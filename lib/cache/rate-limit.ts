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
 * DEPLOYMENT / TRUST ASSUMPTION for the IP dimension: the client identity is
 * taken from `x-forwarded-for` (FIRST entry) → `x-real-ip` → the constant
 * 'unknown'. This assumes production runs behind a trusted reverse proxy /
 * load balancer that OVERWRITES (or is the sole appender to) these headers.
 * A client behind such a proxy cannot inject its own XFF entries; a client
 * talking to the app directly (unproxied dev server) can forge them, which
 * only lets that client rotate its own bucket — the header is never used for
 * anything beyond bucketing. Values are additionally restricted to the
 * identity charset ([a-z0-9.:-]) so a hostile header cannot shape the Redis
 * key.
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
   * override it (e.g. login buckets additionally on the body's username) —
   * the value is sanitized the same way as IPs before it reaches Redis.
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
 * - auth/login      10/min/IP and 10/min/account — each attempt costs an
 *   RPC getAccount + signature verification; the account dimension stops
 *   one credential being hammered from many IPs (and slows one attacker
 *   probing many accounts from a single IP via the IP dimension).
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
 */
export const RATE_LIMITS = {
  authChallenge: { key: 'auth:challenge', limit: 30, windowSeconds: 60 },
  authSession: { key: 'auth:session', limit: 120, windowSeconds: 60 },
  authLoginIp: { key: 'auth:login:ip', limit: 10, windowSeconds: 60 },
  authLoginAccount: { key: 'auth:login:acct', limit: 10, windowSeconds: 60 },
  steemBroadcast: { key: 'steem:broadcast', limit: 30, windowSeconds: 60 },
  search: { key: 'search', limit: 30, windowSeconds: 60 },
  steemOverseer: { key: 'steem:overseer', limit: 60, windowSeconds: 60 },
  steemFollowing: { key: 'steem:following', limit: 60, windowSeconds: 60 },
} as const satisfies Record<string, RateLimitRule>;

const UNKNOWN_IP = 'unknown';
const MAX_IDENTITY_LENGTH = 45; // longest valid IPv6 textual form

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
 * Resolve the client IP for bucketing: first x-forwarded-for entry, then
 * x-real-ip, else 'unknown'. See the trust assumption in the module comment.
 */
export function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    // "client, proxy1, proxy2" — the first entry is the originating client.
    const first = xff.split(',')[0];
    if (first) return sanitizeIdentity(first);
  }
  const real = request.headers.get('x-real-ip');
  if (real) return sanitizeIdentity(real);
  return UNKNOWN_IP;
}

/**
 * Fixed-window counter: INCR the bucket, set EXPIRE only on the first hit of
 * a window, and return the count plus the TTL left in the window.
 */
const FIXED_WINDOW_LUA = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return { current, redis.call('TTL', KEYS[1]) }
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
 * Check a request against a fixed-window rate limit.
 *
 * Always resolves (never throws); Redis being unconfigured or failing means
 * the request is allowed — availability over strictness for an abuse backstop.
 */
export async function checkRateLimit(
  request: Request,
  opts: RateLimitOptions
): Promise<RateLimitResult> {
  const identity = opts.identifier
    ? sanitizeIdentity(opts.identifier)
    : getClientIp(request);
  const redisKeyFull = redisKey(`ratelimit:${opts.key}:${identity}`);

  const redis = getRedis();
  if (!redis) {
    return { allowed: true }; // Redis optional: no-op, allow
  }

  try {
    const result = (await redis.eval(
      FIXED_WINDOW_LUA,
      1,
      redisKeyFull,
      String(opts.windowSeconds)
    )) as [number, number];

    const [count, ttl] = result;
    if (count <= opts.limit) {
      return { allowed: true, remaining: Math.max(0, opts.limit - count) };
    }

    // TTL is negative only if the key vanished between INCR and TTL (expiry
    // race) — the next request starts a fresh window, so advise a short retry.
    const retryAfter = ttl > 0 ? ttl : 1;
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
