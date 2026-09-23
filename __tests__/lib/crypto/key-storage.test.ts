import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type KeyStorage = typeof import('@/lib/crypto/key-storage');

/**
 * The decrypted-key memory cache lives in module scope (audit N-07), so a
 * "fresh page load" is simulated by resetting the module registry and
 * re-importing: both cache variables come back null while localStorage (the
 * only thing that survives a reload in the browser) keeps its entry.
 */
async function loadFreshModule(): Promise<KeyStorage> {
  vi.resetModules();
  return await import('@/lib/crypto/key-storage');
}

describe('key-storage on non-secure contexts (no crypto.subtle)', () => {
  let keyStorage: KeyStorage;

  beforeEach(async () => {
    keyStorage = await loadFreshModule();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('does not persist the key on a non-secure context (audit N-24)', async () => {
    // Plain HTTP over a LAN IP has no Web Crypto subtle API at all (and
    // jsdom's isSecureContext is undefined — same class). Persistence is
    // disabled: nothing may be written to localStorage, but the memory
    // cache keeps the current tab working.
    vi.stubGlobal('crypto', { getRandomValues: (a: Uint8Array) => a });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await keyStorage.encryptAndStoreKey('5K-test-wif', 'alice');
    expect(localStorage.getItem('steem_encrypted_key')).toBeNull();
    expect(sessionStorage.getItem('steem_encrypted_key')).toBeNull();
    expect(keyStorage.hasStoredKey()).toBe(false);
    expect(keyStorage.getCachedKey()).toBe('5K-test-wif');
    expect(keyStorage.decryptAndRetrieveKey()).resolves.toEqual({
      privateKey: '5K-test-wif',
      username: 'alice',
    });
    expect(warn).toHaveBeenCalled();

    // A page reload drops the key entirely (memory cache only).
    const reloaded = await loadFreshModule();
    expect(reloaded.getCachedKey()).toBeNull();
    expect(await reloaded.decryptAndRetrieveKey()).toBeNull();
    warn.mockRestore();
  });

  it('forces persist off even on a secure context when subtle is unavailable (audit N-24)', async () => {
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      configurable: true,
    });
    vi.stubGlobal('crypto', { getRandomValues: (a: Uint8Array) => a });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    try {
      await keyStorage.encryptAndStoreKey('5K-test-wif', 'alice');
      expect(localStorage.getItem('steem_encrypted_key')).toBeNull();
      expect(keyStorage.getCachedKey()).toBe('5K-test-wif');
    } finally {
      Object.defineProperty(window, 'isSecureContext', {
        value: undefined,
        configurable: true,
      });
      warn.mockRestore();
    }
  });

  it('with persist=false keeps the key in memory only', async () => {
    vi.stubGlobal('crypto', { getRandomValues: (a: Uint8Array) => a });

    await keyStorage.encryptAndStoreKey('5K-test-wif', 'alice', false);
    expect(localStorage.getItem('steem_encrypted_key')).toBeNull();
    expect(sessionStorage.getItem('steem_encrypted_key')).toBeNull();
    expect(keyStorage.hasStoredKey()).toBe(false);
    expect(keyStorage.getCachedKey()).toBe('5K-test-wif');

    // Signing within the same tab session still works.
    const result = await keyStorage.decryptAndRetrieveKey();
    expect(result).toEqual({ privateKey: '5K-test-wif', username: 'alice' });

    // A page reload drops the key entirely.
    const reloaded = await loadFreshModule();
    expect(reloaded.getCachedKey()).toBeNull();
    expect(await reloaded.decryptAndRetrieveKey()).toBeNull();
  });

  it('migrates a legacy sessionStorage entry into localStorage on a secure context', async () => {
    vi.stubGlobal('crypto', { getRandomValues: (a: Uint8Array) => a });
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      configurable: true,
    });

    try {
      // Older versions wrote the (plaintext fallback) entry to sessionStorage.
      sessionStorage.setItem(
        'steem_encrypted_key',
        JSON.stringify({ plain: '5K-test-wif', username: 'alice', timestamp: 1 })
      );

      const result = await keyStorage.decryptAndRetrieveKey();
      expect(result).toEqual({ privateKey: '5K-test-wif', username: 'alice' });
      expect(sessionStorage.getItem('steem_encrypted_key')).toBeNull();
      expect(localStorage.getItem('steem_encrypted_key')).not.toBeNull();
    } finally {
      Object.defineProperty(window, 'isSecureContext', {
        value: undefined,
        configurable: true,
      });
    }
  });

  it('reads a legacy sessionStorage entry in place on a non-secure context (audit N-24)', async () => {
    vi.stubGlobal('crypto', { getRandomValues: (a: Uint8Array) => a });

    sessionStorage.setItem(
      'steem_encrypted_key',
      JSON.stringify({ plain: '5K-test-wif', username: 'alice', timestamp: 1 })
    );

    const result = await keyStorage.decryptAndRetrieveKey();
    expect(result).toEqual({ privateKey: '5K-test-wif', username: 'alice' });
    // Nothing copied into localStorage, and the in-place entry is kept
    // (removing it would lose the only copy).
    expect(localStorage.getItem('steem_encrypted_key')).toBeNull();
    expect(sessionStorage.getItem('steem_encrypted_key')).not.toBeNull();
  });

  it('clearStoredKey clears localStorage, sessionStorage and the memory cache', async () => {
    vi.stubGlobal('crypto', { getRandomValues: (a: Uint8Array) => a });

    await keyStorage.encryptAndStoreKey('5K-test-wif', 'alice');
    sessionStorage.setItem('steem_encrypted_key', '{"plain":"legacy"}');

    keyStorage.clearStoredKey();

    expect(localStorage.getItem('steem_encrypted_key')).toBeNull();
    expect(sessionStorage.getItem('steem_encrypted_key')).toBeNull();
    expect(keyStorage.getCachedKey()).toBeNull();
    expect(keyStorage.hasStoredKey()).toBe(false);
  });
});

