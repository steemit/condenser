// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * lib/steem/client.ts cache + RPC contracts (review X8).
 *
 * Two surfaces had no coverage:
 *
 * 1. Cache key families & TTL pairs. The broadcast route's post-write
 *    invalidation deletes by exact key or prefix — 'steem:profile:{account}',
 *    'steem:following:', 'steem:following-page:', 'steem:followers-page:',
 *    'steem:community-subscribers:', 'steem:communities:' (see
 *    app/api/steem/broadcast/route.ts). If a key format in client.ts drifts,
 *    invalidation silently misses and stale personal state is served
 *    indefinitely. These tests pin each family's format and TTL pair.
 *
 * 2. callBridge/callSteemApi error paths and the observer bypass that keeps
 *    personalised reads out of the shared cache.
 *
 * withCache is mocked with a recorder that still executes the fetcher, so the
    assertions cover what client.ts passes INTO the cache layer, not
 * cache behaviour itself (pinned in __tests__/lib/cache/server-cache.test.ts).
 */

const calls: Array<{ key: string; ttl: number; staleTtl: number }> = [];

vi.mock('@/lib/cache/server-cache', () => ({
  withCache: vi.fn(
    async <T,>(key: string, ttl: number, staleTtl: number, fetcher: () => Promise<T>) => {
      calls.push({ key, ttl, staleTtl });
      return { data: await fetcher(), degraded: false };
    }
  ),
}));

vi.mock('@/lib/steem/pending-overlay', () => ({
  applyVoteOverlayToPosts: (posts: unknown[]) => posts,
  applyDiscussionOverlays: (_a: string, _p: string, d: unknown) => d,
  applyProfileOverlay: (_a: string, p: unknown) => p,
}));

vi.mock('@steemit/steem-js', () => ({
  steem: {
    api: {
      setOptions: vi.fn(),
      call: vi.fn(),
      getAccountsAsync: vi.fn(),
      getDynamicGlobalPropertiesAsync: vi.fn(),
      getFollowingAsync: vi.fn(),
    },
  },
}));

import { steem } from '@steemit/steem-js';
import {
  callBridge,
  getAccountPosts,
  getCommunityRoles,
  getCommunitySubscribers,
  getDiscussion,
  getDynamicGlobalProperties,
  getFollowing,
  getFollowingByPage,
  getFollowersByPage,
  getProfile,
  getRankedPosts,
  listCommunities,
  checkSteemNodeHealth,
} from '@/lib/steem/client';
import { withCache } from '@/lib/cache/server-cache';

const api = steem.api as unknown as {
  setOptions: ReturnType<typeof vi.fn>;
  call: ReturnType<typeof vi.fn>;
  getAccountsAsync: ReturnType<typeof vi.fn>;
  getDynamicGlobalPropertiesAsync: ReturnType<typeof vi.fn>;
  getFollowingAsync: ReturnType<typeof vi.fn>;
};
const withCacheMock = vi.mocked(withCache);

/** The single (key, ttl, staleTtl) triple recorded by the latest call. */
function lastCall() {
  expect(calls.length).toBeGreaterThan(0);
  return calls[calls.length - 1];
}

