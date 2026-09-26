import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeGetRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  getRankedPosts: vi.fn(),
  getAccountPosts: vi.fn(),
}));

// Partial mock: keep the real RATE_LIMITS / rateLimitResponse, stub only the
// Redis-backed check (audit N-08) — same pattern as followers.test.ts.
vi.mock('@/lib/cache/rate-limit', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/cache/rate-limit')>();
  return {
    ...actual,
    checkRateLimit: vi.fn(async () => ({ allowed: true })),
  };
});

import { GET } from '@/app/api/steem/posts/route';
import { getAccountPosts, getRankedPosts } from '@/lib/steem/client';
import { checkRateLimit } from '@/lib/cache/rate-limit';

const getRankedPostsMock = vi.mocked(getRankedPosts);
const getAccountPostsMock = vi.mocked(getAccountPosts);
const checkRateLimitMock = vi.mocked(checkRateLimit);

describe('GET /api/steem/posts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    checkRateLimitMock.mockResolvedValue({ allowed: true });
  });

  it('defaults to trending ranked posts', async () => {
    getRankedPostsMock.mockResolvedValue([{ post_id: 1 }]);

    const res = await GET(makeGetRequest('/api/steem/posts'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([{ post_id: 1 }]);
    expect(getRankedPostsMock).toHaveBeenCalledWith({
      sort: 'trending',
      tag: '',
      start_author: undefined,
      start_permlink: undefined,
      limit: 20,
      observer: undefined,
    });
    expect(getAccountPostsMock).not.toHaveBeenCalled();
  });

  it('uses getAccountPosts when account is given', async () => {
    getAccountPostsMock.mockResolvedValue([{ post_id: 2 }]);

    const res = await GET(
      makeGetRequest('/api/steem/posts', { account: 'alice', sort: 'blog' })
    );
    expect(res.status).toBe(200);
    expect(getAccountPostsMock).toHaveBeenCalledWith({
      sort: 'blog',
      account: 'alice',
      start_author: undefined,
      start_permlink: undefined,
      limit: 20,
      observer: undefined,
    });
    expect(getRankedPostsMock).not.toHaveBeenCalled();
  });

  it('forwards sort=feed to getAccountPosts (user home feed)', async () => {
    getAccountPostsMock.mockResolvedValue([{ post_id: 3 }]);

    const res = await GET(
      makeGetRequest('/api/steem/posts', { account: 'alice', sort: 'feed' })
    );
    expect(res.status).toBe(200);
    // Legacy PostsIndex ['home', user] calls bridge get_account_posts with
    // sort 'feed'; the client forwards `sort` verbatim to that bridge call.
    expect(getAccountPostsMock).toHaveBeenCalledWith({
      sort: 'feed',
      account: 'alice',
      start_author: undefined,
      start_permlink: undefined,
      limit: 20,
      observer: undefined,
    });
    expect(getRankedPostsMock).not.toHaveBeenCalled();
  });

  it('forwards pagination params and observer (observer gates the server cache)', async () => {
    getRankedPostsMock.mockResolvedValue([]);

    const res = await GET(
      makeGetRequest('/api/steem/posts', {
        sort: 'hot',
        tag: 'steem',
        limit: '5',
        start_author: 'bob',
        start_permlink: 'last-post',
        observer: 'carol',
      })
    );
    expect(res.status).toBe(200);
    expect(getRankedPostsMock).toHaveBeenCalledWith({
      sort: 'hot',
      tag: 'steem',
      start_author: 'bob',
      start_permlink: 'last-post',
      limit: 5,
      observer: 'carol',
    });
  });

  it('returns 500 with a generic message on RPC failure (audit N-20)', async () => {
    getRankedPostsMock.mockRejectedValue(new Error('node down'));

    const res = await GET(makeGetRequest('/api/steem/posts'));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Failed to fetch posts' });
  });

  it.each([
    ['unknown ranked sort', { sort: 'DROP TABLE' }],
    ['account sort used without an account', { sort: 'blog' }],
  ])('returns 400 for an invalid sort (%s)', async (_label, query) => {
    const res = await GET(makeGetRequest('/api/steem/posts', query));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid sort' });
    expect(getRankedPostsMock).not.toHaveBeenCalled();
    expect(getAccountPostsMock).not.toHaveBeenCalled();
  });

  it('returns 400 when an account request uses a ranked sort', async () => {
    const res = await GET(
      makeGetRequest('/api/steem/posts', { account: 'alice', sort: 'trending' })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid sort' });
    expect(getAccountPostsMock).not.toHaveBeenCalled();
  });

  it('lowercases and trims the sort before the whitelist check', async () => {
    getRankedPostsMock.mockResolvedValue([]);

    const res = await GET(makeGetRequest('/api/steem/posts', { sort: '  HOT  ' }));
    expect(res.status).toBe(200);
    expect(getRankedPostsMock).toHaveBeenCalledWith(
      expect.objectContaining({ sort: 'hot' })
    );
  });

  it('checks the steem:posts limit (60/min/IP) before anything else', async () => {
    getRankedPostsMock.mockResolvedValue([]);

    await GET(makeGetRequest('/api/steem/posts'));

    expect(checkRateLimitMock).toHaveBeenCalledWith(expect.anything(), {
      key: 'steem:posts',
      limit: 60,
      windowSeconds: 60,
    });
  });

  it('returns 429 with Retry-After and never queries when limited', async () => {
    checkRateLimitMock.mockResolvedValue({ allowed: false, retryAfterSeconds: 30 });

    const res = await GET(makeGetRequest('/api/steem/posts'));
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('30');
    expect(await res.json()).toEqual({
      error: 'Too many requests. Please try again later.',
    });
    expect(getRankedPostsMock).not.toHaveBeenCalled();
    expect(getAccountPostsMock).not.toHaveBeenCalled();
  });

  it('defaults the account sort to blog when sort is absent', async () => {
    getAccountPostsMock.mockResolvedValue([]);

    const res = await GET(
      makeGetRequest('/api/steem/posts', { account: 'alice' })
    );
    expect(res.status).toBe(200);
    expect(getAccountPostsMock).toHaveBeenCalledWith(
      expect.objectContaining({ sort: 'blog', account: 'alice' })
    );
  });

  it.each([
    ['non-numeric', 'abc', 20],
    ['oversized', '100000', 100],
    ['negative', '-5', 1],
  ])('clamps/defaults a %s limit to %i', async (_label, raw, expected) => {
    getRankedPostsMock.mockResolvedValue([]);

    const res = await GET(
      makeGetRequest('/api/steem/posts', { limit: raw })
    );
    expect(res.status).toBe(200);
    expect(getRankedPostsMock).toHaveBeenCalledWith(
      expect.objectContaining({ limit: expected })
    );
  });

  it('bounds the tag length (audit N-21)', async () => {
    getRankedPostsMock.mockResolvedValue([]);

    const longTag = 'x'.repeat(200);
    const res = await GET(makeGetRequest('/api/steem/posts', { tag: longTag }));
    expect(res.status).toBe(200);
    expect(getRankedPostsMock).toHaveBeenCalledWith(
      expect.objectContaining({ tag: 'x'.repeat(64) })
    );
  });

  it('returns 400 for an account outside the bounded charset', async () => {
    const res = await GET(
      makeGetRequest('/api/steem/posts', { account: 'al ce', sort: 'blog' })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid account name' });
    expect(getAccountPostsMock).not.toHaveBeenCalled();
  });
});
