// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Steem health monitor state machine (review X8).
 *
 * Only GET /api/health writes the shared Redis entry; every other consumer
 * reads it. The freshness window (FRESH_THRESHOLD = 60s) decides whether a
 * reader sees the entry at all, and the probe lock (SET NX, 30s TTL) decides
 * whether a stale reader probes or serves stale. redis.ts is module-mocked
 * with an in-memory map so the wire keys and TTL arguments can be asserted
 * without a real Redis.
 */

vi.mock('@/lib/cache/redis', () => ({
  // Mirrors the real prefix for default REDIS_KEY_PREFIX ('condenser').
  redisKey: (key: string) => `condenser:${key}`,
  getRedis: vi.fn(),
}));

import {
  FRESH_THRESHOLD,
  acquireProbeLock,
  getSteemHealth,
  getSteemHealthStale,
  isSteemKnownDown,
  markSteemHealthy,
  markSteemUnhealthy,
  releaseProbeLock,
  type SteemHealthStatus,
} from '@/lib/cache/health-monitor';
import { getRedis } from '@/lib/cache/redis';

const getRedisMock = vi.mocked(getRedis);

/** Minimal Redis surface used by health-monitor, backed by a Map. */
function makeRedis() {
  const store = new Map<string, string>();
  const set = vi.fn(async (key: string, value: string, ...args: unknown[]) => {
    // Honour the 'EX <seconds>' / 'NX' tail the monitor passes (NX only wins
    // when absent, matching Redis SET semantics).
    const nx = args.includes('NX');
    if (nx && store.has(key)) return null;
    store.set(key, value);
    return 'OK';
  });
  const get = vi.fn(async (key: string) => store.get(key) ?? null);
  const del = vi.fn(async (key: string) => {
    store.delete(key);
    return 1;
  });
  return {
    client: { set, get, del, on: vi.fn() } as never,
    set,
    get,
    del,
    store,
  };
}

function healthEntry(partial: Partial<SteemHealthStatus>): string {
  return JSON.stringify({
    healthy: true,
    checkedAt: Date.now(),
    ...partial,
  });
}

describe('health monitor state machine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-26T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('reads', () => {
    it('returns null for every read when Redis is unavailable', async () => {
      getRedisMock.mockReturnValue(null);

      expect(await getSteemHealth()).toBeNull();
      expect(await getSteemHealthStale()).toBeNull();
      expect(await isSteemKnownDown()).toBe(false);
    });

    it('returns null when no entry exists', async () => {
      const redis = makeRedis();
      getRedisMock.mockReturnValue(redis.client);

      expect(await getSteemHealth()).toBeNull();
      expect(await isSteemKnownDown()).toBe(false);
    });

    it('returns a fresh entry and null for one past the 60s window', async () => {
      const redis = makeRedis();
      getRedisMock.mockReturnValue(redis.client);
      redis.store.set('condenser:health:steem', healthEntry({ healthy: false, error: 'boom' }));

      const fresh = await getSteemHealth();
      expect(fresh).toMatchObject({ healthy: false, error: 'boom' });

      vi.setSystemTime(new Date('2026-09-26T00:01:00Z').getTime() + 1);
      expect(await getSteemHealth()).toBeNull();
      // The stale read has no freshness gate — /api/health uses it for
      // stale-while-revalidate.
      expect(await getSteemHealthStale()).toMatchObject({ healthy: false });
    });

    it('pins the 60s freshness threshold constant', () => {
      // FRESH_THRESHOLD is the contract between the monitor and /api/health
      // (both compute freshness independently — they must agree).
      expect(FRESH_THRESHOLD).toBe(60_000);
    });

    it('reads under the namespaced key and survives a Redis read error', async () => {
      const redis = makeRedis();
      getRedisMock.mockReturnValue(redis.client);
      redis.get.mockRejectedValueOnce(new Error('conn reset'));

      expect(await getSteemHealth()).toBeNull();
      expect(redis.get).toHaveBeenCalledWith('condenser:health:steem');
    });
  });

  describe('isSteemKnownDown', () => {
    it('is true only for a FRESH unhealthy entry', async () => {
      const redis = makeRedis();
      getRedisMock.mockReturnValue(redis.client);

      redis.store.set('condenser:health:steem', healthEntry({ healthy: false }));
      expect(await isSteemKnownDown()).toBe(true);

      redis.store.set('condenser:health:steem', healthEntry({ healthy: true }));
      expect(await isSteemKnownDown()).toBe(false);

      // Unhealthy but older than 60s: no longer authoritative.
      redis.store.set(
        'condenser:health:steem',
        healthEntry({ healthy: false, checkedAt: Date.now() - FRESH_THRESHOLD - 1 })
      );
      expect(await isSteemKnownDown()).toBe(false);
    });
  });

  describe('writers', () => {
    it('markSteemHealthy writes healthy:true with block/latency under a 60s TTL', async () => {
      const redis = makeRedis();
      getRedisMock.mockReturnValue(redis.client);

      await markSteemHealthy(12345, 42);

      expect(redis.set).toHaveBeenCalledWith(
        'condenser:health:steem',
        JSON.stringify({
          healthy: true,
          checkedAt: Date.now(),
          blockNumber: 12345,
          latency: 42,
        }),
        'EX',
        60
      );
    });

    it('markSteemUnhealthy writes healthy:false with the error under a 60s TTL', async () => {
      const redis = makeRedis();
      getRedisMock.mockReturnValue(redis.client);

      await markSteemUnhealthy('timeout');

      expect(redis.set).toHaveBeenCalledWith(
        'condenser:health:steem',
        JSON.stringify({
          healthy: false,
          checkedAt: Date.now(),
          error: 'timeout',
        }),
        'EX',
        60
      );
    });

    it('writers are no-ops without Redis and swallow Redis errors', async () => {
      getRedisMock.mockReturnValue(null);
      await expect(markSteemHealthy(1, 1)).resolves.toBeUndefined();
      await expect(markSteemUnhealthy('e')).resolves.toBeUndefined();

      const redis = makeRedis();
      getRedisMock.mockReturnValue(redis.client);
      redis.set.mockRejectedValue(new Error('down'));
      await expect(markSteemHealthy(1, 1)).resolves.toBeUndefined();
      await expect(markSteemUnhealthy('e')).resolves.toBeUndefined();
    });
  });

  describe('probe lock', () => {
    it('acquires (SET NX → OK) and releases (DEL) the lock', async () => {
      const redis = makeRedis();
      getRedisMock.mockReturnValue(redis.client);

      expect(await acquireProbeLock()).toBe(true);
      expect(redis.set).toHaveBeenCalledWith(
        'condenser:health:steem:probe-lock',
        expect.any(String),
        'EX',
        30,
        'NX'
      );

      // Second acquirer loses while the first holds the lock.
      expect(await acquireProbeLock()).toBe(false);

      await releaseProbeLock();
      expect(redis.del).toHaveBeenCalledWith('condenser:health:steem:probe-lock');
      // After release the lock is acquirable again.
      expect(await acquireProbeLock()).toBe(true);
    });

    it('never acquires without Redis and on a Redis error', async () => {
      getRedisMock.mockReturnValue(null);
      expect(await acquireProbeLock()).toBe(false);

      const redis = makeRedis();
      getRedisMock.mockReturnValue(redis.client);
      redis.set.mockRejectedValue(new Error('down'));
      expect(await acquireProbeLock()).toBe(false);
    });
  });
});
