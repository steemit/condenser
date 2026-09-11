import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  encryptAndStoreKey,
  decryptAndRetrieveKey,
  clearStoredKey,
  hasStoredKey,
  getCachedKey,
} from '@/lib/crypto/key-storage';

function clearMemoryCache() {
  const w = window as unknown as Record<string, unknown>;
  delete w['steem_decrypted_key'];
  delete w['steem_decrypted_key_username'];
}

describe('key-storage on non-secure contexts (no crypto.subtle)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearStoredKey();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('falls back to plaintext localStorage and roundtrips the key', async () => {
    // Plain HTTP over a LAN IP has no Web Crypto subtle API at all.
    vi.stubGlobal('crypto', { getRandomValues: (a: Uint8Array) => a });

    await encryptAndStoreKey('5K-test-wif', 'alice');
    expect(hasStoredKey()).toBe(true);
    expect(localStorage.getItem('steem_encrypted_key')).not.toBeNull();

    // Simulate a fresh page load: only localStorage survives.
    clearMemoryCache();
    const result = await decryptAndRetrieveKey();
    expect(result).toEqual({ privateKey: '5K-test-wif', username: 'alice' });
  });

  it('with persist=false keeps the key in memory only', async () => {
    vi.stubGlobal('crypto', { getRandomValues: (a: Uint8Array) => a });

    await encryptAndStoreKey('5K-test-wif', 'alice', false);
    expect(localStorage.getItem('steem_encrypted_key')).toBeNull();
    expect(sessionStorage.getItem('steem_encrypted_key')).toBeNull();
    expect(hasStoredKey()).toBe(false);
    expect(getCachedKey()).toBe('5K-test-wif');

    // Signing within the same tab session still works.
    const result = await decryptAndRetrieveKey();
    expect(result).toEqual({ privateKey: '5K-test-wif', username: 'alice' });

    // A page reload drops the key entirely.
    clearMemoryCache();
    expect(await decryptAndRetrieveKey()).toBeNull();
  });

  it('migrates a legacy sessionStorage entry into localStorage', async () => {
    vi.stubGlobal('crypto', { getRandomValues: (a: Uint8Array) => a });

    // Older versions wrote the (plaintext fallback) entry to sessionStorage.
    sessionStorage.setItem(
      'steem_encrypted_key',
      JSON.stringify({ plain: '5K-test-wif', username: 'alice', timestamp: 1 })
    );

    const result = await decryptAndRetrieveKey();
    expect(result).toEqual({ privateKey: '5K-test-wif', username: 'alice' });
    expect(sessionStorage.getItem('steem_encrypted_key')).toBeNull();
    expect(localStorage.getItem('steem_encrypted_key')).not.toBeNull();
  });

  it('clearStoredKey clears localStorage, sessionStorage and the memory cache', async () => {
    vi.stubGlobal('crypto', { getRandomValues: (a: Uint8Array) => a });

    await encryptAndStoreKey('5K-test-wif', 'alice');
    sessionStorage.setItem('steem_encrypted_key', '{"plain":"legacy"}');

    clearStoredKey();

    expect(localStorage.getItem('steem_encrypted_key')).toBeNull();
    expect(sessionStorage.getItem('steem_encrypted_key')).toBeNull();
    expect(getCachedKey()).toBeNull();
    expect(hasStoredKey()).toBe(false);
  });
});
