import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  recordActivityTracker,
  recordRouteTag,
  userActionRecord,
} from '@/lib/analytics/overseer';
import { routeTagForPath } from '@/lib/analytics/route-tags';

function lastCollectCall(): [string, Record<string, unknown>] {
  const fetchMock = vi.mocked(fetch);
  const call = fetchMock.mock.calls.at(-1);
  if (!call) throw new Error('no fetch call');
  return JSON.parse((call[1] as RequestInit).body as string);
}

describe('overseer payloads', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });

  it('recordRouteTag post', () => {
    recordRouteTag('x-123', 'post', { permlink: 'hello-world' }, true);
    const [collection, data] = lastCollectCall();
    expect(collection).toBe('custom');
    expect(data).toEqual({
      measurement: 'route',
      fields: { trackingId: 'x-123', permlink: 'hello-world' },
      tags: { app: 'condenser', tag: 'post', is_login: true },
    });
  });

  it('recordRouteTag category computes is_my_community', () => {
    recordRouteTag('x-1', 'category', {
      category: 'my',
      order: 'trending',
      is_user_feed: false,
    });
    const [, data] = lastCollectCall();
    expect(data.tags).toMatchObject({ tag: 'category', sort: 'trending', is_my_community: true });
  });

  it('userActionRecord vote', () => {
    userActionRecord('vote', {
      vote_type: 'up',
      voter: 'alice',
      author: 'bob',
      permlink: 'p1',
      weight: 10000,
    });
    const [collection, data] = lastCollectCall();
    expect(collection).toBe('custom');
    expect(data).toEqual({
      measurement: 'user_action',
      fields: { voter: 'alice', author: 'bob', permlink: 'p1', weight: 10000 },
      tags: { app: 'condenser', action_type: 'vote', vote_type: 'up' },
    });
  });

  it('userActionRecord comment', () => {
    userActionRecord('comment', {
      username: 'alice',
      is_edit: false,
      payout_type: '50%',
      comment_type: 'post',
    });
    const [, data] = lastCollectCall();
    expect(data).toEqual({
      measurement: 'user_action',
      fields: { username: 'alice' },
      tags: {
        app: 'condenser',
        action_type: 'comment',
        is_edit: false,
        payout_type: '50%',
        comment_type: 'post',
      },
    });
  });

  it('userActionRecord reblog', () => {
    userActionRecord('reblog', { username: 'alice', permlink: 'p1', author: 'bob' });
    const [, data] = lastCollectCall();
    expect(data.fields).toEqual({ username: 'alice', permlink: 'p1', author: 'bob' });
  });

  it('recordActivityTracker', () => {
    recordActivityTracker({
      trackingId: 'x-9',
      activityTag: 'promo',
      pathname: '/trending',
      referrer: '',
    });
    const [collection, data] = lastCollectCall();
    expect(collection).toBe('custom');
    expect(data.measurement).toBe('activity_tracker');
    expect(data.tags).toEqual({ activityTag: 'promo', appType: 'condenser' });
    expect(data.fields).toMatchObject({ views: 1, trackingId: 'x-9', pathname: '/trending' });
  });

  it('swallows network errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    expect(() => userActionRecord('reblog', { username: 'a' })).not.toThrow();
    // allow the rejected promise to settle
    await new Promise((r) => setTimeout(r, 0));
  });
});

describe('routeTagForPath', () => {
  it('maps sort feeds to index', () => {
    expect(routeTagForPath('/trending')).toEqual({ tag: 'index', params: { order: 'trending' } });
    expect(routeTagForPath('/hot')).toEqual({ tag: 'index', params: { order: 'hot' } });
  });

  it('maps tag feeds to category', () => {
    expect(routeTagForPath('/trending/photography')).toEqual({
      tag: 'category',
      params: { category: 'photography', order: 'trending', is_user_feed: false },
    });
  });

  it('maps community feeds to community_index', () => {
    expect(routeTagForPath('/hot/hive-123456')).toEqual({
      tag: 'community_index',
      params: { community_name: 'hive-123456', order: 'hot' },
    });
  });

  it('maps post pages with and without category', () => {
    expect(routeTagForPath('/steem/@alice/hello-world')).toEqual({
      tag: 'post',
      params: { permlink: 'hello-world' },
    });
    expect(routeTagForPath('/@alice/hello-world')).toEqual({
      tag: 'post',
      params: { permlink: 'hello-world' },
    });
  });

  it('maps profile pages to user_index', () => {
    expect(routeTagForPath('/@alice')).toEqual({
      tag: 'user_index',
      params: { username: 'alice', section: 'blog' },
    });
    expect(routeTagForPath('/@alice/comments')).toEqual({
      tag: 'user_index',
      params: { username: 'alice', section: 'comments' },
    });
  });

  it('maps the own feed to category with is_user_feed', () => {
    expect(routeTagForPath('/@alice/feed')).toEqual({
      tag: 'category',
      params: { category: '@alice', order: 'feed', is_user_feed: true },
    });
  });

  it('maps static pages', () => {
    expect(routeTagForPath('/submit')).toEqual({ tag: 'submit_post', params: {} });
    expect(routeTagForPath('/communities')).toEqual({ tag: 'more_communities', params: {} });
  });

  it('returns null for untracked paths', () => {
    expect(routeTagForPath('/login')).toBeNull();
    expect(routeTagForPath('/search')).toBeNull();
  });
});
