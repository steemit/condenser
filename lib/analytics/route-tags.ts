/**
 * Maps app paths to legacy overseer route tags (legacy call sites:
 * PostsIndex.jsx setRouteTag, Post.jsx, UserProfile.jsx, static pages).
 * Pure function so it can be unit-tested without the network layer.
 */

import type { RouteTag } from './overseer';
import { PROFILE_SECTIONS, RESERVED_ROUTES, SORT_TYPES } from '@/lib/routes';

type Primitive = string | number | boolean | null | undefined;

export interface RouteTagInfo {
  tag: RouteTag;
  params: Record<string, Primitive>;
}

// Set lookups over the shared route vocabulary (lib/routes.ts — the same
// lists proxy.ts consumes).
const SORT_TYPES_SET = new Set(SORT_TYPES);
const PROFILE_SECTIONS_SET = new Set(PROFILE_SECTIONS);
// Only guards usernames below (post-no-category and profile-root branches);
// post categories carry no reserved-word check, mirroring proxy.ts branch 2.
const RESERVED_ROUTES_SET = new Set(RESERVED_ROUTES);

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

  // `/` renders the trending PostsIndex (legacy ResolveRoute.js maps `/`
  // → PostsIndex ['trending']; its setRouteTag dispatches 'index').
  if (seg.length === 0) return { tag: 'index', params: { order: 'trending' } };

  // Post pages: /category/@user/permlink or /@user/permlink.
  // Mirrors proxy.ts branch 2: no reserved-word check on the category —
  // analytics receives the pre-rewrite URL (usePathname(), e.g.
  // /hot/@alice/my-post) and legacy tags every Post page unconditionally.
  const postWithCategory = pathname.match(/^\/([^/]+)\/@([^/]+)\/([^/]+)$/);
  if (postWithCategory) {
    return { tag: 'post', params: { permlink: postWithCategory[3] } };
  }
  const postNoCategory = pathname.match(/^\/@([^/]+)\/([^/]+)$/);
  if (
    postNoCategory &&
    !RESERVED_ROUTES_SET.has(postNoCategory[1].toLowerCase()) &&
    !PROFILE_SECTIONS_SET.has(postNoCategory[2].toLowerCase())
  ) {
    return { tag: 'post', params: { permlink: postNoCategory[2] } };
  }

  // User profile: /@user and /@user/<section>. The own feed (/@user/feed)
  // is legacy PostsIndex home feed → 'category' with is_user_feed.
  if (postNoCategory && PROFILE_SECTIONS_SET.has(postNoCategory[2].toLowerCase())) {
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
  if (userRoot && !RESERVED_ROUTES_SET.has(userRoot[1].toLowerCase())) {
    return { tag: 'user_index', params: { username: userRoot[1], section: 'blog' } };
  }

  // Feed pages: /[sort] and /[sort]/[tag].
  if (seg.length >= 1 && SORT_TYPES_SET.has(seg[0].toLowerCase())) {
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
