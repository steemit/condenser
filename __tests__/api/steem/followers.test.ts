import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeGetRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  getFollowersByPage: vi.fn(),
  getFollowingByPage: vi.fn(),
}));

import { GET } from '@/app/api/steem/followers/route';
import { getFollowersByPage, getFollowingByPage } from '@/lib/steem/client';

const followersMock = vi.mocked(getFollowersByPage);
const followingMock = vi.mocked(getFollowingByPage);

const FOLLOWERS = [
  { follower: 'bob', following: 'alice', what: ['blog'] },
  { follower: 'carol', following: 'alice', what: ['blog'] },
];

describe('GET /api/steem/followers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns 400 when account is missing', async () => {
    const res = await GET(makeGetRequest('/api/steem/followers'));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Account is required' });
  });

  it('returns 400 for an unknown type', async () => {
    const res = await GET(
      makeGetRequest('/api/steem/followers', { account: 'alice', type: 'mates' })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Type must be "followers" or "following"',
    });
  });

  it('queries followers by 0-based page and passes the limit', async () => {
    followersMock.mockResolvedValue(FOLLOWERS as Awaited<ReturnType<typeof getFollowersByPage>>);

    const res = await GET(
      makeGetRequest('/api/steem/followers', {
        account: 'alice',
        type: 'followers',
        page: '2',
        limit: '50',
      })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(FOLLOWERS);
    expect(followersMock).toHaveBeenCalledWith({ account: 'alice', page: 2, limit: 50 });
    expect(followingMock).not.toHaveBeenCalled();
  });

  it('queries following when type=following with the default limit', async () => {
    followingMock.mockResolvedValue([]);

    const res = await GET(
      makeGetRequest('/api/steem/followers', {
        account: 'alice',
        type: 'following',
        page: '0',
      })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
    expect(followingMock).toHaveBeenCalledWith({ account: 'alice', page: 0, limit: 20 });
  });

  it('defaults to the followers list when type is omitted', async () => {
    followersMock.mockResolvedValue([]);

    const res = await GET(
      makeGetRequest('/api/steem/followers', { account: 'alice' })
    );
    expect(res.status).toBe(200);
    expect(followersMock).toHaveBeenCalledWith({ account: 'alice', page: 0, limit: 20 });
    expect(followingMock).not.toHaveBeenCalled();
  });

  it('returns an empty list when the RPC yields null', async () => {
    followersMock.mockResolvedValue(null as unknown as Awaited<ReturnType<typeof getFollowersByPage>>);

    const res = await GET(
      makeGetRequest('/api/steem/followers', { account: 'alice' })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it('propagates RPC failures as 500', async () => {
    followersMock.mockRejectedValue(new Error('boom'));

    const res = await GET(
      makeGetRequest('/api/steem/followers', { account: 'alice' })
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'boom' });
  });
});
