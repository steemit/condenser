/**
 * Steem API Client
 * Server-side Steem API client using @steemit/steem-js
 * This should only be used in server-side code (API routes, Server Components)
 */

// Import steem object directly as a named export
import { steem } from '@steemit/steem-js';
import { withCache, type WithCacheResult } from '@/lib/cache/server-cache';

// Initialize Steem API configuration
let isInitialized = false;

/**
 * Cache TTLs (seconds). These are initial values — tune after observing real
 * freshness requirements in production. `ttl` is the fresh window; `staleTtl`
 * is the grace window during which stale data may be served on RPC failure.
 *
 * Personalised endpoints (posts/post/profile/comments/followers) are cached
 * ONLY when no observer is present (anonymous traffic). A logged-in observer
 * bypasses Redis entirely to avoid leaking one user's vote/follow state to
 * another. See the isAnonymous guard at each call site.
 */
const CACHE_TTL = {
  // Global / non-personalised data
  dynamicGlobalProperties: { ttl: 3, staleTtl: 30 },
  communities: { ttl: 600, staleTtl: 1800 },
  communityRoles: { ttl: 600, staleTtl: 1800 },
  // Personalised — cached for anonymous traffic only
  posts: { ttl: 3, staleTtl: 300 },
  post: { ttl: 30, staleTtl: 600 },
  comments: { ttl: 60, staleTtl: 600 },
  profile: { ttl: 30, staleTtl: 300 },
  followers: { ttl: 30, staleTtl: 300 },
} as const;

/** Extract the bare data value from a WithCacheResult wrapper. */
function unwrap<T>(result: WithCacheResult<T>): T {
  return result.data;
}

export function initializeSteemApi() {
  if (isInitialized) return;

  // Use unified environment variable for Steem API URL
  const steemdUrl = process.env.STEEM_API_URL || 'https://api.steemit.com';
  const useAppbase = process.env.STEEMD_USE_APPBASE === 'true';
  const chainId = process.env.CHAIN_ID || '0000000000000000000000000000000000000000000000000000000000000000';
  const addressPrefix = process.env.ADDRESS_PREFIX || 'STM';

  steem.api.setOptions({
    url: steemdUrl,
    retry: {
      retries: 10,
      factor: 5,
      minTimeout: 50,
      maxTimeout: 60 * 1000,
      randomize: true,
    },
    useAppbaseApi: useAppbase,
    address_prefix: addressPrefix,
    chain_id: chainId,
  });

  isInitialized = true;
}

/**
 * Call Steem API bridge method
 * Similar to legacy callBridge function
 */
export async function callBridge<T = unknown>(method: string, params: unknown, pre = 'bridge.'): Promise<T> {
  initializeSteemApi();

  return new Promise<T>((resolve, reject) => {
    steem.api.call(pre + method, params, (err: unknown, data: unknown) => {
      if (err) {
        console.error('Steem API call error:', {
          method: pre + method,
          params,
          error: err,
        });
        reject(err);
      } else {
        resolve(data as T);
      }
    });
  });
}

/**
 * Generic Steem API call helper for non-bridge methods.
 * Keeps compatibility with API routes that call raw method names.
 */
export async function callSteemApi<T = unknown>(method: string, params: unknown): Promise<T> {
  initializeSteemApi();

  return new Promise<T>((resolve, reject) => {
    steem.api.call(method, params, (err: unknown, data: unknown) => {
      if (err) {
        console.error('Steem API call error:', {
          method,
          params,
          error: err,
        });
        reject(err);
      } else {
        resolve(data as T);
      }
    });
  });
}

/**
 * Probe the Steem node health by fetching dynamic global properties.
 * Used by /api/health to populate the shared health entry. Returns a result
 * object rather than throwing so callers can record the failure reason.
 *
 * IMPORTANT: this must bypass the cache and hit the RPC directly. The probe's
 * entire purpose is to detect a node outage *now*; going through the cached
 * getDynamicGlobalProperties() would return a fresh-window value and mask the
 * very failure we are trying to observe.
 */
export async function checkSteemNodeHealth(): Promise<{
  healthy: boolean;
  blockNumber?: number;
  latency?: number;
  error?: string;
}> {
  try {
    const start = Date.now();
    initializeSteemApi();
    const props = (await steem.api.getDynamicGlobalPropertiesAsync()) as {
      head_block_number?: number;
    };
    const latency = Date.now() - start;
    return {
      healthy: true,
      blockNumber: props?.head_block_number,
      latency,
    };
  } catch (error) {
    return { healthy: false, error: (error as Error).message };
  }
}

/**
 * Get ranked posts
 */
