import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

import userReducer, { setUser } from '@/store/slices/userSlice';
import { IntlWrapper } from '@/__tests__/helpers/i18n';

const routerPush = vi.fn();
const routerRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush, refresh: routerRefresh }),
  usePathname: () => '/trending',
}));

// Render the dropdown inline (no portal) so menu items are directly clickable.
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuGroup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  DropdownMenuLabel: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => null,
}));

vi.mock('@/components/layout/SidePanel', () => ({
  SidePanel: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/components/layout/SteemitLogo', () => ({
  SteemitLogo: () => <div>logo</div>,
}));
vi.mock('@/components/elements/Userpic', () => ({
  default: () => <div>userpic</div>,
}));
vi.mock('@/components/elements/NotificationBadge', () => ({
  default: () => null,
}));

import { Header } from '@/components/layout/Header';

function makeStore() {
  return configureStore({ reducer: { user: userReducer } });
}

describe('Header logout', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    vi.clearAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('dispatches logoutThunk and refreshes without navigating away', async () => {
    const store = makeStore();
    store.dispatch(setUser({ username: 'alice', posting_authority: true }));
    window.localStorage.setItem('autopost2', JSON.stringify({ username: 'alice' }));

    render(
      <Provider store={store}>
        <IntlWrapper>
          <Header />
        </IntlWrapper>
      </Provider>
    );

    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(store.getState().user.current).toEqual({});
    });
    expect(store.getState().user.logged_out).toBe(true);
    expect(window.localStorage.getItem('autopost2')).toBeNull();
    expect(fetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });
    expect(routerRefresh).toHaveBeenCalled();
    // Legacy does not navigate on logout
    expect(routerPush).not.toHaveBeenCalled();
  });
});
