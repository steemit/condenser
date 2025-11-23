import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
interface CommunityRole {
  account: string;
  role: string;
}

interface CommunityState {
  [community: string]: {
    listSubscribersPending?: boolean;
    listSubscribersError?: any;
    subscribers?: any[];
    listRolesPending?: boolean;
    listRolesError?: any;
    roles?: CommunityRole[];
    updatePending?: boolean;
  };
}

const initialState: CommunityState = {};

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    // Saga watcher - no state change
    getCommunitySubscribers: (state, action: PayloadAction<{ community: string }>) => {
      // Saga handles this
    },
    getCommunitySubscribersPending: (state, action: PayloadAction<{
      community: string;
      pending: boolean;
    }>) => {
      const { community, pending } = action.payload;
      if (!state[community]) {
        state[community] = {};
      }
      state[community].listSubscribersPending = pending;
    },
    getCommunitySubscribersError: (state, action: PayloadAction<{
      community: string;
      error: any;
    }>) => {
      const { community, error } = action.payload;
      if (!state[community]) {
        state[community] = {};
      }
      state[community].listSubscribersError = error;
    },
    setCommunitySubscribers: (state, action: PayloadAction<{
      community: string;
      subscribers: any[];
    }>) => {
      const { community, subscribers } = action.payload;
      if (!state[community]) {
        state[community] = {};
      }
      state[community].subscribers = subscribers;
    },
    // Saga watcher - no state change
    getCommunityRoles: (state, action: PayloadAction<{ community: string }>) => {
      // Saga handles this
    },
    getCommunityRolesPending: (state, action: PayloadAction<{
      community: string;
      pending: boolean;
    }>) => {
      const { community, pending } = action.payload;
      if (!state[community]) {
        state[community] = {};
      }
      state[community].listRolesPending = pending;
    },
    getCommunityRolesError: (state, action: PayloadAction<{
      community: string;
      error: any;
    }>) => {
      const { community, error } = action.payload;
      if (!state[community]) {
        state[community] = {};
      }
      state[community].listRolesError = error;
    },
    setCommunityRoles: (state, action: PayloadAction<{
      community: string;
      roles: CommunityRole[];
    }>) => {
      const { community, roles } = action.payload;
      if (!state[community]) {
        state[community] = {};
      }
      state[community].roles = roles;
    },
    setUserRolePending: (state, action: PayloadAction<{
      community: string;
      pending: boolean;
    }>) => {
      const { community, pending } = action.payload;
      if (!state[community]) {
        state[community] = {};
      }
      state[community].updatePending = pending;
    },
    applyUserRole: (state, action: PayloadAction<{
      community: string;
      account: string;
      role: string;
    }>) => {
      const { community, account, role } = action.payload;
      if (!state[community]) {
        state[community] = {};
      }
      if (!state[community].roles) {
        state[community].roles = [];
      }
      
      const index = state[community].roles!.findIndex((r) => r.account === account);
      if (index === -1) {
        state[community].roles!.push({ account, role });
      } else {
        state[community].roles![index] = { account, role };
      }
    },
  },
});

export const {
  getCommunitySubscribers,
  getCommunitySubscribersPending,
  getCommunitySubscribersError,
  setCommunitySubscribers,
  getCommunityRoles,
  getCommunityRolesPending,
  getCommunityRolesError,
  setCommunityRoles,
  setUserRolePending,
  applyUserRole,
} = communitySlice.actions;

export default communitySlice.reducer;
