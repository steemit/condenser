import { configureStore } from '@reduxjs/toolkit';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, describe, expect, it, vi } from 'vitest';

import appReducer, { setUserPreferences } from '@/store/slices/appSlice';
import userReducer from '@/store/slices/userSlice';
import type { NsfwPref } from '@/lib/nsfw';
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
  nsfwPref: NsfwPref
) {
  const store = configureStore({
    reducer: { app: appReducer, user: userReducer },
  });
  store.dispatch(setUserPreferences({ nsfwPref }));
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
    for (const pref of ['hide', 'warn', 'show'] as const) {
      const { unmount } = renderFull(makePost(['travel']), pref);
      expect(screen.getByTestId('markdown-viewer').textContent).toBe(
        'the actual body'
      );
      unmount();
    }
  });
});

describe('PostFull nsfw reveal resets when the post changes', () => {
  afterEach(cleanup);

  function makeKeyedPost(author: string, permlink: string, body: string) {
    return {
      author,
      permlink,
      category: 'steem',
      title: `Post ${permlink}`,
      body,
      created: '2024-01-01T00:00:00',
      json_metadata: { tags: ['nsfw'] },
    };
  }

  function renderTree(post: ReturnType<typeof makeKeyedPost>) {
    const store = configureStore({
      reducer: { app: appReducer, user: userReducer },
    });
    store.dispatch(setUserPreferences({ nsfwPref: 'warn' }));
    const renderUI = (p: ReturnType<typeof makeKeyedPost>) => (
      <Provider store={store}>
        <IntlWrapper>
          <PostFull post={p} />
        </IntlWrapper>
      </Provider>
    );
    // rerender() needs a fresh element per call — an identical element
    // reference lets React bail out without re-rendering.
    return { ...render(renderUI(post)), renderUI };
  }

  it('a revealed post A does not leak the reveal into post B', async () => {
    // Retrospective review finding: a parent that swaps the post prop
    // without remounting (client-side navigation) kept revealNsfw=true, so
    // post B's nsfw body rendered without the interstitial.
    const { rerender, renderUI } = renderTree(
      makeKeyedPost('alice', 'nsfw-a', 'body of A')
    );

    expect(screen.getByText('Reveal this post')).toBeTruthy();
    fireEvent.click(screen.getByText('Reveal this post'));
    expect(screen.getByTestId('markdown-viewer').textContent).toBe('body of A');

    // Navigate to post B: the interstitial must be back.
    rerender(renderUI(makeKeyedPost('bob', 'nsfw-b', 'body of B')));
    expect(screen.getByText('Reveal this post')).toBeTruthy();
    expect(screen.queryByTestId('markdown-viewer')).toBeNull();

    // B itself can still be revealed.
    fireEvent.click(screen.getByText('Reveal this post'));
    expect(screen.getByTestId('markdown-viewer').textContent).toBe('body of B');
  });

  it('keeps the reveal across refetches of the same post (same author/permlink, new object)', async () => {
    const { rerender, renderUI } = renderTree(
      makeKeyedPost('alice', 'nsfw-a', 'body of A')
    );
    fireEvent.click(screen.getByText('Reveal this post'));
    expect(screen.getByTestId('markdown-viewer').textContent).toBe('body of A');

    // A refetch produces a new object for the SAME post — the reveal must
    // not reset (the gate would flash back over an already-revealed body).
    rerender(renderUI({ ...makeKeyedPost('alice', 'nsfw-a', 'body of A v2') }));
    expect(screen.queryByText('Reveal this post')).toBeNull();
    expect(screen.getByTestId('markdown-viewer').textContent).toBe(
      'body of A v2'
    );
  });
});
