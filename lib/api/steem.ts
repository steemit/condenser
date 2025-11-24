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

