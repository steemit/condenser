import { configureStore } from '@reduxjs/toolkit';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import userReducer, { setUser } from '@/store/slices/userSlice';
import globalReducer from '@/store/slices/globalSlice';
import appReducer from '@/store/slices/appSlice';
import { IntlWrapper } from '@/__tests__/helpers/i18n';

let mockParams: Record<string, string | string[]> = {};
vi.mock('next/navigation', () => ({
  useParams: () => mockParams,
  usePathname: () => '/trending/my',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

const fetchRankedPostsMock = vi.fn();
const fetchCommunityMock = vi.fn();
vi.mock('@/lib/api/steem', () => ({
  fetchRankedPosts: (...args: unknown[]) => fetchRankedPostsMock(...args),
  fetchCommunity: (...args: unknown[]) => fetchCommunityMock(...args),
  // FeedSidebarWidgets (right rail) + CommunityBanner (cover fallback).
  fetchCommunities: () => Promise.resolve([]),
  fetchUserProfile: () => Promise.resolve(null),
}));

import SortTagPage from '@/app/(main)/[sort]/[tag]/page';

function makePost(author: string, permlink: string) {
  return {
    author,
    permlink,
    category: 'steem',
    title: `Post by ${author}`,
    body: '',
    created: '2024-01-01T00:00:00',
  };
}

function renderPage(loggedIn: boolean) {
  // PostSummary reads app.user_preferences (nsfwPref) — include the slice.
  const store = configureStore({
    reducer: { app: appReducer, user: userReducer, global: globalReducer },
  });
  if (loggedIn) {
    store.dispatch(setUser({ username: 'alice', posting_authority: true }));
  }
  return render(
    <Provider store={store}>
      <IntlWrapper>
        <SortTagPage />
      </IntlWrapper>
    </Provider>
  );
}

describe('/[sort]/[tag] page — legacy tag=my special cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams = { sort: 'trending', tag: 'my' };
    // Non-community tags must not query the community route.
    fetchCommunityMock.mockResolvedValue(null);
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true, json: async () => ({ data: [] }) }))
    );
  });
  afterEach(cleanup);

  it('shows the no-communities callout when the logged-in feed is empty', async () => {
    fetchRankedPostsMock.mockResolvedValue([]);
    renderPage(true);
    await waitFor(() => {
      expect(
        screen.getByText("You haven't joined any active communities yet!")
      ).toBeTruthy();
    });
    expect(
      screen.getByRole('link', { name: 'Explore Communities' }).getAttribute('href')
    ).toBe('/communities');
    // Legacy hides SortOrder while the my feed is empty.
    expect(screen.queryByLabelText('Sort')).toBeNull();
  });

  it('titles the my feed "My Communities" (legacy g.my_communities)', async () => {
    fetchRankedPostsMock.mockResolvedValue([makePost('bob', 'p1')]);
    renderPage(true);
    await waitFor(() => {
      expect(screen.getByText('Post by bob')).toBeTruthy();
    });
    expect(screen.getByRole('heading', { name: 'My Communities' })).toBeTruthy();
    // Non-empty my feed keeps the sort selector (legacy parity).
    expect(screen.queryByLabelText('Sort')).toBeTruthy();
  });

  it('always shows the callout for logged-out visitors, even if posts came back', async () => {
    fetchRankedPostsMock.mockResolvedValue([makePost('bob', 'p1')]);
    renderPage(false);
    await waitFor(() => {
      expect(
        screen.getByText("You haven't joined any active communities yet!")
      ).toBeTruthy();
    });
    expect(screen.queryByText('Post by bob')).toBeNull();
    // posts.size > 0 keeps the selector visible (legacy condition:
    // hide only when category==='my' && !posts.size).
    expect(screen.queryByLabelText('Sort')).toBeTruthy();
  });

  it('regular tags keep the generic empty state and no title', async () => {
    mockParams = { sort: 'trending', tag: 'bitcoin' };
    fetchRankedPostsMock.mockResolvedValue([]);
    renderPage(false);
    await waitFor(() => {
      expect(screen.getByText('No posts in #bitcoin yet!')).toBeTruthy();
    });
    expect(screen.queryByText('My Communities')).toBeNull();
    expect(screen.queryByText("You haven't joined any active communities yet!")).toBeNull();
  });

  it('uppercase sort passes a lowercased order so payout empty copy matches', async () => {
    // proxy.ts validates SORT_TYPES case-insensitively but rewrites with the
    // original casing, so /Payout/bitcoin arrives as sort='Payout'.
    // PostsList keys its empty-state copy on the order prop — a raw-cased
    // 'Payout' falls through to the generic "No posts found." copy.
    mockParams = { sort: 'Payout', tag: 'bitcoin' };
    fetchRankedPostsMock.mockResolvedValue([]);
    renderPage(false);
    await waitFor(() => {
      expect(
        screen.getByText(/No pending posts found\./i)
      ).toBeTruthy();
    });
    expect(screen.queryByText('No posts found.')).toBeNull();
    // The API query itself also uses the normalized order.
    expect(fetchRankedPostsMock).toHaveBeenCalledWith(
      expect.objectContaining({ order: 'payout', category: 'bitcoin' })
    );
  });
});

