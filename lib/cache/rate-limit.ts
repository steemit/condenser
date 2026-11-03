/**
 * Application-layer rate limiting (audit N-08).
 *
 * Fixed-window counter in Redis, implemented as a single Lua script so
 * INCR + EXPIRE + TTL are atomic — no race window where concurrent requests
 * miss the EXPIRE and leave a persistent counter key. The TTL read back from
 * the script feeds the Retry-After response header.
 *
 * Keys live in the content-cache namespace (`condenser:` via redisKey) as
 * `ratelimit:{bucket}:{identity}` — the session store's `steem:session:`
 * prefix is never touched.
 *
 * Redis is OPTIONAL (project-wide principle): when REDIS_URL is not
 * configured — local dev, JWT-fallback deployments — or when Redis errors
 * mid-call, checkRateLimit fails OPEN and every request is allowed. Losing
 * the limiter must never take the site down.
 *
 * DEPLOYMENT / TRUST CONTRACT for the IP dimension (audit CD-05): which
 * request header — if any — may identify the client is DECLARED via the
 * TRUSTED_CLIENT_IP_HEADER env var (x-real-ip | cf-connecting-ip | xff-tail
 * | unset/none). Only the declared header is ever read; X-Forwarded-For is
 * never trusted implicitly. Pre-CD-05 the FIRST XFF entry was used, but
 * every proxy layer in the production chain (Cloudflare → ALB → openresty →
 * app) merely APPENDS to XFF, so a client-supplied first segment fully
 * controlled the rate-limit identity. Trusted values must be strict IP
 * literals (v4/v6); IPv6 is aggregated to its /64 prefix (see
 * aggregateIpIdentity) so address rotation inside one allocation cannot
 * mint fresh buckets. Unresolvable identities never mix into per-user
 * buckets: with no trusted header configured the IP dimension is exempt
 * (bucketing everyone together would collapse the site into one quota),
 * while a configured-but-missing header means direct-to-app access and
 * lands in a dedicated shared 'unattributed' bucket at the normal limit.
 * The mode is validated at module load — an unknown value refuses to start
 * rather than silently degrading to no-trust.
 *
 * The contract is only as strong as the network topology: a client that
 * reaches the app DIRECTLY (bypassing the trusted proxy) can forge the
 * declared header itself with arbitrary valid IP literals and rotate
 * buckets — for xff-tail, a single-entry X-Forwarded-For from such a
 * client is entirely the client's own value. The app port must be
 * reachable only from the trusted proxy (security-group / network
 * segmentation); header validation cannot substitute for that.
 */

import { NextResponse } from 'next/server';
import { getRedis, redisKey } from '@/lib/cache/redis';

export interface RateLimitRule {
  /** Bucket name, endpoint-scoped (e.g. 'auth:login'). */
  key: string;
  /** Max requests per window per identity. */
  limit: number;
  /** Fixed window length in seconds. */
  windowSeconds: number;
}

export interface RateLimitOptions extends RateLimitRule {
  /**
   * Identity to bucket on. Defaults to the request's client IP. Routes may
   * override it (e.g. the login route buckets VERIFIED logins on the body's
   * username — see authLoginAccount and audit CD-04) — the value is
   * sanitized the same way as IPs before it reaches Redis.
   */
  identifier?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the current window resets (only meaningful when blocked). */
  retryAfterSeconds?: number;
  /** Remaining requests in the window (best effort, for logging/headers). */
  remaining?: number;
}

