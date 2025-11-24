/**
 * Steem API Client
 * Server-side Steem API client using @steemit/steem-js
 * This should only be used in server-side code (API routes, Server Components)
 */

import * as steem from '@steemit/steem-js';

// Initialize Steem API configuration
let isInitialized = false;

export function initializeSteemApi() {
  if (isInitialized) return;

  const steemdUrl = process.env.STEEMD_CONNECTION_SERVER || process.env.STEEMD_CONNECTION_CLIENT || 'https://api.steemit.com';
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
  });

  steem.config.set('address_prefix', addressPrefix);
  steem.config.set('chain_id', chainId);

  isInitialized = true;
}

/**
 * Call Steem API bridge method
 * Similar to legacy callBridge function
 */
export async function callBridge(method: string, params: any, pre = 'bridge.'): Promise<any> {
  initializeSteemApi();

  return new Promise((resolve, reject) => {
    steem.api.call(pre + method, params, (err: any, data: any) => {
      if (err) {
        console.error('Steem API call error:', {
          method: pre + method,
          params,
          error: err,
        });
        reject(err);
      } else {
        resolve(data);
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
}): Promise<any[]> {
  return callBridge('get_ranked_posts', params);
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
}): Promise<any[]> {
  return callBridge('get_account_posts', params);
}

/**
 * Get discussion (post with comments)
 */
export async function getDiscussion(params: {
  author: string;
  permlink: string;
}): Promise<any> {
  return callBridge('get_discussion', params);
}

/**
 * Get account information
 */
export async function getAccount(username: string): Promise<any> {
  initializeSteemApi();
  const accounts = await steem.api.getAccountsAsync([username]);
  return accounts && accounts.length > 0 ? accounts[0] : null;
}

/**
 * Get accounts information
 */
export async function getAccounts(usernames: string[]): Promise<any[]> {
  initializeSteemApi();
  return steem.api.getAccountsAsync(usernames);
}

/**
 * Get dynamic global properties
 */
export async function getDynamicGlobalProperties(): Promise<any> {
  initializeSteemApi();
  return steem.api.getDynamicGlobalPropertiesAsync();
}

/**
 * Get following list
 */
export async function getFollowing(account: string, start: string, type: string, limit: number): Promise<any[]> {
  initializeSteemApi();
  return steem.api.getFollowingAsync(account, start, type, limit);
}

/**
 * Get followers list
 */
export async function getFollowers(account: string, start: string, type: string, limit: number): Promise<any[]> {
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
}): Promise<any[]> {
  return callBridge('account_notifications', params);
}

/**
 * Get unread notifications
 */
export async function getUnreadNotifications(params: {
  account: string;
}): Promise<any> {
  return callBridge('unread_notifications', params);
}

/**
 * Export steem API for direct access if needed
 */
export { steem };

