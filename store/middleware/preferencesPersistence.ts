/**
 * Auto-persistence of user preference toggles (legacy SagaShared parity).
 *
 * Legacy watched SET_USER_PREFERENCES / TOGGLE_NIGHTMODE / TOGGLE_BLOGMODE
 * with a takeLatest saga that POSTed the whole user_preferences map to
 * /api/v1/setUserPreferences (a session-scoped store, login required) —
 * see condenser-legacy src/app/redux/SagaShared.js:19-30.
 *
 * This rewrite watches the toggle-class actions only: the nsfw select in
 * UserSettings keeps its explicit "Save Preferences" button (it has visible
 * success/error feedback), and the locale is cookie-managed by I18nProvider
 * rather than a session preference. Watching setUserPreferences here would
 * also re-POST the session-hydration snapshot on every page load.
 *
 * The flush payload is likewise narrowed to the keys this middleware owns
 * (nightmode/blogmode): forwarding the whole map would write cookie-managed
 * keys like locale into the session, and any unknown server-side field
 * would round-trip back through the hydration merge.
 *
 * Failures are silent (console.warn): preferences are cosmetic, and the
 * Redux state already reflects the toggled UI — persistence is best-effort.
 */

import type { Middleware } from '@reduxjs/toolkit';

import { postJsonWithCsrf } from '@/lib/api/csrf';
import { toggleBlogmode, toggleNightmode } from '@/store/slices/appSlice';
import { logout } from '@/store/slices/userSlice';
import type { RootState } from '@/store/index';

/** Trailing debounce so rapid toggles collapse into one request. */
export const PREFERENCES_PERSIST_DEBOUNCE_MS = 800;

/** Action types whose preference change auto-persists. */
const PERSISTED_ACTION_TYPES = new Set<string>([
  toggleNightmode.type,
  toggleBlogmode.type,
]);

interface PreferencesPersistenceOptions {
  /** Flush delay (tests pass a short delay). */
  debounceMs?: number;
}

export function createPreferencesPersistenceMiddleware(
  options: PreferencesPersistenceOptions = {}
): Middleware {
  const debounceMs = options.debounceMs ?? PREFERENCES_PERSIST_DEBOUNCE_MS;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = async (getState: () => RootState) => {
    // The login gate lives HERE, at flush time — the only place it is
    // checked: the debounce window can straddle a logout (skip — the POST
    // would only 401) or a login (the pending toggle belongs to the
    // now-valid session).
    const state = getState();
    if (!state.user.current?.username) return;

    // Read the latest values at flush time (legacy's saga re-selected from
    // the store rather than using the action payload) and send only the
    // keys this middleware owns.
    const payload = {
      nightmode: state.app.user_preferences.nightmode,
      blogmode: state.app.user_preferences.blogmode,
    };

    try {
      const res = await postJsonWithCsrf('/api/auth/preferences', { payload });
      if (!res.ok) {
        // 401 (not logged in) and friends: nothing the UI should do.
        // The one race left is a POST already on the wire when a logout
        // lands: with Redis sessions the logout revokes the session id, so
        // the route 401s and lands here; in JWT-fallback mode the
        // superseded token cannot be revoked, so the write goes to the
        // orphaned session — the documented revocation residual (see
        // revokeSession in lib/auth/session.ts).
        console.warn(
          'Failed to persist user preferences:',
          res.status
        );
      }
    } catch (error) {
      console.warn('Failed to persist user preferences:', error);
    }
  };

  return ({ getState }) => (next) => (action) => {
    const result = next(action);
    if (typeof action !== 'object' || action === null) return result;
    const type = (action as { type: string }).type;

    if (PERSISTED_ACTION_TYPES.has(type)) {
      // Always arm the debounce, regardless of login state at dispatch
      // time: the flush-time re-check below owns the login gate. Filtering
      // anonymous dispatches up front would silently drop a toggle that
      // lands inside the debounce window before a login — the pending
      // toggle then belongs to the now-valid session. The cost is that an
      // anonymous toggle arms a timer whose flush skips; harmless.
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        void flush(getState);
      }, debounceMs);
    } else if (type === logout.type) {
      // Logout cancels a pending flush: the debounce window would otherwise
      // fire after the session is gone. (flush re-checks login too — this
      // just avoids the doomed timer outright.)
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }
    return result;
  };
}
