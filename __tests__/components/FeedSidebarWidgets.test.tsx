import { configureStore } from '@reduxjs/toolkit';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import userReducer, { setUser } from '@/store/slices/userSlice';
import { IntlWrapper } from '@/__tests__/helpers/i18n';

let mockPathname = '/trending';
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

import { FeedSidebarWidgets } from '@/components/layout/FeedSidebarWidgets';

function makeStore(loggedIn: boolean) {
  const store = configureStore({ reducer: { user: userReducer } });
  if (loggedIn) {
    store.dispatch(setUser({ username: 'alice', posting_authority: true }));
  }
  return store;
}

const NOTICE = {
  status: 1,
  body: { en: '**Hello** world', cn: '你好' },
};

function mockFetchNotices() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((url: string) => {
      if (url === '/api/steem/notices') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: [NOTICE] }),
        });
      }
      // communities fetch etc.
      return Promise.resolve({ ok: true, json: async () => ({ data: [] }) });
    })
  );
}

describe('FeedSidebarWidgets announcement placement', () => {
  beforeEach(() => {
    mockFetchNotices();
  });
  afterEach(cleanup);

  it('shows the announcement on feed pages when logged in', async () => {
    mockPathname = '/trending';
    render(
      <Provider store={makeStore(true)}>
        <IntlWrapper>
          <FeedSidebarWidgets />
        </IntlWrapper>
      </Provider>
    );
    expect(await screen.findByText('Announcements')).toBeTruthy();
    expect(await screen.findByText('Hello')).toBeTruthy();
  });

  it('shows the announcement on feed pages when logged out', async () => {
    mockPathname = '/trending';
    render(
      <Provider store={makeStore(false)}>
        <IntlWrapper>
          <FeedSidebarWidgets />
        </IntlWrapper>
      </Provider>
    );
    await waitFor(() => {
      expect(screen.getByText('New to Steemit?')).toBeTruthy();
    });
    expect(await screen.findByText('Announcements')).toBeTruthy();
  });

  it('shows the announcement on post pages even when logged out', async () => {
    mockPathname = '/steem/@alice/hello-world';
    render(
      <Provider store={makeStore(false)}>
        <IntlWrapper>
          <FeedSidebarWidgets />
        </IntlWrapper>
      </Provider>
    );
    expect(await screen.findByText('Announcements')).toBeTruthy();
  });

  it('renders the rail modules exactly once', async () => {
    mockPathname = '/trending';
    render(
      <Provider store={makeStore(false)}>
        <IntlWrapper>
          <FeedSidebarWidgets />
        </IntlWrapper>
      </Provider>
    );
    await waitFor(() => {
      expect(screen.getAllByText('New to Steemit?')).toHaveLength(1);
    });
  });
});