/**
 * Per-endpoint limits (audit N-08). Code constants, deliberately NOT env-
 * configurable: they are abuse backstops, not tuning knobs — making them
 * env-driven invites misconfiguration on the security path. Adjust here with
 * a PR when a threshold proves wrong in practice.
 *
 * - auth/challenge  30/min/IP — challenge generation is cheap but every
 *   cookie-less hit mints a Redis session (now short-TTL); still a write per
 *   request, so keep the ceiling low.
 * - auth/session    120/min/IP — the session probe fires once per page load
 *   for real clients, so the ceiling is far above any legitimate traffic,
 *   but like challenge a cookie-less hit mints a session (withSession
 *   creates one), so creation must stay bounded (audit follow-up: challenge
 *   was limited but session was not).
 * - auth/login      10/min/IP (all attempts) and 10/min/account (VERIFIED
 *   logins only, audit CD-04): the account bucket is consumed after the
 *   posting-key signature verifies, so unauthenticated traffic naming a
 *   victim cannot monopolize (lock out) that account's quota — invalid
 *   attempts only burn the sender's own IP bucket. Forging a signature is
 *   cryptographically infeasible, so per-account damping of unverified
 *   attempts bought nothing the IP dimension does not already provide;
 *   the account dimension instead stops one VERIFIED credential being
 *   hammered (session churn) from rotating IPs.
 * - auth/preferences 60/min/IP — every accepted hit rewrites the session
 *   (Redis write or JWT re-issue + Set-Cookie) after a CSRF check. The
 *   ceiling must sit above the client's own senders: the middleware's
 *   800ms debounce tops out at 75 flushes/min of sustained toggling, and
 *   the Settings page's manual saves share this bucket — at 30/min a
 *   heavy toggle session plus a save or two would hit the 429 and silently
 *   drop a save. 60/min matches the following/overseer tier: it still
 *   bounds scripted abuse of the rewrite path while leaving legitimate
 *   toggle+save traffic (realistically far below the debounce peak, which
 *   collapses rapid toggles) clear of the limiter.
 * - steem/broadcast 30/min/IP — the chain node enforces its own limits;
 *   this only caps the relay's abuse surface.
 * - search          30/min/IP — each request opens an ES scroll context
 *   (1m keepalive) that must be aged out (see audit N-09).
 * - steem/overseer  60/min/IP — analytics fire on every navigation; higher
 *   ceiling than the rest, still bounded.
 * - steem/following 60/min/IP — a legitimate session seeds the full
 *   following/ignoring sets at login (2 kinds, a handful of 1000-entry
 *   pages each); 60/min leaves retry headroom while bounding per-IP
 *   creation of the ~100KB cached entries behind the route. Fixed-window
 *   caveat: users behind a shared egress IP (NAT/CGNAT) logging in within
 *   the same minute can collectively trip the 429; a kind that fails stays
 *   empty until the next page load (the documented seeding failure mode).
 * - steem/followers 60/min/IP — profile pages page through followers/
 *   following lists (page-based, limit <= 100); same per-IP ceiling as
 *   steem/following for the same key-spray rationale (the account/page
 *   params reach the server cache keys in get{Followers,Following}ByPage).
 * - steem/posts     60/min/IP — the feed route (ranked + account, audit
 *   N-21 follow-up). Limit evaluation for the main feed route: every
 *   caller pages strictly serially (SortFeed / tag pages / profile
 *   sections keep one load-more in flight and there is no prefetch), and
 *   repeated identical reads are served by the 10s-fresh browser L1
 *   before reaching the network, so a fast human scroller sits far below
 *   the ceiling (each page appends 20 cards that must be scrolled past);
 *   anything near 60/min is scripted. 60/min matches the
 *   followers/following tier and bounds per-IP creation of the
 *   steem:posts:{ranked,account}:* cache entries whose tag/account
 *   dimensions are free-form. Fixed-window NAT/CGNAT caveat as for
 *   steem/followers: users behind one shared egress IP each cost ~1
 *   request per page load; if they collectively trip the 429 the caller
 *   treats it like a transient fetch failure (pagination stops, reload
 *   recovers).
 */
export const RATE_LIMITS = {
  authChallenge: { key: 'auth:challenge', limit: 30, windowSeconds: 60 },
  authSession: { key: 'auth:session', limit: 120, windowSeconds: 60 },
  authLoginIp: { key: 'auth:login:ip', limit: 10, windowSeconds: 60 },
  authLoginAccount: { key: 'auth:login:acct', limit: 10, windowSeconds: 60 },
  authPreferences: { key: 'auth:preferences', limit: 60, windowSeconds: 60 },
  steemBroadcast: { key: 'steem:broadcast', limit: 30, windowSeconds: 60 },
  search: { key: 'search', limit: 30, windowSeconds: 60 },
  steemOverseer: { key: 'steem:overseer', limit: 60, windowSeconds: 60 },
  steemFollowing: { key: 'steem:following', limit: 60, windowSeconds: 60 },
  steemFollowers: { key: 'steem:followers', limit: 60, windowSeconds: 60 },
  steemPosts: { key: 'steem:posts', limit: 60, windowSeconds: 60 },
} as const satisfies Record<string, RateLimitRule>;

