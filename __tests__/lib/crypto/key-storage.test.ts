import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  encryptAndStoreKey,
  decryptAndRetrieveKey,
  clearStoredKey,
  hasStoredKey,
} from '@/lib/crypto/key-storage';

describe('key-storage on non-secure contexts (no crypto.subtle)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearStoredKey();
    sessionStorage.clear();
  });

  it('falls back to plaintext sessionStorage and roundtrips the key', async () => {
    // Plain HTTP over a LAN IP has no Web Crypto subtle API at all.
    vi.stubGlobal('crypto', { getRandomValues: (a: Uint8Array) => a });

    await encryptAndStoreKey('5K-test-wif', 'alice');
    expect(hasStoredKey()).toBe(true);

    // Simulate a fresh page load: only sessionStorage survives.
    delete (window as unknown as Record<string, unknown>)['steem_decrypted_key'];
    const result = await decryptAndRetrieveKey();
    expect(result).toEqual({ privateKey: '5K-test-wif', username: 'alice' });
  });
});
