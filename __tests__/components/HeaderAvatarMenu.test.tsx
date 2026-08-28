import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

import userReducer, { setUser } from '@/store/slices/userSlice';
import { IntlWrapper } from '@/__tests__/helpers/i18n';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/trending',
}));

vi.mock('@/components/layout/SidePanel', () => ({
  SidePanel: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/components/layout/SteemitLogo', () => ({
  SteemitLogo: () => <div>logo</div>,
}));

import { Header } from '@/components/layout/Header';

function makeStore() {
  return configureStore({ reducer: { user: userReducer } });
}

describe('Header avatar menu (real base-ui dropdown, unmocked)', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    );
  });

  it('opens the account menu when clicking the avatar', async () => {
    const store = makeStore();
    store.dispatch(setUser({ username: 'alice', posting_authority: true }));

    render(
      <Provider store={store}>
        <IntlWrapper>
          <Header />
        </IntlWrapper>
      </Provider>
    );

    await userEvent.click(screen.getByLabelText('Account menu'));

    // Simplified menu: Profile / Notifications / Wallet / Logout only.
    expect(await screen.findByText('Profile')).toBeTruthy();
    expect(screen.getByText('Notifications')).toBeTruthy();
    expect(screen.getByText('Wallet')).toBeTruthy();
    expect(screen.getByText('Logout')).toBeTruthy();
    expect(screen.queryByText('Comments')).toBeNull();
    expect(screen.queryByText('Replies')).toBeNull();
    expect(screen.queryByText('Switch to Night Mode')).toBeNull();
  });
});
