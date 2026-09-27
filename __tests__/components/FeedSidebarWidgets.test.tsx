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

describe('FeedSidebarWidgets community pane (case normalization)', () => {
  const COMMUNITY = {
    name: 'hive-123',
    title: 'Test Community',
    about: 'A community for tests',
    subscribers: 42,
    num_authors: 7,
  };

  beforeEach(() => {
    // Mock shapes mirror the real routes: /api/steem/communities responds
    // with a BARE array (NextResponse.json(result), consumed via cachedFetch),
    // while /api/steem/notices wraps in { data } (bare fetch in Announcement).
    // The headers stub matters too: cachedFetch reads X-Cache-Invalidate via
    // res.headers.get(), and a missing headers object would throw inside
    // invalidateFromResponse — silently swallowed by fetchCommunities.
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        const ok = (json: () => unknown) =>
          Promise.resolve({ ok: true, headers: { get: () => null }, json });
        if (url === '/api/steem/notices') {
          return ok(async () => ({ data: [NOTICE] }));
        }
        if (url.startsWith('/api/steem/communities')) {
          return ok(async () => [COMMUNITY]);
        }
        return ok(async () => []);
      })
    );
  });
  afterEach(cleanup);

  it('shows the community pane for an uppercase sort (/Payout/hive-123)', async () => {
    // Legacy 301-normalized the URL to lowercase before the UI matched, so
    // the pane must appear here too (legacy parity).
    mockPathname = '/Payout/hive-123';
    render(
      <Provider store={makeStore(false)}>
        <IntlWrapper>
          <FeedSidebarWidgets />
        </IntlWrapper>
      </Provider>
    );
    expect(await screen.findByText('Test Community')).toBeTruthy();
  });

  it('keeps the community pane hidden on non-community feeds', async () => {
    mockPathname = '/Payout/my';
    render(
      <Provider store={makeStore(false)}>
        <IntlWrapper>
          <FeedSidebarWidgets />
        </IntlWrapper>
      </Provider>
    );
    // Wait for the rail to settle (SidebarNewUsers), then assert no pane.
    await waitFor(() => {
      expect(screen.getByText('New to Steemit?')).toBeTruthy();
    });
    expect(screen.queryByText('Test Community')).toBeNull();
  });
});
