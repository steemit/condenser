/**
 * Maps app paths to legacy overseer route tags (legacy call sites:
 * PostsIndex.jsx setRouteTag, Post.jsx, UserProfile.jsx, static pages).
 * Pure function so it can be unit-tested without the network layer.
 */

import type { RouteTag } from './overseer';

type Primitive = string | number | boolean | null | undefined;

export interface RouteTagInfo {
  tag: RouteTag;
  params: Record<string, Primitive>;
}

const SORT_TYPES = new Set([
  'hot',
  'trending',
  'promoted',
  'payout',
  'payout_comments',
  'muted',
  'created',
]);

// Same list as proxy.ts — profile URL segments that are sections.
const PROFILE_SECTIONS = new Set([
  'blog',
  'posts',
  'comments',
  'replies',
  'payout',
  'feed',
  'followers',
  'followed',
  'settings',
  'notifications',
  'communities',
]);

const RESERVED_ROUTES = new Set([
  'trending', 'hot', 'created', 'payout', 'payout_comments', 'muted',
  'login', 'search', 'submit', 'about', 'faq', 'privacy', 'support', 'tos',
  'communities', 'tags', 'rewards', 'roles', 'welcome', 'api', '_next',
]);

/**
 * Returns the route tag + params for a path, or null for paths legacy does
 * not track (login, search, 404, …).
 */
export function routeTagForPath(pathname: string): RouteTagInfo | null {
  const seg = pathname.split('/').filter(Boolean).map((s) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  });

  // Static pages (legacy: SubmitPost.jsx, CommunitiesIndex.jsx).
  if (seg.length === 1 && seg[0] === 'submit') return { tag: 'submit_post', params: {} };
  if (seg.length === 1 && seg[0] === 'communities')
    return { tag: 'more_communities', params: {} };

  // Post pages: /category/@user/permlink or /@user/permlink.
  const postWithCategory = pathname.match(/^\/([^/]+)\/@([^/]+)\/([^/]+)$/);
  if (postWithCategory && !RESERVED_ROUTES.has(postWithCategory[1].toLowerCase())) {
    return { tag: 'post', params: { permlink: postWithCategory[3] } };
  }
  const postNoCategory = pathname.match(/^\/@([^/]+)\/([^/]+)$/);
  if (
    postNoCategory &&
    !RESERVED_ROUTES.has(postNoCategory[1].toLowerCase()) &&
    !PROFILE_SECTIONS.has(postNoCategory[2].toLowerCase())
  ) {
    return { tag: 'post', params: { permlink: postNoCategory[2] } };
  }

  // User profile: /@user and /@user/<section>. The own feed (/@user/feed)
  // is legacy PostsIndex home feed → 'category' with is_user_feed.
  if (postNoCategory && PROFILE_SECTIONS.has(postNoCategory[2].toLowerCase())) {
    const user = postNoCategory[1];
    const section = postNoCategory[2].toLowerCase();
    if (section === 'feed') {
      return {
        tag: 'category',
        params: { category: `@${user}`, order: 'feed', is_user_feed: true },
      };
    }
    return { tag: 'user_index', params: { username: user, section } };
  }
  const userRoot = pathname.match(/^\/@([^/]+)\/?$/);
  if (userRoot && !RESERVED_ROUTES.has(userRoot[1].toLowerCase())) {
    return { tag: 'user_index', params: { username: userRoot[1], section: 'blog' } };
  }

  // Feed pages: /[sort] and /[sort]/[tag].
  if (seg.length >= 1 && SORT_TYPES.has(seg[0].toLowerCase())) {
    const order = seg[0].toLowerCase();
    if (seg.length === 1) return { tag: 'index', params: { order } };
    const tag = seg[1];
    if (tag.startsWith('@')) return null; // /@user/... handled above
    if (tag.toLowerCase().startsWith('hive-')) {
      return { tag: 'community_index', params: { community_name: tag, order } };
    }
    return {
      tag: 'category',
      params: { category: tag, order, is_user_feed: false },
    };
  }

  return null;
}
