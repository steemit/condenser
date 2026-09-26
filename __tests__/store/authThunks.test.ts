import { configureStore } from '@reduxjs/toolkit';
import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import userReducer, { setUser } from '@/store/slices/userSlice';
import globalReducer, { receiveFollowList } from '@/store/slices/globalSlice';
import { loginThunk, logoutThunk } from '@/store/thunks/authThunks';
import type { AppDispatch, RootState } from '@/store';

// The thunk's dispatch signature is typed against the full app store; the
// partial reducer under test only touches user/global state, so widen the type.
type TestStore = { dispatch: AppDispatch; getState: () => RootState };
function makeStore(): TestStore {
  return configureStore({
    reducer: { user: userReducer, global: globalReducer },
  }) as unknown as TestStore;
}

describe('logoutThunk', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('clears Redux user state, stored credentials and the server session', async () => {
    const store = makeStore();
    store.dispatch(setUser({ username: 'alice', posting_authority: true }));
    window.localStorage.setItem('autopost2', JSON.stringify({ username: 'alice' }));
    window.localStorage.setItem('steem_encrypted_key', '{"encrypted":"x"}');
    window.sessionStorage.setItem('steem_encrypted_key', '{"encrypted":"legacy"}');

    await store.dispatch(logoutThunk());

    const state = store.getState().user;
    expect(state.current).toEqual({});
    expect(state.logged_out).toBe(true);
    expect(window.localStorage.getItem('autopost2')).toBeNull();
    expect(window.localStorage.getItem('steem_encrypted_key')).toBeNull();
    expect(window.sessionStorage.getItem('steem_encrypted_key')).toBeNull();
    // The POST goes through postJsonWithCsrf: JSON content type + the
    // double-submit header when a token cookie exists (audit N-22).
    expect(fetch).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: undefined,
    });
  });

  it('still clears local state when the server logout call fails', async () => {
    (fetch as Mock).mockRejectedValue(new Error('network down'));
    const store = makeStore();
    store.dispatch(setUser({ username: 'alice' }));

    await store.dispatch(logoutThunk());

    expect(store.getState().user.current).toEqual({});
    expect(store.getState().user.logged_out).toBe(true);
  });

  it('clears the follow state on logout (state hygiene beyond legacy)', async () => {
    // Legacy LOGOUT never cleared global.follow (keyed by username, inert
    // until the same user returned); the rewrite drops it so a subsequent
    // visitor on the same tab cannot read the previous user's sets.
    const store = makeStore();
    store.dispatch(setUser({ username: 'alice' }));
    store.dispatch(
      receiveFollowList({ follower: 'alice', type: 'blog', accounts: ['bob'] })
    );
    store.dispatch(
      receiveFollowList({ follower: 'alice', type: 'ignore', accounts: ['mallory'] })
    );
    expect(store.getState().global.follow?.getFollowingAsync?.alice).toBeDefined();

    await store.dispatch(logoutThunk());

    expect(store.getState().global.follow?.getFollowingAsync).toBeUndefined();
  });
});

describe('loginThunk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // Route follow-list fetches (loadFollowState) to an empty page.
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string) => {
        if (input.startsWith('/api/steem/following')) {
          return { ok: true, json: async () => [] };
        }
        return { ok: true, json: async () => ({}) };
      })
    );
  });

  it('sets the user and seeds the follow state after login', async () => {
    const store = makeStore();

    await store.dispatch(loginThunk({ username: '@Alice' }));

    expect(store.getState().user.current).toMatchObject({
      username: 'alice',
      posting_authority: true,
      pass_auth: true,
    });
    expect(store.getState().user.authority.alice).toMatchObject({
      posting: 'full',
    });
    // Legacy parity (UserSaga usernamePasswordLogin): login triggers the
    // follow/ignore list load for the freshly logged-in user.
    const followUrls = (fetch as Mock).mock.calls
      .map((call) => String(call[0]))
      .filter((u: string) => u.startsWith('/api/steem/following?'));
    expect(followUrls).toHaveLength(2);
    expect(followUrls.every((u: string) => u.includes('account=alice'))).toBe(true);
    // loadFollowState is dispatched fire-and-forget inside the thunk.
    await waitFor(() => {
      expect(
        store.getState().global.follow?.getFollowingAsync?.alice?.blog_result
      ).toEqual([]);
      expect(
        store.getState().global.follow?.getFollowingAsync?.alice?.ignore_result
      ).toEqual([]);
    });
  });
});
