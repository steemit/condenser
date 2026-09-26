import { configureStore } from '@reduxjs/toolkit';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import userReducer, { setUser } from '@/store/slices/userSlice';
import globalReducer from '@/store/slices/globalSlice';
import { IntlWrapper } from '@/__tests__/helpers/i18n';

let mockParams: Record<string, string | string[]> = {};
vi.mock('next/navigation', () => ({
  useParams: () => mockParams,
  usePathname: () => '/trending/my',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

const fetchRankedPostsMock = vi.fn();
vi.mock('@/lib/api/steem', () => ({
  fetchRankedPosts: (...args: unknown[]) => fetchRankedPostsMock(...args),
  // FeedSidebarWidgets (right rail) also imports this.
  fetchCommunities: () => Promise.resolve([]),
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
  const store = configureStore({
    reducer: { user: userReducer, global: globalReducer },
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
});
