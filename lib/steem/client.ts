/**
 * Steem API Client
 * Server-side Steem API client using @steemit/steem-js
 * This should only be used in server-side code (API routes, Server Components)
 */

// Import steem object directly as a named export
// @ts-expect-error - TypeScript can't resolve the named export, but it exists at runtime
import { steem } from '@steemit/steem-js';

// Initialize Steem API configuration
let isInitialized = false;

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
  return callBridge<unknown[]>('get_ranked_posts', params);
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
  return callBridge<unknown[]>('get_account_posts', params);
}

/**
 * Get discussion (post with comments)
 */
export async function getDiscussion(params: {
  author: string;
  permlink: string;
}): Promise<unknown> {
  return callBridge<unknown>('get_discussion', params);
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
  initializeSteemApi();
  return steem.api.getDynamicGlobalPropertiesAsync();
}

/**
 * Get following list
 */
export async function getFollowing(account: string, start: string, type: string, limit: number): Promise<unknown[]> {
  initializeSteemApi();
  return steem.api.getFollowingAsync(account, start, type, limit);
}

/**
 * Get followers list
 */
export async function getFollowers(account: string, start: string, type: string, limit: number): Promise<unknown[]> {
  initializeSteemApi();
  return steem.api.getFollowersAsync(account, start, type, limit);
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
  return callBridge<unknown>('get_profile', params);
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
  return callBridge<unknown[]>('get_followers_by_page', [account, page, limit, type], 'condenser_api.');
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
  return callBridge<unknown[]>('get_following_by_page', [account, page, limit, type], 'condenser_api.');
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
  return callBridge<unknown[]>('list_communities', params);
}

/**
 * Get community roles
 */
export async function getCommunityRoles(params: {
  community: string;
}): Promise<unknown[]> {
  return callBridge<unknown[]>('list_community_roles', params);
}

/**
 * Get community subscribers
 */
export async function getCommunitySubscribers(params: {
  community: string;
}): Promise<unknown[]> {
  return callBridge<unknown[]>('list_subscribers', params);
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

