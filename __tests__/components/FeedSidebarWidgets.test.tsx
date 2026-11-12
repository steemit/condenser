import { configureStore } from '@reduxjs/toolkit';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import userReducer, { setUser } from '@/store/slices/userSlice';
import globalReducer from '@/store/slices/globalSlice';
import { CommunityProvider } from '@/components/providers/CommunityProvider';
import { IntlWrapper } from '@/__tests__/helpers/i18n';
import type { Community } from '@/types/steem';

let mockPathname = '/trending';
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

import { FeedSidebarWidgets } from '@/components/layout/FeedSidebarWidgets';

function makeStore(loggedIn: boolean) {
  const store = configureStore({
    reducer: { user: userReducer, global: globalReducer },
  });
  if (loggedIn) {
    store.dispatch(setUser({ username: 'alice', posting_authority: true }));
  }
  return store;
}

const NOTICE = {
  status: 1,
  body: { en: '**Hello** world', cn: '你好' },
};

// Default communities response is non-empty on purpose: SidebarLinks only
// renders its module once topics arrive, and cachedFetch caches the first
// response for the file's lifetime (30s fresh window) — an empty default
// would poison the "keeps SidebarLinks" test below via the shared cache.
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
      // cachedFetch consumers (SidebarLinks' communities fetch) expect a
      // BARE array; the headers stub keeps invalidateFromResponse from
      // throwing on res.headers.get().
      return Promise.resolve({
        ok: true,
        headers: { get: () => null },
        json: async () =>
          url.startsWith('/api/steem/communities')
            ? [{ name: 'hive-9', title: 'Some Community' }]
            : [],
      });
    })
  );
}

/** bridge.get_community fixture (hive-1* → guests may post). */
function makeCommunity(overrides: Partial<Community> = {}): Community {
  return {
    name: 'hive-123',
    title: 'Test Community',
    about: 'A community for tests',
    description: 'Line one\nLine two',
    flag_text: 'Rule one\nRule two',
    lang: 'en',
    subscribers: 42,
    sum_pending: 8,
    num_authors: 7,
    context: { role: 'guest', subscribed: false },
    team: [
      ['owner-acct', 'owner', ''],
      ['alice', 'admin', 'founder'],
      ['bob', 'mod', ''],
    ],
    ...overrides,
  };
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
  // The pane consumes the page-provided CommunityProvider value; the URL
  // regex only gates layout slots (which modules appear), so every URL
  // variant below must show the pane content.
  beforeEach(mockFetchNotices);
  afterEach(cleanup);

  const cases: [string, string][] = [
    // Legacy 301-normalized the URL to lowercase before the UI matched, so
    // the pane must appear for raw-cased URLs too (legacy parity).
    ['/Payout/hive-123', 'uppercase sort'],
    ['/payout/hive-123', 'all-lowercase baseline'],
    // The proxy 308-strips trailing slashes today, but the matcher must
    // tolerate one (aligned with isPostPathname) so the pane does not go
    // dead again if skipTrailingSlashRedirect is ever enabled.
    ['/Payout/hive-123/', 'trailing slash'],
    // Community names are lowercase on chain; the lowercased capture must
    // still match how the page queries the tag.
    ['/payout/HIVE-123', 'mixed-case tag'],
  ];

  it.each(cases)('shows the community pane for %s (%s)', (pathname) => {
    mockPathname = pathname;
    render(
      <Provider store={makeStore(false)}>
        <IntlWrapper>
          <CommunityProvider community={makeCommunity()}>
            <FeedSidebarWidgets />
          </CommunityProvider>
        </IntlWrapper>
      </Provider>
    );
    expect(screen.getByText('Leadership')).toBeTruthy();
    expect(screen.getByText('@alice')).toBeTruthy();
  });

  it('keeps the community pane hidden on non-community feeds', async () => {
    mockPathname = '/Payout/my';
    render(
      <Provider store={makeStore(false)}>
        <IntlWrapper>
          <CommunityProvider community={makeCommunity()}>
            <FeedSidebarWidgets />
          </CommunityProvider>
        </IntlWrapper>
      </Provider>
    );
    // Wait for the rail to settle (SidebarNewUsers), then assert no pane.
    await waitFor(() => {
      expect(screen.getByText('New to Steemit?')).toBeTruthy();
    });
    expect(screen.queryByText('Leadership')).toBeNull();
  });

  it('renders nothing while the community payload has not loaded (null context)', () => {
    mockPathname = '/trending/hive-123';
    render(
      <Provider store={makeStore(false)}>
        <IntlWrapper>
          <CommunityProvider community={null}>
            <FeedSidebarWidgets />
          </CommunityProvider>
        </IntlWrapper>
      </Provider>
    );
    expect(screen.queryByText('Leadership')).toBeNull();
  });
});

