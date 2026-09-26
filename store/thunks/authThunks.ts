/**
 * Authentication thunks
 * Async actions for user authentication
 * Replaces legacy Redux-Saga logic
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { setUser, loginError, setAuthority, logout, setTrackingId, generateTrackingId } from '../slices/userSlice';
import { resetFollowState } from '../slices/globalSlice';
import { loadFollowState } from './followThunks';
import { clearStoredKey } from '@/lib/crypto/key-storage';
import { postJsonWithCsrf } from '@/lib/api/csrf';
import type { AppDispatch, RootState } from '../index';

export interface LoginPayload {
  username: string;
  password: string;
  saveLogin?: boolean;
  operationType?: string;
  afterLoginRedirectToWelcome?: boolean;
}

/**
 * Login thunk
 * Handles the complete login flow
 */
export const loginThunk = createAsyncThunk<
  void,
  LoginPayload,
  { dispatch: AppDispatch; state: RootState }
>(
  'auth/login',
  async (payload, { dispatch, rejectWithValue }) => {
    const {
      username,
      password,
      operationType,
    } = payload;

    try {
      // Normalize username
      let finalUsername = username.toLowerCase().replace(/^@/, '');
      let userProvidedRole: string | undefined = operationType;

      // Check for role specification (e.g., "alice/active")
      if (finalUsername.includes('/')) {
        [finalUsername, userProvidedRole] = finalUsername.split('/');
      }


      // The actual authentication is now handled in the LoginForm component
      // This thunk is mainly for updating Redux state after successful login

      // Set user in Redux store (minimal info, session is managed server-side)
      dispatch(
        setUser({
          username: finalUsername,
          posting_authority: true, // Only posting keys are allowed
          pass_auth: true,
        })
      );

      // Legacy parity (usernamePasswordLogin): login regenerates the
      // tracking id used by overseer analytics.
      dispatch(setTrackingId(generateTrackingId()));

      // Set authority information (posting only)
      dispatch(
        setAuthority({
          accountName: finalUsername,
          auth: {
            posting: 'full',
            active: 'none', // Blocked for security
            owner: 'none',  // Blocked for security
            memo: 'none',   // Not implemented yet
          },
          pub_keys_used: [],
        })
      );

      // Legacy parity (UserSaga usernamePasswordLogin): after login the
      // user's following/ignoring sets are loaded into global follow state
      // so Follow/Mute buttons start from chain state.
      dispatch(loadFollowState(finalUsername));
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed. Please try again.';
      dispatch(loginError({ error: errorMessage }));
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Logout thunk
 */
export const logoutThunk = createAsyncThunk<void, void, { dispatch: AppDispatch }>(
  'auth/logout',
  async (_, { dispatch }) => {
    // Clear the persisted posting key (localStorage + memory cache)
    clearStoredKey();

    // Clean up the legacy key written by older versions of condenser
    if (typeof window !== 'undefined') {
      localStorage.removeItem('autopost2');
    }

    // Dispatch logout action
    dispatch(logout());

    // State hygiene beyond legacy: LOGOUT never cleared global.follow (it
    // is keyed by username and was inert until the same user returned), but
    // the rewrite drops it so a subsequent visitor on the same tab cannot
    // read the previous user's following/ignoring sets.
    dispatch(resetFollowState());

    // Call server API logout to clear server-side session. The POST echoes
    // the CSRF token (audit N-22); postJsonWithCsrf refreshes the session
    // and retries once if the token was missing/stale (pre-rollout session).
    try {
      await postJsonWithCsrf('/api/auth/logout');
    } catch (error) {
      // Don't fail logout if server call fails
      console.error('Server logout error:', error);
    }
  }
);

