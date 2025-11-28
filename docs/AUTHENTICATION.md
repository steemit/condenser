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
JWT_SECRET=your-secret-key-change-in-production
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
REDIS_KEY_PREFIX=steem:session:
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
- **Automatic Expiration**: 30-day TTL with renewal

### Key Management Security
- **No Server Storage**: Private keys never stored on server
- **Memory Safety**: Keys cleared from memory after use
- **Role Restriction**: Only posting authority allowed
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
