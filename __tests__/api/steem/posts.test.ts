import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeGetRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  getRankedPosts: vi.fn(),
  getAccountPosts: vi.fn(),
}));

import { GET } from '@/app/api/steem/posts/route';
import { getAccountPosts, getRankedPosts } from '@/lib/steem/client';

const getRankedPostsMock = vi.mocked(getRankedPosts);
const getAccountPostsMock = vi.mocked(getAccountPosts);

describe('GET /api/steem/posts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
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

  it('propagates RPC failures as 500', async () => {
    getRankedPostsMock.mockRejectedValue(new Error('node down'));

    const res = await GET(makeGetRequest('/api/steem/posts'));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'node down' });
  });
});
