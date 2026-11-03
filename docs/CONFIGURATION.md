# Configuration Guide

## Environment Variables

### Steem API Configuration
```bash
# Unified API URL
STEEM_API_URL=https://api.steemit.com

# false = condenser_api namespace (default, matches .env.example);
# true = appbase-style routing
STEEMD_USE_APPBASE=false
CHAIN_ID=0000000000000000000000000000000000000000000000000000000000000000
ADDRESS_PREFIX=STM
```

**Note**: 
- You can configure these variables in `.env.local` file (for local development) or `.env.production` (for production). Next.js automatically loads environment variables from `.env*` files.
- A template file `.env.example` is provided in the project root. Copy it to `.env.local` and customize the values:
  ```bash
  cp .env.example .env.local
  ```

### Authentication
```bash
# REQUIRED in every environment (not just production). Session endpoints
# fail closed unless JWT_SECRET is set, at least 32 bytes long, and not the
# old placeholder value. Generate one with:
#   openssl rand -hex 32
JWT_SECRET=<output of openssl rand -hex 32>
```

### Session Management - Redis (Optional)

For distributed deployments, Redis-based session management is recommended. If Redis is not configured, the system will fall back to JWT-based sessions.

The same Redis instance also backs the content cache, the API rate limiter (`lib/cache/rate-limit.ts`), and the pending-broadcast overlay (`lib/steem/pending-overlay.ts`): freshly broadcast votes/posts/edits/deletes are recorded in short-lived keys (120s TTL) and merged into read results until hivemind indexes them — this prevents vote-state loss and new-post 404s during the indexing window. Without Redis the overlay and the rate limiter degrade to no-ops.

#### Option 1: Redis URL
```bash
REDIS_URL=redis://localhost:6379
```

#### Option 2: Individual Redis Settings
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0
# Session key prefix (individual-settings mode only — REDIS_URL mode stores
# sessions under their raw session ids, unchanged from before the split)
REDIS_SESSION_KEY_PREFIX=steem:session:
# Content-cache key prefix — also namespaces the pending-broadcast overlay
# and the rate limiter, which share the cache client
REDIS_CACHE_KEY_PREFIX=condenser
```

> `REDIS_KEY_PREFIX` (deprecated) is the pre-split shared name that set both
> prefixes at once. It is still honored for existing deployments — with the
> old both-at-once semantics, and overridden by either specific variable —
> but new deployments should use `REDIS_SESSION_KEY_PREFIX` /
> `REDIS_CACHE_KEY_PREFIX`. Sharing one value for both stores was never safe:
> the two defaults (`steem:session:` vs `condenser`) exist exactly so the
> stores' keyspaces stay disjoint on a shared instance.

### Other Configuration
```bash
NEXT_PUBLIC_SIGNUP_URL=https://signup.steemit.com
ELASTICSEARCH_URL=http://localhost:9200

# Image proxy prefix (lib/media/proxify-url.ts, legacy
# $STM_Config.img_proxy_prefix). First-party post-body images are rewritten
# to {prefix}/p/{base58}?width=&mode=fit&format=match. Default:
# https://steemitimages.com/
NEXT_PUBLIC_IMAGE_PROXY_PREFIX=https://steemitimages.com/

# External Steemit wallet origin (lib/steemitWallet.ts — Condenser only links
# out, the wallet itself is a separate app). Default when unset:
# https://steemitwallet.com in production, https://wallet.steemitdev.com under
# `next dev`.
NEXT_PUBLIC_WALLET_URL=https://steemitwallet.com

# This site's own origin for absolute SEO-metadata URLs (og:url, avatar and
# share-image fallbacks; lib/seo.ts SITE_ORIGIN). Self-hosted deployments
# must set it, or their og:url points at steemit.com. Must be a bare https
# origin (https://<host>; an optional port is accepted; malformed values
# fall back to the default with a warning). Server-side runtime read at
# module load (a module-level constant evaluated once at module load) —
# changing it requires a restart, not a rebuild. Default: https://steemit.com
SITE_ORIGIN=https://steemit.com