export async function getRankedPosts(params: {
  sort: string;
  tag?: string;
  start_author?: string;
  start_permlink?: string;
  limit?: number;
  observer?: string;
}): Promise<unknown[]> {
  const useCache = !params.observer && !params.start_author;
  if (!useCache) {
    return callBridge<unknown[]>('get_ranked_posts', params);
  }

  // Default 20 mirrors the posts route's fallback (app/api/steem/posts/route.ts:17).
  const key = `steem:posts:ranked:${params.sort}:${params.tag || ''}:${params.limit || 20}`;
  const result = await withCache(key, CACHE_TTL.posts.ttl, CACHE_TTL.posts.staleTtl, () =>
    callBridge<unknown[]>('get_ranked_posts', params)
  );
  return unwrap(result);
}

/**
 * Get account posts
 */
export async function getAccountPosts(params: {
  sort: string;
  account: string;
  start_author?: string;
  start_permlink?: string;
  limit?: number;
  observer?: string;
}): Promise<unknown[]> {
  const useCache = !params.observer && !params.start_author;
  if (!useCache) {
    return callBridge<unknown[]>('get_account_posts', params);
  }

  // Default 20 mirrors the posts route's fallback (app/api/steem/posts/route.ts:17).
  const key = `steem:posts:account:${params.account}:${params.sort}:${params.limit || 20}`;
  const result = await withCache(key, CACHE_TTL.posts.ttl, CACHE_TTL.posts.staleTtl, () =>
    callBridge<unknown[]>('get_account_posts', params)
  );
  return unwrap(result);
}

/**
 * Get discussion (post with comments)
 *
 * Cached unconditionally. This is safe because the bridge `get_discussion`
 * call is public-read-only and carries no `observer`: the result contains
 * `active_votes` (public) but no per-observer fields (e.g. "have I voted"),
 * so serving one user's cached copy to another cannot leak personal state.
 * If this ever changes to pass an observer, the cache must be gated like
 * getRankedPosts/getProfile (bypass when observer is present).
 */
export async function getDiscussion(params: {
  author: string;
  permlink: string;
}): Promise<unknown> {
  const key = `steem:post:${params.author}:${params.permlink}`;
  const result = await withCache(key, CACHE_TTL.post.ttl, CACHE_TTL.post.staleTtl, () =>
    callBridge<unknown>('get_discussion', params)
  );
  return unwrap(result);
}

/**
 * Get account information
 */
export async function getAccount(username: string): Promise<unknown | null> {
  initializeSteemApi();
  const accounts = await steem.api.getAccountsAsync([username]);
  return accounts && accounts.length > 0 ? accounts[0] : null;
}

/**
 * Get accounts information
 */
export async function getAccounts(usernames: string[]): Promise<unknown[]> {
  initializeSteemApi();
  return steem.api.getAccountsAsync(usernames);
}

/**
 * Get dynamic global properties
 */
export async function getDynamicGlobalProperties(): Promise<unknown> {
  const result = await withCache(
    'steem:dynamic-global-properties',
    CACHE_TTL.dynamicGlobalProperties.ttl,
    CACHE_TTL.dynamicGlobalProperties.staleTtl,
    async () => {
      initializeSteemApi();
      return steem.api.getDynamicGlobalPropertiesAsync();
    }
  );
  return unwrap(result);
}

/**
 * Get following list
 */
export async function getFollowing(account: string, start: string, type: string, limit: number): Promise<unknown[]> {
  const key = `steem:following:${account}:${type}:${start || '0'}:${limit}`;
  const result = await withCache(key, CACHE_TTL.followers.ttl, CACHE_TTL.followers.staleTtl, async () => {
    initializeSteemApi();
    return steem.api.getFollowingAsync(account, start, type, limit);
  });
  return unwrap(result);
}

/**
 * Get followers list
 */
export async function getFollowers(account: string, start: string, type: string, limit: number): Promise<unknown[]> {
  const key = `steem:followers:${account}:${type}:${start || '0'}:${limit}`;
  const result = await withCache(key, CACHE_TTL.followers.ttl, CACHE_TTL.followers.staleTtl, async () => {
    initializeSteemApi();
    return steem.api.getFollowersAsync(account, start, type, limit);
  });
  return unwrap(result);
}

/**
 * Get account notifications
 */
export async function getAccountNotifications(params: {
  account: string;
  last_id?: number;
  limit?: number;
}): Promise<unknown[]> {
  return callBridge<unknown[]>('account_notifications', params);
}

/**
 * Get user profile from bridge API
 */
export async function getProfile(params: {
  account: string;
  observer?: string;
}): Promise<unknown> {
  // observer personalises the result (e.g. follows-you) — bypass cache when set.
  if (params.observer) {
    return callBridge<unknown>('get_profile', params);
  }

  const key = `steem:profile:${params.account}`;
  const result = await withCache(key, CACHE_TTL.profile.ttl, CACHE_TTL.profile.staleTtl, () =>
    callBridge<unknown>('get_profile', params)
  );
  return unwrap(result);
}

/**
 * Get followers list by page
 */
export async function getFollowersByPage(params: {
  account: string;
  page: number;
  limit: number;
  type?: string;
}): Promise<unknown[]> {
  const { account, page, limit, type = 'blog' } = params;
  const key = `steem:followers-page:${account}:${type}:${page}:${limit}`;
  const result = await withCache(key, CACHE_TTL.followers.ttl, CACHE_TTL.followers.staleTtl, () =>
    callBridge<unknown[]>('get_followers_by_page', [account, page, limit, type], 'condenser_api.')
  );
  return unwrap(result);
}

