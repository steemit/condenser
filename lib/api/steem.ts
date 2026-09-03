/**
 * Steem API client
 * This module provides functions to interact with the Steem blockchain API
 * Replaces the old FetchDataSaga functionality
 *
 * All read functions go through the browser-side stale-while-revalidate cache
 * (lib/cache/client-fetch). Public signatures are unchanged so existing call
 * sites keep working; the SWR behaviour is transparent. Writes/mutations are
 * never cached.
 */

import { cachedFetch, HttpError } from '@/lib/cache/client-fetch';

/**
 * Client-side staleMs / maxAgeMs per data type.
 *   staleMs  — fresh window; within it, no network request is made.
 *   maxAgeMs — hard expiry; beyond it a fetch blocks rather than serving stale.
 * These mirror (loosely) the server-side Redis TTLs but are tuned for the
 * browser (shorter, since users expect fresh content on explicit navigation).
 */
const SWR = {
  posts: { staleMs: 10_000, maxAgeMs: 60_000 }, // 10s fresh / 1m max
  post: { staleMs: 15_000, maxAgeMs: 120_000 }, // 15s fresh / 2m max
  comments: { staleMs: 15_000, maxAgeMs: 120_000 },
  profile: { staleMs: 15_000, maxAgeMs: 60_000 },
  followers: { staleMs: 15_000, maxAgeMs: 120_000 },
  communities: { staleMs: 30_000, maxAgeMs: 300_000 },
  communityRoles: { staleMs: 30_000, maxAgeMs: 300_000 },
  notifications: { staleMs: 10_000, maxAgeMs: 30_000 },
} as const;

