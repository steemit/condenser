# Authentication System

## Overview

The Condenser application has been updated with a secure, posting-key-only authentication system that eliminates the need for Steem Keychain and provides enhanced security for distributed deployments.

## Key Features

### 1. Posting Key Only Authentication
- **Security First**: Only posting keys are allowed for login
- **Active/Owner Key Blocking**: Active and owner keys are explicitly blocked for security
- **Client-Side Validation**: Private keys are validated on the client before submission
- **No Key Storage**: Private keys are never stored on the server

### 2. Signature-Based Authentication Flow

#### Step 1: Client-Side Key Validation
```typescript
// Validate private key matches account's posting public key
const validation = validatePostingKey(privateKeyWif, expectedPostingPublicKey);
```

#### Step 2: Challenge-Response Authentication
```typescript
// Get challenge from server
const { challenge } = await fetch('/api/auth/challenge');

// Sign authentication data with private key
const signatureResult = signAuthData(privateKeyWif, username, challenge);
```

#### Step 3: Server-Side Signature Verification
```typescript
// Verify signature matches account's posting authority
const isValidSignature = sig.verifyHash(Buffer.from(data, 'utf8'), pubKey);
```

### 3. Distributed Session Management

#### Redis-Based Sessions (Recommended for Production)
- **Scalability**: Supports multiple server instances
- **Performance**: Fast session lookup and management
- **Advanced Features**: Logout from all devices, session analytics
- **Automatic Expiration**: Built-in TTL management

#### JWT Fallback (Development/Single Instance)
- **No Dependencies**: Works without external services
- **Stateless**: Self-contained session tokens
- **HTTP-Only Cookies**: XSS protection
- **Revocable**: logout/login record the token's `jti` in a denylist (in-process + Redis mirror when reachable) until its `exp` (audit CS-01)
- **Bounded Lifetime**: logged-in fallback tokens expire after 12 hours (sliding via re-signing on session writes), instead of the 30-day Redis-session TTL

## Implementation Details

### Client-Side Components

#### `lib/crypto/client.ts`
- Private key validation and public key derivation
- Signature generation for authentication
- Master password to posting key derivation
- WIF format detection and validation

#### `components/modules/LoginForm.tsx`
- Updated UI for posting-key-only authentication
- Real-time key validation feedback
- Secure authentication flow implementation

### Server-Side Components

#### `app/api/auth/challenge/route.ts`
- Generates secure random challenges for signature authentication
- Creates temporary sessions for challenge tracking

#### `app/api/auth/login/route.ts`
- Signature verification using account's posting public key
- Session creation and cookie management
- Security validation and error handling

#### `lib/auth/csrf.ts`
- CSRF double-submit token (audit N-22). Every session carries a random
  `csrfToken`, mirrored into the non-HttpOnly `steem-csrf` cookie by
  `GET /api/auth/challenge`, `GET /api/auth/session` and every
  session-writing route. The session-writing routes (`POST
  /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/preferences`)
  require the `X-CSRF-Token` request header to match the session value
  (403 otherwise) and require `Content-Type: application/json` (415
  otherwise). Clients use `postJsonWithCsrf()` (lib/api/csrf.ts), which
  reads the cookie, attaches the header and retries once via
  `GET /api/auth/session` when a pre-rollout session answers 403.
  The broadcast relay is intentionally not covered: it carries no session
  (authenticity comes from the client-side signature the chain verifies).

#### `lib/auth/session.ts`
- Hybrid session management (Redis + JWT fallback)
- Secure cookie handling
- Session lifecycle management

#### `lib/auth/redis-session.ts`
- Redis-based session storage adapter
- Connection management and error handling
- Session cleanup and maintenance utilities

## Configuration

### Environment Variables

#### Required
```bash
# Strong random secret (>= 32 bytes), required in every environment;
# session endpoints fail closed without it. Generate with:
#   openssl rand -hex 32
JWT_SECRET=<output of openssl rand -hex 32>
```

#### Optional (Redis)
```bash
# Option 1: Redis URL
REDIS_URL=redis://localhost:6379

# Option 2: Individual settings
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0
# Session key prefix (individual-settings mode only). Pre-split note: the old
# shared REDIS_KEY_PREFIX set both this and the content-cache prefix at once;
# it still works but is deprecated — see docs/CONFIGURATION.md.
REDIS_SESSION_KEY_PREFIX=steem:session:
```

### Session Storage Selection
1. If Redis is configured and available → Use Redis sessions
2. If Redis is not available → Fallback to JWT sessions
3. Automatic failover if Redis connection is lost

