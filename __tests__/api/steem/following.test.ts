import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeGetRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  getFollowing: vi.fn(),
}));

// Partial mock: keep the real RATE_LIMITS / rateLimitResponse, stub only the
// Redis-backed check (audit N-08) — same pattern as the search route test.
vi.mock('@/lib/cache/rate-limit', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/cache/rate-limit')>();
  return {
    ...actual,
    checkRateLimit: vi.fn(async () => ({ allowed: true })),
  };
});

import { GET } from '@/app/api/steem/following/route';
import { getFollowing } from '@/lib/steem/client';
import { checkRateLimit } from '@/lib/cache/rate-limit';

const followingMock = vi.mocked(getFollowing);
const checkRateLimitMock = vi.mocked(checkRateLimit);

const FOLLOWING = [
  { follower: 'alice', following: 'bob', what: ['blog'] },
  { follower: 'alice', following: 'mallory', what: ['ignore'] },
];

describe('GET /api/steem/following', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    checkRateLimitMock.mockResolvedValue({ allowed: true });
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

  it.each([
    ['bad charset (space)', 'al ce'],
    ['bad charset (path traversal)', '../../etc'],
    ['bad charset (symbol)', 'alice!'],
    ['too long', 'a'.repeat(65)],
  ])('returns 400 for an invalid account (%s)', async (_label, account) => {
    const res = await GET(
      makeGetRequest('/api/steem/following', { account })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid account name' });
    expect(followingMock).not.toHaveBeenCalled();
  });

  it('returns "Account is required" for a whitespace-only account', async () => {
    const res = await GET(
      makeGetRequest('/api/steem/following', { account: '   ' })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Account is required' });
    expect(followingMock).not.toHaveBeenCalled();
  });

  it.each([
    ['bad charset', 'bo b'],
    ['too long', 'b'.repeat(65)],
  ])('returns 400 for an invalid start cursor (%s)', async (_label, start) => {
    const res = await GET(
      makeGetRequest('/api/steem/following', { account: 'alice', start })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid start account' });
    expect(followingMock).not.toHaveBeenCalled();
  });

  it('normalizes account and start (trim + lowercase) so ALICE/alice share one cache key', async () => {
    followingMock.mockResolvedValue(FOLLOWING as Awaited<ReturnType<typeof getFollowing>>);

    const res = await GET(
      makeGetRequest('/api/steem/following', {
        account: '  ALICE ',
        start: 'Bob',
      })
    );
    expect(res.status).toBe(200);
    // The route must hand the client canonical lowercase params: the Redis
    // cache key in lib/steem/client.ts is built from exactly these values.
    expect(followingMock).toHaveBeenCalledWith('alice', 'bob', 'blog');
  });

  it('accepts segmented account names with dots', async () => {
    followingMock.mockResolvedValue([]);
    const res = await GET(
      makeGetRequest('/api/steem/following', { account: 'alice-1.test' })
    );
    expect(res.status).toBe(200);
    expect(followingMock).toHaveBeenCalledWith('alice-1.test', '', 'blog');
  });

  it('passes account, start cursor and type through (legacy shape)', async () => {
    followingMock.mockResolvedValue(FOLLOWING as Awaited<ReturnType<typeof getFollowing>>);

    const res = await GET(
      makeGetRequest('/api/steem/following', {
        account: 'alice',
        type: 'ignore',
        start: 'bob',
      })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(FOLLOWING);
    expect(followingMock).toHaveBeenCalledWith('alice', 'bob', 'ignore');
  });

  it('defaults to the blog list with no cursor', async () => {
    followingMock.mockResolvedValue([]);

    const res = await GET(
      makeGetRequest('/api/steem/following', { account: 'alice' })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
    expect(followingMock).toHaveBeenCalledWith('alice', '', 'blog');
  });

  it('returns an empty list when the RPC yields null', async () => {
    followingMock.mockResolvedValue(null as unknown as Awaited<ReturnType<typeof getFollowing>>);

    const res = await GET(
      makeGetRequest('/api/steem/following', { account: 'alice' })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it('ignores a client-sent limit (fixed 1000-entry pages, audit N-21)', async () => {
    followingMock.mockResolvedValue([]);

    await GET(
      makeGetRequest('/api/steem/following', { account: 'alice', limit: '500' })
    );
    // No limit dimension: the RPC page size is fixed in lib/steem/client.ts
    // and never derived from the query string.
    expect(followingMock).toHaveBeenCalledWith('alice', '', 'blog');
  });

  it('returns 500 with a generic message on RPC failure (audit N-20)', async () => {
    followingMock.mockRejectedValue(new Error('boom'));

    const res = await GET(
      makeGetRequest('/api/steem/following', { account: 'alice' })
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Failed to fetch following list' });
  });

  it('checks the steem:following limit (60/min/IP) before touching the RPC', async () => {
    followingMock.mockResolvedValue([]);

    await GET(makeGetRequest('/api/steem/following', { account: 'alice' }));
    expect(checkRateLimitMock).toHaveBeenCalledWith(expect.anything(), {
      key: 'steem:following',
      limit: 60,
      windowSeconds: 60,
    });
  });

  it('returns 429 with Retry-After and never reaches the RPC when limited', async () => {
    checkRateLimitMock.mockResolvedValue({
      allowed: false,
      retryAfterSeconds: 33,
    });

    const res = await GET(
      makeGetRequest('/api/steem/following', { account: 'alice' })
    );
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('33');
    expect(await res.json()).toEqual({
      error: 'Too many requests. Please try again later.',
    });
    expect(followingMock).not.toHaveBeenCalled();
  });
});
