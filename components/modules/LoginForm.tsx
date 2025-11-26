'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { hideLogin, loginError } from '@/store/slices/userSlice';
import { loginThunk } from '@/store/thunks/authThunks';

/**
 * LoginForm component
 * Handles user authentication and login
 * Migrated from legacy/src/app/components/modules/LoginForm.jsx
 * TODO: Implement full SteemKeychain support
 * TODO: Implement password validation and checksum checking
 * TODO: Implement account name validation
 */
export default function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { login_error, show_login_modal } = useAppSelector((state) => state.user);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [saveLogin, setSaveLogin] = useState(true);
  const [useKeychain, setUseKeychain] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved login preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('saveLogin');
      setSaveLogin(saved !== 'no');
    }
  }, []);

  // Clear error when form changes
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [username, password]);

  // Display Redux login error
  useEffect(() => {
    if (login_error) {
      setError(login_error);
    }
  }, [login_error]);

  const validateForm = (): string | null => {
    if (!username.trim()) {
      return 'Username is required';
    }

    // Basic username validation (lowercase, alphanumeric, dots, hyphens)
    const usernameRegex = /^[a-z0-9.-]+$/;
    if (!usernameRegex.test(username.toLowerCase())) {
      return 'Invalid username format';
    }

    if (!useKeychain && !password.trim()) {
      return 'Password is required';
    }

    // Check if password is a public key (should not be)
    if (password.trim()) {
      try {
        // This would throw if it's not a valid public key format
        // For now, we'll do a basic check
        if (password.startsWith('STM') && password.length > 50) {
          return 'You need a private password or key, not a public key';
        }
      } catch (e) {
        // Not a public key, which is good
      }
    }

    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Normalize username (lowercase, remove @ prefix if present)
      const normalizedUsername = username.toLowerCase().replace(/^@/, '');

      // Check for role specification (e.g., "alice/active")
      let userProvidedRole: string | undefined;
      let finalUsername = normalizedUsername;
      if (normalizedUsername.includes('/')) {
        [finalUsername, userProvidedRole] = normalizedUsername.split('/');
      }

      // Dispatch login thunk
      const result = await dispatch(
        loginThunk({
          username: finalUsername,
          password,
          useKeychain,
          saveLogin,
          operationType: userProvidedRole,
        })
      );

      // Check if login was successful
      if (loginThunk.fulfilled.match(result)) {
        // Login successful, redirect will happen via useEffect
        router.push('/trending');
      } else {
        // Login failed, error is already set in Redux state
        const errorMessage = result.payload as string || 'Login failed. Please try again.';
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
      dispatch(loginError({ error: err.message || 'Login failed' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    dispatch(hideLogin());
    router.push('/trending');
  };

  const handleSignup = () => {
    // TODO: Open signup URL in new window
    // Safe access to process.env for UMD compatibility
    const signupUrl = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SIGNUP_URL) 
      ? process.env.NEXT_PUBLIC_SIGNUP_URL 
      : 'https://signup.steemit.com';
    window.open(signupUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="LoginForm">
      <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username input */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              @
            </span>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="Enter your username"
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              autoComplete="username"
              disabled={submitting}
              required
            />
          </div>
        </div>

        {/* Password input or Keychain option */}
        {useKeychain ? (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              You will be prompted to authorize via Steem Keychain
            </p>
          </div>
        ) : (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password or Private Key
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password or private key"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              autoComplete="current-password"
              disabled={submitting}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Use your master password or a private posting key
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Keychain option */}
        {typeof window !== 'undefined' && (window as any).steem_keychain && (
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useKeychain}
                onChange={(e) => setUseKeychain(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={submitting}
              />
              <span className="ml-2 text-sm text-gray-700">Use Steem Keychain</span>
            </label>
          </div>
        )}

        {/* Save login option */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={saveLogin}
              onChange={(e) => {
                setSaveLogin(e.target.checked);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('saveLogin', e.target.checked ? 'yes' : 'no');
                }
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={submitting}
            />
            <span className="ml-2 text-sm text-gray-700">Keep me logged in</span>
          </label>
          <p className="mt-1 text-xs text-gray-500 ml-6">
            Only for low-security keys (like posting keys). Never save owner or active keys.
          </p>
        </div>

        {/* Submit button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Logging in...' : 'Login'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={submitting}
          >
            Cancel
          </button>
        </div>

        {/* Sign up link */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Not a Steemit user?</p>
          <button
            type="button"
            onClick={handleSignup}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Sign up for free and get STEEM
          </button>
        </div>
      </form>
    </div>
  );
}

