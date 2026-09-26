import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import type { ReactNode } from 'react';

import {
  resetSessionHydrationForTests,
  useSessionHydration,
} from '@/hooks/use-session-hydration';
import userReducer from '@/store/slices/userSlice';
import globalReducer from '@/store/slices/globalSlice';
import appReducer from '@/store/slices/appSlice';

function makeStore() {
  return configureStore({
    reducer: { user: userReducer, global: globalReducer, app: appReducer },
  });
}

function wrapper(store: ReturnType<typeof makeStore>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

/** Route fetch by URL: the session endpoint gets the given body, the
 *  following endpoint (loadFollowState) gets an empty page. */
function mockSessionResponse(body: unknown, ok = true) {
  (fetch as Mock).mockImplementation(async (input: string) => {
    if (input.startsWith('/api/steem/following')) {
      return { ok: true, json: async () => [] };
    }
    return { ok, json: async () => body };
  });
}

describe('useSessionHydration', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    resetSessionHydrationForTests();
  });

  it('restores user identity into Redux when the session is authenticated', async () => {
    mockSessionResponse({
      authenticated: true,
      session: { username: 'alice', uid: 'uid-1' },
    });
    const store = makeStore();

    renderHook(() => useSessionHydration(), { wrapper: wrapper(store) });

    await waitFor(() => {
      expect(store.getState().user.current.username).toBe('alice');
    });
    // Same action shape loginThunk dispatches on success
    expect(store.getState().user.current).toMatchObject({
      username: 'alice',
      posting_authority: true,
      pass_auth: true,
    });
  });

  it('loads the follow state after restoring an authenticated session', async () => {
    mockSessionResponse({
      authenticated: true,
      session: { username: 'alice', uid: 'uid-1' },
    });
    const store = makeStore();

    renderHook(() => useSessionHydration(), { wrapper: wrapper(store) });

    await waitFor(() => {
      const follow = store.getState().global.follow?.getFollowingAsync?.alice;
      return follow?.blog_result !== undefined && follow?.ignore_result !== undefined;
    });
    const calledUrls = (fetch as Mock).mock.calls.map((call) => String(call[0]));
    expect(calledUrls).toContain('/api/auth/session');
    expect(
      calledUrls.filter((u: string) => u.startsWith('/api/steem/following?'))
    ).toHaveLength(2);
  });

  it('leaves the user logged out when the session is unauthenticated', async () => {
    mockSessionResponse({ authenticated: false, session: null });
    const store = makeStore();

    renderHook(() => useSessionHydration(), { wrapper: wrapper(store) });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/session', {
        credentials: 'same-origin',
      });
    });
    expect(store.getState().user.current).toEqual({});
    // Anonymous visitors never fetch follow lists.
    expect(
      (fetch as Mock).mock.calls.some((call) =>
        String(call[0]).startsWith('/api/steem/following')
      )
    ).toBe(false);
  });

  it('normalizes an out-of-range stored nsfwPref instead of binding it raw', async () => {
    mockSessionResponse({
      authenticated: false,
      session: {
        uid: 'uid-3',
        userPreferences: { nsfwPref: 'garbage', nightmode: true, locale: 'zh' },
      },
    });
    const store = makeStore();

    renderHook(() => useSessionHydration(), { wrapper: wrapper(store) });

    await waitFor(() => {
      // Coerced to the legacy default; a raw out-of-range value would
      // render a blank option in the Settings <select>.
      expect(store.getState().app.user_preferences.nsfwPref).toBe('warn');
    });
    expect(store.getState().app.user_preferences.nightmode).toBe(true);
    // locale is cookie-managed: hydration never stomps it.
    expect(store.getState().app.user_preferences.locale).toBeNull();
  });

  it('leaves the user logged out when the fetch fails', async () => {
    (fetch as Mock).mockRejectedValue(new Error('network down'));
    const store = makeStore();

    renderHook(() => useSessionHydration(), { wrapper: wrapper(store) });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
    expect(store.getState().user.current).toEqual({});
  });

  it('hydrates only once per page load, even across remounts', async () => {
    mockSessionResponse({ authenticated: false, session: null });
    const store = makeStore();

    const first = renderHook(() => useSessionHydration(), {
      wrapper: wrapper(store),
    });
    first.unmount();
    renderHook(() => useSessionHydration(), { wrapper: wrapper(store) });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});
