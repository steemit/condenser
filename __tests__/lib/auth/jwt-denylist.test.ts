// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * lib/auth/jwt-denylist (audit CS-01). The denylist is module-level state,
 * so each test loads a fresh module (vi.resetModules + dynamic import) with
 * the redis-session helpers mocked — same pattern as redis-session.test.ts.
 */

async function loadDenylist(
  setDenylistEntry: ReturnType<typeof vi.fn> = vi.fn(),
  hasDenylistEntry: ReturnType<typeof vi.fn> = vi.fn()
) {
  vi.doMock('@/lib/auth/redis-session', () => ({
    setDenylistEntry,
    hasDenylistEntry,
  }));
  return import('@/lib/auth/jwt-denylist');
}

describe('lib/auth/jwt-denylist (CS-01)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.doUnmock('@/lib/auth/redis-session');
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('denylistKeyFor', () => {
    it('prefers the token jti and falls back to the token digest', async () => {
      const { denylistKeyFor } = await loadDenylist();
      expect(denylistKeyFor('abc123', 'header.payload.sig')).toBe('abc123');
      // Deterministic SHA-256 hex of the token for pre-jti legacy tokens.
      const first = denylistKeyFor(undefined, 'header.payload.sig');
      const second = denylistKeyFor(undefined, 'header.payload.sig');
      expect(first).toMatch(/^[a-f0-9]{64}$/);
      expect(first).toBe(second);
      expect(denylistKeyFor(undefined, 'other.token.here')).not.toBe(first);
    });
  });

  describe('revokeJwt / isJwtRevoked', () => {
    it('records the revocation in-process when Redis is unavailable', async () => {
      const set = vi.fn().mockResolvedValue(false); // no Redis / mirror failed
      const has = vi.fn().mockResolvedValue(false);
      const { revokeJwt, isJwtRevoked } = await loadDenylist(set, has);

      expect(await isJwtRevoked('jti-1')).toBe(false);
      await revokeJwt('jti-1', Math.floor(Date.now() / 1000) + 3600);
      expect(await isJwtRevoked('jti-1')).toBe(true);
      expect(await isJwtRevoked('jti-2')).toBe(false); // scoped per key
    });

    it('is a no-op for a token that is already expired', async () => {
      const set = vi.fn().mockResolvedValue(true);
      const has = vi.fn().mockResolvedValue(false);
      const { revokeJwt, isJwtRevoked } = await loadDenylist(set, has);

      await revokeJwt('jti-old', Math.floor(Date.now() / 1000) - 10);
      expect(await isJwtRevoked('jti-old')).toBe(false);
      expect(set).not.toHaveBeenCalled();
    });

    it('never throws when a revoke is called with a non-positive expiry', async () => {
      const { revokeJwt } = await loadDenylist();
      await expect(revokeJwt('jti-0', 0)).resolves.toBeUndefined();
    });
  });

  describe('entry expiry follows the token exp exactly', () => {
    it('stays revoked just before exp and drops at exp (not earlier)', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
      const set = vi.fn().mockResolvedValue(false);
      const has = vi.fn().mockResolvedValue(false);
      const { revokeJwt, isJwtRevoked } = await loadDenylist(set, has);

      const expSec = Math.floor(Date.now() / 1000) + 600;
      await revokeJwt('jti-exp', expSec);

      vi.setSystemTime(new Date('2026-01-01T00:09:59.999Z'));
      expect(await isJwtRevoked('jti-exp')).toBe(true); // 1ms before exp

      vi.setSystemTime(new Date('2026-01-01T00:10:00Z'));
      expect(await isJwtRevoked('jti-exp')).toBe(false); // at exp
    });

    it('mirrors to Redis with the remaining lifetime as the TTL (not much later)', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
      const set = vi.fn().mockResolvedValue(true);
      const has = vi.fn().mockResolvedValue(false);
      const { revokeJwt } = await loadDenylist(set, has);

      await revokeJwt('jti-ttl', Math.floor(Date.now() / 1000) + 3600);
      expect(set).toHaveBeenCalledWith('jti-ttl', 3600); // exact remaining

      // Half a second later the ceil() adds at most one second of slack.
      vi.setSystemTime(new Date('2026-01-01T00:00:00.500Z'));
      await revokeJwt('jti-ttl2', Math.floor(Date.now() / 1000) + 3600);
      expect(set).toHaveBeenLastCalledWith('jti-ttl2', 3600);
    });
  });

  describe('Redis mirror', () => {
    it('writes the mirror once on success and does not rewrite it', async () => {
      const set = vi.fn().mockResolvedValue(true);
      const has = vi.fn().mockResolvedValue(false);
      const { revokeJwt, isJwtRevoked } = await loadDenylist(set, has);

      await revokeJwt('jti-m', Math.floor(Date.now() / 1000) + 60);
      await isJwtRevoked('jti-m'); // consults + sees mirrored=true
      await isJwtRevoked('jti-m');

      expect(set).toHaveBeenCalledTimes(1);
      expect(set).toHaveBeenCalledWith('jti-m', 60);
    });

    it('retries an un-mirrored entry when Redis recovers (lazy re-mirror)', async () => {
      const set = vi.fn().mockResolvedValueOnce(false).mockResolvedValue(true);
      const has = vi.fn().mockResolvedValue(false);
      const { revokeJwt, isJwtRevoked } = await loadDenylist(set, has);

      await revokeJwt('jti-r', Math.floor(Date.now() / 1000) + 60);
      expect(set).toHaveBeenCalledTimes(1); // outage: mirror failed

      expect(await isJwtRevoked('jti-r')).toBe(true); // still revoked locally
      expect(set).toHaveBeenCalledTimes(2); // retried once Redis is back
    });

    it('honors a cross-instance revocation read from the Redis mirror', async () => {
      const set = vi.fn().mockResolvedValue(true);
      const has = vi.fn().mockResolvedValue(true); // another instance revoked it
      const { isJwtRevoked } = await loadDenylist(set, has);

      expect(await isJwtRevoked('jti-other-instance')).toBe(true);
      expect(has).toHaveBeenCalledWith('jti-other-instance');
    });

    it('never throws when the Redis read helper rejects', async () => {
      const has = vi.fn().mockRejectedValue(new Error('redis down'));
      const { isJwtRevoked } = await loadDenylist(vi.fn(), has);

      await expect(isJwtRevoked('jti-x')).resolves.toBe(false);
    });

    it('never throws when the Redis write helper rejects', async () => {
      const set = vi.fn().mockRejectedValue(new Error('redis down'));
      const { revokeJwt, isJwtRevoked } = await loadDenylist(set, vi.fn());

      await revokeJwt('jti-w', Math.floor(Date.now() / 1000) + 60);
      expect(await isJwtRevoked('jti-w')).toBe(true); // in-process still holds
    });
  });

  describe('bounded in-process map', () => {
    it('evicts oldest entries once the cap is reached (no unbounded growth)', async () => {
      const set = vi.fn().mockResolvedValue(false);
      const has = vi.fn().mockResolvedValue(false);
      const { revokeJwt, isJwtRevoked, JWT_DENYLIST_MAX_ENTRIES } =
        await loadDenylist(set, has);

      const exp = Math.floor(Date.now() / 1000) + 3600;
      const overflow = 5;
      for (let i = 0; i < JWT_DENYLIST_MAX_ENTRIES + overflow; i++) {
        await revokeJwt(`jti-bulk-${i}`, exp);
      }

      // The first `overflow` keys were evicted oldest-first...
      for (let i = 0; i < overflow; i++) {
        expect(await isJwtRevoked(`jti-bulk-${i}`)).toBe(false);
      }
      // ...while everything still inside the cap remains revoked.
      expect(await isJwtRevoked(`jti-bulk-${overflow}`)).toBe(true);
      expect(
        await isJwtRevoked(`jti-bulk-${JWT_DENYLIST_MAX_ENTRIES + overflow - 1}`)
      ).toBe(true);
    });
  });
});
