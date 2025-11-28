'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { hideLogin, loginError } from '@/store/slices/userSlice';
import { loginThunk } from '@/store/thunks/authThunks';
import { 
  validatePostingKey, 
  signAuthData, 
  isWifFormat,
  isPublicKeyFormat 
} from '@/lib/crypto/client';
import { encryptAndStoreKey, initializeKeyLifecycle } from '@/lib/crypto/key-storage';

/**
 * LoginForm component
 * Handles user authentication and login
 * Migrated from legacy/src/app/components/modules/LoginForm.jsx
 * Note: Steem Keychain support has been removed as per project requirements
 * TODO: Implement password validation and checksum checking
 * TODO: Implement account name validation
 */
export default function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { login_error } = useAppSelector((state) => state.user);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [saveLogin, setSaveLogin] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validatingKey, setValidatingKey] = useState(false);

  // Load saved login preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('saveLogin');
      setSaveLogin(saved !== 'no');
      
      // Initialize key lifecycle management
      const cleanup = initializeKeyLifecycle();
      return cleanup;
    }
  }, []);

  // Clear error when form changes
  useEffect(() => {
    setError(null);
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

    if (!password.trim()) {
      return 'Posting private key (WIF) is required';
    }

    // Only accept WIF format private keys
    if (!isWifFormat(password.trim())) {
      return 'Invalid format. Please enter your posting private key in WIF format (starts with 5...)';
    }

    // Check if password is a public key (should not be)
    if (isPublicKeyFormat(password.trim())) {
      return 'You need a posting private key (WIF), not a public key';
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
    setValidatingKey(true);
    setError(null);

    try {
      // Normalize username (lowercase, remove @ prefix if present)
      const normalizedUsername = username.toLowerCase().replace(/^@/, '');

      // Step 1: Get account info to retrieve posting public key
      const accountResponse = await fetch(`/api/steem/account?username=${encodeURIComponent(normalizedUsername)}`);
      if (!accountResponse.ok) {
        throw new Error('Account not found');
      }
      const account = await accountResponse.json();
      
      if (!account || !account.posting || !account.posting.key_auths || account.posting.key_auths.length === 0) {
        throw new Error('Invalid account or posting authority not found');
      }

      // Get the posting public key (first key in posting authority)
      const postingPublicKey = account.posting.key_auths[0][0];

      // Step 2: Validate that input is a WIF format private key
      const privateKeyWif = password.trim();
      if (!isWifFormat(privateKeyWif)) {
        throw new Error('Invalid format. Only posting private keys in WIF format are allowed.');
      }

      // Step 3: Validate private key matches posting public key
      setValidatingKey(true);
      const validation = validatePostingKey(privateKeyWif, postingPublicKey);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid posting key');
      }

      // Step 4: Get login challenge from server
      const challengeResponse = await fetch('/api/auth/challenge');
      if (!challengeResponse.ok) {
        throw new Error('Failed to get login challenge');
      }
      const { challenge } = await challengeResponse.json();

      // Step 5: Sign authentication data
      const signatureResult = signAuthData(privateKeyWif, normalizedUsername, challenge);

      // Step 6: Submit signature for verification and login
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: normalizedUsername,
          signature: signatureResult.signature,
          publicKey: signatureResult.publicKey,
          data: signatureResult.data,
          challenge,
        }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        throw new Error(errorData.error || 'Login failed');
      }

      await loginResponse.json();
      
      // Step 7: Store encrypted private key for subsequent operations
      // The key is encrypted using application-level key material and stored in sessionStorage
      // It will be cleared when the tab is closed
      if (saveLogin) {
        try {
          // Encrypt and store the private key
          // Encryption uses application identifier + username for key derivation
          await encryptAndStoreKey(privateKeyWif, normalizedUsername);
        } catch (storageError) {
          console.error('Failed to store encrypted key:', storageError);
          // Don't fail login if storage fails, but log the error
        }
      }
      
      // Step 8: Update Redux state
      dispatch(
        loginThunk({
          username: normalizedUsername,
          password: '', // Don't store password in Redux
          saveLogin,
        })
      );

      // Login successful
      router.push('/trending');
    } catch (err: unknown) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
      dispatch(loginError({ error: errorMessage }));
    } finally {
      setSubmitting(false);
      setValidatingKey(false);
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

        {/* Posting Private Key input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Posting Private Key (WIF)
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your posting private key (WIF format, starts with 5...)"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            autoComplete="off"
            disabled={submitting}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Only posting private keys in WIF format are accepted. Master passwords are not supported.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Your private key starts with &quot;5&quot; and is typically 51-52 characters long.
          </p>
          {validatingKey && (
            <p className="mt-1 text-xs text-blue-600">
              Validating posting private key...
            </p>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{error}</p>
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
{submitting ? (validatingKey ? 'Validating key...' : 'Logging in...') : 'Login'}
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

