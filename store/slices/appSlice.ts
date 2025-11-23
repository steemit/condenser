import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface UserPreferences {
  locale: string | null;
  nsfwPref: string;
  nightmode: boolean;
  blogmode: boolean;
  currency: string;
  defaultBlogPayout: string;
  defaultCommentPayout: string;
  selectedRpc: string;
}

export interface Notification {
  key: string;
  action?: string;
  dismissAfter?: number;
  [key: string]: any;
}

interface AppState {
  loading: boolean;
  error: string;
  location: {
    pathname?: string;
  };
  notifications: Record<string, Notification> | null;
  user_preferences: UserPreferences;
  featureFlags: Record<string, any>;
  modalLoading: boolean;
  routeTag: any;
  frontend_has_rendered?: boolean;
}

const initialState: AppState = {
  loading: false,
  error: '',
  location: {},
  notifications: null,
  user_preferences: {
    locale: null,
    nsfwPref: 'warn',
    nightmode: false,
    blogmode: false,
    currency: 'USD',
    defaultBlogPayout: '50%',
    defaultCommentPayout: '50%',
    selectedRpc: '',
  },
  featureFlags: {},
  modalLoading: false,
  routeTag: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLocation: (state, action: PayloadAction<{ pathname: string }>) => {
      state.location = action.payload;
    },
    steemApiError: (state, action: PayloadAction<any>) => {
      // Log error but don't update state as per original implementation
      console.error('SteemApiError', action.payload);
    },
    fetchDataBegin: (state) => {
      state.loading = true;
    },
    fetchDataEnd: (state) => {
      state.loading = false;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      const notification: Notification = {
        action: 'Dismiss',
        dismissAfter: 10000,
        ...action.payload,
      };
      
      if (!state.notifications) {
        state.notifications = {};
      }
      state.notifications[notification.key] = notification;
    },
    removeNotification: (state, action: PayloadAction<{ key: string }>) => {
      if (state.notifications) {
        delete state.notifications[action.payload.key];
      }
    },
    setUserPreferences: (state, action: PayloadAction<UserPreferences>) => {
      state.user_preferences = action.payload;
    },
    toggleNightmode: (state) => {
      state.user_preferences.nightmode = !state.user_preferences.nightmode;
    },
    toggleBlogmode: (state) => {
      state.user_preferences.blogmode = !state.user_preferences.blogmode;
    },
    receiveFeatureFlags: (state, action: PayloadAction<Record<string, any>>) => {
      state.featureFlags = {
        ...state.featureFlags,
        ...action.payload,
      };
    },
    modalLoadingBegin: (state) => {
      state.modalLoading = true;
    },
    modalLoadingEnd: (state) => {
      state.modalLoading = false;
    },
    setFeRendered: (state) => {
      state.frontend_has_rendered = true;
    },
    setRouteTag: (state, action: PayloadAction<any>) => {
      state.routeTag = action.payload;
    },
  },
});

export const {
  setLocation,
  steemApiError,
  fetchDataBegin,
  fetchDataEnd,
  addNotification,
  removeNotification,
  setUserPreferences,
  toggleNightmode,
  toggleBlogmode,
  receiveFeatureFlags,
  modalLoadingBegin,
  modalLoadingEnd,
  setFeRendered,
  setRouteTag,
} = appSlice.actions;

export default appSlice.reducer;

