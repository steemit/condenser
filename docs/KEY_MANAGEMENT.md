# Private Key Management and Transaction Signing

## Overview

The Next.js version implements a secure client-side private key management system that addresses the challenge of maintaining private keys across page refreshes while maintaining security. Unlike the legacy single-page application that could keep keys in memory, this system uses encrypted storage with automatic lifecycle management.

## Architecture

### Key Principles

1. **Client-Side Signing**: All transactions are signed on the client before being sent to the API
2. **API as Forwarder**: The API layer only forwards pre-signed transactions to the Steem network
3. **No Server Storage**: Private keys are never stored on the server
4. **Encrypted Storage**: Private keys are encrypted before storage using Web Crypto API
5. **Automatic Cleanup**: Keys are cleared when pages become hidden or tabs are closed

## Key Storage System

### Storage Mechanism

The system uses a two-tier storage approach:

1. **Encrypted Storage (sessionStorage)**: 
   - Private keys are encrypted with user's password using AES-GCM
   - Stored in `sessionStorage` (automatically cleared when tab closes)
   - Uses PBKDF2 for key derivation (100,000 iterations)

2. **Memory Cache**:
   - Decrypted keys are cached in memory for performance
   - Automatically cleared when page becomes hidden
   - Re-encrypted key remains in sessionStorage for later use

### Security Features

- **Web Crypto API**: Industry-standard encryption
- **AES-GCM**: Authenticated encryption with associated data
- **PBKDF2**: Password-based key derivation (100,000 iterations)
- **Random IV/Salt**: Unique encryption parameters for each storage
- **Session-Based**: Keys cleared on tab close
- **Visibility-Based Cleanup**: Memory cache cleared when page hidden

## Transaction Signing Flow

### 1. User Login

```typescript
// User logs in with password or WIF private key
// After successful authentication:
await encryptAndStoreKey(privateKeyWif, username, password);
```

### 2. Transaction Creation

```typescript
// Client creates transaction locally
const signedTransaction = await signCommentOperation(privateKey, {
  parentAuthor: '',
  parentPermlink: 'hive-123456',
  author: 'alice',
  permlink: 'my-post',
  title: 'My Post Title',
  body: 'Post content...',
  jsonMetadata: '{}',
});
```

### 3. Transaction Broadcasting

```typescript
// Client sends signed transaction to API
const result = await broadcastSignedTransaction(signedTransaction);

// API only forwards, never signs
// POST /api/steem/broadcast
// { signedTransaction: { ...operations, signatures: [...] } }
```

## API Design

### Broadcast API (`/api/steem/broadcast`)

**Input:**
```json
{
  "signedTransaction": {
    "ref_block_num": 12345,
    "ref_block_prefix": 1234567890,
    "expiration": "2024-01-01T12:00:00",
    "operations": [
      ["comment", { ... }]
    ],
    "extensions": [],
    "signatures": ["1f2a3b4c..."]
  }
}
```

**Output:**
```json
{
  "success": true,
  "result": { ... },
  "transactionId": "abc123...",
  "permlink": "my-post"
}
```

**Security:**
- Validates transaction structure
- Verifies signatures exist
- Does NOT sign or modify transactions
- Only forwards to Steem network

## Key Lifecycle Management

### Initialization

```typescript
// Initialize on app load
useEffect(() => {
  const cleanup = initializeKeyLifecycle();
  return cleanup;
}, []);
```

### Lifecycle Events

1. **Page Visible**: Key loaded from sessionStorage and cached in memory
2. **Page Hidden**: Memory cache cleared (encrypted key remains)
3. **Tab Closed**: sessionStorage cleared (all keys removed)
4. **User Logout**: Explicitly clears all storage

### Memory Cache Strategy

- **Fast Access**: Decrypted keys cached in memory for quick signing
- **Security**: Cleared when page becomes hidden
- **Persistence**: Encrypted key remains in sessionStorage
- **Re-authentication**: User can decrypt again with password if needed

## Usage Examples

### Posting a Comment

```typescript
import { broadcastComment } from '@/lib/api/broadcast';

// Key is automatically retrieved from memory cache or sessionStorage
const result = await broadcastComment({
  parentAuthor: '',
  parentPermlink: 'hive-123456',
  author: 'alice',
  permlink: 'my-comment',
  title: '',
  body: 'This is my comment',
  jsonMetadata: '{}',
  // password: 'optional' // Only needed if key not in memory
});
```

### Voting

```typescript
import { broadcastVote } from '@/lib/api/broadcast';

const result = await broadcastVote({
  voter: 'alice',
  author: 'bob',
  permlink: 'post-title',
  weight: 10000, // 100% upvote
});
```

### Custom JSON Operations

```typescript
import { broadcastCustomJson } from '@/lib/api/broadcast';

// Follow operation
const result = await broadcastCustomJson({
  requiredAuths: [],
  requiredPostingAuths: ['alice'],
  id: 'follow',
  json: JSON.stringify(['follow', {
    follower: 'alice',
    following: 'bob',
    what: ['blog']
  }]),
});
```

## Security Considerations

### Advantages Over Legacy System

1. **No Server-Side Key Storage**: Keys never leave the client
2. **Encrypted Storage**: Even if sessionStorage is compromised, keys are encrypted
3. **Automatic Cleanup**: Keys cleared on tab close or page hide
4. **API Security**: API cannot sign transactions, only forwards them
5. **Password Protection**: Encrypted keys require password to decrypt

### Limitations

1. **Page Refresh**: Requires re-authentication if memory cache cleared
2. **Password Required**: User must remember password for re-decryption
3. **Session-Based**: Keys lost on tab close (by design for security)

### Best Practices

1. **Use "Keep me logged in"**: Stores encrypted key for session
2. **Don't share passwords**: Each user should have unique password
3. **Logout when done**: Explicitly clear keys when finished
4. **Use secure passwords**: Strong passwords protect encrypted keys

## Migration from Legacy

### Key Differences

| Legacy | Next.js |
|--------|---------|
| Memory-only storage | Encrypted sessionStorage + memory cache |
| Survives page refresh | Requires re-authentication after refresh |
| No encryption | AES-GCM encryption with password |
| Server-side signing | Client-side signing only |
| API signs transactions | API only forwards |

### Benefits

1. **Better Security**: Encrypted storage with automatic cleanup
2. **API Simplification**: API doesn't need to handle keys
3. **User Control**: Users control their own keys
4. **Compliance**: Better alignment with security best practices

## Implementation Details

### Files

- `lib/crypto/key-storage.ts`: Encryption and storage utilities
- `lib/crypto/transaction-signer.ts`: Transaction signing functions
- `lib/api/broadcast.ts`: Client-side broadcast API
- `app/api/steem/broadcast/route.ts`: Server-side forwarder API
- `app/api/steem/dynamic-global-properties/route.ts`: Transaction header data

### Dependencies

- Web Crypto API (browser built-in)
- `@steemit/steem-js`: Transaction serialization and signing
- sessionStorage: Encrypted key storage

## Future Enhancements

1. **Biometric Authentication**: Use WebAuthn for key decryption
2. **Hardware Wallet Support**: Integration with hardware security modules
3. **Key Rotation**: Automatic key rotation for enhanced security
4. **Multi-Device Sync**: Secure key sync across devices (with user consent)
