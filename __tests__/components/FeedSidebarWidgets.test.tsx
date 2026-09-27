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

  it('shows the community pane for the all-lowercase baseline (/payout/hive-123)', async () => {
    mockPathname = '/payout/hive-123';
    render(
      <Provider store={makeStore(false)}>
        <IntlWrapper>
          <FeedSidebarWidgets />
        </IntlWrapper>
      </Provider>
    );
    expect(await screen.findByText('Test Community')).toBeTruthy();
  });

  it('shows the community pane with a trailing slash (/Payout/hive-123/)', async () => {
    // The proxy 308-strips trailing slashes today, but the matcher must
    // tolerate one (aligned with isPostPathname) so the pane does not go
    // dead again if skipTrailingSlashRedirect is ever enabled.
    mockPathname = '/Payout/hive-123/';
    render(
      <Provider store={makeStore(false)}>
        <IntlWrapper>
          <FeedSidebarWidgets />
        </IntlWrapper>
      </Provider>
    );
    expect(await screen.findByText('Test Community')).toBeTruthy();
  });

  it('shows the community pane for a mixed-case tag (/payout/HIVE-123)', async () => {
    // Community names are lowercase on chain; the lowercased capture must
    // still match how the page queries the tag.
    mockPathname = '/payout/HIVE-123';
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

describe('FeedSidebarWidgets community page hides the user rail (legacy !community)', () => {
  const COMMUNITY = {
    name: 'hive-123',
    title: 'Test Community',
    about: 'A community for tests',
    subscribers: 42,
    num_authors: 7,
  };

  beforeEach(() => {
    // Same shape as the pane suite above: bare-array /api/steem/communities
    // (cachedFetch) with headers, { data }-wrapped /api/steem/notices.
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

  it('hides SidebarNewUsers on community pages when logged out', async () => {
    mockPathname = '/trending/hive-123';
    render(
      <Provider store={makeStore(false)}>
        <IntlWrapper>
          <FeedSidebarWidgets />
        </IntlWrapper>
      </Provider>
    );
    // Let the pane settle first, then assert the legacy !community rail.
    expect(await screen.findByText('Test Community')).toBeTruthy();
    expect(screen.queryByText('New to Steemit?')).toBeNull();
    expect(screen.queryByText('Announcements')).toBeNull();
  });

  it('hides SidebarLinks on community pages when logged in', async () => {
    mockPathname = '/trending/hive-123';
    render(
      <Provider store={makeStore(true)}>
        <IntlWrapper>
          <FeedSidebarWidgets />
        </IntlWrapper>
      </Provider>
    );
    expect(await screen.findByText('Test Community')).toBeTruthy();
    expect(screen.queryByText('Trending Communities')).toBeNull();
    expect(screen.queryByText('New to Steemit?')).toBeNull();
  });

  it('keeps SidebarLinks on ordinary feed pages when logged in', async () => {
    mockPathname = '/trending';
    render(
      <Provider store={makeStore(true)}>
        <IntlWrapper>
          <FeedSidebarWidgets />
        </IntlWrapper>
      </Provider>
    );
    expect(await screen.findByText('Trending Communities')).toBeTruthy();
  });
});
