import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeGetRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  getDiscussion: vi.fn(),
}));

import { GET } from '@/app/api/steem/comments/route';
import { getDiscussion } from '@/lib/steem/client';

const getDiscussionMock = vi.mocked(getDiscussion);

const PARAMS = { author: 'alice', permlink: 'my-post' };

/**
 * Realistic bridge `get_discussion` response: a content map keyed by
 * "author/permlink". The root post sits at the queried key; each node's
 * `replies` is an array of child KEYS into the same map (legacy loadThread).
 */
const DISCUSSION_MAP = {
  'alice/my-post': {
    author: 'alice',
    permlink: 'my-post',
    body: 'the root post',
    replies: ['bob/nice-post', 'carol/first'],
  },
  'bob/nice-post': {
    author: 'bob',
    permlink: 'nice-post',
    body: 'nice post',
    parent_author: 'alice',
    parent_permlink: 'my-post',
    replies: ['dave/thanks-bob'],
  },
  'carol/first': {
    author: 'carol',
    permlink: 'first',
    body: 'first!',
    parent_author: 'alice',
    parent_permlink: 'my-post',
    replies: [],
  },
  'dave/thanks-bob': {
    author: 'dave',
    permlink: 'thanks-bob',
    body: 'thanks bob',
    parent_author: 'bob',
    parent_permlink: 'nice-post',
    replies: [],
  },
};

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

  it('flattens the discussion map and excludes the root post', async () => {
    getDiscussionMock.mockResolvedValue(DISCUSSION_MAP);

    const res = await GET(makeGetRequest('/api/steem/comments', PARAMS));
    expect(res.status).toBe(200);

    const comments = (await res.json()) as Array<{
      author: string;
      permlink: string;
    }>;
    expect(comments).toHaveLength(3);
    // The root post is excluded; every other map entry is returned as-is.
    expect(comments.map((c) => `${c.author}/${c.permlink}`).sort()).toEqual([
      'bob/nice-post',
      'carol/first',
      'dave/thanks-bob',
    ]);
    expect(comments).toContainEqual(DISCUSSION_MAP['bob/nice-post']);
    expect(comments).toContainEqual(DISCUSSION_MAP['carol/first']);
    expect(comments).toContainEqual(DISCUSSION_MAP['dave/thanks-bob']);
    expect(getDiscussionMock).toHaveBeenCalledWith(PARAMS);
  });

  it('returns an empty list when the root post has no comments', async () => {
    getDiscussionMock.mockResolvedValue({
      'alice/my-post': DISCUSSION_MAP['alice/my-post'],
    });

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