describe('FeedSidebarWidgets community pane content (legacy CommunityPane.jsx)', () => {
  beforeEach(mockFetchNotices);
  afterEach(cleanup);

  function renderPane(community: Community, loggedIn = false) {
    mockPathname = '/trending/hive-123';
    const store = makeStore(loggedIn);
    render(
      <Provider store={store}>
        <IntlWrapper>
          <CommunityProvider community={community}>
            <FeedSidebarWidgets />
          </CommunityProvider>
        </IntlWrapper>
      </Provider>
    );
    return store;
  }

  it('lists the leadership team without owner rows, with role/title badges', () => {
    renderPane(makeCommunity());
    expect(screen.getByText('Leadership')).toBeTruthy();
    // Team rows: owner hidden (legacy teamMembers skips owner), @name links.
    expect(screen.getByText('@alice')).toBeTruthy();
    expect(screen.getByText('@bob')).toBeTruthy();
    expect(screen.queryByText('@owner-acct')).toBeNull();
    // .user_role badge text (rendered 'admin', uppercased only via CSS).
    expect(screen.getByText('admin')).toBeTruthy();
    expect(screen.getByText('founder')).toBeTruthy(); // .affiliation badge
  });

  it('renders description, rules (nl2li) and language modules', () => {
    renderPane(makeCommunity());
    expect(screen.getByText('Description')).toBeTruthy();
    expect(screen.getByText('Line one')).toBeTruthy();
    expect(screen.getByText('Rules')).toBeTruthy();
    expect(screen.getByText('Rule one')).toBeTruthy();
    expect(screen.getByText('Language')).toBeTruthy();
    expect(screen.getByText('en')).toBeTruthy();
  });

  it('shows the only-approved note on members-only communities (guest viewer)', () => {
    renderPane(makeCommunity({ name: 'hive-234', context: { role: 'guest' } }));
    expect(screen.getByText(/Only approved members can post/i)).toBeTruthy();
    // Guests do not get the Edit Roles link.
    expect(screen.queryByText('Edit Roles')).toBeNull();
  });

  it('omits the note and shows Edit Roles for moderators', () => {
    renderPane(makeCommunity({ context: { role: 'mod' } }));
    expect(screen.queryByText(/Only approved members can post/i)).toBeNull();
    expect(screen.getByText('Edit Roles').getAttribute('href')).toBe(
      '/roles/hive-123'
    );
  });

  it('carries no subscribe button (legacy pane: subscribe lives in the banner)', () => {
    renderPane(makeCommunity());
    expect(screen.queryByText('Subscribe')).toBeNull();
    expect(screen.queryByText('Joined')).toBeNull();
  });

  it('opens the moderation log dialog from the pane Activity Log link', () => {
    const store = renderPane(makeCommunity());
    fireEvent.click(screen.getByRole('button', { name: 'Activity Log' }));
    expect(
      (store.getState() as { global: { dialogs: Record<string, { visible: boolean }> } })
        .global.dialogs.communityModerationLog?.visible
    ).toBe(true);
  });
});

describe('FeedSidebarWidgets community page hides the user rail (legacy !community)', () => {
  beforeEach(mockFetchNotices);
  afterEach(cleanup);

  it('hides SidebarNewUsers on community pages when logged out', () => {
    mockPathname = '/trending/hive-123';
    render(
      <Provider store={makeStore(false)}>
        <IntlWrapper>
          <CommunityProvider community={makeCommunity()}>
            <FeedSidebarWidgets />
          </CommunityProvider>
        </IntlWrapper>
      </Provider>
    );
    // Pane present, legacy !community rail absent.
    expect(screen.getByText('Leadership')).toBeTruthy();
    expect(screen.queryByText('New to Steemit?')).toBeNull();
    expect(screen.queryByText('Announcements')).toBeNull();
  });

  it('hides SidebarLinks on community pages when logged in', () => {
    mockPathname = '/trending/hive-123';
    render(
      <Provider store={makeStore(true)}>
        <IntlWrapper>
          <CommunityProvider community={makeCommunity()}>
            <FeedSidebarWidgets />
          </CommunityProvider>
        </IntlWrapper>
      </Provider>
    );
    expect(screen.getByText('Leadership')).toBeTruthy();
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
    expect(await screen.findByText('Some Community')).toBeTruthy();
  });
});