# Image upload endpoint for the settings page profile/cover upload (legacy
# $STM_Config.upload_image). The client signs the file with the posting key
# and POSTs it here. Read at request time and inlined into the SSR HTML (like
# SDC_GOOGLE_ANALYTICS_ID) — never baked into the bundle.
# Default: https://steemitimages.com
SDC_UPLOAD_IMAGE_URL=https://steemitimages.com

# Analytics (all optional)
# Google Analytics (gtag.js) property id — scripts are injected only when set.
SDC_GOOGLE_ANALYTICS_ID=
# Comma-separated activity-campaign URL hashes reported to overseer
# activity_tracker (e.g. "promo-2026,launch").
NEXT_PUBLIC_ACTIVITY_TAGS=
# Tron ad network slots (legacy tronads_*); all disabled unless ENABLED is set.
NEXT_PUBLIC_TRONADS_ENABLED=
NEXT_PUBLIC_TRONADS_ENV=0
NEXT_PUBLIC_TRONADS_MOCK=0
NEXT_PUBLIC_TRONADS_SIDEBAR_AD_PID=
NEXT_PUBLIC_TRONADS_CONTENT_PC_AD_PID=
NEXT_PUBLIC_TRONADS_CONTENT_MOBILE_AD_PID=
# NOTE on NEXT_PUBLIC_TRONADS_ENV: it has two consumers — the client bundle
# (selects which engine host the vendored TronAds SDK loads its iframes
# from) and the proxy's Content-Security-Policy frame-src origin (lib/csp.ts
# -> configuredTronAdsEngineOrigin). Both are effectively BUILD-time: with
# Turbopack, Next.js's getDefineEnv unconditionally inlines every
# NEXT_PUBLIC_* var present in the build environment into BOTH the browser
# and the nodejs (server) bundle, so when this variable is set at build time
# the proxy-side read is a baked-in literal too and a later runtime value is
# ignored on both sides. The runtime lookup in the proxy only survives a
# build that left the variable unset — and that is exactly the divergence
# case: the CSP then follows the runtime value while the browser keeps the
# inlined default (0), so the CSP allows the engine host the browser never
# loads and blocks the one it does, and all TronAd slots render empty.
# Changing the value reliably therefore means REBUILDING with it set. The
# other TRONADS vars are likewise build-time-inlined for the client; ENV is
# the only one the proxy reads at all.
# Coin Marketplace right-rail module (legacy steem_market_*). No endpoint
# configured means the module stays hidden.
STEEM_MARKET_ENDPOINT=
STEEM_MARKET_TOKEN=