## Security Features

### Authentication Security
- **Private Key Validation**: Client-side validation before server submission
- **Challenge-Response**: Prevents replay attacks
- **Signature Verification**: Cryptographic proof of key ownership
- **Public Key Matching**: Ensures key belongs to the account

### Session Security
- **HTTP-Only Cookies**: Prevents XSS attacks
- **Secure Flag**: HTTPS-only in production
- **SameSite Protection**: CSRF protection
- **Automatic Expiration**: 10-minute TTL for anonymous (challenge-only) sessions, 30-day TTL for logged-in Redis-backed sessions, renewed on activity; logged-in fallback JWTs expire after 12 hours (audit CS-01), sliding with each session rewrite
- **JWT_SECRET Fail Closed**: session creation/verification throws in any environment when `JWT_SECRET` is missing, shorter than 32 bytes, or the shipped placeholder — a weak secret lets anyone mint session cookies (including forged login challenges)
- **Session Revocation (Redis mode)**: logout and successful login revoke the superseded Redis session id server-side (`revokeSession()` → `RedisSession.deleteSession()`), so the old token cannot be replayed after the cookie is rotated
- **Session Revocation (JWT fallback, audit CS-01)**: fallback JWTs carry a unique per-token `jti` (a SHA-256 token digest for tokens minted before the `jti` rollout). Logout/login denylists that key until the token's own `exp` — always in-process on the instance that served the request, mirrored to Redis (`revoked-jwt:` keys, TTL = remaining token lifetime — under the session key prefix in `REDIS_HOST` mode; `REDIS_URL` deployments keep unprefixed session keys by design, so the denylist keys are raw there) when reachable so other instances honor it, and re-mirrored lazily after Redis recovers. `verifySession` rejects denylisted tokens. Residual risk: during a full Redis outage in a multi-instance deployment, revocation is only honored per-instance until the outage ends (bounded by the 12-hour fallback TTL); use Redis sessions (`REDIS_URL`) in production for immediate cluster-wide revocation
- **Single Live Session Id (Redis mode)**: reads/writes that refresh an existing session (the `withSession` read path, challenge, preferences) rewrite it in place under the SAME Redis id (`RedisSession.updateSession` is a set-if-exists `SET ... XX` and never mints keys); if the in-place rewrite fails, the superseded id is revoked before a replacement is minted — so a session lineage holds at most one live id at any time and logout kills it (audit CD-02: previously every session read minted a new id and left the old one valid for up to 30 days, surviving logout)

### Key Management Security
- **No Server Storage**: Private keys never stored on server
- **Posting Key Only**: Only the lowest-privilege key (posting/memo) is stored; active/owner keys are rejected at login
- **"Keep me logged in" Persistence**: When checked, the posting key is AES-GCM encrypted and persisted in localStorage until explicit logout (legacy `autopost2` behavior); when unchecked it lives in memory only for the tab session
- **Obfuscation, Not Password Protection**: The encryption key material (origin + username) is derivable by any same-origin script, so this does not protect against XSS — an accepted trade-off since a posting key cannot move funds (see `docs/KEY_MANAGEMENT.md`)
- **Public Key Verification**: Server validates against blockchain data

## Migration from Legacy System

### Removed Components
- **Steem Keychain Integration**: Completely removed
- **Active/Owner Key Support**: Blocked for security
- **Password-Based Sessions**: Replaced with signature-based auth

### Updated Components
- **LoginForm**: New UI and validation logic
- **AuthThunks**: Simplified Redux actions
- **Session Management**: Hybrid Redis/JWT system

## Usage Examples

### Master Password Login
```typescript
// User enters master password
const privateKey = derivePostingKey(username, masterPassword);
const validation = validatePostingKey(privateKey, accountPostingKey);
```

### WIF Private Key Login
```typescript
// User enters WIF private key directly
const validation = validatePostingKey(wifPrivateKey, accountPostingKey);
```

### Session Management
```typescript
// Create session after successful authentication
const sessionToken = await loginUser(currentSession, username);
setSessionCookie(response, sessionToken);
```

## Benefits

1. **Enhanced Security**: Posting-key-only authentication reduces attack surface
2. **Scalability**: Redis support enables distributed deployments
3. **User Experience**: Faster authentication with client-side validation
4. **Maintainability**: Simplified codebase without Keychain dependencies
5. **Flexibility**: Supports both master passwords and direct WIF keys