describe('lib/steem/client cache-key and TTL contracts', () => {
  beforeEach(() => {
    calls.length = 0;
    vi.clearAllMocks();
    api.call.mockImplementation(
      (_m: string, _p: unknown, cb: (e: unknown, d: unknown) => void) =>
        void cb(null, [])
    );
  });

  it('getRankedPosts: steem:posts:ranked:<sort>:<tag>:<limit> @ posts TTL (3/300), default limit 20', async () => {
    await getRankedPosts({ sort: 'trending', tag: 'hive-123' });
    expect(lastCall()).toEqual({
      key: 'steem:posts:ranked:trending:hive-123:20',
      ttl: 3,
      staleTtl: 300,
    });

    await getRankedPosts({ sort: 'created', tag: 'photography', limit: 50 });
    expect(lastCall().key).toBe('steem:posts:ranked:created:photography:50');

    // Tag-less feeds collapse to an empty segment.
    await getRankedPosts({ sort: 'hot' });
    expect(lastCall().key).toBe('steem:posts:ranked:hot::20');
  });

  it('getAccountPosts: steem:posts:account:<account>:<sort>:<limit> @ posts TTL', async () => {
    await getAccountPosts({ sort: 'blog', account: 'alice' });
    expect(lastCall()).toEqual({
      key: 'steem:posts:account:alice:blog:20',
      ttl: 3,
      staleTtl: 300,
    });
  });

  it('getDiscussion: steem:post:<author>:<permlink> @ post TTL (30/600)', async () => {
    await getDiscussion({ author: 'alice', permlink: 'my-post' });
    expect(lastCall()).toEqual({
      key: 'steem:post:alice:my-post',
      ttl: 30,
      staleTtl: 600,
    });
  });

  it('getDynamicGlobalProperties: fixed key @ 3/30', async () => {
    api.getDynamicGlobalPropertiesAsync.mockResolvedValue({ head_block_number: 1 });
    await getDynamicGlobalProperties();
    expect(lastCall()).toEqual({
      key: 'steem:dynamic-global-properties',
      ttl: 3,
      staleTtl: 30,
    });
  });

  it('getFollowing: steem:following:<account>:<type>:<start|0> @ followers TTL (30/300)', async () => {
    api.getFollowingAsync.mockResolvedValue([]);
    await getFollowing('alice', '', 'blog');
    expect(lastCall()).toEqual({
      key: 'steem:following:alice:blog:0',
      ttl: 30,
      staleTtl: 300,
    });

    await getFollowing('alice', 'bob', 'ignore');
    expect(lastCall().key).toBe('steem:following:alice:ignore:bob');
  });

  it('getProfile: steem:profile:<account> @ profile TTL (30/300)', async () => {
    await getProfile({ account: 'alice' });
    expect(lastCall()).toEqual({
      key: 'steem:profile:alice',
      ttl: 30,
      staleTtl: 300,
    });
  });

  it('paged follow lists: followers-page / following-page keys @ followers TTL', async () => {
    await getFollowersByPage({ account: 'alice', page: 2, limit: 50 });
    expect(lastCall().key).toBe('steem:followers-page:alice:blog:2:50');

    await getFollowingByPage({ account: 'bob', page: 1, limit: 100, type: 'ignore' });
    expect(lastCall().key).toBe('steem:following-page:bob:ignore:1:100');
    expect(lastCall()).toMatchObject({ ttl: 30, staleTtl: 300 });
  });

  it('listCommunities: steem:communities:<sort>:<query>:<limit|20> @ communities TTL (600/1800)', async () => {
    await listCommunities({});
    expect(lastCall()).toEqual({
      key: 'steem:communities:::20',
      ttl: 600,
      staleTtl: 1800,
    });

    await listCommunities({ sort: 'ranked', query: 'photo', limit: 100 });
    expect(lastCall().key).toBe('steem:communities:ranked:photo:100');
  });

  it('community roles/subscribers keys @ communityRoles TTL (600/1800)', async () => {
    await getCommunityRoles({ community: 'hive-123456' });
    expect(lastCall()).toEqual({
      key: 'steem:community-roles:hive-123456',
      ttl: 600,
      staleTtl: 1800,
    });

    await getCommunitySubscribers({ community: 'hive-123456' });
    expect(lastCall().key).toBe('steem:community-subscribers:hive-123456');
  });

  it('every cached key stays under the steem: namespace the invalidation sweeps rely on', async () => {
    // Re-derived guard: the broadcast route only ever deletes
    // cacheDelete/cacheDeleteByPrefix targets inside `steem:` — a key that
    // escapes this prefix can never be invalidated. Sample EVERY withCache
    // call site in client.ts (all key families), not a subset, so a future
    // family added outside the namespace fails here immediately.
    calls.length = 0;
    api.getFollowingAsync.mockResolvedValue([]);
    api.getDynamicGlobalPropertiesAsync.mockResolvedValue({ head_block_number: 1 });
    await getRankedPosts({ sort: 'trending' });
    await getAccountPosts({ sort: 'blog', account: 'alice' });
    await getDiscussion({ author: 'a', permlink: 'b' });
    await getDynamicGlobalProperties();
    await getFollowing('a', '', 'blog');
    await getFollowersByPage({ account: 'a', page: 1, limit: 50 });
    await getFollowingByPage({ account: 'a', page: 1, limit: 50 });
    await getProfile({ account: 'a' });
    await listCommunities({});
    await getCommunityRoles({ community: 'hive-123456' });
    await getCommunitySubscribers({ community: 'hive-123456' });

    // 11 call sites = the 11 cache-key families (posts:ranked, posts:account,
    // post, dynamic-global-properties, following, followers-page,
    // following-page, profile, communities, community-roles,
    // community-subscribers).
    expect(calls.length).toBe(11);
    for (const { key } of calls) {
      expect(key.startsWith('steem:')).toBe(true);
    }
  });
});

