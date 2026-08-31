'use client';

/**
 * Session hydration hook
 * Restores user identity into Redux on app mount when a valid server-side
 * session cookie exists (legacy App.jsx auto-login equivalent).
 *
 * Note: this only restores identity/UI state. The encrypted private key in
 * sessionStorage does not survive a page reload by design, so posting
 * actions will prompt for the key again — that is intentional.
 */

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setTrackingId, setUser } from '@/store/slices/userSlice';

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