export interface Post {
  author: string;
  permlink: string;
  category: string;
  title: string;
  body: string;
  created: string;
  net_rshares?: string;
  children?: number;
  active_votes?: Array<{
    voter: string;
    weight: number;
  }>;
  pending_payout_value?: string;
  // Legacy bridge fields read by cards / voting UI.
  stats?: {
    gray?: boolean;
    is_pinned?: boolean;
    total_votes?: number;
    [key: string]: unknown;
  };
  author_reputation?: string | number;
  last_update?: string;
  community_title?: string;
  payout_at?: string;
  author_payout_value?: string;
  curator_payout_value?: string;
  json_metadata?: {
    tags?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface FetchPostsParams {
  order:
    | "trending"
    | "hot"
    | "created"
    | "payout"
    | "payout_comments"
    | "muted"
    | "feed"
    | "promoted";
  category?: string;
  start_author?: string;
  start_permlink?: string;
  limit?: number;
  observer?: string;
}

/** Sort modes for `/api/steem/posts` when fetching a single account's history */
export type AccountPostsOrder =
  | "blog"
  | "posts"
  | "comments"
  | "replies"
  | "payout"
  | "feed";

export interface FetchAccountPostsParams {
  account: string;
  order?: AccountPostsOrder;
  start_author?: string;
  start_permlink?: string;
  limit?: number;
  observer?: string;
}

/**
 * Fetch ranked posts from Steem API
 */
export async function fetchRankedPosts(params: FetchPostsParams): Promise<Post[]> {
  const {
    order = 'trending',
    category = '',
    start_author,
    start_permlink,
    limit = 20,
    observer,
  } = params;

  const searchParams = new URLSearchParams({
    sort: order,
    tag: category,
    limit: limit.toString(),
  });
  if (start_author) searchParams.set('start_author', start_author);
  if (start_permlink) searchParams.set('start_permlink', start_permlink);
  if (observer) searchParams.set('observer', observer);

  // Pagination cursors change the result set — bypass cache to avoid
  // stitching a stale "load more" page onto a shifted feed.
  const noStore = Boolean(start_author || start_permlink);

  try {
    const { data } = await cachedFetch<Post[]>(`/api/steem/posts?${searchParams.toString()}`, {
      ...SWR.posts,
      noStore,
    });
    return data;
  } catch (error) {
    console.error('Error fetching ranked posts:', error);
    return [];
  }
}

/**
 * Fetch account posts from Steem API
 */
export async function fetchAccountPosts(
  params: FetchAccountPostsParams
): Promise<Post[]> {
  const {
    order = "blog",
    account,
    start_author,
    start_permlink,
    limit = 20,
    observer,
  } = params;

  const searchParams = new URLSearchParams({
    sort: order,
    account,
    limit: limit.toString(),
  });
  if (start_author) searchParams.set('start_author', start_author);
  if (start_permlink) searchParams.set('start_permlink', start_permlink);
  if (observer) searchParams.set('observer', observer);

  const noStore = Boolean(start_author || start_permlink);

  try {
    const { data } = await cachedFetch<Post[]>(`/api/steem/posts?${searchParams.toString()}`, {
      ...SWR.posts,
      noStore,
    });
    return data;
  } catch (error) {
    console.error('Error fetching account posts:', error);
    return [];
  }
}

/**
 * Fetch a single post by category, author, and permlink
 */
export async function fetchPostByPermlink(
  category: string | null,
  author: string,
  permlink: string
): Promise<Post | null> {
  const searchParams = new URLSearchParams({ author, permlink });
  try {
    const { data } = await cachedFetch<Post>(`/api/steem/post?${searchParams.toString()}`, {
      ...SWR.post,
    });
    return data;
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return null;
    console.error('Error fetching post:', error);
    return null;
  }
}

/**
 * Fetch comments for a given post
 */
export async function fetchCommentsByPermlink(
  author: string,
  permlink: string
): Promise<Post[]> {
  const searchParams = new URLSearchParams({ author, permlink });
  try {
    const { data } = await cachedFetch<Post[]>(`/api/steem/comments?${searchParams.toString()}`, {
      ...SWR.comments,
    });
    return data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

/**
 * User profile interface based on bridge API get_profile response
 */
export interface UserProfile {
  id: number;
  name: string;
  created: string;
  active: string;
  post_count: number;
  reputation: string;
  blacklists: string[];
  stats: {
    rank: number;
    following: number;
    followers: number;
  };
  metadata: {
    profile: {
      name?: string;
      about?: string;
      location?: string;
      website?: string;
      profile_image?: string;
      cover_image?: string;
      version?: number;
      [key: string]: unknown;
    };
  };
  [key: string]: unknown;
}

/**
 * Fetch user profile from bridge API
 */
export async function fetchUserProfile(
  account: string,
  observer?: string
): Promise<UserProfile | null> {
  const searchParams = new URLSearchParams({ account });
  if (observer) searchParams.set('observer', observer);
  try {
    const { data } = await cachedFetch<UserProfile>(`/api/steem/profile?${searchParams.toString()}`, {
      ...SWR.profile,
    });
    return data;
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return null;
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Follower/Following item interface
 */
export interface FollowItem {
  follower: string;
  following: string;
  what: string[];
}

/**
 * Fetch followers list. `page` is 0-based (see app/api/steem/followers/route.ts).
 */
export async function fetchFollowers(
  account: string,
  page: number = 0,
  limit: number = 20
): Promise<FollowItem[]> {
  const searchParams = new URLSearchParams({
    account,
    type: 'followers',
    page: page.toString(),
    limit: limit.toString(),
  });
  try {
    const { data } = await cachedFetch<FollowItem[]>(`/api/steem/followers?${searchParams.toString()}`, {
      ...SWR.followers,
    });
    return data;
  } catch (error) {
    console.error('Error fetching followers:', error);
    return [];
  }
}

/**
 * Fetch following list. `page` is 0-based (see app/api/steem/followers/route.ts).
 */
export async function fetchFollowing(
  account: string,
  page: number = 0,
  limit: number = 20
): Promise<FollowItem[]> {
  const searchParams = new URLSearchParams({
    account,
    type: 'following',
    page: page.toString(),
    limit: limit.toString(),
  });
  try {
    const { data } = await cachedFetch<FollowItem[]>(`/api/steem/followers?${searchParams.toString()}`, {
      ...SWR.followers,
    });
    return data;
  } catch (error) {
    console.error('Error fetching following:', error);
    return [];
  }
}

/**
 * Unread notifications response interface
 */
export interface UnreadNotificationsResponse {
  account: string;
  unread_count: number;
  result?: unknown;
  error?: string;
}

/**
 * Fetch unread notifications count
 */
export async function fetchUnreadNotificationsCount(
  account: string
): Promise<UnreadNotificationsResponse> {
  const searchParams = new URLSearchParams({ account });
  try {
    const { data } = await cachedFetch<UnreadNotificationsResponse>(
      `/api/steem/unread-notifications?${searchParams.toString()}`,
      { ...SWR.notifications }
    );
    return data;
  } catch (error) {
    console.error('Error fetching unread notifications count:', error);
    return {
      account,
      unread_count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Community subscription interface
 */
export interface CommunitySubscription {
  name: string;
  title: string;
  about?: string;
  lang?: string;
  type_id?: number;
  subscribers?: number;
  sum_pending?: number;
  num_pending?: number;
  num_authors?: number;
  created?: string;
  avatar_url?: string;
  description?: string;
  flag_text?: string;
  settings?: unknown;
  team?: unknown[];
  context?: {
    role?: string;
    title?: string;
    subscribed?: boolean;
  };
  [key: string]: unknown;
}

/**
 * Fetch user subscriptions (communities)
 */
export async function fetchUserSubscriptions(
  account: string
): Promise<CommunitySubscription[]> {
  const searchParams = new URLSearchParams({ account, type: 'subscriptions' });
  try {
    const { data } = await cachedFetch<CommunitySubscription[]>(
      `/api/steem/communities?${searchParams.toString()}`,
      { ...SWR.communities }
    );
    return data;
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    return [];
  }
}

/**
 * Fetch communities list
 */
export async function fetchCommunities(params: {
  observer?: string;
  query?: string;
  sort?: string;
  limit?: number;
} = {}): Promise<CommunitySubscription[]> {
  const searchParams = new URLSearchParams();
  if (params.observer) searchParams.set('observer', params.observer);
  if (params.query) searchParams.set('query', params.query);
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.limit) searchParams.set('limit', params.limit.toString());
  try {
    const { data } = await cachedFetch<CommunitySubscription[]>(
      `/api/steem/communities?${searchParams.toString()}`,
      { ...SWR.communities }
    );
    return data;
  } catch (error) {
    console.error('Error fetching communities:', error);
    return [];
  }
}

/**
 * Community role interface
 */
export interface CommunityRole {
  name: string;
  role: string;
  title: string;
  account?: string;
  [key: string]: unknown;
}

/**
 * Community subscriber interface
 */
export interface CommunitySubscriber {
  name: string;
  role?: string;
  title?: string;
  created_at?: string;
  [key: string]: unknown;
}

/**
 * Fetch community roles
 */
export async function fetchCommunityRoles(
  community: string
): Promise<CommunityRole[]> {
  const searchParams = new URLSearchParams({ community, type: 'roles' });
  try {
    const { data } = await cachedFetch<CommunityRole[]>(
      `/api/steem/community-roles?${searchParams.toString()}`,
      { ...SWR.communityRoles }
    );
    return data;
  } catch (error) {
    console.error('Error fetching community roles:', error);
    return [];
  }
}

/**
 * Fetch community subscribers
 */
export async function fetchCommunitySubscribers(
  community: string
): Promise<CommunitySubscriber[]> {
  const searchParams = new URLSearchParams({ community, type: 'subscribers' });
  try {
    const { data } = await cachedFetch<CommunitySubscriber[]>(
      `/api/steem/community-roles?${searchParams.toString()}`,
      { ...SWR.communityRoles }
    );
    return data;
  } catch (error) {
    console.error('Error fetching community subscribers:', error);
    return [];
  }
}

