/**
 * Authentication thunks
 * Async actions for user authentication
 * Replaces legacy Redux-Saga logic
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { getAccount, checkAuthority, serverApiLogin } from '@/lib/api/auth';
import { setUser, loginError, setAuthority, logout } from '../slices/userSlice';
import { clearStoredKey } from '@/lib/crypto/key-storage';
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


      // The actual authentication is now handled in the LoginForm component
      // This thunk is mainly for updating Redux state after successful login
      
      // Save login preference if requested
      if (saveLogin) {
        if (typeof window !== 'undefined') {
          const loginData = {
            username: finalUsername,
            timestamp: Date.now(),
            // Never store actual keys in localStorage
          };
          localStorage.setItem('autopost2', JSON.stringify(loginData));
        }
      }

      // Set user in Redux store (minimal info, session is managed server-side)
      dispatch(
        setUser({
          username: finalUsername,
          posting_authority: true, // Only posting keys are allowed
          pass_auth: true,
        })
      );

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
    // Clear encrypted private key from sessionStorage and memory
    clearStoredKey();

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('autopost2');
    }

    // Dispatch logout action
    dispatch(logout());

    // Call server API logout to clear server-side session
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Don't fail logout if server call fails
      console.error('Server logout error:', error);
    }
  }
);

