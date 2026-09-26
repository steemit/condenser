import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeGetRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  getFollowersByPage: vi.fn(),
  getFollowingByPage: vi.fn(),
}));

// Partial mock: keep the real RATE_LIMITS / rateLimitResponse, stub only the
// Redis-backed check (audit N-08).
vi.mock('@/lib/cache/rate-limit', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/cache/rate-limit')>();
  return {
    ...actual,
    checkRateLimit: vi.fn(async () => ({ allowed: true })),
  };
});

import { GET } from '@/app/api/steem/followers/route';
import { getFollowersByPage, getFollowingByPage } from '@/lib/steem/client';
import { checkRateLimit } from '@/lib/cache/rate-limit';

const followersMock = vi.mocked(getFollowersByPage);
const followingMock = vi.mocked(getFollowingByPage);
const checkRateLimitMock = vi.mocked(checkRateLimit);

const FOLLOWERS = [
  { follower: 'bob', following: 'alice', what: ['blog'] },
  { follower: 'carol', following: 'alice', what: ['blog'] },
];

describe('GET /api/steem/followers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    checkRateLimitMock.mockResolvedValue({ allowed: true });
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

  it('clamps limit to [1, 100] and floors page at 0 (audit N-21)', async () => {
    followersMock.mockResolvedValue([]);

    await GET(
      makeGetRequest('/api/steem/followers', {
        account: 'alice',
        limit: '100000',
      })
    );
    await GET(
      makeGetRequest('/api/steem/followers', {
        account: 'alice',
        limit: '-3',
      })
    );
    await GET(
      makeGetRequest('/api/steem/followers', {
        account: 'alice',
        page: '-5',
        limit: 'abc',
      })
    );

    expect(followersMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ limit: 100 })
    );
    expect(followersMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ limit: 1 })
    );
    expect(followersMock).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ page: 0, limit: 20 })
    );
  });

  it('returns 500 with a generic message on RPC failure (audit N-20)', async () => {
    followersMock.mockRejectedValue(new Error('boom'));

    const res = await GET(
      makeGetRequest('/api/steem/followers', { account: 'alice' })
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Failed to fetch followers/following' });
  });

  it('checks the steem:followers limit (60/min/IP) before anything else', async () => {
    followersMock.mockResolvedValue([]);

    await GET(makeGetRequest('/api/steem/followers', { account: 'alice' }));

    expect(checkRateLimitMock).toHaveBeenCalledWith(expect.anything(), {
      key: 'steem:followers',
      limit: 60,
      windowSeconds: 60,
    });
  });

  it('returns 429 with Retry-After and never queries when limited', async () => {
    checkRateLimitMock.mockResolvedValue({ allowed: false, retryAfterSeconds: 30 });

    const res = await GET(
      makeGetRequest('/api/steem/followers', { account: 'alice' })
    );
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('30');
    expect(await res.json()).toEqual({
      error: 'Too many requests. Please try again later.',
    });
    expect(followersMock).not.toHaveBeenCalled();
    expect(followingMock).not.toHaveBeenCalled();
  });

  it('normalizes the account (trim + lowercase) before it reaches the cache key', async () => {
    followersMock.mockResolvedValue([]);

    const res = await GET(
      makeGetRequest('/api/steem/followers', { account: '  Alice  ' })
    );
    expect(res.status).toBe(200);
    expect(followersMock).toHaveBeenCalledWith(
      expect.objectContaining({ account: 'alice' })
    );
  });

  it('returns 400 for an account outside the bounded charset (key-spray guard)', async () => {
    const res = await GET(
      makeGetRequest('/api/steem/followers', {
        account: 'alice*glob`injection',
      })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid account name' });
    expect(followersMock).not.toHaveBeenCalled();
  });

  it('returns 400 for a whitespace-only account', async () => {
    const res = await GET(
      makeGetRequest('/api/steem/followers', { account: '   ' })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Account is required' });
  });

  it('clamps page to [0, 5000] (audit N-21: page feeds the cache key)', async () => {
    followersMock.mockResolvedValue([]);

    await GET(
      makeGetRequest('/api/steem/followers', {
        account: 'alice',
        page: '999999999',
      })
    );
    await GET(
      makeGetRequest('/api/steem/followers', {
        account: 'alice',
        page: '-7',
      })
    );

    expect(followersMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ page: 5000 })
    );
    expect(followersMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ page: 0 })
    );
  });
});
