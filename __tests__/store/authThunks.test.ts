import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import userReducer, { setUser } from '@/store/slices/userSlice';
import { logoutThunk } from '@/store/thunks/authThunks';
import type { AppDispatch, RootState } from '@/store';

// The thunk's dispatch signature is typed against the full app store; the
// partial reducer under test only touches user state, so widen the type.
type TestStore = { dispatch: AppDispatch; getState: () => RootState };
function makeStore(): TestStore {
  return configureStore({
    reducer: { user: userReducer },
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
    window.sessionStorage.setItem('steem_encrypted_key', '{"encrypted":"x"}');

    await store.dispatch(logoutThunk());

    const state = store.getState().user;
    expect(state.current).toEqual({});
    expect(state.logged_out).toBe(true);
    expect(window.localStorage.getItem('autopost2')).toBeNull();
    expect(window.sessionStorage.getItem('steem_encrypted_key')).toBeNull();
    expect(fetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });
  });

  it('still clears local state when the server logout call fails', async () => {
    (fetch as Mock).mockRejectedValue(new Error('network down'));
    const store = makeStore();
    store.dispatch(setUser({ username: 'alice' }));

    await store.dispatch(logoutThunk());

    expect(store.getState().user.current).toEqual({});
    expect(store.getState().user.logged_out).toBe(true);
  });
});
