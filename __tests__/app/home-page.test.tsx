import { configureStore } from '@reduxjs/toolkit';
import { cleanup, render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import userReducer from '@/store/slices/userSlice';
import globalReducer from '@/store/slices/globalSlice';
import { IntlWrapper } from '@/__tests__/helpers/i18n';

const redirectMock = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});
vi.mock('next/navigation', () => ({
  redirect: (url: string) => redirectMock(url),
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

const getServerSessionMock = vi.fn();
vi.mock('@/lib/auth/session', () => ({
  getServerSession: () => getServerSessionMock(),
}));

const fetchRankedPostsMock = vi.fn();
vi.mock('@/lib/api/steem', () => ({
  fetchRankedPosts: (...args: unknown[]) => fetchRankedPostsMock(...args),
  fetchCommunities: () => Promise.resolve([]),
}));

import HomePage from '@/app/(main)/page';

describe('/ home page (legacy: SSR trending at /, logged-in → /trending/my)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true, json: async () => ({ data: [] }) }))
    );
  });
  afterEach(cleanup);

  it('renders the trending feed at / for anonymous visitors (no redirect)', async () => {
    getServerSessionMock.mockResolvedValue(null);
    fetchRankedPostsMock.mockResolvedValue([]);
    const element = await HomePage();
    expect(redirectMock).not.toHaveBeenCalled();
    render(
      <Provider store={configureStore({ reducer: { user: userReducer, global: globalReducer } })}>
        <IntlWrapper>{element}</IntlWrapper>
      </Provider>
    );
    await waitFor(() => {
      expect(fetchRankedPostsMock).toHaveBeenCalledWith(
        expect.objectContaining({ order: 'trending' })
      );
    });
  });

  it('redirects logged-in sessions to /trending/my (legacy server.js parity)', async () => {
    getServerSessionMock.mockResolvedValue({ username: 'alice', uid: 'u1' });
    await expect(HomePage()).rejects.toThrow('NEXT_REDIRECT:/trending/my');
    expect(redirectMock).toHaveBeenCalledWith('/trending/my');
  });
});
