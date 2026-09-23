/**
 * Client-side posting key storage.
 *
 * Threat model:
 * - The stored key is the posting key only — the lowest-privilege key
 *   (posting/memo), never active/owner.
 * - Persisting it in localStorage matches legacy condenser behavior (legacy
 *   stored it as plain hex in `autopost2`).
 * - The AES-GCM encryption is obfuscation only: the key material
 *   (origin + username) is derivable by any same-origin script, so this does
 *   NOT protect against XSS. Key leakage under XSS is an accepted trade-off,
 *   since a posting key cannot move funds.
 * - After decryption the WIF lives in the module-scoped variables below, NOT
 *   in window properties: an own enumerable window global is visible to any
 *   same-origin script via `Object.keys(window)` (and enumerable by
 *   low-privilege extension sandboxes), widening the theft surface for zero
 *   benefit. A module closure is behaviorally equivalent for our purposes —
 *   per-tab lifetime, never shared across reloads or tabs — while being
 *   reachable only through this module's exported API. This is hardening, not
 *   XSS protection (see the AES-GCM note above).
 * - The key persists until explicit logout.
 *
 * Module state and SSR: this module is client-only by construction — every
 * setter (encryptAndStoreKey) throws on the server and every reader
 * (decryptAndRetrieveKey / getCachedKey) returns null there, so the module
 * variables below can only ever be populated in a browser tab and cannot leak
 * across server requests or users.
 */

const STORAGE_KEY = 'steem_encrypted_key';
const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_DERIVATION_ALGORITHM = 'PBKDF2';

// In-memory cache of the decrypted WIF. Module scope instead of window
// globals (audit N-07): see the threat-model note above. Lifecycle is
// identical to the old window properties — populated on login/decrypt,
// cleared on logout, dropped with the tab (a reload re-imports the module
// with both variables back to null).
let cachedWif: string | null = null;
let cachedWifUsername: string | null = null;

interface EncryptedKeyData {
  encrypted: string; // Base64 encoded encrypted key
  iv: string; // Base64 encoded initialization vector
  salt: string; // Base64 encoded salt for key derivation
  username: string; // Associated username
  timestamp: number; // Encryption timestamp
}

/**
 * Shape written by pre-N-24 versions on non-secure contexts (plaintext
 * fallback). No longer written (persistence is disabled there — audit
 * N-24); kept only so decryptAndRetrieveKey can still read entries written
 * by older versions until the user logs out.
 */
interface PlainKeyData {
  plain: string;
  username: string;
  timestamp: number;
}

/**
 * crypto.subtle exists only in secure contexts (HTTPS or localhost). Plain
 * HTTP over a LAN IP (e.g. http://192.168.x.x during development) has no
 * subtle API at all.
 */
function isSubtleCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && !!crypto.subtle;
}

/**
 * Get application-level encryption key material
 * Uses a combination of application identifier and username for key derivation
 */
function getEncryptionKeyMaterial(username: string): string {
  // Use application identifier + username for key derivation
  // This ensures each user has a unique encryption key
  const appId = typeof window !== 'undefined'
    ? (window.location.origin || 'steem-condenser')
    : 'steem-condenser';
  return `${appId}:${username}:key-storage`;
}

/**
 * Derive encryption key from key material using PBKDF2
 */
async function deriveKey(
  keyMaterial: string,
  salt: Uint8Array,
  keyUsage: KeyUsage[] = ['encrypt', 'decrypt']
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const materialKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(keyMaterial),
    { name: KEY_DERIVATION_ALGORITHM },
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: KEY_DERIVATION_ALGORITHM,
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    materialKey,
    { name: ENCRYPTION_ALGORITHM, length: 256 },
    false,
    keyUsage
  );
}

function setMemoryCache(privateKeyWif: string, username: string): void {
  cachedWif = privateKeyWif;
  cachedWifUsername = username;
}

/**
 * Encrypt and store the private key.
 * Uses application-level key material derived from username.
 *
 * The decrypted key is always cached in memory (lost when the tab closes).
 * With `persist` (the legacy "keep me logged in" checkbox) the encrypted key
 * is additionally written to localStorage, where it survives reloads and new
 * tabs until explicit logout — matching legacy condenser's `autopost2`.
 *
 * Non-secure contexts (plain HTTP to a LAN IP — NOT dev http://localhost,
 * which is a secure context) force persist off (audit N-24): localStorage
 * there is readable by any network attacker, so nothing is written and the
 * key lives in the memory cache for the current tab only.
 */
