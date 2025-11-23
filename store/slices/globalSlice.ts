import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Post {
  author: string;
  permlink: string;
  collapsed?: boolean;
  [key: string]: any;
}

export interface Account {
  name: string;
  witness_votes?: Set<string>;
  [key: string]: any;
}

export interface Notification {
  name: string;
  notifications: any[];
  isLastPage?: boolean;
  unreadNotifications?: Record<string, any>;
}

export interface Community {
  name: string;
  [key: string]: any;
}

interface GlobalState {
  status: Record<string, any>;
  content: Record<string, Post>;
  accounts: Record<string, Account>;
  headers: Record<string, any>;
  notifications: Record<string, Notification> & {
    loading?: boolean;
  };
  community: Record<string, Community>;
  community_idx: string[];
  subscriptions: {
    loading?: boolean;
    [key: string]: any;
  };
  special_posts?: {
    featured_posts?: any[];
    promoted_posts?: any[];
  };
  fetchJson: Record<string, any>;
  dialogs: Record<string, any>;
  rewards?: any;
  dgp?: any;
  vests_per_steem?: number;
  notices?: any;
  tagslist?: any[];
  followerslist?: any[];
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
    [key: string]: any;
  };
  [key: string]: any;
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
    setCollapsed: (state, action: PayloadAction<{ post: string; collapsed: boolean }>) => {
      const { post, collapsed } = action.payload;
      if (!state.content[post]) {
        state.content[post] = {} as Post;
      }
      state.content[post].collapsed = collapsed;
    },
    receiveState: (state, action: PayloadAction<any>) => {
      // Deep merge payload into state
      const payload = action.payload;
      Object.keys(payload).forEach((key) => {
        if (typeof payload[key] === 'object' && payload[key] !== null && !Array.isArray(payload[key])) {
          state[key] = { ...state[key], ...payload[key] };
        } else {
          state[key] = payload[key];
        }
      });
    },
    receiveNotifications: (state, action: PayloadAction<{
      name: string;
      notifications: any[];
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
      unreadNotifications: Record<string, any>;
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
    receivePostHeader: (state, action: PayloadAction<Record<string, any>>) => {
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
    receiveSubscriptions: (state, action: PayloadAction<any>) => {
      state.subscriptions = {
        ...state.subscriptions,
        ...action.payload,
      };
    },
    syncSpecialPosts: (state, action: PayloadAction<{
      featured_posts?: any[];
      promoted_posts?: any[];
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
          (v: any) => v.voter === voter
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
    receiveData: (state, action: PayloadAction<any>) => {
      // Merge received data
      state.status = {
        ...state.status,
        ...action.payload,
      };
    },
    set: (state, action: PayloadAction<{ key: string | string[]; value: any }>) => {
      const { key, value } = action.payload;
      const keys = Array.isArray(key) ? key : [key];
      
      let current: any = state;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in current) || typeof current[k] !== 'object') {
          current[k] = {};
        }
        current = current[k];
      }
      current[keys[keys.length - 1]] = value;
    },
    remove: (state, action: PayloadAction<{ key: string | string[] }>) => {
      const { key } = action.payload;
      const keys = Array.isArray(key) ? key : [key];
      
      let current: any = state;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in current)) {
          return; // Path doesn't exist
        }
        current = current[k];
      }
      delete current[keys[keys.length - 1]];
    },
    update: (state, action: PayloadAction<{ key: string | string[]; value: any }>) => {
      // Similar to set but for updates
      const { key, value } = action.payload;
      const keys = Array.isArray(key) ? key : [key];
      
      let current: any = state;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in current) || typeof current[k] !== 'object') {
          current[k] = {};
        }
        current = current[k];
      }
      if (typeof current[keys[keys.length - 1]] === 'object' && typeof value === 'object') {
        current[keys[keys.length - 1]] = {
          ...current[keys[keys.length - 1]],
          ...value,
        };
      } else {
        current[keys[keys.length - 1]] = value;
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
    fetchJsonResult: (state, action: PayloadAction<{ id: string; result?: any; error?: any }>) => {
      const { id, result, error } = action.payload;
      state.fetchJson[id] = {
        loading: false,
        result,
        error,
      };
    },
    showDialog: (state, action: PayloadAction<{ name: string; data?: any }>) => {
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
    receiveRewards: (state, action: PayloadAction<any>) => {
      state.rewards = action.payload;
    },
    setDgp: (state, action: PayloadAction<any>) => {
      state.dgp = action.payload;
    },
    setVestsPerSteem: (state, action: PayloadAction<number>) => {
      state.vests_per_steem = action.payload;
    },
    setNotices: (state, action: PayloadAction<any>) => {
      state.notices = action.payload;
    },
    setTagslist: (state, action: PayloadAction<any[]>) => {
      state.tagslist = action.payload;
    },
    setFollowerslist: (state, action: PayloadAction<any[]>) => {
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
