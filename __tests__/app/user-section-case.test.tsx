import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import userReducer, { setUser } from '@/store/slices/userSlice';
import globalReducer from '@/store/slices/globalSlice';
import appReducer from '@/store/slices/appSlice';
import { IntlWrapper } from '@/__tests__/helpers/i18n';

// proxy.ts matches PROFILE_SECTIONS case-insensitively but rewrites with the
// ORIGINAL casing, so /@alice/BLOG reaches the page as section='BLOG'.
// These tests pin that the component renders the matching section instead
// of the default empty state (legacy 301-normalized to lowercase first).
let mockParams: Record<string, string | string[]> = {};
vi.mock('next/navigation', () => ({
  useParams: () => mockParams,
  usePathname: () => '/@alice/blog',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

const fetchAccountPostsMock = vi.fn();
const fetchUserProfileMock = vi.fn();
vi.mock('@/lib/api/steem', () => ({
  fetchAccountPosts: (...args: unknown[]) => fetchAccountPostsMock(...args),
  fetchUserProfile: (...args: unknown[]) => fetchUserProfileMock(...args),
  // Imports pulled in by the rendered subtree.
  fetchUserSubscriptions: () => Promise.resolve([]),
  fetchAccount: () => Promise.resolve({ name: 'alice' }),
  fetchFollowers: () => Promise.resolve([]),
  fetchFollowing: () => Promise.resolve([]),
  fetchCommunities: () => Promise.resolve([]),
}));

vi.mock('@/lib/api/broadcast', () => ({
  broadcastAccountUpdate: vi.fn(),
  broadcastCustomJson: vi.fn(),
}));

import UserSectionClient from '@/app/(main)/user/[username]/[section]/UserSectionClient';

const PROFILE = {
  name: 'alice',
  post_count: 1,
  stats: { followers: 0, following: 0 },
  metadata: { profile: { name: 'Alice' } },
};

function makePost(permlink: string) {
  return {
    author: 'alice',
    permlink,
    category: 'steem',
    title: `Post ${permlink}`,
    body: '',
    created: '2024-01-01T00:00:00',
  };
}

function renderSection(section: string, loggedIn: boolean) {
  // The section parameter drives the mocked route params, so each test's
  // intent (which cased section it renders) lives in one place.
  mockParams = { username: 'alice', section };
  const store = configureStore({
    reducer: { app: appReducer, user: userReducer, global: globalReducer },
  });
  if (loggedIn) {
    store.dispatch(setUser({ username: 'alice' }));
  }
  return render(
    <Provider store={store}>
      <IntlWrapper>
        <UserSectionClient />
      </IntlWrapper>
    </Provider>
  );
}

describe('UserSectionClient section case normalization (legacy parity)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchUserProfileMock.mockResolvedValue(PROFILE);
  });

  it('uppercase BLOG renders the blog posts, not the empty state', async () => {
    fetchAccountPostsMock.mockResolvedValue([makePost('hello-world')]);

    renderSection('BLOG', false);

    // The posts branch must fire with the normalized order.
    await waitFor(() => {
      expect(fetchAccountPostsMock).toHaveBeenCalledWith(
        expect.objectContaining({ account: 'alice', order: 'blog' })
      );
    });
    await waitFor(() => {
      expect(screen.getByText('Post hello-world')).toBeTruthy();
    });
    expect(
      screen.queryByText("Looks like alice hasn't posted anything yet.")
    ).toBeNull();
    expect(
      screen.queryByText("@alice hasn't posted anything yet.")
    ).toBeNull();
  });

  it('uppercase SETTINGS renders the own-account settings editor', async () => {
    renderSection('SETTINGS', true);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Account Settings' })).toBeTruthy();
    });
    expect(fetchAccountPostsMock).not.toHaveBeenCalled();
    // Not the default posts empty state.
    expect(
      screen.queryByText("Looks like you haven't posted anything yet.")
    ).toBeNull();
  });

  it('mixed-case followers renders the followers list heading', async () => {
    renderSection('Followers', false);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Followers' })).toBeTruthy();
    });
    expect(fetchAccountPostsMock).not.toHaveBeenCalled();
  });
});