const UNKNOWN_IP = 'unknown';
const MAX_IDENTITY_LENGTH = 45; // longest valid IPv6 textual form

/**
 * Valid TRUSTED_CLIENT_IP_HEADER values (audit CD-05):
 *  - 'x-real-ip'        — trust X-Real-IP; the recommended value for Steemit
 *                         deployments: the openresty tier sets
 *                         `proxy_set_header X-Real-IP $remote_addr`, which
 *                         UNCONDITIONALLY overwrites any client-supplied
 *                         value with the real (CF-rewritten) peer address.
 *  - 'cf-connecting-ip' — trust CF-Connecting-IP; for deployments where the
 *                         app sits directly behind Cloudflare with no
 *                         header-stripping layer in between.
 *  - 'xff-tail'         — take the LAST X-Forwarded-For entry; in append-only
 *                         chains that entry was appended by the proxy closest
 *                         to the app. Only as trustworthy as that closest
 *                         proxy (documented caveat).
 *  - 'none' / unset     — trust no header: direct-exposure semantics.
 */
const TRUSTED_CLIENT_IP_MODES = [
  'x-real-ip',
  'cf-connecting-ip',
  'xff-tail',
  'none',
] as const;

type TrustedClientIpMode = (typeof TRUSTED_CLIENT_IP_MODES)[number];

function parseTrustMode(raw: string | undefined): TrustedClientIpMode {
  const value = (raw ?? '').trim().toLowerCase();
  if (value === '') return 'none';
  if (!(TRUSTED_CLIENT_IP_MODES as readonly string[]).includes(value)) {
    // Fail fast on a broken contract (startup validation): an unknown mode
    // must never silently degrade to no-trust — that would quietly disable
    // per-IP limiting on the security path.
    throw new Error(
      `TRUSTED_CLIENT_IP_HEADER is set to an unknown value "${value}". ` +
        `Valid values: ${TRUSTED_CLIENT_IP_MODES.join(', ')} — or leave it ` +
        `unset for direct-exposure deployments with no reverse proxy. ` +
        `Refusing to run with an ambiguous client-IP trust contract ` +
        `(audit CD-05).`
    );
  }
  return value as TrustedClientIpMode;
}

// Captured once at module load so an invalid value fails at startup (the
// module is imported by every rate-limited route), and the contract is
// stable for the process lifetime — changing the env var requires a
// restart, not a rebuild (same lifecycle as SITE_ORIGIN).
const TRUST_MODE: TrustedClientIpMode = parseTrustMode(
  process.env.TRUSTED_CLIENT_IP_HEADER
);

/**
 * Identity for requests whose client IP cannot be attributed: no trusted
 * header is configured, or the configured header is missing/invalid.
 * Deliberately a NEW name (not the old 'unknown') so the pre-fix shared
 * buckets age out and the post-fix occupancy is distinguishable.
 */
const UNATTRIBUTED_IDENTITY = 'unattributed';

/**
 * Strict IPv4 literal: exactly four dotted-decimal octets, no leading zeros
 * (the leading-zero form is ambiguously octal in some stacks and no proxy in
 * our chain emits it). IPv6 validation reuses parseIpv6.
 */
const IPV4_STRICT =
  /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

/**
 * Validate a value from the trusted header as a strict IP literal and return
 * the bucketing identity (IPv6 aggregated to its /64). Anything else —
 * ports, comma lists, junk — returns null: the configured proxy writes a
 * clean IP, so garbage means the header did not come from that proxy.
 */
function trustedIpIdentity(raw: string): string | null {
  const value = raw.trim();
  if (IPV4_STRICT.test(value)) return aggregateIpIdentity(value);
  if (value.includes(':') && parseIpv6(value) !== null) {
    return aggregateIpIdentity(value);
  }
  return null;
}

/**
 * Last non-empty X-Forwarded-For entry, or null for an effectively empty
 * header. In an append-only chain the last entry is the one appended by the
 * proxy closest to the app — the only position a client cannot prepend over.
 */
function lastXffEntry(xff: string): string | null {
  const parts = xff.split(',');
  for (let i = parts.length - 1; i >= 0; i--) {
    const value = parts[i].trim();
    if (value) return value;
  }
  return null;
}

