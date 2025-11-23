/**
 * Authentication thunks
 * Async actions for user authentication
 * Replaces legacy Redux-Saga logic
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { getAccount, checkAuthority, serverApiLogin } from '@/lib/api/auth';
import { setUser, loginError, setAuthority, logout } from '../slices/userSlice';
import type { AppDispatch, RootState } from '../index';

export interface LoginPayload {
  username: string;
  password: string;
  useKeychain?: boolean;
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
      useKeychain = false,
      saveLogin = false,
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

      // Handle Steem Keychain login
      if (useKeychain) {
        // TODO: Implement Steem Keychain integration
        dispatch(
          setUser({
            username: finalUsername,
            login_with_keychain: true,
          })
        );
        return;
      }

      // Check authority via server API (handles key derivation and authority checking)
      const authResult = await checkAuthority({
        username: finalUsername,
        password,
        role: userProvidedRole,
      });

      if (!authResult || !authResult.account) {
        const error = 'Username does not exist or invalid credentials';
        dispatch(loginError({ error }));
        return rejectWithValue(error);
      }

      const { auth, account } = authResult;

      // Block active/owner login for security
      if (auth.active === 'full') {
        const error = 'active_login_blocked';
        dispatch(loginError({ error }));
        return rejectWithValue(error);
      }

      if (auth.owner === 'full') {
        const error = 'owner_login_blocked';
        dispatch(loginError({ error }));
        return rejectWithValue(error);
      }

      // Check if we have at least posting authority
      if (auth.posting === 'none') {
        const error = 'Invalid password or key. Posting authority required.';
        dispatch(loginError({ error }));
        return rejectWithValue(error);
      }

      // Store minimal private key info (server handles the actual keys)
      // Only store a flag that we're logged in, actual keys stay on server
      const storedKeys: any = {
        // Don't store actual private keys in client
        // They should be handled server-side or via secure storage
        has_posting: auth.posting !== 'none',
        has_memo: auth.memo !== 'none',
      };

      // Save login if requested (only for low-security keys)
      if (saveLogin && auth.posting === 'full') {
        // TODO: Save to localStorage securely
        // Only save posting key, never active or owner
        // For now, we'll just save a flag
        if (typeof window !== 'undefined') {
          const loginData = {
            username: finalUsername,
            timestamp: Date.now(),
            // Never store actual keys in localStorage
          };
          localStorage.setItem('autopost2', JSON.stringify(loginData));
        }
      }

      // Server API login (optional, for server-side session)
      try {
        const signatures: Record<string, string> = {};
        // TODO: Generate signatures for server authentication
        // const response = await serverApiLogin(finalUsername, signatures);
        // const body = await response.json();
        // if (body.status === 'ok') {
        //   // Server login successful
        // }
      } catch (error) {
        // Server login is optional, don't fail if it errors
        console.error('Server login error:', error);
      }

      // Set user in Redux store
      dispatch(
        setUser({
          username: finalUsername,
          private_keys: storedKeys,
          pass_auth: true,
        })
      );

      // Set authority information
      dispatch(
        setAuthority({
          accountName: finalUsername,
          auth,
          pub_keys_used: [], // Will be populated by server if needed
        })
      );
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Login failed. Please try again.';
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
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('autopost2');
    }

    // Dispatch logout action
    dispatch(logout());

    // TODO: Call server API logout if needed
    // await serverApiLogout();
  }
);

