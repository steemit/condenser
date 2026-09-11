# Private Key Management and Transaction Signing

## Overview

The Next.js version implements client-side private key management that mirrors the legacy condenser lifecycle: the posting key is kept available for signing for the whole session, and — when the user opts in with "keep me logged in" — persisted across reloads and new tabs until explicit logout. Unlike the legacy app, which stored the posting key as plain hex in `localStorage['autopost2']`, the rewrite stores it AES-GCM encrypted in `localStorage['steem_encrypted_key']`.

## Architecture

### Key Principles

1. **Client-Side Signing**: All transactions are signed on the client before being sent to the API
2. **API as Forwarder**: The API layer only forwards pre-signed transactions to the Steem network
3. **No Server Storage**: Private keys are never stored on the server
4. **Posting Key Only**: Only the lowest-privilege key (posting/memo) is ever stored; active/owner keys are rejected at login
5. **Legacy Lifecycle**: "Keep me logged in" persists the key until logout; without it the key lives in memory only for the tab session

## Key Storage System

### Threat Model

- The stored key is the **posting key only** — the lowest-privilege key (posting/memo), never active/owner.
- Persisting it in localStorage **matches legacy condenser behavior** (legacy stored it as plain hex in `autopost2`).
- The AES-GCM encryption is **obfuscation only**: the key material (origin + username) is derivable by any same-origin script, so this does **NOT** protect against XSS. Key leakage under XSS is an accepted trade-off, since a posting key cannot move funds.
- The key **persists until explicit logout**.

### Storage Mechanism

The system uses a two-tier storage approach:

1. **Persistent Storage (localStorage, opt-in)**:
   - Written only when "keep me logged in" is checked at login
   - The posting key is encrypted with AES-GCM before storage (PBKDF2 key derivation, 100,000 iterations)
   - The encryption key material is derived from `origin:username:key-storage` — publicly derivable, so this is obfuscation, not password protection (see Threat Model)
   - Survives page reloads, new tabs, and browser restarts; cleared only by explicit logout

2. **Memory Cache (always)**:
   - The decrypted key is cached on `window` for fast signing
   - This is the *only* copy when "keep me logged in" is unchecked — the key is lost when the tab closes or reloads (legacy behavior: unchecked = in-memory only)
   - Disappears naturally when the tab closes

On non-secure contexts (plain HTTP, e.g. development over a LAN IP) `crypto.subtle` is unavailable; the system degrades to storing the key unencrypted in localStorage. Production is always HTTPS.

### Migration from Older Versions

Versions before this change wrote the encrypted key to `sessionStorage`. On first read, `decryptAndRetrieveKey` moves any such entry into localStorage and removes the sessionStorage copy, so existing sessions keep working. `clearStoredKey` clears both storages.

## Transaction Signing Flow

### 1. User Login

```typescript
// User logs in with their posting WIF private key.
// After successful authentication:
await encryptAndStoreKey(privateKeyWif, username, saveLogin);
// saveLogin (the "keep me logged in" checkbox) controls whether the
// encrypted key is persisted to localStorage or kept in memory only.
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

## Key Lifecycle

1. **Login**: Key validated, then cached in memory; encrypted copy persisted to localStorage if "keep me logged in" is checked
2. **Signing**: Key read from memory cache, falling back to decrypting the localStorage copy
3. **Page Reload / New Tab**: Memory cache is gone; with "keep me logged in" the key is restored from localStorage, without it the user must log in again
4. **Logout**: `clearStoredKey()` removes the localStorage entry (plus any legacy sessionStorage entry) and the memory cache

## Usage Examples

### Posting a Comment

```typescript
import { broadcastComment } from '@/lib/api/broadcast';

// Key is automatically retrieved from memory cache or localStorage
const result = await broadcastComment({
  parentAuthor: '',
  parentPermlink: 'hive-123456',
  author: 'alice',
  permlink: 'my-comment',
  title: '',
  body: 'This is my comment',
  jsonMetadata: '{}',
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
2. **Encrypted at Rest**: The persisted key is AES-GCM encrypted instead of legacy's plain hex (obfuscation only — see Threat Model)
3. **API Security**: API cannot sign transactions, only forwards them
4. **Posting Key Only**: Active/owner keys are rejected, so a leaked key cannot move funds

### Limitations

1. **XSS**: Any same-origin script can derive the encryption key material and decrypt the stored key. This is an accepted trade-off (posting keys cannot move funds) and is no worse than legacy's plaintext storage.
2. **Shared Devices**: With "keep me logged in", the key stays on the device until explicit logout — users on shared devices should uncheck it or log out.

### Best Practices

1. **Uncheck "Keep me logged in" on shared devices**: The key then lives in memory only for the tab session
2. **Logout when done**: Explicitly clears the persisted key
3. **Never enter active/owner keys**: The login form rejects them; only the posting key is ever stored

## Migration from Legacy

### Key Differences

| Legacy | Next.js |
|--------|---------|
| Plain hex WIF in `localStorage['autopost2']` (opt-in) | AES-GCM encrypted key in `localStorage['steem_encrypted_key']` (opt-in) |
| Unchecked: key in Redux memory for the tab session | Unchecked: key in memory cache for the tab session |
| Server-side signing possible | Client-side signing only |
| API signs transactions | API only forwards |

### Benefits

1. **Better Security at Rest**: Encrypted storage instead of plaintext hex
2. **API Simplification**: API doesn't need to handle keys
3. **User Control**: Users control their own keys
4. **Same UX as Legacy**: Identical "keep me logged in" semantics

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
- localStorage: Encrypted key storage (opt-in persistence)

## Future Enhancements

1. **Biometric Authentication**: Use WebAuthn for key decryption
2. **Hardware Wallet Support**: Integration with hardware security modules
3. **Key Rotation**: Automatic key rotation for enhanced security
4. **Multi-Device Sync**: Secure key sync across devices (with user consent)
