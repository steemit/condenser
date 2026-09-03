import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Vote {
  voter: string;
  weight: number;
  rshares?: string;
  percent?: number;
  time?: string;
  [key: string]: unknown;
}

export interface Post {
  author: string;
  permlink: string;
  collapsed?: boolean;
  replies?: string[];
  active_votes?: Vote[];
  [key: string]: unknown;
}

export interface Account {
  name: string;
  witness_votes?: Set<string>;
  [key: string]: unknown;
}

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

interface GlobalState {
  status: Record<string, unknown>;
  content: Record<string, Post>;
  accounts: Record<string, Account>;
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
  pathname?: string;
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
        state.content[post] = {} as Post;
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
    receiveNotifications: (state, action: PayloadAction<{
      name: string;
      notifications: NotificationItem[];
      isLastPage?: boolean;
    }>) => {
      const { name, notifications, isLastPage } = action.payload;
      if (!state.notifications[name]) {
        state.notifications[name] = {
          name,
          notifications: [],
        };
      }
      state.notifications[name].notifications = [
        ...(state.notifications[name].notifications || []),
        ...notifications,
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
      state.notifications[name].unreadNotifications = unreadNotifications;
    },
    notificationsLoading: (state, action: PayloadAction<boolean>) => {
      state.notifications.loading = action.payload;
    },
    receiveAccount: (state, action: PayloadAction<{ account: Account }>) => {
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
    receiveAccounts: (state, action: PayloadAction<{ accounts: Account[] }>) => {
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
          state.content[parentKey] = {
            author: parent_author,
            permlink: parent_permlink,
            replies: [],
          } as Post;
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

      // Determine action based on what array
      const hasBlog = what[0] === 'blog';
      const hasIgnore = what[1] === 'ignore';

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
    setPathname: (state, action: PayloadAction<string>) => {
      state.pathname = action.payload;
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
  setPathname,
} = globalSlice.actions;

export default globalSlice.reducer;
