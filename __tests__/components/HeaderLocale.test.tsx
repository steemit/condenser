import { configureStore } from '@reduxjs/toolkit';
import { cleanup, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

import userReducer, { setUser } from '@/store/slices/userSlice';
import { IntlWrapper, getMergedMessages } from '@/__tests__/helpers/i18n';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/trending',
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuGroup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children }: { children: ReactNode }) => (
    <button type="button">{children}</button>
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

describe('Header locale rendering', () => {
  afterEach(() => cleanup());

  it('renders Spanish labels when the locale is es', async () => {
    const store = configureStore({ reducer: { user: userReducer } });
    const messages = await getMergedMessages('es');

    render(
      <Provider store={store}>
        <IntlWrapper locale="es" messages={messages as never}>
          <Header />
        </IntlWrapper>
      </Provider>
    );

    // g.login / g.sign_up / g.search from legacy es.json
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
    expect(screen.getByText('Inscribirse')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar')).toBeInTheDocument();
    expect(screen.queryByText('Sign up')).not.toBeInTheDocument();
  });

  it('falls back to English for keys missing from es', async () => {
    const store = configureStore({ reducer: { user: userReducer } });
    store.dispatch(setUser({ username: 'alice', posting_authority: true }));
    const messages = await getMergedMessages('es');

    render(
      <Provider store={store}>
        <IntlWrapper locale="es" messages={messages as never}>
          <Header />
        </IntlWrapper>
      </Provider>
    );

    // g.profile is missing from legacy es.json — the merged bundle fills
    // it from en, so the menu item stays English rather than breaking.
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });
});