/**
 * Restrict an identity to the identity charset before it becomes part of a
 * Redis key. Anything unexpected (injected separators/spaces/unicode)
 * collapses to the 'unknown' bucket rather than erroring.
 *
 * '-' is included because Steem usernames legally contain it: without it,
 * 'some-user' and 'someuser' would share one bucket, and spraying variants
 * of a hyphenated victim's name could lock out unrelated accounts. IPs never
 * contain '-' (v4/v6 textual forms use digits, dots, colons at most), so the
 * extra character is inert for the IP dimension.
 */
function sanitizeIdentity(raw: string): string {
  // The '-' sits last inside the class so it is a literal, not a range.
  const cleaned = raw.trim().toLowerCase().replace(/[^a-z0-9.:-]/g, '');
  if (!cleaned || cleaned.length > MAX_IDENTITY_LENGTH) return UNKNOWN_IP;
  return cleaned;
}

/**
 * Parse a textual IPv6 address into its 8 hextets, or null when malformed.
 * Handles '::' elision, an embedded dotted-quad tail (e.g. 2001:db8::1.2.3.4)
 * and a zone id (fe80::1%eth0); brackets from [::1] forms are tolerated.
 */
function parseIpv6(raw: string): number[] | null {
  const addr = raw
    .trim()
    .toLowerCase()
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .split('%')[0];
  if (!addr || !addr.includes(':')) return null;

  const parseGroups = (part: string): number[] | null => {
    if (part === '') return [];
    const pieces = part.split(':');
    const groups: number[] = [];
    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];
      if (piece.includes('.')) {
        // Dotted-quad tail: counts as two hextets, only valid last.
        if (i !== pieces.length - 1) return null;
        const octets = piece.split('.').map(Number);
        if (
          octets.length !== 4 ||
          octets.some((o) => !Number.isInteger(o) || o < 0 || o > 255)
        ) {
          return null;
        }
        groups.push((octets[0] << 8) | octets[1]);
        groups.push((octets[2] << 8) | octets[3]);
      } else {
        if (!/^[0-9a-f]{1,4}$/.test(piece)) return null;
        groups.push(parseInt(piece, 16));
      }
    }
    return groups;
  };

  const halves = addr.split('::');
  if (halves.length > 2) return null;
  const left = parseGroups(halves[0]);
  if (left === null) return null;
  let groups: number[];
  if (halves.length === 2) {
    const right = parseGroups(halves[1]);
    if (right === null) return null;
    if (left.length + right.length >= 8) return null; // nothing elided
    const fill = new Array(8 - left.length - right.length).fill(0);
    groups = [...left, ...fill, ...right];
  } else {
    if (left.length !== 8) return null;
    groups = left;
  }
  return groups;
}

/**
 * Aggregate an IP identity for bucketing (audit N-08 follow-up, #4039
 * leftover):
 *  - IPv4-mapped IPv6 (::ffff:a.b.c.d) normalizes to the plain IPv4, so
 *    mapped and plain forms share one bucket;
 *  - every other IPv6 address collapses to its /64 prefix — the standard
 *    SLAAC allocation size — so a single attacker rotating addresses inside
 *    one /64 cannot mint a fresh bucket per request;
 *  - plain IPv4 passes through unchanged;
 *  - anything unparseable falls back to the charset sanitizer (previous
 *    behavior for hostile XFF values).
 */
export function aggregateIpIdentity(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.includes(':')) {
    const groups = parseIpv6(trimmed);
    if (groups) {
      // IPv4-mapped: ::ffff:a.b.c.d = [0,0,0,0,0,ffff,a,b].
      if (
        groups.slice(0, 5).every((g) => g === 0) &&
        groups[5] === 0xffff
      ) {
        const a = groups[6];
        const b = groups[7];
        return `${a >> 8}.${a & 0xff}.${b >> 8}.${b & 0xff}`;
      }
      const hextet = (g: number) => g.toString(16).padStart(4, '0');
      return groups
        .slice(0, 4)
        .map(hextet)
        .join(':')
        .concat('::/64');
    }
  }
  return sanitizeIdentity(trimmed);
}

/**
 * Resolve the client identity for rate-limit bucketing from the header the
 * deployment DECLARED trustworthy via TRUSTED_CLIENT_IP_HEADER (audit
 * CD-05). Only the declared header is read — every other candidate header
 * (in particular a client-forged X-Forwarded-For) is ignored entirely, and
 * there is NEVER a fallback to an undeclared header: in a configured
 * deployment the trusted proxy always sets the header, so a missing one is
 * itself the signal (direct-to-app access), not something to paper over by
 * trusting client-controlled data again.
 *
 * Returns UNATTRIBUTED_IDENTITY when no trustworthy IP can be resolved;
 * checkRateLimit decides what that means for the bucket (see below).
 */