/**
 * Get following list by page
 */
export async function getFollowingByPage(params: {
  account: string;
  page: number;
  limit: number;
  type?: string;
}): Promise<unknown[]> {
  const { account, page, limit, type = 'blog' } = params;
  const key = `steem:following-page:${account}:${type}:${page}:${limit}`;
  const result = await withCache(key, CACHE_TTL.followers.ttl, CACHE_TTL.followers.staleTtl, () =>
    callBridge<unknown[]>('get_following_by_page', [account, page, limit, type], 'condenser_api.')
  );
  return unwrap(result);
}

/**
 * Get user subscriptions (communities)
 */
export async function getUserSubscriptions(params: {
  account: string;
}): Promise<unknown[]> {
  return callBridge<unknown[]>('list_all_subscriptions', params);
}

/**
 * List communities
 */
export async function listCommunities(params: {
  observer?: string;
  query?: string;
  sort?: string;
  limit?: number;
}): Promise<unknown[]> {
  // observer personalises the list (e.g. subscribed-to flag) — bypass cache when set.
  if (params.observer) {
    return callBridge<unknown[]>('list_communities', params);
  }

  // Default 20 mirrors the communities route's own fallback (app/api/steem/
  // communities/route.ts:18), so the key matches what actually reaches the RPC.
  const key = `steem:communities:${params.sort || ''}:${params.query || ''}:${params.limit || 20}`;
  const result = await withCache(key, CACHE_TTL.communities.ttl, CACHE_TTL.communities.staleTtl, () =>
    callBridge<unknown[]>('list_communities', params)
  );
  return unwrap(result);
}

/**
 * Get community roles
 */
export async function getCommunityRoles(params: {
  community: string;
}): Promise<unknown[]> {
  const key = `steem:community-roles:${params.community}`;
  const result = await withCache(key, CACHE_TTL.communityRoles.ttl, CACHE_TTL.communityRoles.staleTtl, () =>
    callBridge<unknown[]>('list_community_roles', params)
  );
  return unwrap(result);
}

/**
 * Get community subscribers
 */
export async function getCommunitySubscribers(params: {
  community: string;
}): Promise<unknown[]> {
  const key = `steem:community-subscribers:${params.community}`;
  const result = await withCache(key, CACHE_TTL.communityRoles.ttl, CACHE_TTL.communityRoles.staleTtl, () =>
    callBridge<unknown[]>('list_subscribers', params)
  );
  return unwrap(result);
}

/**
 * Get unread notifications
 */
export interface UnreadNotificationsResponse {
  error?: {
    message: string;
  };
  [key: string]: unknown;
}

export async function getUnreadNotifications(params: {
  account: string;
}): Promise<UnreadNotificationsResponse> {
  return callBridge('unread_notifications', params);
}

/**
 * Create a unique permlink for a post
 */
export function createPermlink(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  
  const timestamp = Date.now().toString(36);
  return `${slug}-${timestamp}`;
}

/**
 * Broadcast a comment operation (post or reply)
 */
export async function broadcastComment(params: {
  author: string;
  title: string;
  body: string;
  category: string;
  tags: string[];
  parent_author?: string;
  parent_permlink?: string;
  permlink?: string;
  json_metadata?: unknown;
  privateKey: string;
}): Promise<unknown> {
  initializeSteemApi();

  const {
    author,
    title,
    body,
    category,
    tags,
    parent_author = '',
    parent_permlink = category,
    permlink = createPermlink(title),
    json_metadata = { tags, app: 'condenser/0.1' },
    privateKey,
  } = params;

  const commentOp = {
    parent_author,
    parent_permlink,
    author,
    permlink: permlink.toLowerCase(),
    title: title.trim(),
    body: body.trim(),
    json_metadata: typeof json_metadata === 'string' 
      ? json_metadata 
      : JSON.stringify(json_metadata),
  };

  const operations: Array<[string, Record<string, unknown>]> = [['comment', commentOp]];

  // Add comment_options for posts (not replies)
  if (!parent_author) {
    operations.push([
      'comment_options',
      {
        author,
        permlink: permlink.toLowerCase(),
        max_accepted_payout: '1000000.000 SBD',
        percent_steem_dollars: 10000, // 100%
        allow_votes: true,
        allow_curation_rewards: true,
        extensions: [],
      },
    ]);
  }

  return new Promise((resolve, reject) => {
    const key = steem.auth.PrivateKey.fromString(privateKey);
    steem.broadcast.send(
      {
        extensions: [],
        operations,
      },
      [key],
      (err: unknown, result: unknown) => {
        if (err) {
          console.error('Broadcast error:', err);
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
}

/**
 * Export steem API for direct access if needed
 */
export { steem };
export const PrivateKey = steem.auth.PrivateKey;