export async function encryptAndStoreKey(
  privateKeyWif: string,
  username: string,
  persist = true
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Key storage is only available in browser environment');
  }

  // Audit N-24: never persist the key on a non-secure context. The page
  // itself is plaintext there, so the "keep me logged in" convenience would
  // hand the WIF to anyone on the path. Keep the memory cache so the
  // current tab keeps working.
  if (!window.isSecureContext && persist) {
    persist = false;
    console.warn(
      'Non-secure context (plain HTTP): the posting key is kept in memory for this tab only and will not be persisted. Serve the app over HTTPS to stay logged in across reloads.'
    );
  }

  // No WebCrypto at all (also implies a non-secure context in practice):
  // same policy — memory cache only, nothing written.
  if (!isSubtleCryptoAvailable()) {
    if (persist) {
      persist = false;
      console.warn(
        'Web Crypto subtle API unavailable; the posting key is kept in memory for this tab only and will not be persisted.'
      );
    }
  }

  if (!persist) {
    setMemoryCache(privateKeyWif, username);
    return;
  }

  try {
    // Generate salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96 bits for GCM

    // Derive encryption key from application identifier + username
    const keyMaterial = getEncryptionKeyMaterial(username);
    const encryptionKey = await deriveKey(keyMaterial, salt);

    // Encrypt the private key
    const encoder = new TextEncoder();
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv,
      },
      encryptionKey,
      encoder.encode(privateKeyWif)
    );

    const encryptedKeyData: EncryptedKeyData = {
      encrypted: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
      iv: btoa(String.fromCharCode(...iv)),
      salt: btoa(String.fromCharCode(...salt)),
      username,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedKeyData));

    // Also cache the decrypted key in memory for performance
    setMemoryCache(privateKeyWif, username);
  } catch (error) {
    console.error('Failed to encrypt and store key:', error);
    throw new Error('Failed to securely store private key');
  }
}

/**
 * Decrypt and retrieve private key
 * Uses stored username to derive decryption key
 */
export async function decryptAndRetrieveKey(): Promise<{ privateKey: string; username: string } | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Migrate a legacy sessionStorage entry (written by versions before the
    // key became persistent) into localStorage so it survives like the
    // legacy autopost2 entry did. On a non-secure context nothing may be
    // persisted (audit N-24), so the entry is read in place instead.
    let stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const legacy = sessionStorage.getItem(STORAGE_KEY);
      if (legacy) {
        if (window.isSecureContext) {
          localStorage.setItem(STORAGE_KEY, legacy);
          sessionStorage.removeItem(STORAGE_KEY);
        }
        stored = legacy;
      }
    }

    // Check memory cache first
    if (cachedWif) {
      const username = stored
        ? (JSON.parse(stored) as EncryptedKeyData | PlainKeyData).username
        : cachedWifUsername;
      if (username) {
        return { privateKey: cachedWif, username };
      }
    }

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);

    // Plaintext entry written by a pre-N-24 version on a non-secure
    // context: still readable so those sessions survive until logout, but
    // nothing new is ever written in this shape.
    if ('plain' in parsed) {
      const data = parsed as PlainKeyData;
      setMemoryCache(data.plain, data.username);
      return { privateKey: data.plain, username: data.username };
    }

    const encryptedKeyData: EncryptedKeyData = parsed;

    // Decode salt and IV
    const salt = Uint8Array.from(atob(encryptedKeyData.salt), (c) => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(encryptedKeyData.iv), (c) => c.charCodeAt(0));
    const encrypted = Uint8Array.from(atob(encryptedKeyData.encrypted), (c) => c.charCodeAt(0));

    // Derive decryption key using stored username
    const keyMaterial = getEncryptionKeyMaterial(encryptedKeyData.username);
    const decryptionKey = await deriveKey(keyMaterial, salt);

    // Decrypt
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv,
      },
      decryptionKey,
      encrypted
    );

    const decoder = new TextDecoder();
    const privateKey = decoder.decode(decryptedData);

    // Cache in memory
    setMemoryCache(privateKey, encryptedKeyData.username);

    return {
      privateKey,
      username: encryptedKeyData.username,
    };
  } catch (error) {
    console.error('Failed to decrypt key:', error);
    return null;
  }
}

/**
 * Get cached private key from memory (if available)
 */
export function getCachedKey(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return cachedWif || null;
}

/**
 * Check if a persisted key exists in storage
 */
export function hasStoredKey(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return (
    localStorage.getItem(STORAGE_KEY) !== null ||
    sessionStorage.getItem(STORAGE_KEY) !== null
  );
}

/**
 * Get stored username without decrypting
 */
export function getStoredUsername(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const stored = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }
  try {
    const data: EncryptedKeyData = JSON.parse(stored);
    return data.username;
  } catch {
    return null;
  }
}

/**
 * Clear stored key (logout)
 */
export function clearStoredKey(): void {
  // Clear the in-memory cache unconditionally (module state; on the server
  // both variables are always null, so this is a no-op there).
  cachedWif = null;
  cachedWifUsername = null;
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
  // Also clear any legacy sessionStorage entry left by older versions.
  sessionStorage.removeItem(STORAGE_KEY);
}
