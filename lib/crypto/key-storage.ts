/**
 * Secure client-side private key storage
 * Uses Web Crypto API for encryption and sessionStorage for persistence
 * Memory cache for performance, cleared on page visibility change
 */

const STORAGE_KEY = 'steem_encrypted_key';
const MEMORY_CACHE_KEY = 'steem_decrypted_key';
const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_DERIVATION_ALGORITHM = 'PBKDF2';

interface EncryptedKeyData {
  encrypted: string; // Base64 encoded encrypted key
  iv: string; // Base64 encoded initialization vector
  salt: string; // Base64 encoded salt for key derivation
  username: string; // Associated username
  timestamp: number; // Encryption timestamp
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

/**
 * Encrypt and store private key
 * Uses application-level key material derived from username
 */
export async function encryptAndStoreKey(
  privateKeyWif: string,
  username: string
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Key storage is only available in browser environment');
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

    // Store encrypted data
    const encryptedKeyData: EncryptedKeyData = {
      encrypted: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
      iv: btoa(String.fromCharCode(...iv)),
      salt: btoa(String.fromCharCode(...salt)),
      username,
      timestamp: Date.now(),
    };

    // Store in sessionStorage (cleared when tab closes)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedKeyData));

    // Also cache decrypted key in memory for performance
    // This will be cleared on page visibility change
    if (typeof window !== 'undefined') {
      (window as unknown as { [key: string]: string })[MEMORY_CACHE_KEY] = privateKeyWif;
    }
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
    // Check memory cache first
    const cachedKey = (window as unknown as { [key: string]: string })[MEMORY_CACHE_KEY];
    if (cachedKey) {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: EncryptedKeyData = JSON.parse(stored);
        return {
          privateKey: cachedKey,
          username: data.username,
        };
      }
    }

    // Retrieve from sessionStorage
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const encryptedKeyData: EncryptedKeyData = JSON.parse(stored);

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
    (window as unknown as { [key: string]: string })[MEMORY_CACHE_KEY] = privateKey;

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
 * Check if encrypted key exists in storage
 */
export function hasStoredKey(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return sessionStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Get stored username without decrypting
 */
export function getStoredUsername(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const stored = sessionStorage.getItem(STORAGE_KEY);
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
  sessionStorage.removeItem(STORAGE_KEY);
  delete (window as unknown as { [key: string]: string })[MEMORY_CACHE_KEY];
}

/**
 * Initialize key lifecycle management
 * Clears memory cache when page becomes hidden
 */
export function initializeKeyLifecycle(): () => void {
  if (typeof window === 'undefined') {
    return () => {}; // No-op for SSR
  }

  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Page is hidden, clear memory cache for security
      // Encrypted key remains in sessionStorage
      delete (window as unknown as { [key: string]: string })[MEMORY_CACHE_KEY];
    }
  };

  const handleBeforeUnload = () => {
    // Clear everything on page unload
    clearStoredKey();
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);

  // Return cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}