describe('lib/steem/client observer gating (personalised reads bypass the cache)', () => {
  beforeEach(() => {
    calls.length = 0;
    vi.clearAllMocks();
    api.call.mockImplementation(
      (_m: string, _p: unknown, cb: (e: unknown, d: unknown) => void) =>
        void cb(null, [])
    );
  });

  it('getRankedPosts / getAccountPosts skip withCache for a paginated or observed read', async () => {
    await getRankedPosts({ sort: 'trending', observer: 'alice' });
    await getRankedPosts({ sort: 'trending', start_author: 'bob' });
    await getAccountPosts({ sort: 'blog', account: 'alice', observer: 'alice' });
    await getAccountPosts({ sort: 'blog', account: 'alice', start_author: 'bob' });

    expect(withCacheMock).not.toHaveBeenCalled();
    // The RPC still ran for each call.
    expect(api.call).toHaveBeenCalledTimes(4);
  });

  it('getProfile skips withCache when an observer personalises the result', async () => {
    await getProfile({ account: 'bob', observer: 'alice' });

    expect(withCacheMock).not.toHaveBeenCalled();
    expect(api.call).toHaveBeenCalledWith(
      'bridge.get_profile',
      { account: 'bob', observer: 'alice' },
      expect.any(Function)
    );
  });

  it('listCommunities skips withCache when an observer is set', async () => {
    await listCommunities({ observer: 'alice' });

    expect(withCacheMock).not.toHaveBeenCalled();
    expect(api.call).toHaveBeenCalledWith(
      'bridge.list_communities',
      { observer: 'alice' },
      expect.any(Function)
    );
  });
});

describe('callBridge / callSteemApi error paths', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('resolves with the RPC payload on success and prefixes bridge. by default', async () => {
    api.call.mockImplementation(
      (_m: string, _p: unknown, cb: (e: unknown, d: unknown) => void) =>
        void cb(null, { ok: 1 })
    );

    await expect(callBridge('get_ranked_posts', {})).resolves.toEqual({ ok: 1 });
    expect(api.call).toHaveBeenCalledWith(
      'bridge.get_ranked_posts',
      {},
      expect.any(Function)
    );
  });

  it('honours a custom method prefix (turtle. for notices)', async () => {
    api.call.mockImplementation(
      (_m: string, _p: unknown, cb: (e: unknown, d: unknown) => void) =>
        void cb(null, [])
    );

    await callBridge('get_notices', { limit: 1 }, 'turtle.');
    expect(api.call).toHaveBeenCalledWith(
      'turtle.get_notices',
      { limit: 1 },
      expect.any(Function)
    );
  });

  it('rejects with the RPC error and logs method+params on failure', async () => {
    const rpcError = new Error('method not found');
    api.call.mockImplementation(
      (_m: string, _p: unknown, cb: (e: unknown, d: unknown) => void) =>
        void cb(rpcError, undefined)
    );

    await expect(callBridge('get_ranked_posts', { sort: 'trending' })).rejects.toBe(
      rpcError
    );
    expect(console.error).toHaveBeenCalledWith(
      'Steem API call error:',
      expect.objectContaining({ method: 'bridge.get_ranked_posts', error: rpcError })
    );
  });

  it('callSteemApi calls the raw method name and rejects on error', async () => {
    const { callSteemApi } = await import('@/lib/steem/client');
    const rpcError = new Error('bad params');
    api.call.mockImplementation(
      (_m: string, _p: unknown, cb: (e: unknown, d: unknown) => void) =>
        void cb(rpcError, undefined)
    );

    await expect(callSteemApi('condenser_api.get_state', ['/trending'])).rejects.toBe(
      rpcError
    );
    expect(api.call).toHaveBeenCalledWith(
      'condenser_api.get_state',
      ['/trending'],
      expect.any(Function)
    );
  });
});

describe('checkSteemNodeHealth (probe)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports healthy with head block number on success', async () => {
    api.getDynamicGlobalPropertiesAsync.mockResolvedValue({
      head_block_number: 98765432,
    });

    const health = await checkSteemNodeHealth();

    expect(health.healthy).toBe(true);
    expect(health.blockNumber).toBe(98765432);
    expect(typeof health.latency).toBe('number');
    expect(health.error).toBeUndefined();
  });

  it('reports unhealthy with the error message instead of throwing', async () => {
    api.getDynamicGlobalPropertiesAsync.mockRejectedValue(new Error('ETIMEDOUT'));

    const health = await checkSteemNodeHealth();

    expect(health).toMatchObject({ healthy: false, error: 'ETIMEDOUT' });
  });
});