# Dev-only (`pnpm dev`): comma-separated extra origins allowed to reach the
# dev server, HMR websocket included. Next.js blocks non-localhost dev
# origins by default, so set this when accessing the dev server from another
# machine on the LAN (e.g. "192.168.1.10"). Loaded from .env/.env.local.
NEXT_DEV_ALLOWED_ORIGINS=
```

### Analytics (overseer)

Overseer metrics (route views, user actions, activity campaigns) replicate the
legacy `ServerApiClient.js` reporting. The client posts to
`POST /api/steem/overseer`, which relays to the node's `overseer.collect`
JSON-RPC method. (steem-js is used on both ends in the rewrite: the server
keeps it as a `serverExternalPackages` entry for all RPC, while the browser
bundle ships the SDK's browser build via `browser.esm.js` (~290KB, measured
285.6KB — the whole chunk, including RPC code nothing calls) but only calls
its auth/signing/operation-builder helpers — so unlike legacy, the browser
never speaks JSON-RPC to the node directly.)
No configuration is required — the
relay uses `STEEM_API_URL`. GA page views and route tags are recorded on every
client-side navigation; `user_login` is reported server-side by
`/api/auth/login`.

GA (gtag.js) is inlined into the SSR HTML by the root layout, exactly like
legacy `server-html.jsx` (async gtag.js + inline dataLayer/config init — the
browser loads it at parse time, no hydration dependency). All routes render
per-request (`force-dynamic` in the root layout), so the id is always read
from the runtime `SDC_GOOGLE_ANALYTICS_ID` — unset means no GA. This keeps
published images environment-agnostic: the community runs the same images
with their own env.

## Session Management

The application supports two session storage modes:

### 1. JWT-based Sessions (Default)
- Sessions are stored as signed JWT tokens in HTTP-only cookies
- No external dependencies required
- Suitable for single-instance deployments
- Sessions are stateless and self-contained

### 2. Redis-based Sessions (Recommended for Production)
- Sessions are stored in Redis with automatic expiration
- Supports distributed deployments with multiple server instances
- Better performance for high-traffic applications
- Allows for advanced session management (logout from all devices, etc.)

### Configuration Priority
1. If `REDIS_URL` is set, it will be used for Redis connection
2. If `REDIS_URL` is not set but `REDIS_HOST` is configured, individual Redis settings will be used
3. If no Redis configuration is found, JWT-based sessions will be used

## Security Features

### Rate Limiting & Request Body Caps (audit N-08)

Write and abuse-prone endpoints are rate limited per client IP with a Redis
fixed-window counter (`lib/cache/rate-limit.ts`). Which request header — if
any — is trusted to carry the REAL client IP is an explicit deployment
contract declared via `TRUSTED_CLIENT_IP_HEADER` (see the next section);
only that declared header is ever read. Blocked requests receive `429` with
a `Retry-After` header.

#### Client-IP trust contract (audit CD-05)

```bash
# Which request header this deployment guarantees carries the real client IP.
# One of: x-real-ip | cf-connecting-ip | xff-tail | none (unset = none).
# Server-side runtime read at module load — changing it requires a restart,
# not a rebuild. An unknown value fails startup with a clear error rather
# than silently degrading to no-trust.
TRUSTED_CLIENT_IP_HEADER=x-real-ip
```

- `x-real-ip` — trust `X-Real-IP`. **Recommended for Steemit deployments**:
  the openresty tier sets `proxy_set_header X-Real-IP $remote_addr`, which
  unconditionally overwrites any client-supplied value with the real
  (Cloudflare-rewritten) peer address.
- `cf-connecting-ip` — trust `CF-Connecting-IP`, for deployments where the
  app sits directly behind Cloudflare with no header-stripping layer in
  between.
- `xff-tail` — take the LAST entry of `X-Forwarded-For`: in an append-only
  proxy chain that entry was appended by the proxy closest to the app, the
  only position a client cannot prepend over. Caveat: the identity is only
  as trustworthy as that closest proxy — if it blindly forwards a
  client-controlled XFF, the client still controls the tail.
- unset / `none` — trust no header: direct-exposure semantics (see below).

Background (why this exists): every proxy layer in the production chain
(Cloudflare → ALB → openresty → app) merely APPENDS to `X-Forwarded-For`
without sanitizing, so a client that sends `X-Forwarded-For: 203.0.113.77`
controls the FIRST segment arriving at the app — which the pre-fix limiter
used as the rate-limit identity, making every per-IP bucket spoofable
(audit CD-05). Under the contract, only the declared header is read (a
forged XFF has zero effect in `x-real-ip` mode), the value must be a strict
IP literal — IPv4 dotted-quad or IPv6; IPv6 is aggregated to its /64 — and
anything else (ports, lists, junk) counts as unattributed.

Missing or invalid trusted header:

- With a mode configured, a missing/invalid header means the request did NOT
  come through the trusted proxy (that proxy always sets it) — direct-to-app
  access or a proxy misconfiguration. Such requests share one dedicated
  `unattributed` bucket at the endpoint's normal per-IP limit: dropping the
  header must not become a way to escape rate limiting, but anomalous
  traffic also never mixes into real per-user buckets. A warning is logged,
  throttled to one per minute.
- With NO mode configured (direct exposure), there is no sound IP identity
  at all — every header is client-supplied. Rather than collapsing all
  visitors into one shared bucket (where they would 429 each other at
  site-wide ceilings like 30/min), IP-dimension buckets are exempted and a
  warning is logged. Identifier-dimension buckets (e.g. the per-account
  login limit, audit CD-04) do not depend on the IP and remain enforced.
  Direct-exposure deployments that want per-IP limiting must place a
  trustworthy proxy in front and declare it with this variable.

> Deployment action item (Steemit/Elastic Beanstalk): set
> `TRUSTED_CLIENT_IP_HEADER=x-real-ip` as an EB environment property when
> this ships — until then the per-IP limiter runs in the exempt (unset)
> mode.

| Endpoint | Limit | Dimension |
|----------|-------|-----------|
| `GET /api/auth/challenge` | 30/min | IP |
| `GET /api/auth/session` | 120/min | IP |
| `POST /api/auth/login` | 10/min | IP (all attempts) **and** account (verified logins only) |
| `POST /api/auth/preferences` | 60/min | IP |
| `GET /api/steem/posts` | 60/min | IP |
| `GET /api/steem/following` | 60/min | IP |
| `GET /api/steem/followers` | 60/min | IP |
| `POST /api/steem/broadcast` | 30/min | IP |
| `POST /api/search` | 30/min | IP |
| `POST /api/steem/overseer` | 60/min | IP |

`GET /api/auth/session` is limited at 120/min/IP because a cookie-less hit
mints a session (same as challenge) — the ceiling is far above the
once-per-page-load pattern of real clients while still bounding session
creation.

For `POST /api/auth/login`, the per-account (body username) bucket is consumed
only AFTER the posting-key signature verifies (audit CD-04): a request that
cannot be attributed to the account holder must never consume that account's
quota, so an attacker submitting invalid signatures that name a victim only
exhausts their own per-IP bucket and cannot lock out the victim's login. The
account dimension still rate-limits verified logins (e.g. session churn from
rotating IPs); an attacker remains able to burn their own IP quota, which is
intended.

Limits are code constants (the `RATE_LIMITS` registry), deliberately not
env-configurable: they are abuse backstops, not tuning knobs, and env-driven
security thresholds invite misconfiguration. They require `REDIS_URL`; without
Redis the limiter is a no-op and all requests are allowed (fail open — losing
an abuse backstop must not take the site down).

All POST routes cap the request body at 64KB (`lib/api/body-limit.ts`):
oversized bodies are rejected with `413` based on `Content-Length` when
present, and by reading the stream for chunked requests where the header is
absent or lying. The one exception is `POST /api/steem/broadcast`, capped at
256KB — a maximal legitimate post (65280-byte body client-side, 65536
on-chain) inflates to ~67KB of HTTP body after the JSON envelope, escaping
and signature, which a 64KB cap would reject. (The former
`POST /api/auth/check-authority` rate-limit exemption is gone — the endpoint
was removed entirely in audit N-13.)

### Session TTLs

Anonymous ("challenge-only") sessions — created by `GET /api/auth/challenge`
and cookie-less hits on `GET /api/auth/session` — expire after **10 minutes**
(Redis TTL and JWT `exp` alike), matching the 5-minute login challenge window
with 2x headroom. Logged-in Redis-backed sessions keep the 30-day TTL, and
any rewrite of a session preserves its original TTL class. Without Redis, the
same 10-minute expiration applies to anonymous fallback JWTs, while logged-in
fallback JWTs expire after **12 hours** (audit CS-01): Redis is down when
those are minted, so revocation can only be honored per-instance and the
shorter TTL bounds a leaked token's exposure. The window slides — every
session rewrite re-signs the fallback JWT — so active use is uninterrupted.

### Authentication
- Only posting keys are allowed for login (active/owner keys are blocked for security)
- Client-side private key validation before server submission
- Signature-based authentication with challenge-response mechanism
- Server-side signature verification using account's posting public key

### Session Security
- HTTP-only cookies prevent XSS attacks
- Secure flag enabled in production
- 10-minute expiration for anonymous (challenge-only) sessions, 30-day for logged-in Redis-backed sessions (12-hour for logged-in fallback JWTs), with automatic renewal (see "Session TTLs" above)
- Session invalidation on logout (Redis key deletion, or jti denylist for fallback JWTs — see docs/AUTHENTICATION.md)

### Key Management
- Private keys are never stored on the server
- Only session tokens and public keys are maintained
- Client-side key derivation for master password login
- WIF private key support for direct posting key login
