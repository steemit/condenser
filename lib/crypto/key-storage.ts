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
 * - The key persists until explicit logout.
 */

const STORAGE_KEY = 'steem_encrypted_key';
const MEMORY_CACHE_KEY = 'steem_decrypted_key';
const MEMORY_CACHE_USERNAME_KEY = 'steem_decrypted_key_username';
const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_DERIVATION_ALGORITHM = 'PBKDF2';

interface EncryptedKeyData {
  encrypted: string; // Base64 encoded encrypted key
  iv: string; // Base64 encoded initialization vector
  salt: string; // Base64 encoded salt for key derivation
  username: string; // Associated username
  timestamp: number; // Encryption timestamp
}

/** Shape used when Web Crypto subtle is unavailable (plaintext fallback). */
interface PlainKeyData {
  plain: string;
  username: string;
  timestamp: number;
}

/**
 * crypto.subtle exists only in secure contexts (HTTPS or localhost). Plain
 * HTTP over a LAN IP (e.g. http://192.168.x.x during development) has no
 * subtle API at all — degrade to plaintext localStorage there. That is
 * acceptable: on a non-secure context the page itself is already plaintext,
 * so encryption would buy nothing; production is always HTTPS.
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
  const w = window as unknown as { [key: string]: string };
  w[MEMORY_CACHE_KEY] = privateKeyWif;
  w[MEMORY_CACHE_USERNAME_KEY] = username;
}

/**
 * Encrypt and store the private key.
 * Uses application-level key material derived from username.
 *
 * The decrypted key is always cached in memory (lost when the tab closes).
 * With `persist` (the legacy "keep me logged in" checkbox) the encrypted key
 * is additionally written to localStorage, where it survives reloads and new
 * tabs until explicit logout — matching legacy condenser's `autopost2`.
 */
export async function encryptAndStoreKey(
  privateKeyWif: string,
  username: string,
  persist = true
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Key storage is only available in browser environment');
  }

  // Non-secure context (plain HTTP over LAN etc.): no crypto.subtle.
  // Fall back to plaintext localStorage — see isSubtleCryptoAvailable().
  if (!isSubtleCryptoAvailable()) {
    if (persist) {
      console.warn(
        'Web Crypto subtle API unavailable (non-secure context); storing the posting key unencrypted in localStorage. Use HTTPS in production.'
      );
      const plainData: PlainKeyData = { plain: privateKeyWif, username, timestamp: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plainData));
    }
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

    if (persist) {
      const encryptedKeyData: EncryptedKeyData = {
        encrypted: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
        iv: btoa(String.fromCharCode(...iv)),
        salt: btoa(String.fromCharCode(...salt)),
        username,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedKeyData));
    }

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
    // legacy autopost2 entry did.
    if (!localStorage.getItem(STORAGE_KEY)) {
      const legacy = sessionStorage.getItem(STORAGE_KEY);
      if (legacy) {
        localStorage.setItem(STORAGE_KEY, legacy);
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }

    const stored = localStorage.getItem(STORAGE_KEY);

    // Check memory cache first
    const w = window as unknown as { [key: string]: string };
    const cachedKey = w[MEMORY_CACHE_KEY];
    if (cachedKey) {
      const username = stored
        ? (JSON.parse(stored) as EncryptedKeyData | PlainKeyData).username
        : w[MEMORY_CACHE_USERNAME_KEY];
      if (username) {
        return { privateKey: cachedKey, username };
      }
    }

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);

    // Plaintext fallback written on non-secure contexts (no crypto.subtle).
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
  return (window as unknown as { [key: string]: string })[MEMORY_CACHE_KEY] || null;
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
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
  // Also clear any legacy sessionStorage entry left by older versions.
  sessionStorage.removeItem(STORAGE_KEY);
  const w = window as unknown as { [key: string]: string };
  delete w[MEMORY_CACHE_KEY];
  delete w[MEMORY_CACHE_USERNAME_KEY];
}
