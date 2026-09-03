# Configuration Guide

## Environment Variables

### Steem API Configuration
```bash
# Unified API URL
STEEM_API_URL=https://api.steemit.com

STEEMD_USE_APPBASE=true
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
JWT_SECRET=your-secret-key-change-in-production
# NOTE: production deployments fail closed without a real JWT_SECRET
# (session creation/verification throws) — the fallback secret is dev-only.
```

### Session Management - Redis (Optional)

For distributed deployments, Redis-based session management is recommended. If Redis is not configured, the system will fall back to JWT-based sessions.

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
REDIS_KEY_PREFIX=steem:session:
```

### Other Configuration
```bash
NEXT_PUBLIC_SIGNUP_URL=https://signup.steemit.com
ELASTICSEARCH_URL=http://localhost:9200

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
# Coin Marketplace right-rail module (legacy steem_market_*). No endpoint
# configured means the module stays hidden.
STEEM_MARKET_ENDPOINT=
STEEM_MARKET_TOKEN=
```

### Analytics (overseer)

Overseer metrics (route views, user actions, activity campaigns) replicate the
legacy `ServerApiClient.js` reporting. The client posts to
`POST /api/steem/overseer`, which relays to the node's `overseer.collect`
JSON-RPC method (steem-js is server-only in the rewrite, unlike legacy which
called the node directly from the browser). No configuration is required — the
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

### Authentication
- Only posting keys are allowed for login (active/owner keys are blocked for security)
- Client-side private key validation before server submission
- Signature-based authentication with challenge-response mechanism
- Server-side signature verification using account's posting public key

### Session Security
- HTTP-only cookies prevent XSS attacks
- Secure flag enabled in production
- 30-day session expiration with automatic renewal
- Session invalidation on logout

### Key Management
- Private keys are never stored on the server
- Only session tokens and public keys are maintained
- Client-side key derivation for master password login
- WIF private key support for direct posting key login
