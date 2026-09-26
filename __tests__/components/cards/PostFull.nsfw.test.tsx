import { configureStore } from '@reduxjs/toolkit';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, describe, expect, it, vi } from 'vitest';

import appReducer from '@/store/slices/appSlice';
import userReducer from '@/store/slices/userSlice';
import { IntlWrapper } from '@/__tests__/helpers/i18n';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/steem/@alice/a-post',
}));

// Voting/Reblog/MarkdownViewer pull in wider machinery; the gate decision
// is what we assert, so stub them with observable output.
vi.mock('@/components/elements/Voting', () => ({
  default: () => <div data-testid="voting" />,
}));
vi.mock('@/components/elements/Reblog', () => ({
  default: () => <div data-testid="reblog" />,
}));
vi.mock('@/components/elements/MarkdownViewer', () => ({
  default: ({ text }: { text: string }) => (
    <div data-testid="markdown-viewer">{text}</div>
  ),
}));

import PostFull from '@/components/cards/PostFull';

function makePost(tags: string[], category = 'steem') {
  return {
    author: 'alice',
    permlink: 'a-post',
    category,
    title: 'Hello world',
    body: 'the actual body',
    created: '2024-01-01T00:00:00',
    json_metadata: { tags },
  };
}

function renderFull(
  post: ReturnType<typeof makePost>,
  nsfwPref: string
) {
  const store = configureStore({
    reducer: { app: appReducer, user: userReducer },
  });
  store.dispatch({
    type: 'app/setUserPreferences',
    payload: { nsfwPref },
  });
  return render(
    <Provider store={store}>
      <IntlWrapper>
        <PostFull post={post} />
      </IntlWrapper>
    </Provider>
  );
}

describe('PostFull nsfw gate (extension beyond legacy: post-page interstitial)', () => {
  afterEach(cleanup);

  it("nsfwPref 'show' renders the body directly", () => {
    renderFull(makePost(['nsfw']), 'show');
    expect(screen.getByTestId('markdown-viewer').textContent).toBe(
      'the actual body'
    );
    expect(screen.queryByText('Reveal this post')).toBeNull();
  });

  it("nsfwPref 'warn' hides the body behind a reveal interstitial", () => {
    renderFull(makePost(['nsfw']), 'warn');
    // Header stays visible; the body is gated.
    expect(screen.getByText('Hello world')).toBeTruthy();
    expect(screen.queryByTestId('markdown-viewer')).toBeNull();
    expect(screen.getByText('Reveal this post')).toBeTruthy();

    fireEvent.click(screen.getByText('Reveal this post'));
    expect(screen.getByTestId('markdown-viewer').textContent).toBe(
      'the actual body'
    );
  });

  it("nsfwPref 'hide' also gates the body (direct links stay reachable)", () => {
    renderFull(makePost(['nsfw']), 'hide');
    expect(screen.queryByTestId('markdown-viewer')).toBeNull();
    fireEvent.click(screen.getByText('Reveal this post'));
    expect(screen.getByTestId('markdown-viewer')).toBeTruthy();
  });

  it('non-nsfw posts render the body untouched for every preference', () => {
    for (const pref of ['hide', 'warn', 'show']) {
      const { unmount } = renderFull(makePost(['travel']), pref);
      expect(screen.getByTestId('markdown-viewer').textContent).toBe(
        'the actual body'
      );
      unmount();
    }
  });
});
