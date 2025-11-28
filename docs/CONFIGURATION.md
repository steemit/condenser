# Configuration Guide

## Environment Variables

### Steem API Configuration
```bash
STEEMD_CONNECTION_SERVER=https://api.steemit.com
STEEMD_CONNECTION_CLIENT=https://api.steemit.com
STEEMD_USE_APPBASE=true
CHAIN_ID=0000000000000000000000000000000000000000000000000000000000000000
ADDRESS_PREFIX=STM
```

### Authentication
```bash
JWT_SECRET=your-secret-key-change-in-production
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
```

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
