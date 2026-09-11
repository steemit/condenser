'use client';

/**
 * Session hydration hook
 * Restores user identity into Redux on app mount when a valid server-side
 * session cookie exists (legacy App.jsx auto-login equivalent).
 *
 * Note: this only restores identity/UI state. The posting key is restored
 * separately by lib/crypto/key-storage: if the user checked "keep me logged
 * in" the encrypted key in localStorage survives the reload and signing
 * keeps working; otherwise the key was memory-only and the user must log in
 * again to sign.
 */

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setTrackingId, setUser } from '@/store/slices/userSlice';
import { setUserPreferences } from '@/store/slices/appSlice';

// One hydration attempt per page load is enough: the session cookie lives
// for 30 days, and on failure the UI simply stays logged out until the next
// load. The guard also absorbs React strict-mode double effects.
let hydrationStarted = false;

/** Reset the hydration guard (test-only). */
export function resetSessionHydrationForTests() {
  hydrationStarted = false;
}

export function useSessionHydration() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (hydrationStarted) return;
    hydrationStarted = true;

    let cancelled = false;

    fetch('/api/auth/session', { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        // Legacy parity: every visitor's trackingId is the session uid
        // (the session route creates one when missing), regenerated at
        // login time by usernamePasswordLogin.
        if (data.session?.uid) dispatch(setTrackingId(data.session.uid));
        // Legacy auto-login also restores saved user preferences (nsfwPref,
        // …) from the session — except locale, which is cookie-managed in
        // the rewrite (i18n PR) and must not be stomped here.
        // Known race (accepted): if the user saves prefs in Settings before
        // this in-flight snapshot resolves, the dispatch reverts the Redux
        // state until next reload; the server-side state stays correct.
        if (data.session?.userPreferences) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { locale: _locale, ...rest } = data.session.userPreferences;
          dispatch(setUserPreferences(rest));
        }
        if (!data.authenticated) return;
        const username = data.session?.username;
        if (!username) return;
        // Same action shape loginThunk dispatches on success so downstream
        // selectors behave identically.
        dispatch(
          setUser({
            username,
            posting_authority: true, // Session implies a verified posting key
            pass_auth: true,
          })
        );
      })
      .catch(() => {
        // Network/session errors leave the UI logged out.
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch]);
}
