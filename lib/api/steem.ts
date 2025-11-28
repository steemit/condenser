/**
 * Steem API client
 * This module provides functions to interact with the Steem blockchain API
 * Replaces the old FetchDataSaga functionality
 */

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
  json_metadata?: {
    tags?: string[];
    [key: string]: any;
  };
  [key: string]: any;
}

export interface FetchPostsParams {
  order: 'trending' | 'hot' | 'created' | 'payout' | 'payout_comments' | 'muted' | 'feed';
  category?: string;
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

  try {
    const searchParams = new URLSearchParams({
      sort: order,
      tag: category,
      limit: limit.toString(),
    });
    if (start_author) searchParams.set('start_author', start_author);
    if (start_permlink) searchParams.set('start_permlink', start_permlink);
    if (observer) searchParams.set('observer', observer);

    const response = await fetch(`/api/steem/posts?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    const posts = await response.json();
    return posts as Post[];
  } catch (error) {
    console.error('Error fetching ranked posts:', error);
    return [];
  }
}

/**
 * Fetch account posts from Steem API
 */
export async function fetchAccountPosts(params: FetchPostsParams & { account: string }): Promise<Post[]> {
  const {
    order = 'blog',
    account,
    start_author,
    start_permlink,
    limit = 20,
    observer,
  } = params;

  try {
    const searchParams = new URLSearchParams({
      sort: order,
      account,
      limit: limit.toString(),
    });
    if (start_author) searchParams.set('start_author', start_author);
    if (start_permlink) searchParams.set('start_permlink', start_permlink);
    if (observer) searchParams.set('observer', observer);

    const response = await fetch(`/api/steem/posts?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch account posts: ${response.statusText}`);
    }

    const posts = await response.json();
    return posts as Post[];
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
  try {
    const searchParams = new URLSearchParams({
      author,
      permlink,
    });

    const response = await fetch(`/api/steem/post?${searchParams.toString()}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch post: ${response.statusText}`);
    }

    const post = await response.json();
    return post as Post;
  } catch (error) {
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
  try {
    const searchParams = new URLSearchParams({
      author,
      permlink,
    });

    const response = await fetch(`/api/steem/comments?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.statusText}`);
    }

    const comments = await response.json();
    return comments as Post[];
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
      [key: string]: any;
    };
  };
  [key: string]: any;
}

/**
 * Fetch user profile from bridge API
 */
export async function fetchUserProfile(
  account: string,
  observer?: string
): Promise<UserProfile | null> {
  try {
    const searchParams = new URLSearchParams({
      account,
    });
    if (observer) searchParams.set('observer', observer);

    const response = await fetch(`/api/steem/profile?${searchParams.toString()}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const profile = await response.json();
    return profile as UserProfile;
  } catch (error) {
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
 * Fetch followers list
 */
export async function fetchFollowers(
  account: string,
  page: number = 1,
  limit: number = 20
): Promise<FollowItem[]> {
  try {
    const searchParams = new URLSearchParams({
      account,
      type: 'followers',
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`/api/steem/followers?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch followers: ${response.statusText}`);
    }

    const followers = await response.json();
    return followers as FollowItem[];
  } catch (error) {
    console.error('Error fetching followers:', error);
    return [];
  }
}

/**
 * Fetch following list
 */
export async function fetchFollowing(
  account: string,
  page: number = 1,
  limit: number = 20
): Promise<FollowItem[]> {
  try {
    const searchParams = new URLSearchParams({
      account,
      type: 'following',
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`/api/steem/followers?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch following: ${response.statusText}`);
    }

    const following = await response.json();
    return following as FollowItem[];
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
  result?: any;
  error?: string;
}

/**
 * Fetch unread notifications count
 */
export async function fetchUnreadNotificationsCount(
  account: string
): Promise<UnreadNotificationsResponse> {
  try {
    const searchParams = new URLSearchParams({ account });
    const response = await fetch(`/api/steem/unread-notifications?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch unread notifications: ${response.statusText}`);
    }

    const result = await response.json();
    return result as UnreadNotificationsResponse;
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
  settings?: any;
  team?: any[];
  context?: {
    role?: string;
    title?: string;
    subscribed?: boolean;
  };
  [key: string]: any;
}

/**
 * Fetch user subscriptions (communities)
 */
export async function fetchUserSubscriptions(
  account: string
): Promise<CommunitySubscription[]> {
  try {
    const searchParams = new URLSearchParams({
      account,
      type: 'subscriptions',
    });

    const response = await fetch(`/api/steem/communities?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch subscriptions: ${response.statusText}`);
    }

    const subscriptions = await response.json();
    return subscriptions as CommunitySubscription[];
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
  try {
    const searchParams = new URLSearchParams();
    if (params.observer) searchParams.set('observer', params.observer);
    if (params.query) searchParams.set('query', params.query);
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.limit) searchParams.set('limit', params.limit.toString());

    const response = await fetch(`/api/steem/communities?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch communities: ${response.statusText}`);
    }

    const communities = await response.json();
    return communities as CommunitySubscription[];
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
  [key: string]: any;
}

/**
 * Community subscriber interface
 */
export interface CommunitySubscriber {
  name: string;
  role?: string;
  title?: string;
  [key: string]: any;
}

/**
 * Fetch community roles
 */
export async function fetchCommunityRoles(
  community: string
): Promise<CommunityRole[]> {
  try {
    const searchParams = new URLSearchParams({
      community,
      type: 'roles',
    });

    const response = await fetch(`/api/steem/community-roles?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch community roles: ${response.statusText}`);
    }

    const roles = await response.json();
    return roles as CommunityRole[];
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
  try {
    const searchParams = new URLSearchParams({
      community,
      type: 'subscribers',
    });

    const response = await fetch(`/api/steem/community-roles?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch community subscribers: ${response.statusText}`);
    }

    const subscribers = await response.json();
    return subscribers as CommunitySubscriber[];
  } catch (error) {
    console.error('Error fetching community subscribers:', error);
    return [];
  }
}

