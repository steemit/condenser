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
 * Failures are silent (console.warn): preferences are cosmetic, and the
 * Redux state already reflects the toggled UI — persistence is best-effort.
 */

import type { Middleware } from '@reduxjs/toolkit';

import { postJsonWithCsrf } from '@/lib/api/csrf';
import { toggleBlogmode, toggleNightmode } from '@/store/slices/appSlice';

/** Trailing debounce so rapid toggles collapse into one request. */
export const PREFERENCES_PERSIST_DEBOUNCE_MS = 800;

/** Action types whose preference change auto-persists. */
const PERSISTED_ACTION_TYPES = new Set<string>([
  toggleNightmode.type,
  toggleBlogmode.type,
]);

interface PreferencesPersistenceOptions {
  /** Flush delay (tests pass 0/controlled fake timers). */
  debounceMs?: number;
}

export function createPreferencesPersistenceMiddleware(
  options: PreferencesPersistenceOptions = {}
): Middleware {
  const debounceMs = options.debounceMs ?? PREFERENCES_PERSIST_DEBOUNCE_MS;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = async (getState: () => unknown) => {
    // Read the latest prefs at flush time (legacy's saga re-selected from
    // the store rather than using the action payload).
    const state = getState() as {
      app: { user_preferences: Record<string, unknown> };
    };
    try {
      const res = await postJsonWithCsrf('/api/auth/preferences', {
        payload: state.app.user_preferences,
      });
      if (!res.ok) {
        // 401 (not logged in) and friends: nothing the UI should do.
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
    if (
      typeof action === 'object' &&
      action !== null &&
      PERSISTED_ACTION_TYPES.has((action as { type: string }).type)
    ) {
      // Skip anonymous visitors up front: the route requires a session and
      // would 401 (legacy's anonymous POSTs failed the same way, just
      // server-side). Their toggles stay Redux-only for this page load.
      const state = getState() as {
        user: { current?: { username?: string } | null };
      };
      if (!state.user.current?.username) return result;

      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        void flush(getState);
      }, debounceMs);
    }
    return result;
  };
}
