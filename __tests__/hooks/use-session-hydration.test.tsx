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

function makeStore() {
  return configureStore({ reducer: { user: userReducer } });
}

function wrapper(store: ReturnType<typeof makeStore>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

function mockSessionResponse(body: unknown, ok = true) {
  (fetch as Mock).mockResolvedValue({ ok, json: async () => body });
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
