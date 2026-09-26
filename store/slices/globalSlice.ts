import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { lastreadTimeMs } from '@/lib/utils/lastread';
import type { Account, Post, Vote } from '@/types/steem';

// Types
export type { Vote };

/**
 * Redux account cache entry: the canonical wire Account plus witness_votes
 * as a client-side Set (legacy stored the voted-witness set, not the chain's
 * string array). Derived so the wire shape stays owned by types/steem.ts.
 */
export type AccountEntry = Account & {
  witness_votes?: Set<string>;
};

/**
 * Redux content-cache entry: the canonical wire Post plus client-only UI
 * state (collapse flag; reply keys in tree order). Derived so the wire shape
 * itself stays owned by types/steem.ts.
 */
export type ContentPost = Post & {
  collapsed?: boolean;
  replies?: string[];
};

export interface NotificationItem {
  [key: string]: unknown;
}

export interface Notification {
  name: string;
  notifications: NotificationItem[];
  isLastPage?: boolean;
  unreadNotifications?: Record<string, unknown>;
}

export interface Community {
  name: string;
  [key: string]: unknown;
}

interface FetchJsonEntry {
  loading: boolean;
  result?: unknown;
  error?: unknown;
}

interface DialogEntry {
  visible: boolean;
  data?: unknown;
}