describe('key-storage memory cache scope (audit N-07)', () => {
  let keyStorage: KeyStorage;

  beforeEach(async () => {
    keyStorage = await loadFreshModule();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('never exposes the decrypted key as an enumerable window global', async () => {
    vi.stubGlobal('crypto', { getRandomValues: (a: Uint8Array) => a });

    await keyStorage.encryptAndStoreKey('5K-test-wif', 'alice');

    // The cache used to live on window.steem_decrypted_key(_username), own
    // enumerable properties any same-origin script could walk via
    // Object.keys(window). It must now stay inside the module closure.
    const w = window as unknown as Record<string, unknown>;
    expect(w['steem_decrypted_key']).toBeUndefined();
    expect(w['steem_decrypted_key_username']).toBeUndefined();
    expect(Object.keys(window)).not.toContain('steem_decrypted_key');
    expect(Object.keys(window)).not.toContain('steem_decrypted_key_username');

    // …while remaining readable through the module API.
    expect(keyStorage.getCachedKey()).toBe('5K-test-wif');
  });

  it('does not serve the memory cache when no username can be resolved', async () => {
    vi.stubGlobal('crypto', { getRandomValues: (a: Uint8Array) => a });

    // persist=false with an empty username: the WIF is cached but the
    // username companion is empty and nothing is persisted, so the cache
    // cannot produce a (key, username) pair and must not report a hit.
    await keyStorage.encryptAndStoreKey('5K-orphan-wif', '', false);
    expect(keyStorage.getCachedKey()).toBe('5K-orphan-wif');
    expect(await keyStorage.decryptAndRetrieveKey()).toBeNull();
  });
});

describe('key-storage on secure contexts (AES-GCM)', () => {
  let keyStorage: KeyStorage;

  beforeEach(async () => {
    keyStorage = await loadFreshModule();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('encrypts before persisting and roundtrips the key across a reload', async () => {
    if (!globalThis.crypto?.subtle) {
      // Environments without Web Crypto are covered by the fallback suite.
      return;
    }
    // The AES-GCM path only persists on a secure context (audit N-24);
    // jsdom's isSecureContext is undefined, so simulate HTTPS.
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      configurable: true,
    });

    try {
      await keyStorage.encryptAndStoreKey('5J-encrypted-wif', 'bob');
      expect(keyStorage.hasStoredKey()).toBe(true);

    // The persisted entry must not contain the plaintext WIF.
    const stored = JSON.parse(localStorage.getItem('steem_encrypted_key')!);
    expect(stored.plain).toBeUndefined();
    expect(stored.encrypted).toBeDefined();
    expect(JSON.stringify(stored)).not.toContain('5J-encrypted-wif');

    // Simulate a fresh page load: the module cache starts empty and the key
    // is recovered from the encrypted localStorage entry.
    const reloaded = await loadFreshModule();
    expect(reloaded.getCachedKey()).toBeNull();
    const result = await reloaded.decryptAndRetrieveKey();
    expect(result).toEqual({ privateKey: '5J-encrypted-wif', username: 'bob' });

      // The decrypted key is cached in module memory for subsequent calls…
      expect(reloaded.getCachedKey()).toBe('5J-encrypted-wif');
      // …and never leaks onto window.
      const w = window as unknown as Record<string, unknown>;
      expect(w['steem_decrypted_key']).toBeUndefined();
      expect(Object.keys(window)).not.toContain('steem_decrypted_key');
    } finally {
      Object.defineProperty(window, 'isSecureContext', {
        value: undefined,
        configurable: true,
      });
    }
  });
});
