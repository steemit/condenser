import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeGetRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  getDiscussion: vi.fn(),
}));

import { GET } from '@/app/api/steem/post/route';
import { getDiscussion } from '@/lib/steem/client';

const getDiscussionMock = vi.mocked(getDiscussion);

describe('GET /api/steem/post', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns 400 when author or permlink is missing', async () => {
    for (const query of [{}, { author: 'alice' }, { permlink: 'my-post' }]) {
      const res = await GET(makeGetRequest('/api/steem/post', query));
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({
        error: 'Author and permlink are required',
      });
    }
    expect(getDiscussionMock).not.toHaveBeenCalled();
  });

  it('returns 404 when the discussion is missing', async () => {
    getDiscussionMock.mockResolvedValue(null);

    const res = await GET(
      makeGetRequest('/api/steem/post', { author: 'alice', permlink: 'my-post' })
    );
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Post not found' });
  });

  it('returns 404 when the discussion lacks the requested post key', async () => {
    getDiscussionMock.mockResolvedValue({ 'alice/other-post': {} });

    const res = await GET(
      makeGetRequest('/api/steem/post', { author: 'alice', permlink: 'my-post' })
    );
    expect(res.status).toBe(404);
  });

  it('returns the post from the discussion map', async () => {
    const post = { title: 'Hello', author: 'alice', permlink: 'my-post' };
    getDiscussionMock.mockResolvedValue({ 'alice/my-post': post });

    const res = await GET(
      makeGetRequest('/api/steem/post', { author: 'alice', permlink: 'my-post' })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(post);
    expect(getDiscussionMock).toHaveBeenCalledWith({
      author: 'alice',
      permlink: 'my-post',
    });
  });

  it('propagates RPC failures as 500', async () => {
    getDiscussionMock.mockRejectedValue(new Error('boom'));

    const res = await GET(
      makeGetRequest('/api/steem/post', { author: 'alice', permlink: 'my-post' })
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'boom' });
  });
});
