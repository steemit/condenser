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
# origin (https://<host>; malformed values fall back to the default with a
# warning). Server-side runtime read at module load (a module-level constant
# evaluated once at process start) — changing it requires a restart, not a
# rebuild. Default: https://steemit.com
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
fixed-window counter (`lib/cache/rate-limit.ts`). The client IP is taken from
`x-forwarded-for` (first entry), then `x-real-ip`, else the shared `unknown`
bucket — this assumes production runs behind a trusted reverse proxy that
overwrites those headers (see the trust assumptions in the module's comments).
Blocked requests receive `429` with a `Retry-After` header.

| Endpoint | Limit | Dimension |
|----------|-------|-----------|
| `GET /api/auth/challenge` | 30/min | IP |
| `GET /api/auth/session` | 120/min | IP |
| `POST /api/auth/login` | 10/min | IP **and** account (body username) |
| `POST /api/steem/broadcast` | 30/min | IP |
| `POST /api/search` | 30/min | IP |
| `POST /api/steem/overseer` | 60/min | IP |

`GET /api/auth/session` is limited at 120/min/IP because a cookie-less hit
mints a session (same as challenge) — the ceiling is far above the
once-per-page-load pattern of real clients while still bounding session
creation.

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
with 2x headroom. Logged-in sessions keep the 30-day TTL, and any rewrite of
a session preserves its original TTL class. Without Redis, the same 10-minute
expiration applies to the JWT fallback tokens.

### Authentication
- Only posting keys are allowed for login (active/owner keys are blocked for security)
- Client-side private key validation before server submission
- Signature-based authentication with challenge-response mechanism
- Server-side signature verification using account's posting public key

### Session Security
- HTTP-only cookies prevent XSS attacks
- Secure flag enabled in production
- 10-minute expiration for anonymous (challenge-only) sessions, 30-day for logged-in sessions, with automatic renewal (see "Session TTLs" above)
- Session invalidation on logout

### Key Management
- Private keys are never stored on the server
- Only session tokens and public keys are maintained
- Client-side key derivation for master password login
- WIF private key support for direct posting key login
