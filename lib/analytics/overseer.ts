/**
 * Client-side overseer reporting (legacy src/app/utils/ServerApiClient.js).
 *
 * Legacy called the node's `overseer.collect` JSON-RPC method directly from
 * the browser via steem-js. In the rewrite steem-js is server-only, so these
 * helpers relay through the /api/steem/overseer route handler instead. All
 * calls are fire-and-forget: failures are logged, never thrown.
 *
 * Every payload carries `version: 'next'` so rewrite traffic can be told
 * apart from legacy condenser traffic in overseer (legacy sends no version).
 */

type Primitive = string | number | boolean | null | undefined;

interface OverseerCollectPayload {
  measurement?: string;
  tags?: Record<string, Primitive>;
  fields?: Record<string, Primitive>;
  [collectionItem: string]: unknown;
}

async function collect(payload: [string, OverseerCollectPayload]): Promise<void> {
  try {
    await fetch('/api/steem/overseer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // Reporting must not be cancelled when the page unloads mid-request.
      keepalive: true,
    });
  } catch (error) {
    console.warn('overseer collect error', error);
  }
}

export type RouteTag =
  | 'post'
  | 'community_index'
  | 'category'
  | 'index'
  | 'user_index'
  | 'submit_post'
  | 'more_communities';

/** Legacy ServerApiClient.recordRouteTag — page view per route family. */
export function recordRouteTag(
  trackingId: string,
  tag: RouteTag,
  params: Record<string, Primitive> = {},
  isLogin = false
): void {
  let tags: Record<string, Primitive> = { app: 'condenser', version: 'next', tag };
  let fields: Record<string, Primitive> = { trackingId };
  switch (tag) {
    case 'post':
      fields = { trackingId, permlink: params.permlink };
      break;
    case 'community_index':
      fields = { trackingId, community_name: params.community_name };
      tags = { app: 'condenser', version: 'next', tag, sort: params.order };
      break;
    case 'category':
      fields = { trackingId, category: params.category };
      tags = {
        app: 'condenser',
        version: 'next',
        tag,
        sort: params.order,
        is_user_feed: params.is_user_feed,
        is_my_community: params.category === 'my',
      };
      break;
    case 'index':
      fields = { trackingId };
      tags = { app: 'condenser', version: 'next', tag, sort: params.order };
      break;
  }
  tags['is_login'] = isLogin;
  void collect(['custom', { measurement: 'route', fields, tags }]);
}

/** Legacy ServerApiClient.userActionRecord — user action tracking. */
export function userActionRecord(
  action: string,
  params: Record<string, Primitive> = {}
): void {
  let tags: Record<string, Primitive> = { app: 'condenser', version: 'next', action_type: action };
  let fields: Record<string, Primitive> = {};
  switch (action) {
    case 'comment':
      tags = {
        app: 'condenser',
        version: 'next',
        action_type: action,
        is_edit: params.is_edit,
        payout_type: params.payout_type,
        comment_type: params.comment_type,
      };
      fields = { username: params.username };
      break;
    case 'vote':
      tags = { app: 'condenser', version: 'next', action_type: action, vote_type: params.vote_type };
      fields = {
        voter: params.voter,
        author: params.author,
        permlink: params.permlink,
        weight: params.weight,
      };
      break;
    case 'update_account':
      fields = { username: params.username };
      break;
    case 'reblog':
      fields = {
        username: params.username,
        permlink: params.permlink,
        author: params.author,
      };
      break;
    case 'delete_comment':
      tags = { app: 'condenser', version: 'next', action_type: action, comment_type: params.comment_type };
      fields = { username: params.username, permlink: params.permlink };
      break;
  }
  void collect(['custom', { measurement: 'user_action', fields, tags }]);
}

/** Legacy ServerApiClient.recordAdsView — ad click/impression beacon. */
export function recordAdsView({
  trackingId,
  adTag,
}: {
  trackingId: string;
  adTag: string;
}): void {
  void collect(['ad', { trackingId, adTag, version: 'next' }]);
}

/** Legacy ServerApiClient.recordActivityTracker — URL-hash campaign visits. */
export function recordActivityTracker({
  trackingId,
  activityTag,
  pathname,
  referrer,
}: {
  trackingId: string;
  activityTag: string;
  pathname: string;
  referrer: string;
}): void {
  void collect([
    'custom',
    {
      measurement: 'activity_tracker',
      tags: { activityTag, appType: 'condenser', version: 'next' },
      fields: {
        views: 1,
        trackingId,
        pathname,
        referrer,
        ua: typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : null,
      },
    },
  ]);
}
