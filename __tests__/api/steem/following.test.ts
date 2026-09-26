import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeGetRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  getFollowing: vi.fn(),
}));

import { GET } from '@/app/api/steem/following/route';
import { getFollowing } from '@/lib/steem/client';

const followingMock = vi.mocked(getFollowing);

const FOLLOWING = [
  { follower: 'alice', following: 'bob', what: ['blog'] },
  { follower: 'alice', following: 'mallory', what: ['ignore'] },
];

describe('GET /api/steem/following', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns 400 when account is missing', async () => {
    const res = await GET(makeGetRequest('/api/steem/following'));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Account is required' });
  });

  it('returns 400 for an unknown follow kind', async () => {
    const res = await GET(
      makeGetRequest('/api/steem/following', { account: 'alice', type: 'mates' })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Type must be "blog" or "ignore"',
    });
  });

  it('passes account, start cursor, type and limit through (legacy shape)', async () => {
    followingMock.mockResolvedValue(FOLLOWING as Awaited<ReturnType<typeof getFollowing>>);

    const res = await GET(
      makeGetRequest('/api/steem/following', {
        account: 'alice',
        type: 'ignore',
        start: 'bob',
        limit: '500',
      })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(FOLLOWING);
    expect(followingMock).toHaveBeenCalledWith('alice', 'bob', 'ignore', 500);
  });

  it('defaults to the blog list with limit 1000 and no cursor', async () => {
    followingMock.mockResolvedValue([]);

    const res = await GET(
      makeGetRequest('/api/steem/following', { account: 'alice' })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
    expect(followingMock).toHaveBeenCalledWith('alice', '', 'blog', 1000);
  });

  it('returns an empty list when the RPC yields null', async () => {
    followingMock.mockResolvedValue(null as unknown as Awaited<ReturnType<typeof getFollowing>>);

    const res = await GET(
      makeGetRequest('/api/steem/following', { account: 'alice' })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it('clamps limit to [1, 1000] (audit N-21)', async () => {
    followingMock.mockResolvedValue([]);

    await GET(
      makeGetRequest('/api/steem/following', { account: 'alice', limit: '100000' })
    );
    await GET(
      makeGetRequest('/api/steem/following', { account: 'alice', limit: '-3' })
    );
    await GET(
      makeGetRequest('/api/steem/following', { account: 'alice', limit: 'abc' })
    );

    expect(followingMock).toHaveBeenNthCalledWith(1, 'alice', '', 'blog', 1000);
    expect(followingMock).toHaveBeenNthCalledWith(2, 'alice', '', 'blog', 1);
    expect(followingMock).toHaveBeenNthCalledWith(3, 'alice', '', 'blog', 1000);
  });

  it('returns 500 with a generic message on RPC failure (audit N-20)', async () => {
    followingMock.mockRejectedValue(new Error('boom'));

    const res = await GET(
      makeGetRequest('/api/steem/following', { account: 'alice' })
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Failed to fetch following list' });
  });
});
