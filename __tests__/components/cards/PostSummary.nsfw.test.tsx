import { configureStore } from '@reduxjs/toolkit';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, describe, expect, it, vi } from 'vitest';

import appReducer, { setUserPreferences } from '@/store/slices/appSlice';
import userReducer, { setUser } from '@/store/slices/userSlice';
import type { NsfwPref } from '@/lib/nsfw';
import { IntlWrapper } from '@/__tests__/helpers/i18n';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/trending',
}));

// Voting/Reblog need wider stores; irrelevant to the nsfw assertions.
vi.mock('@/components/elements/Voting', () => ({
  default: () => <div data-testid="voting" />,
}));
vi.mock('@/components/elements/Reblog', () => ({
  default: () => <div data-testid="reblog" />,
}));

import PostSummary from '@/components/cards/PostSummary';

function makePost(tags: string[], category = 'steem') {
  return {
    author: 'alice',
    permlink: 'a-post',
    category,
    title: 'Hello world',
    body: 'some body text',
    created: '2024-01-01T00:00:00',
    json_metadata: { tags },
  };
}

function renderCard(
  post: ReturnType<typeof makePost>,
  nsfwPref: NsfwPref,
  loggedIn = false
) {
  const store = configureStore({
    reducer: { app: appReducer, user: userReducer },
  });
  if (loggedIn) store.dispatch(setUser({ username: 'alice' }));
  // Set the preference after store creation (merging reducer).
  store.dispatch(setUserPreferences({ nsfwPref }));
  return render(
    <Provider store={store}>
      <IntlWrapper>
        <ul>
          <PostSummary post={post} />
        </ul>
      </IntlWrapper>
    </Provider>
  );
}

describe('PostSummary nsfwPref consumption (legacy PostSummary.jsx parity)', () => {
  afterEach(cleanup);

  it("nsfwPref 'hide' drops the card entirely (legacy returns null)", () => {
    const { container } = renderCard(makePost(['nsfw']), 'hide');
    expect(container.querySelector('li')).toBeNull();
    expect(screen.queryByText('Hello world')).toBeNull();
  });

  it("nsfwPref 'warn' shows the placeholder until revealed", () => {
    renderCard(makePost(['nsfw']), 'warn');
    // Placeholder copy, not the card content.
    expect(screen.getByText('Reveal this post')).toBeTruthy();
    expect(screen.queryByText('Hello world')).toBeNull();

    fireEvent.click(screen.getByText('Reveal this post'));
    // Revealed: full card with the nsfw title flag.
    expect(screen.getByText('Hello world')).toBeTruthy();
    expect(screen.getByText('nsfw', { exact: true })).toBeTruthy();
  });

  it("nsfwPref 'show' renders the full card directly with the nsfw flag", () => {
    renderCard(makePost(['nsfw']), 'show');
    expect(screen.getByText('Hello world')).toBeTruthy();
    expect(screen.queryByText('Reveal this post')).toBeNull();
    expect(screen.getByText('nsfw', { exact: true })).toBeTruthy();
  });

  it('non-nsfw posts are never gated regardless of the preference', () => {
    for (const pref of ['hide', 'warn', 'show'] as const) {
      const { unmount } = renderCard(makePost(['photography']), pref);
      expect(screen.getByText('Hello world')).toBeTruthy();
      unmount();
    }
  });

  it('warn placeholder links logged-in users to their settings (legacy branch)', () => {
    renderCard(makePost(['nsfw']), 'warn', true);
    const settingsLink = screen.getByText('display preferences').closest('a');
    expect(settingsLink?.getAttribute('href')).toBe('/@alice/settings');
  });

  it('warn placeholder offers signup to anonymous visitors (legacy branch)', () => {
    renderCard(makePost(['nsfw']), 'warn', false);
    const signup = screen.getByText('create an account').closest('a');
    expect(signup?.getAttribute('href')).toBe('https://signup.steemit.com');
  });

  it('treats the nsfw category as nsfw (legacy normalizeTags)', () => {
    const { container } = renderCard(makePost(['photo'], 'nsfw'), 'hide');
    expect(container.querySelector('li')).toBeNull();
  });
});
