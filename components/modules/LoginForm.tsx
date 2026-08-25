'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
export default function LoginForm({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useTranslations();
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
      return t('loginform_jsx.username_required');
    }

    // Basic username validation (lowercase, alphanumeric, dots, hyphens)
    const usernameRegex = /^[a-z0-9.-]+$/;
    if (!usernameRegex.test(username.toLowerCase())) {
      return t('loginform_jsx.invalid_username_format');
    }

    if (!password.trim()) {
      return t('loginform_jsx.wif_required');
    }

    // Check for a public key first so users pasting one get the specific
    // message (legacy behavior); isPublicKeyFormat runs before the WIF check.
    if (isPublicKeyFormat(password.trim())) {
      return t('loginform_jsx.you_need_a_private_password_or_key');
    }

    // Only accept WIF format private keys
    if (!isWifFormat(password.trim())) {
      return t('loginform_jsx.invalid_wif_format');
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
      await dispatch(
        loginThunk({
          username: normalizedUsername,
          password: '', // Don't store password in Redux
          saveLogin,
        })
      ).unwrap();

      dispatch(hideLogin());

      // Legacy (UserSaga.js:495-500) navigates to the user's feed after
      // logging in from the login page or the home page; modal logins from
      // other pages stay put and just refresh.
      const path = window.location.pathname;
      if (path === '/login' || path === '/') {
        router.push('/trending/my');
      } else {
        router.refresh();
      }
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

  const handleSignup = () => {
    // TODO: Open signup URL in new window
    // Safe access to process.env for UMD compatibility
    const signupUrl = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SIGNUP_URL) 
      ? process.env.NEXT_PUBLIC_SIGNUP_URL 
      : 'https://signup.steemit.com';
    window.open(signupUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="LoginForm mx-auto mb-2 mt-4 max-w-[28rem]">
      {!embedded ? (
        <h3 className="mb-4 text-left text-xl font-bold">{t('g.login')}</h3>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username input */}
        <div>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              @
            </span>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder={t('loginform_jsx.enter_your_username')}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              autoComplete="username"
              disabled={submitting}
              required
            />
          </div>
        </div>

        {/* Posting Private Key input */}
        <div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('loginform_jsx.enter_your_posting_wif')}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            autoComplete="off"
            disabled={submitting}
            required
          />
          {validatingKey && (
            <p className="mt-1 text-xs text-blue-600">
              {t('loginform_jsx.validating_key')}
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
            <span className="ml-2 text-sm text-gray-700">{t('loginform_jsx.keep_me_logged_in')}</span>
          </label>
        </div>

        {/* Submit button + register link on one row (legacy login-modal-buttons) */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting
              ? validatingKey
                ? t('loginform_jsx.validating_key')
                : t('loginform_jsx.logging_in')
              : t('g.login')}
          </button>
          <span className="register ml-auto text-right text-sm text-gray-600">
            {t('loginform_jsx.not_a_steemit_user')}
            <br />
            <button
              type="button"
              onClick={handleSignup}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {t('loginform_jsx.sign_up_get_steem')}
            </button>
          </span>
        </div>
      </form>
    </div>
  );
}

