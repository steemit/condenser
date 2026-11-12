import { configureStore } from '@reduxjs/toolkit';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import userReducer from '@/store/slices/userSlice';
import globalReducer from '@/store/slices/globalSlice';
import { IntlWrapper } from '@/__tests__/helpers/i18n';
import type { Community } from '@/types/steem';

const fetchUserProfileMock = vi.fn();
vi.mock('@/lib/api/steem', () => ({
  fetchUserProfile: (...args: unknown[]) => fetchUserProfileMock(...args),
}));

import CommunityBanner from '@/components/elements/CommunityBanner';

function makeCommunity(overrides: Partial<Community> = {}): Community {
  return {
    name: 'hive-166405',
    title: 'Steem POD Team',
    about: 'STEEM POD TEAM Weekly Report',
    subscribers: 9144,
    sum_pending: 890,
    num_authors: 70,
    context: { role: 'guest', subscribed: false },
    ...overrides,
  };
}

function renderBanner(community: Community) {
  const store = configureStore({
    reducer: { user: userReducer, global: globalReducer },
  });
  const utils = render(
    <Provider store={store}>
      <IntlWrapper>
        <CommunityBanner community={community} />
      </IntlWrapper>
    </Provider>
  );
  return { store, ...utils };
}

describe('CommunityBanner (legacy CommunityBanner.jsx parity)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no profile cover fallback.
    fetchUserProfileMock.mockResolvedValue(null);
    // jsdom default viewport is 1024px wide → legacy's comma formatting.
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1024,
      writable: true,
    });
  });
  afterEach(cleanup);

  it('renders title, about and the three community stats with commas', async () => {
    const { container } = renderBanner(makeCommunity());
    expect(screen.getByRole('heading', { name: 'Steem POD Team' })).toBeTruthy();
    expect(screen.getByText('STEEM POD TEAM Weekly Report')).toBeTruthy();
    // 9,144 subscribers / $890 pending rewards / 70 active posters
    expect(screen.getByText(/9,144/)).toBeTruthy();
    expect(screen.getByText(/\$890/)).toBeTruthy();
    expect(screen.getByText(/70/)).toBeTruthy();

    // hive-1* ids allow guests to post (Role.canPost journal/council quirk),
    // so an anonymous visitor still sees Subscribe + New Post (steemit.com
    // behaviour).
    expect(screen.getByRole('link', { name: /New Post/i })).toBeTruthy();
    await waitFor(() => {
      expect(container.querySelector('.CommunityBanner')).toBeTruthy();
    });
  });

  it('hides New Post for members-only communities viewed as guest', () => {
    renderBanner(makeCommunity({ name: 'hive-234567' }));
    expect(screen.queryByRole('link', { name: /New Post/i })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Steem POD Team' })).toBeTruthy();
  });

  it('applies the settings cover image (first-party via the proxy, #3976)', async () => {
    const { container } = renderBanner(
      makeCommunity({
        settings: { cover_url: 'https://steemitimages.com/cover.jpg' },
      })
    );
    const banner = container.querySelector('.CommunityBanner') as HTMLElement;
    await waitFor(() => {
      // First-party images are re-encoded through the /p proxy prefix;
      // third-party URLs would pass through unchanged (legacy #3976).
      expect(banner.style.backgroundImage).toContain('steemitimages.com/p/');
    });
    // A settings cover must NOT trigger the profile fallback fetch.
    expect(fetchUserProfileMock).not.toHaveBeenCalled();
  });

  it('rejects unsafe cover URLs and falls back to the profile cover', async () => {
    renderBanner(
      makeCommunity({ settings: { cover_url: 'javascript:alert(1)' } })
    );
    // safeCoverImageUrl rejects the style-sink URL; legacy then falls back to
    // the community account's profile cover image.
    await waitFor(() => {
      expect(fetchUserProfileMock).toHaveBeenCalledWith('hive-166405');
    });
  });

  it('formats counts compactly below the 760px snap width', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 500,
      writable: true,
    });
    // ≥10000 collapses to the k form (legacy formatNumber).
    renderBanner(makeCommunity({ subscribers: 91440 }));
    expect(screen.getByText(/91\.4k/)).toBeTruthy();
  });

  it('shows mod-only edit links and the nsfw badge for moderators', () => {
    renderBanner(
      makeCommunity({
        context: { role: 'mod', subscribed: false },
        is_nsfw: true,
      })
    );
    expect(screen.getByText('Edit:', { exact: false })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Roles' }).getAttribute('href')).toBe(
      '/roles/hive-166405'
    );
    expect(screen.getByText('nsfw')).toBeTruthy();
  });

  it('opens the subscribers dialog when the subscriber count is clicked', () => {
    const { store } = renderBanner(makeCommunity());
    // The stat button is labelled by its aria-label (legacy
    // "View recent subscribers"), which overrides its text content.
    fireEvent.click(screen.getByRole('button', { name: 'subscribers' }));
    expect(
      (store.getState() as { global: { dialogs: Record<string, { visible: boolean }> } })
        .global.dialogs.communitySubscribers?.visible
    ).toBe(true);
  });

  it('opens the moderation log dialog from the Activity Log link', () => {
    const { store } = renderBanner(makeCommunity());
    fireEvent.click(screen.getByRole('button', { name: 'Activity Log' }));
    expect(
      (store.getState() as { global: { dialogs: Record<string, { visible: boolean }> } })
        .global.dialogs.communityModerationLog?.visible
    ).toBe(true);
  });
});