export interface GlobalState {
  status: Record<string, unknown>;
  content: Record<string, ContentPost>;
  accounts: Record<string, AccountEntry>;
  headers: Record<string, unknown>;
  notifications: Record<string, Notification> & {
    loading?: boolean;
  };
  community: Record<string, Community>;
  community_idx: string[];
  subscriptions: {
    loading?: boolean;
    [key: string]: unknown;
  };
  special_posts?: {
    featured_posts?: unknown[];
    promoted_posts?: unknown[];
  };
  fetchJson: Record<string, FetchJsonEntry>;
  dialogs: Record<string, DialogEntry>;
  rewards?: unknown;
  dgp?: unknown;
  vests_per_steem?: number;
  notices?: unknown;
  tagslist?: unknown[];
  followerslist?: unknown[];
  follow?: {
    getFollowingAsync?: Record<string, {
      blog_result?: string[];
      ignore_result?: string[];
      blog_count?: number;
      ignore_count?: number;
      blog_loading?: boolean;
      ignore_loading?: boolean;
    }>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

const postKey = (author: string, permlink: string): string | null => {
  if (!author || !permlink) return null;
  return `${author}/${permlink}`;
};

// Ids of notification items, ignoring items without a usable id (hivemind
// always assigns one; guard anyway so an id-less item can never be dropped
// or double-inserted by the dedup paths below).
const notificationIdSet = (items: NotificationItem[]): Set<unknown> => {
  const ids = new Set<unknown>();
  items.forEach((item) => {
    if (item.id != null) ids.add(item.id);
  });
  return ids;
};

// A locally applied read marker only shadows hivemind for this long. Normal
// hivemind index latency for setLastRead is seconds; 5 minutes covers
// abnormal-but-recoverable lag while still bounding how long a dropped op
// can pin the unread badge at zero (see receiveUnreadNotifications).
const STALE_MARKER_GRACE_MS = 5 * 60_000;

const initialState: GlobalState = {
  status: {},
  content: {},
  accounts: {},
  headers: {},
  notifications: {},
  community: {},
  community_idx: [],
  subscriptions: {},
  fetchJson: {},
  dialogs: {},
};

const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    // NOTE on client-side data caching:
    // The following reducers were ported from legacy as a cache skeleton but
    // have NO dispatchers in the Next.js app: receiveContent, receiveAccount,
    // receiveAccounts, receivePostHeader, receiveCommunities, receiveCommunity.
    // They are @deprecated — the browser SWR layer (lib/cache/client-fetch) is
    // now the single source of truth for cached read data. Do not add new
    // dispatchers for them; leave them in place only to avoid breaking imports.
    setCollapsed: (state, action: PayloadAction<{ post: string; collapsed: boolean }>) => {
      const { post, collapsed } = action.payload;
      if (!state.content[post]) {
        state.content[post] = {} as ContentPost;
      }
      state.content[post].collapsed = collapsed;
    },
    receiveState: (state, action: PayloadAction<Record<string, unknown>>) => {
      // Deep merge payload into state
      const payload = action.payload;
      Object.keys(payload).forEach((key) => {
        if (typeof payload[key] === 'object' && payload[key] !== null && !Array.isArray(payload[key])) {
          const existing = (state[key] ?? {}) as Record<string, unknown>;
          state[key] = { ...existing, ...(payload[key] as Record<string, unknown>) };
        } else {
          state[key] = payload[key];
        }
      });
    },
    // Legacy GlobalReducer RECEIVE_NOTIFICATIONS blindly concats the incoming
    // page onto the stored list. That was survivable in legacy (class
    // component, no strict mode), but here the list page loads the first page
    // on every mount, so dev strict-mode double effects and client-side
    // navigate-away-and-back both append the same page twice. Keep legacy's
    // append shape but dedup by notification id, with direction-aware merge:
    //   - first page (no cursor): incoming order wins; older items already
    //     paged in that fell off the head of the feed are kept at the tail;
    //   - cursor pagination (append: true): incoming items are strictly older
    //     than what is stored, so they concat at the end, minus duplicates.
    receiveNotifications: (state, action: PayloadAction<{
      name: string;
      notifications: NotificationItem[];
      isLastPage?: boolean;
      /** True when loading an older page via a last_id cursor. */
      append?: boolean;
    }>) => {
      const { name, notifications, isLastPage, append } = action.payload;
      if (!state.notifications[name]) {
        state.notifications[name] = {
          name,
          notifications: [],
        };
      }
      const existing = state.notifications[name].notifications || [];
      // Self-dedup the incoming page first: a single page carrying the same
      // id twice must not be stored twice — the cross-page id sets below only
      // guard against ids already present in the stored list. Id-less items
      // keep their never-dropped semantics.
      const seenIds = new Set<unknown>();
      const incoming = notifications.filter((n) => {
        if (n.id == null) return true;
        if (seenIds.has(n.id)) return false;
        seenIds.add(n.id);
        return true;
      });
      const incomingIds = notificationIdSet(incoming);
      const existingIds = notificationIdSet(existing);
      state.notifications[name].notifications = append
        ? [
            ...existing,
            // Intended asymmetry: unlike a first-page reload (which replaces
            // the stored copy of a re-seen id), a cursor page never refreshes
            // an item already stored — the stored copy wins. Cursor pages are
            // strictly older and fetched once, so there is nothing newer to
            // refresh the row with anyway.
            ...incoming.filter((n) => n.id == null || !existingIds.has(n.id)),
          ]
        : [
            ...incoming,
            ...existing.filter((n) => n.id == null || !incomingIds.has(n.id)),
          ];
      if (isLastPage !== undefined) {
        state.notifications[name].isLastPage = isLastPage;
      }
    },
    receiveUnreadNotifications: (state, action: PayloadAction<{
      name: string;
      unreadNotifications: Record<string, unknown>;
    }>) => {
      const { name, unreadNotifications } = action.payload;
      if (!state.notifications[name]) {
        state.notifications[name] = {
          name,
          notifications: [],
        };
      }
      // Stale-write guard: hivemind keeps serving the pre-setLastRead
      // lastread/unread pair for a while after the setLastRead custom_json
      // is accepted, so a poll snapshot predating the stored read marker
      // must not overwrite it (it would un-zero the badge right after the
      // user marked everything read). Snapshots at or past the marker —
      // e.g. new notifications bumping the count — are applied normally.
      //
      // The guard only holds while the marker is fresh: hivemind indexes
      // setLastRead within seconds, so if poll snapshots still predate the
      // marker after STALE_MARKER_GRACE_MS the op was most likely dropped
      // (rejected in a block, pruned) and will never be confirmed. Past the
      // window the guard yields so hivemind's (authoritative) snapshot can
      // heal the badge instead of pinning it at zero forever.
      const current = state.notifications[name].unreadNotifications;
      const currentMs = lastreadTimeMs(current?.lastread);
      if (
        current &&
        Date.now() - currentMs <= STALE_MARKER_GRACE_MS &&
        currentMs > lastreadTimeMs(unreadNotifications.lastread)
      ) {
        return;
      }
      state.notifications[name].unreadNotifications = unreadNotifications;
    },
    notificationsLoading: (state, action: PayloadAction<boolean>) => {
      state.notifications.loading = action.payload;
    },
    receiveAccount: (state, action: PayloadAction<{ account: AccountEntry }>) => {
      const { account } = action.payload;
      const accountName = account.name;
      if (!state.accounts[accountName]) {
        state.accounts[accountName] = account;
      } else {
        state.accounts[accountName] = {
          ...state.accounts[accountName],
          ...account,
        };
      }
    },
    receiveAccounts: (state, action: PayloadAction<{ accounts: AccountEntry[] }>) => {
      const { accounts } = action.payload;
      accounts.forEach((account) => {
        const accountName = account.name;
        if (!state.accounts[accountName]) {
          state.accounts[accountName] = account;
        } else {
          state.accounts[accountName] = {
            ...state.accounts[accountName],
            ...account,
          };
        }
      });
    },
    receivePostHeader: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.headers = {
        ...state.headers,
        ...action.payload,
      };
    },
    receiveCommunities: (state, action: PayloadAction<{ communities: Community[] }>) => {
      const { communities } = action.payload;
      const communityMap: Record<string, Community> = {};
      const communityIdx: string[] = [];

      communities.forEach((community) => {
        communityMap[community.name] = community;
        communityIdx.push(community.name);
      });

      state.community = communityMap;
      state.community_idx = communityIdx;
    },
    receiveCommunity: (state, action: PayloadAction<Community>) => {
      const community = action.payload;
      if (!state.community[community.name]) {
        state.community[community.name] = community;
      } else {
        state.community[community.name] = {
          ...state.community[community.name],
          ...community,
        };
      }
    },
    loadingSubscriptions: (state, action: PayloadAction<boolean>) => {
      state.subscriptions.loading = action.payload;
    },
    receiveSubscriptions: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.subscriptions = {
        ...state.subscriptions,
        ...action.payload,
      };
    },
    syncSpecialPosts: (state, action: PayloadAction<{
      featured_posts?: unknown[];
      promoted_posts?: unknown[];
    }>) => {
      state.special_posts = action.payload;
    },
    receiveContent: (state, action: PayloadAction<Post>) => {
      const content = action.payload;
      const key = postKey(content.author, content.permlink);
      if (key) {
        if (!state.content[key]) {
          state.content[key] = content;
        } else {
          state.content[key] = {
            ...state.content[key],
            ...content,
          };
        }
      }
    },
    linkReply: (state, action: PayloadAction<{
      parent_author: string;
      parent_permlink: string;
      author: string;
      permlink: string;
    }>) => {
      // Link reply to parent post
      const { parent_author, parent_permlink, author, permlink } = action.payload;
      const parentKey = postKey(parent_author, parent_permlink);
      const replyKey = postKey(author, permlink);

      if (parentKey && replyKey) {
        if (!state.content[parentKey]) {
          // Reply-key stub: a deliberately partial entry — linkReply only
          // needs the reply list; the wire fields arrive with the next
          // receiveContent. (Same stub the pre-convergence slice built.)
          state.content[parentKey] = {
            author: parent_author,
            permlink: parent_permlink,
            replies: [],
          } as unknown as ContentPost;
        }
        if (!state.content[parentKey].replies) {
          state.content[parentKey].replies = [];
        }
        if (!state.content[parentKey].replies!.includes(replyKey)) {
          state.content[parentKey].replies!.push(replyKey);
        }
      }
    },
    deleteContent: (state, action: PayloadAction<{ author: string; permlink: string }>) => {
      const key = postKey(action.payload.author, action.payload.permlink);
      if (key && state.content[key]) {
        delete state.content[key];
      }
    },
    voted: (state, action: PayloadAction<{
      author: string;
      permlink: string;
      voter: string;
      weight: number;
    }>) => {
      const { author, permlink, voter, weight } = action.payload;
      const key = postKey(author, permlink);
      if (key && state.content[key]) {
        // Update vote information
        if (!state.content[key].active_votes) {
          state.content[key].active_votes = [];
        }
        // Update or add vote
        const voteIndex = state.content[key].active_votes!.findIndex(
          (v: Vote) => v.voter === voter
        );
        if (voteIndex >= 0) {
          state.content[key].active_votes![voteIndex].weight = weight;
        } else {
          state.content[key].active_votes!.push({ voter, weight });
        }
      }
    },
    fetchingData: (state, action: PayloadAction<boolean>) => {
      // Set fetching state
      state.status.fetching = action.payload;
    },
    receiveData: (state, action: PayloadAction<Record<string, unknown>>) => {
      // Merge received data
      state.status = {
        ...state.status,
        ...action.payload,
      };
    },
    set: (state, action: PayloadAction<{ key: string | string[]; value: unknown }>) => {
      const { key, value } = action.payload;
      const keys = Array.isArray(key) ? key : [key];

      let current: Record<string, unknown> = state as Record<string, unknown>;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (typeof current[k] !== 'object' || current[k] === null) {
          current[k] = {};
        }
        current = current[k] as Record<string, unknown>;
      }
      current[keys[keys.length - 1]] = value;
    },
    remove: (state, action: PayloadAction<{ key: string | string[] }>) => {
      const { key } = action.payload;
      const keys = Array.isArray(key) ? key : [key];

      let current: Record<string, unknown> = state as Record<string, unknown>;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in current)) {
          return; // Path doesn't exist
        }
        current = current[k] as Record<string, unknown>;
      }
      delete current[keys[keys.length - 1]];
    },
    update: (state, action: PayloadAction<{ key: string | string[]; value: unknown }>) => {
      // Similar to set but for updates
      const { key, value } = action.payload;
      const keys = Array.isArray(key) ? key : [key];

      let current: Record<string, unknown> = state as Record<string, unknown>;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (typeof current[k] !== 'object' || current[k] === null) {
          current[k] = {};
        }
        current = current[k] as Record<string, unknown>;
      }
      const last = keys[keys.length - 1];
      if (typeof current[last] === 'object' && typeof value === 'object' && value !== null) {
        current[last] = {
          ...(current[last] as Record<string, unknown>),
          ...(value as Record<string, unknown>),
        };
      } else {
        current[last] = value;
      }
    },
    fetchJson: (state, action: PayloadAction<{ id: string }>) => {
      // Mark as fetching
      if (!state.fetchJson[action.payload.id]) {
        state.fetchJson[action.payload.id] = { loading: true };
      } else {
        state.fetchJson[action.payload.id].loading = true;
      }
    },
    fetchJsonResult: (state, action: PayloadAction<{ id: string; result?: unknown; error?: unknown }>) => {
      const { id, result, error } = action.payload;
      state.fetchJson[id] = {
        loading: false,
        result,
        error,
      };
    },
    showDialog: (state, action: PayloadAction<{ name: string; data?: unknown }>) => {
      const { name, data } = action.payload;
      state.dialogs[name] = {
        visible: true,
        data,
      };
    },
    hideDialog: (state, action: PayloadAction<{ name: string }>) => {
      const { name } = action.payload;
      if (state.dialogs[name]) {
        state.dialogs[name].visible = false;
      }
    },
    receiveRewards: (state, action: PayloadAction<unknown>) => {
      state.rewards = action.payload;
    },
    setDgp: (state, action: PayloadAction<unknown>) => {
      state.dgp = action.payload;
    },
    setVestsPerSteem: (state, action: PayloadAction<number>) => {
      state.vests_per_steem = action.payload;
    },
    setNotices: (state, action: PayloadAction<unknown>) => {
      state.notices = action.payload;
    },
    setTagslist: (state, action: PayloadAction<unknown[]>) => {
      state.tagslist = action.payload;
    },
    setFollowerslist: (state, action: PayloadAction<unknown[]>) => {
      state.followerslist = action.payload;
    },
    // Optimistic single-relationship update dispatched by the Follow
    // component around a follow custom_json broadcast. Chain data (and the
    // follow operation itself) carries `what` as an unordered membership
    // array, frequently with a single element (['blog'] or ['ignore']) —
    // positional reads (what[0]/what[1]) would misclassify those. Legacy
    // uses member semantics (TransactionSaga.js updateFollowState:
    // what.indexOf('blog') > -1); keep that here.
    updateFollowState: (state, action: PayloadAction<{
      follower: string;
      following: string;
      what: string[];
    }>) => {
      const { follower, following, what } = action.payload;

      // Initialize follow state structure if needed
      if (!state.follow) {
        state.follow = {};
      }
      if (!state.follow.getFollowingAsync) {
        state.follow.getFollowingAsync = {};
      }
      if (!state.follow.getFollowingAsync[follower]) {
        state.follow.getFollowingAsync[follower] = {
          blog_result: [],
          ignore_result: [],
          blog_count: 0,
          ignore_count: 0,
        };
      }

      const followData = state.follow.getFollowingAsync[follower];

      // Determine action based on what array (member semantics, see above)
      const hasBlog = what.includes('blog');
      const hasIgnore = what.includes('ignore');

      // Update blog_result
      if (!followData.blog_result) {
        followData.blog_result = [];
      }
      if (hasBlog && !followData.blog_result.includes(following)) {
        followData.blog_result.push(following);
      } else if (!hasBlog && followData.blog_result.includes(following)) {
        followData.blog_result = followData.blog_result.filter((u: string) => u !== following);
      }

      // Update ignore_result
      if (!followData.ignore_result) {
        followData.ignore_result = [];
      }
      if (hasIgnore && !followData.ignore_result.includes(following)) {
        followData.ignore_result.push(following);
      } else if (!hasIgnore && followData.ignore_result.includes(following)) {
        followData.ignore_result = followData.ignore_result.filter((u: string) => u !== following);
      }

      // Update counts
      followData.blog_count = followData.blog_result.length;
      followData.ignore_count = followData.ignore_result.length;
    },
    // Marks one follow list (blog or ignore) of one follower as loading.
    // Mirrors the `type + '_loading'` flag legacy FollowSaga sets while
    // loadFollowsLoop pages through the chain; Follow reads it to render a
    // loading state instead of a wrong default button.
    // NOT part of the deprecated read-cache skeleton above: this is live
    // interaction write-path state, kept current by loadFollowState (see
    // PR #4046 for the rationale).
    followListLoading: (state, action: PayloadAction<{
      follower: string;
      type: 'blog' | 'ignore';
      loading: boolean;
    }>) => {
      const { follower, type, loading } = action.payload;
      if (!state.follow) {
        state.follow = {};
      }
      if (!state.follow.getFollowingAsync) {
        state.follow.getFollowingAsync = {};
      }
      if (!state.follow.getFollowingAsync[follower]) {
        state.follow.getFollowingAsync[follower] = {};
      }
      state.follow.getFollowingAsync[follower][`${type}_loading`] = loading;
    },
    // Bulk initialization of one follow list (blog or ignore) from chain
    // data. This is the rewrite of legacy FollowSaga's final merge (the
    // `follow_inprogress` -> `follow.getFollowingAsync[account]` move that
    // sets `<type>_result`, `<type>_count` and clears `<type>_loading`),
    // dispatched by the loadFollowState thunk once paging completed.
    // NOT part of the deprecated read-cache skeleton above: this is live
    // interaction write-path state, kept current by loadFollowState (see
    // PR #4046 for the rationale).
    receiveFollowList: (state, action: PayloadAction<{
      follower: string;
      type: 'blog' | 'ignore';
      accounts: string[];
    }>) => {
      const { follower, type, accounts } = action.payload;
      if (!state.follow) {
        state.follow = {};
      }
      if (!state.follow.getFollowingAsync) {
        state.follow.getFollowingAsync = {};
      }
      if (!state.follow.getFollowingAsync[follower]) {
        state.follow.getFollowingAsync[follower] = {};
      }
      const followData = state.follow.getFollowingAsync[follower];
      followData[`${type}_result`] = accounts;
      followData[`${type}_count`] = accounts.length;
      followData[`${type}_loading`] = false;
    },
    // Clears all per-follower follow state. Dispatched by logoutThunk as
    // state hygiene: legacy LOGOUT never cleared global.follow (it was
    // keyed by username and thus inert until the same user returned), but
    // the rewrite drops it so a subsequent visitor on the same tab cannot
    // read the previous user's following/ignoring sets.
    resetFollowState: (state) => {
      state.follow = undefined;
    },
  },
});

export const {
  setCollapsed,
  receiveState,
  receiveNotifications,
  receiveUnreadNotifications,
  notificationsLoading,
  receiveAccount,
  receiveAccounts,
  receivePostHeader,
  receiveCommunities,
  receiveCommunity,
  loadingSubscriptions,
  receiveSubscriptions,
  syncSpecialPosts,
  receiveContent,
  linkReply,
  deleteContent,
  voted,
  fetchingData,
  receiveData,
  set,
  remove,
  update,
  fetchJson,
  fetchJsonResult,
  showDialog,
  hideDialog,
  receiveRewards,
  setDgp,
  setVestsPerSteem,
  setNotices,
  setTagslist,
  setFollowerslist,
  updateFollowState,
  followListLoading,
  receiveFollowList,
  resetFollowState,
} = globalSlice.actions;

export default globalSlice.reducer;
