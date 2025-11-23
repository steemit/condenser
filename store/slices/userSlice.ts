import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface User {
  username?: string;
  private_keys?: {
    active_private?: string;
    posting_private?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface UserState {
  current: User;
  show_login_modal: boolean;
  show_login_warning: boolean;
  login_type?: string;
  loginBroadcastOperation?: any;
  loginDefault?: any;
  login_error?: string;
  show_terms_modal?: boolean;
  termsDefault?: any;
  saveLoginConfirm?: any;
  pub_keys_used: string[] | null;
  locale: string;
  show_side_panel: boolean;
  maybeLoggedIn: boolean;
  showAnnouncement: boolean;
  trackingId: string;
  show_promote_post_modal: boolean;
  show_post_advanced_settings_modal: string;
  show_post_drafts_modal: string;
  on_post_drafts_close_modal: (() => void) | null;
  clear_draft_modal: (() => void) | null;
  show_post_templates_modal: string;
  on_post_templates_close_modal: (() => void) | null;
  logged_out?: boolean;
  keys_error?: string;
  authority: Record<string, any>;
  hide_connection_error_modal: boolean;
  show_image_viewer: boolean;
  image_viewer_url: string;
}

const generateTrackingId = () =>
  `x-${Math.random().toString().slice(2)}`;

const initialState: UserState = {
  current: {},
  show_login_modal: false,
  show_login_warning: false,
  show_terms_modal: false,
  pub_keys_used: null,
  locale: 'en', // DEFAULT_LANGUAGE
  show_side_panel: false,
  maybeLoggedIn: false,
  showAnnouncement: false,
  trackingId: '',
  show_promote_post_modal: false,
  show_post_advanced_settings_modal: '',
  show_post_drafts_modal: '',
  on_post_drafts_close_modal: null,
  clear_draft_modal: null,
  show_post_templates_modal: '',
  on_post_templates_close_modal: null,
  authority: {},
  hide_connection_error_modal: false,
  show_image_viewer: false,
  image_viewer_url: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    showLogin: (state, action: PayloadAction<{
      operation?: any;
      loginDefault?: any;
      type?: string;
    } | undefined>) => {
      const payload = action.payload;
      let operation, loginDefault, login_type;
      if (payload) {
        operation = payload.operation;
        loginDefault = payload.loginDefault;
        login_type = payload.type;
      }
      state.login_error = undefined;
      state.show_login_modal = true;
      state.login_type = login_type;
      state.loginBroadcastOperation = operation;
      state.loginDefault = loginDefault;
    },
    showLoginWarning: (state) => {
      state.show_login_warning = true;
    },
    hideLogin: (state) => {
      state.show_login_modal = false;
      state.loginBroadcastOperation = undefined;
      state.loginDefault = undefined;
    },
    hideLoginWarning: (state) => {
      state.show_login_warning = false;
    },
    showTerms: (state, action: PayloadAction<{ termsDefault?: any } | undefined>) => {
      const payload = action.payload;
      let termsDefault;
      if (payload) {
        termsDefault = payload.termsDefault;
      }
      state.show_terms_modal = true;
      state.termsDefault = termsDefault;
    },
    acceptTerms: (state) => {
      state.show_terms_modal = false;
      state.termsDefault = undefined;
    },
    saveLoginConfirm: (state, action: PayloadAction<any>) => {
      state.saveLoginConfirm = action.payload;
    },
    saveLogin: (state) => {
      // Use only for low security keys (like posting only keys)
      // No state change needed
    },
    removeHighSecurityKeys: (state) => {
      if (!state.current.private_keys) return;
      
      const privateKeys = { ...state.current.private_keys };
      if (privateKeys.active_private) {
        console.log('removeHighSecurityKeys');
        delete privateKeys.active_private;
      }
      
      const isEmpty = Object.keys(privateKeys).length === 0;
      
      if (isEmpty) {
        // LOGOUT - reset to initial state with logged_out flag
        return {
          ...initialState,
          logged_out: true,
        };
      }
      
      state.current.private_keys = privateKeys;
      const username = state.current.username;
      if (username) {
        if (!state.authority[username]) {
          state.authority[username] = {};
        }
        state.authority[username].active = 'none';
        state.authority[username].owner = 'none';
      }
    },
    changeLanguage: (state, action: PayloadAction<string>) => {
      state.locale = action.payload;
    },
    showPromotePost: (state) => {
      state.show_promote_post_modal = true;
    },
    hidePromotePost: (state) => {
      state.show_promote_post_modal = false;
    },
    checkKeyType: (state) => {
      // Saga handles this, no state change
    },
    usernamePasswordLogin: (state) => {
      state.trackingId = generateTrackingId();
      // Saga handles the rest
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.current = { ...state.current, ...action.payload };
      state.show_login_modal = false;
      state.show_login_warning = false;
      state.loginBroadcastOperation = undefined;
      state.loginDefault = undefined;
      state.logged_out = undefined;
    },
    closeLogin: (state) => {
      state.login_error = undefined;
      state.show_login_modal = false;
      state.loginBroadcastOperation = undefined;
      state.loginDefault = undefined;
    },
    loginError: (state, action: PayloadAction<{ error: string }>) => {
      state.login_error = action.payload.error;
      state.logged_out = undefined;
    },
    logout: (state) => {
      return {
        ...initialState,
        logged_out: true,
      };
    },
    keysError: (state, action: PayloadAction<{ error: string }>) => {
      state.keys_error = action.payload.error;
    },
    accountAuthLookup: (state) => {
      // AuthSaga handles this
    },
    setAuthority: (state, action: PayloadAction<{
      accountName: string;
      auth: any;
      pub_keys_used?: string[];
    }>) => {
      const { accountName, auth, pub_keys_used } = action.payload;
      state.authority[accountName] = auth;
      if (pub_keys_used) {
        state.pub_keys_used = pub_keys_used;
      }
    },
    hideConnectionErrorModal: (state) => {
      state.hide_connection_error_modal = true;
    },
    set: (state, action: PayloadAction<{ key: string | string[]; value: any }>) => {
      const { key, value } = action.payload;
      const keys = Array.isArray(key) ? key : [key];
      
      // Deep set using keys array
      let current: any = state;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in current)) {
          current[k] = {};
        }
        current = current[k];
      }
      current[keys[keys.length - 1]] = value;
    },
    showSidePanel: (state) => {
      state.show_side_panel = true;
    },
    hideSidePanel: (state) => {
      state.show_side_panel = false;
    },
    showPostAdvancedSettings: (state, action: PayloadAction<{ formId: string }>) => {
      state.show_post_advanced_settings_modal = action.payload.formId;
    },
    hidePostAdvancedSettings: (state) => {
      state.show_post_advanced_settings_modal = '';
    },
    showPostDrafts: (state, action: PayloadAction<{
      formId: string;
      onDraftsClose?: () => void;
      clearDraft?: () => void;
    }>) => {
      state.show_post_drafts_modal = action.payload.formId;
      state.on_post_drafts_close_modal = action.payload.onDraftsClose || null;
      state.clear_draft_modal = action.payload.clearDraft || null;
    },
    hidePostDrafts: (state) => {
      state.show_post_drafts_modal = '';
      state.on_post_drafts_close_modal = null;
      state.clear_draft_modal = null;
    },
    showPostTemplates: (state, action: PayloadAction<{
      formId: string;
      onTemplatesClose?: () => void;
    }>) => {
      state.show_post_templates_modal = action.payload.formId;
      state.on_post_templates_close_modal = action.payload.onTemplatesClose || null;
    },
    hidePostTemplates: (state) => {
      state.show_post_templates_modal = '';
      state.on_post_templates_close_modal = null;
    },
    showAnnouncement: (state) => {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('hideAnnouncement', 'false');
      }
      state.showAnnouncement = true;
    },
    hideAnnouncement: (state) => {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('hideAnnouncement', 'true');
      }
      state.showAnnouncement = false;
    },
    showImageViewer: (state, action: PayloadAction<{ url: string }>) => {
      state.show_image_viewer = true;
      state.image_viewer_url = action.payload.url;
    },
    hideImageViewer: (state) => {
      state.show_image_viewer = false;
      state.image_viewer_url = '';
    },
  },
});

export const {
  showLogin,
  showLoginWarning,
  hideLogin,
  hideLoginWarning,
  showTerms,
  acceptTerms,
  saveLoginConfirm,
  saveLogin,
  removeHighSecurityKeys,
  changeLanguage,
  showPromotePost,
  hidePromotePost,
  checkKeyType,
  usernamePasswordLogin,
  setUser,
  closeLogin,
  loginError,
  logout,
  keysError,
  accountAuthLookup,
  setAuthority,
  hideConnectionErrorModal,
  set,
  showSidePanel,
  hideSidePanel,
  showPostAdvancedSettings,
  hidePostAdvancedSettings,
  showPostDrafts,
  hidePostDrafts,
  showPostTemplates,
  hidePostTemplates,
  showAnnouncement,
  hideAnnouncement,
  showImageViewer,
  hideImageViewer,
} = userSlice.actions;

export default userSlice.reducer;
