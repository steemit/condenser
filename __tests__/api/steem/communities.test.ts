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

  it('returns subscriptions for an account', async () => {
    getUserSubscriptionsMock.mockResolvedValue([['hive-1', 'Steem']]);

    const res = await GET(
      makeGetRequest('/api/steem/communities', {
        type: 'subscriptions',
        account: 'alice',
      })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([['hive-1', 'Steem']]);
    expect(getUserSubscriptionsMock).toHaveBeenCalledWith({ account: 'alice' });
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

  it('propagates RPC failures as 500', async () => {
    listCommunitiesMock.mockRejectedValue(new Error('boom'));

    const res = await GET(makeGetRequest('/api/steem/communities'));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'boom' });
  });
});
