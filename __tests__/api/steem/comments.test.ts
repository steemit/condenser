import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeGetRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  getDiscussion: vi.fn(),
}));

import { GET } from '@/app/api/steem/comments/route';
import { getDiscussion } from '@/lib/steem/client';

const getDiscussionMock = vi.mocked(getDiscussion);

const PARAMS = { author: 'alice', permlink: 'my-post' };

describe('GET /api/steem/comments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns 400 when author or permlink is missing', async () => {
    const res = await GET(
      makeGetRequest('/api/steem/comments', { author: 'alice' })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Author and permlink are required',
    });
    expect(getDiscussionMock).not.toHaveBeenCalled();
  });

  it('returns 404 when the discussion is missing', async () => {
    getDiscussionMock.mockResolvedValue(null);

    const res = await GET(makeGetRequest('/api/steem/comments', PARAMS));
    expect(res.status).toBe(404);
  });

  it('returns the replies of the discussion', async () => {
    const replies = [{ author: 'bob', body: 'nice post' }];
    getDiscussionMock.mockResolvedValue({ replies });

    const res = await GET(makeGetRequest('/api/steem/comments', PARAMS));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(replies);
    expect(getDiscussionMock).toHaveBeenCalledWith(PARAMS);
  });

  it('returns an empty list when the discussion has no replies', async () => {
    getDiscussionMock.mockResolvedValue({});

    const res = await GET(makeGetRequest('/api/steem/comments', PARAMS));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it('propagates RPC failures as 500', async () => {
    getDiscussionMock.mockRejectedValue(new Error('boom'));

    const res = await GET(makeGetRequest('/api/steem/comments', PARAMS));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'boom' });
  });
});