export function getClientIp(request: Request): string {
  // No trusted header configured (direct exposure): headers are entirely
  // client-supplied and spoofable, so there is no sound IP identity at all.
  if (TRUST_MODE === 'none') return UNATTRIBUTED_IDENTITY;

  let raw: string | null;
  if (TRUST_MODE === 'xff-tail') {
    const xff = request.headers.get('x-forwarded-for');
    raw = xff === null ? null : lastXffEntry(xff);
  } else {
    raw = request.headers.get(TRUST_MODE);
  }
  if (raw === null) return UNATTRIBUTED_IDENTITY;
  return trustedIpIdentity(raw) ?? UNATTRIBUTED_IDENTITY;
}

/**
 * Fixed-window counter: INCR the bucket, set EXPIRE only on the first hit of
 * a window, and return the count, the TTL left in the window, and whether
 * this hit is the FIRST one the bucket blocks (count == limit + 1) so the
 * caller can log one 429 per bucket-window without log flooding.
 */
const FIXED_WINDOW_LUA = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('TTL', KEYS[1])
local first_blocked = 0
if current == tonumber(ARGV[2]) + 1 then
  first_blocked = 1
end
return { current, ttl, first_blocked }
`;

/**
 * Fail-open observability: a Redis outage silently disables the limiter, so
 * the first error in a while is logged — but never per request, or the
 * outage itself (under attack traffic) would flood the logs. Throttled to
 * one warning per FAIL_OPEN_WARN_INTERVAL_MS of wall clock.
 */
let lastFailOpenWarnAt = 0;
const FAIL_OPEN_WARN_INTERVAL_MS = 60_000;

function warnFailOpenThrottled(error: unknown): void {
  const now = Date.now();
  if (now - lastFailOpenWarnAt < FAIL_OPEN_WARN_INTERVAL_MS) return;
  lastFailOpenWarnAt = now;
  console.warn(
    'rate limiter failing OPEN (allowing all requests) due to a Redis error:',
    error instanceof Error ? error.message : String(error)
  );
}

/**
 * Breadcrumbs for the unattributable-identity paths (audit CD-05), with the
 * same one-per-minute throttle rationale as warnFailOpenThrottled: the
 * condition persists per-request (every request in unset mode; an anomalous
 * flood in configured mode), and warning per request would let the very
 * traffic being flagged flood the logs.
 */
let lastNoTrustWarnAt = 0;
let lastUnattributedWarnAt = 0;
const IDENTITY_WARN_INTERVAL_MS = 60_000;

/** No trusted header is configured: the IP dimension is exempt by design. */
function warnNoTrustConfiguredThrottled(): void {
  const now = Date.now();
  if (now - lastNoTrustWarnAt < IDENTITY_WARN_INTERVAL_MS) return;
  lastNoTrustWarnAt = now;
  console.warn(
    'TRUSTED_CLIENT_IP_HEADER is not set: per-IP rate limiting is DISABLED ' +
      '(IP-dimension buckets are exempt; identifier-dimension buckets such ' +
      'as the per-account login limit still apply). This is correct only ' +
      'for direct-exposure deployments with no reverse proxy. Behind a ' +
      'proxy, set TRUSTED_CLIENT_IP_HEADER to x-real-ip, cf-connecting-ip ' +
      'or xff-tail (audit CD-05).'
  );
}

/**
 * A trusted header IS configured but missing/invalid on a request: the
 * request bypassed the trusted proxy (direct-to-app) or the proxy is
 * misconfigured. Such traffic is still limited — under one shared
 * 'unattributed' bucket at the endpoint's normal per-IP ceiling.
 */
function warnUnattributedThrottled(): void {
  const now = Date.now();
  if (now - lastUnattributedWarnAt < IDENTITY_WARN_INTERVAL_MS) return;
  lastUnattributedWarnAt = now;
  console.warn(
    `TRUSTED_CLIENT_IP_HEADER=${TRUST_MODE}: request carried no valid value ` +
      "for that header; bucketing it under the shared 'unattributed' " +
      'identity at the normal per-IP limit. The trusted proxy should always ' +
      'set this header, so this is direct-to-app access or a proxy ' +
      'misconfiguration (audit CD-05).'
  );
}

/**
 * Check a request against a fixed-window rate limit.
 *
 * Always resolves (never throws); Redis being unconfigured or failing means
 * the request is allowed — availability over strictness for an abuse backstop.
 */
export async function checkRateLimit(
  request: Request,
  opts: RateLimitOptions
): Promise<RateLimitResult> {
  // The IP identity is computed even for identifier-bucketed rules so the
  // first-429 log line below can always name the aggregated IP. Identifier
  // dimensions (login account names) are deliberately NOT logged — only the
  // bucket key (audit N-20 log discipline: no usernames or other sensitive
  // fields in logs).
  const ipIdentity = getClientIp(request);
  const identity = opts.identifier
    ? sanitizeIdentity(opts.identifier)
    : ipIdentity;
  const redisKeyFull = redisKey(`ratelimit:${opts.key}:${identity}`);

  const redis = getRedis();
  if (!redis) {
    return { allowed: true }; // Redis optional: no-op, allow
  }

  // Unattributable identities (audit CD-05). The two cases are deliberately
  // treated differently:
  //
  // - No trusted header CONFIGURED (direct exposure): every request is
  //   unattributable, so bucketing them together would collapse the whole
  //   site into one shared quota — all visitors 429-ing each other at the
  //   per-endpoint ceilings (the pre-CD-05 'unknown' hazard). The IP
  //   dimension is therefore exempt: honest about the fact that no sound
  //   identity exists when nothing in front of the app is trusted.
  //   Identifier-dimension rules (e.g. the per-account login bucket, CD-04)
  //   do not depend on the IP and remain enforced below.
  //
  // - Trusted header CONFIGURED but missing/invalid on this request: the
  //   configured proxy always sets it, so the request never went through
  //   that proxy — anomalous direct-to-app access. It must NOT be exempt
  //   (dropping the header would then become a way to escape rate limiting);
  //   instead it shares one dedicated 'unattributed' bucket at the rule's
  //   normal limit. Legitimate users never land here, so the shared bucket
  //   cannot cause cross-user lockout — only the anomalous traffic itself
  //   is collectively capped.
  if (!opts.identifier) {
    if (TRUST_MODE === 'none') {
      warnNoTrustConfiguredThrottled();
      return { allowed: true };
    }
    if (ipIdentity === UNATTRIBUTED_IDENTITY) {
      warnUnattributedThrottled();
    }
  }

  try {
    const result = (await redis.eval(
      FIXED_WINDOW_LUA,
      1,
      redisKeyFull,
      String(opts.windowSeconds),
      String(opts.limit)
    )) as [number, number, number];

    const [count, ttl, firstBlocked] = result;
    if (count <= opts.limit) {
      return { allowed: true, remaining: Math.max(0, opts.limit - count) };
    }

    // TTL is negative only if the key vanished between INCR and TTL (expiry
    // race) — the next request starts a fresh window, so advise a short retry.
    const retryAfter = ttl > 0 ? ttl : 1;
    if (firstBlocked === 1) {
      // One line per bucket-window (the Lua flags count == limit + 1) so an
      // attack shows up in logs without flooding them (#4039 leftover). The
      // identity is only logged for IP dimensions, never for account names.
      console.warn(
        `rate limit exceeded: bucket=${opts.key}` +
          (opts.identifier ? ' identity=<redacted>' : ` ip=${ipIdentity}`) +
          ` retry_after=${retryAfter}s`
      );
    }
    return { allowed: false, retryAfterSeconds: retryAfter };
  } catch (error) {
    // Redis error mid-call: fail open rather than 500-ing real traffic, but
    // leave a throttled breadcrumb (see warnFailOpenThrottled).
    warnFailOpenThrottled(error);
    return { allowed: true };
  }
}

/**
 * Canonical 429 response: JSON error body plus a standards-compliant
 * Retry-After header (in seconds).
 */
export function rateLimitResponse(retryAfterSeconds?: number): NextResponse {
  const response = NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429 }
  );
  if (retryAfterSeconds !== undefined && retryAfterSeconds > 0) {
    response.headers.set('Retry-After', String(Math.ceil(retryAfterSeconds)));
  }
  return response;
}