describe('/[sort]/[tag] page — community banner (legacy CommunityBanner)', () => {
  const COMMUNITY = {
    name: 'hive-166405',
    title: 'Steem POD Team',
    about: 'STEEM POD TEAM Weekly Report',
    subscribers: 9144,
    sum_pending: 890,
    num_authors: 70,
    context: { role: 'guest', subscribed: false },
  };

  function makeCommunityPost() {
    return {
      author: 'bob',
      permlink: 'p1',
      category: 'hive-166405',
      community_title: 'Steem POD Team',
      title: 'Post by bob',
      body: '',
      created: '2024-01-01T00:00:00',
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockParams = { sort: 'created', tag: 'hive-166405' };
    fetchCommunityMock.mockResolvedValue(COMMUNITY);
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true, headers: { get: () => null }, json: async () => ({ data: [] }) }))
    );
  });
  afterEach(cleanup);

  it('fetches the community once (shared with the pane via context) and renders the banner', async () => {
    fetchRankedPostsMock.mockResolvedValue([makeCommunityPost()]);
    renderPage(false);

    expect(await screen.findByRole('heading', { name: 'Steem POD Team' })).toBeTruthy();
    await waitFor(() => {
      expect(fetchCommunityMock).toHaveBeenCalledTimes(1);
      expect(fetchCommunityMock).toHaveBeenCalledWith('hive-166405', undefined);
    });
  });

  it('sets document.title to the community title (legacy SSR page_title)', async () => {
    fetchRankedPostsMock.mockResolvedValue([]);
    renderPage(false);
    await waitFor(() => {
      expect(document.title).toBe('Steem POD Team');
    });
  });

  it('hides the per-card "in #tag" prefix on community feeds (legacy hideCategory)', async () => {
    fetchRankedPostsMock.mockResolvedValue([makeCommunityPost()]);
    renderPage(false);

    await screen.findByText('Post by bob');
    // hideCategory={!!community}: the whole "in #hive-166405 •" prefix is gone.
    expect(screen.queryByRole('link', { name: '#hive-166405' })).toBeNull();
    expect(screen.queryByText(/in /)).toBeNull();
  });

  it('renders the community empty state with the literal "community" word', async () => {
    fetchRankedPostsMock.mockResolvedValue([]);
    renderPage(false);
    await waitFor(() => {
      expect(screen.getByText('No posts in community yet!')).toBeTruthy();
    });
  });

  it('renders no community chrome for plain tags', async () => {
    mockParams = { sort: 'created', tag: 'bitcoin' };
    fetchRankedPostsMock.mockResolvedValue([]);
    renderPage(false);
    await waitFor(() => {
      expect(screen.getByText('No posts in #bitcoin yet!')).toBeTruthy();
    });
    expect(fetchCommunityMock).not.toHaveBeenCalled();
    expect(screen.queryByRole('heading', { name: 'Steem POD Team' })).toBeNull();
  });
});
