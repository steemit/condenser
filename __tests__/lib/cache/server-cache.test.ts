// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * withCache() branch matrix (review X8).
 *
 * The stale-while-error strategy has six outcomes that had no CI coverage:
 * fresh hit, miss+fetch success, miss+fetch failure with/without stale,
 * known-down short-circuit, and the no-Redis degradation. Both dependencies
 * (redis helpers and the health monitor) are module-mocked so each branch is
 * driven deterministically; the Redis layer itself is pinned separately in
 * __tests__/lib/cache/redis.test.ts.
 */

vi.mock('@/lib/cache/redis', () => ({
  getRedis: vi.fn(),
  cacheGet: vi.fn(),
  cacheSet: vi.fn(),
}));

vi.mock('@/lib/cache/health-monitor', () => ({
  isSteemKnownDown: vi.fn(),
}));

import { withCache } from '@/lib/cache/server-cache';
import { cacheGet, cacheSet, getRedis } from '@/lib/cache/redis';
import { isSteemKnownDown } from '@/lib/cache/health-monitor';

const getRedisMock = vi.mocked(getRedis);
const cacheGetMock = vi.mocked(cacheGet);
const cacheSetMock = vi.mocked(cacheSet);
const isSteemKnownDownMock = vi.mocked(isSteemKnownDown);

/** A fetcher that records whether it ran. */
function makeFetcher(value: unknown = 'fresh', shouldThrow = false) {
  const fetcher = vi.fn(async () => {
    if (shouldThrow) throw new Error('rpc down');
    return value;
  });
  return fetcher;
}

/** Stand-in for the real Redis client (only its presence matters here). */
const fakeClient = {} as never;

describe('withCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRedisMock.mockReturnValue(fakeClient);
    isSteemKnownDownMock.mockResolvedValue(false);
  });

  it('runs the fetcher directly with no caching when Redis is unavailable', async () => {
    getRedisMock.mockReturnValue(null);
    const fetcher = makeFetcher('direct');

    const result = await withCache('k', 3, 30, fetcher);

    expect(result).toEqual({ data: 'direct', degraded: false });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(cacheGetMock).not.toHaveBeenCalled();
    expect(cacheSetMock).not.toHaveBeenCalled();
    // Health is not even consulted on the degraded no-Redis path.
    expect(isSteemKnownDownMock).not.toHaveBeenCalled();
  });

  it('returns a fresh hit immediately without calling the fetcher', async () => {
    cacheGetMock.mockResolvedValue({ data: 'cached', degraded: false });
    const fetcher = makeFetcher('fresh');

    const result = await withCache('k', 3, 30, fetcher);

    expect(result).toEqual({ data: 'cached', degraded: false });
    expect(fetcher).not.toHaveBeenCalled();
    expect(cacheSetMock).not.toHaveBeenCalled();
    // A fresh entry wins before the known-down check — healthy data needs
    // no probe and no RPC.
    expect(isSteemKnownDownMock).not.toHaveBeenCalled();
  });

  it('fetches, caches and returns fresh data on a miss', async () => {
    cacheGetMock.mockResolvedValue(null);
    const fetcher = makeFetcher('fresh');

    const result = await withCache('k', 3, 30, fetcher);

    expect(result).toEqual({ data: 'fresh', degraded: false });
    expect(fetcher).toHaveBeenCalledTimes(1);
    // The TTL pair is forwarded verbatim — this is where the per-family
    // windows from lib/steem/client.ts reach Redis.
    expect(cacheGetMock).toHaveBeenCalledWith('k', 3, 30);
    expect(cacheSetMock).toHaveBeenCalledWith('k', 3, 30, 'fresh');
  });

  it('rethrows when the fetch fails and no stale entry exists', async () => {
    cacheGetMock.mockResolvedValue(null);
    const fetcher = makeFetcher(undefined, true);

    await expect(withCache('k', 3, 30, fetcher)).rejects.toThrow('rpc down');
    expect(cacheSetMock).not.toHaveBeenCalled();
  });

  it('serves stale data (degraded, with staleAge) when the fetch fails', async () => {
    cacheGetMock.mockResolvedValue({ data: 'stale', degraded: true, staleAge: 42 });
    const fetcher = makeFetcher(undefined, true);

    const result = await withCache('k', 3, 30, fetcher);

    expect(result).toEqual({ data: 'stale', degraded: true, staleAge: 42 });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(cacheSetMock).not.toHaveBeenCalled();
  });

  it('skips the RPC entirely and serves stale when Steem is known down', async () => {
    cacheGetMock.mockResolvedValue({ data: 'stale', degraded: true, staleAge: 7 });
    isSteemKnownDownMock.mockResolvedValue(true);
    const fetcher = makeFetcher('fresh');

    const result = await withCache('k', 3, 30, fetcher);

    expect(result).toEqual({ data: 'stale', degraded: true, staleAge: 7 });
    // The whole point of the known-down check: an overloaded node is not
    // hammered by every cache expiry.
    expect(fetcher).not.toHaveBeenCalled();
    expect(cacheSetMock).not.toHaveBeenCalled();
  });

  it('revalidates and returns fresh data when Steem is up again', async () => {
    cacheGetMock.mockResolvedValue({ data: 'stale', degraded: true, staleAge: 99 });
    const fetcher = makeFetcher('fresh');

    const result = await withCache('k', 3, 30, fetcher);

    expect(result).toEqual({ data: 'fresh', degraded: false });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(cacheSetMock).toHaveBeenCalledWith('k', 3, 30, 'fresh');
  });

  it('omits staleAge from the degraded result when the stale entry has none', async () => {
    cacheGetMock.mockResolvedValue({ data: 'stale', degraded: true });
    const fetcher = makeFetcher(undefined, true);

    const result = await withCache('k', 3, 30, fetcher);

    expect(result).toEqual({ data: 'stale', degraded: true });
    expect('staleAge' in result).toBe(false);
  });
});
