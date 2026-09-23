import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeGetRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  getUserSubscriptions: vi.fn(),
  listCommunities: vi.fn(),
}));

import { GET } from '@/app/api/steem/communities/route';
import { getUserSubscriptions, listCommunities } from '@/lib/steem/client';

const getUserSubscriptionsMock = vi.mocked(getUserSubscriptions);
const listCommunitiesMock = vi.mocked(listCommunities);

describe('GET /api/steem/communities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns 400 for subscriptions without an account', async () => {
    const res = await GET(
      makeGetRequest('/api/steem/communities', { type: 'subscriptions' })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Account is required for subscriptions',
    });
    expect(getUserSubscriptionsMock).not.toHaveBeenCalled();
  });

  it('returns subscriptions for an account, mapping tuples to objects', async () => {
    // bridge.list_all_subscriptions tuples: [community, title, role, affiliation]
    getUserSubscriptionsMock.mockResolvedValue([
      ['hive-1', 'Steem', 'mod', 'founder'],
    ]);

    const res = await GET(
      makeGetRequest('/api/steem/communities', {
        type: 'subscriptions',
        account: 'alice',
      })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([
      {
        name: 'hive-1',
        title: 'Steem',
        context: { role: 'mod', title: 'founder' },
      },
    ]);
    expect(getUserSubscriptionsMock).toHaveBeenCalledWith({ account: 'alice' });
  });

  it('falls back to the community id when the tuple title is empty', async () => {
    getUserSubscriptionsMock.mockResolvedValue([['hive-2', '', 'guest', '']]);

    const res = await GET(
      makeGetRequest('/api/steem/communities', {
        type: 'subscriptions',
        account: 'alice',
      })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([
      { name: 'hive-2', title: 'hive-2', context: { role: 'guest', title: '' } },
    ]);
  });

  it('lists communities with defaults and forwards the observer', async () => {
    listCommunitiesMock.mockResolvedValue([{ name: 'hive-1' }]);

    const res = await GET(
      makeGetRequest('/api/steem/communities', {
        observer: 'bob',
        query: 'photo',
      })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([{ name: 'hive-1' }]);
    expect(listCommunitiesMock).toHaveBeenCalledWith({
      observer: 'bob',
      query: 'photo',
      sort: 'rank',
      limit: 20,
    });
  });

  it('truncates and trims the query to bound the cache key (audit N-21)', async () => {
    listCommunitiesMock.mockResolvedValue([]);

    await GET(
      makeGetRequest('/api/steem/communities', {
        query: `  ${'x'.repeat(80)}  `,
      })
    );
    expect(listCommunitiesMock).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'x'.repeat(64) })
    );
  });

  it('clamps limit to [1, 100] with fallback for garbage (audit N-21)', async () => {
    listCommunitiesMock.mockResolvedValue([]);

    await GET(makeGetRequest('/api/steem/communities', { limit: '100000' }));
    await GET(makeGetRequest('/api/steem/communities', { limit: '0' }));
    await GET(makeGetRequest('/api/steem/communities', { limit: 'abc' }));

    expect(listCommunitiesMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ limit: 100 })
    );
    expect(listCommunitiesMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ limit: 1 })
    );
    expect(listCommunitiesMock).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ limit: 20 })
    );
  });

  it('accepts UI sorts and falls back to rank for unknown sort values (audit N-21)', async () => {
    listCommunitiesMock.mockResolvedValue([]);

    await GET(makeGetRequest('/api/steem/communities', { sort: 'subs' }));
    await GET(makeGetRequest('/api/steem/communities', { sort: 'new' }));
    await GET(
      makeGetRequest('/api/steem/communities', {
        sort: 'arbitrary-field-name',
      })
    );

    expect(listCommunitiesMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ sort: 'subs' })
    );
    expect(listCommunitiesMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ sort: 'new' })
    );
    expect(listCommunitiesMock).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ sort: 'rank' })
    );
  });

  it('propagates RPC failures as 500', async () => {
    listCommunitiesMock.mockRejectedValue(new Error('boom'));

    const res = await GET(makeGetRequest('/api/steem/communities'));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'boom' });
  });
});
