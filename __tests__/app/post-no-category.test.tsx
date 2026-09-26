import { configureStore } from '@reduxjs/toolkit';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import userReducer from '@/store/slices/userSlice';
import { IntlWrapper } from '@/__tests__/helpers/i18n';

const pushMock = vi.fn();
const replaceMock = vi.fn();
// notFound() must throw a recognizable error so the page test can assert
// the missing-post path without a real Next.js runtime.
const NOT_FOUND_ERROR = Symbol('NEXT_NOT_FOUND');
const notFoundMock = vi.fn(() => {
  throw NOT_FOUND_ERROR;
});
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  usePathname: () => '/@alice/my-post',
  notFound: () => notFoundMock(),
}));

const fetchPostByPermlinkMock = vi.fn();
vi.mock('@/lib/api/steem', () => ({
  fetchPostByPermlink: (...args: unknown[]) => fetchPostByPermlinkMock(...args),
}));

const getDiscussionMock = vi.fn();
vi.mock('@/lib/steem/client', () => ({
  getDiscussion: (...args: unknown[]) => getDiscussionMock(...args),
}));

import PostNoCategoryClient from '@/app/(main)/post-no-category/[username]/[permlink]/PostNoCategoryClient';
import PostNoCategoryPage from '@/app/(main)/post-no-category/[username]/[permlink]/page';

function renderClient(props: React.ComponentProps<typeof PostNoCategoryClient>) {
  const store = configureStore({ reducer: { user: userReducer } });
  return render(
    <Provider store={store}>
      <IntlWrapper>
        <PostNoCategoryClient {...props} />
      </IntlWrapper>
    </Provider>
  );
}

describe('PostNoCategoryClient (missing post → 404, no fake /general/ URL)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(cleanup);

  it('redirects immediately when the server resolved the category (no client fetch)', async () => {
    renderClient({ category: 'steem', username: 'alice', permlink: 'my-post' });
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/steem/@alice/my-post');
    });
    expect(fetchPostByPermlinkMock).not.toHaveBeenCalled();
  });

  it('renders the 404 view when the fallback fetch finds no post', async () => {
    fetchPostByPermlinkMock.mockResolvedValue(null);
    renderClient({ username: 'alice', permlink: 'missing-post' });
    await waitFor(() => {
      expect(screen.getByText("Sorry! This page doesn't exist.")).toBeTruthy();
    });
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('renders the 404 view when the fallback fetch throws', async () => {
    fetchPostByPermlinkMock.mockRejectedValue(new Error('rpc down'));
    renderClient({ username: 'alice', permlink: 'my-post' });
    await waitFor(() => {
      expect(screen.getByText("Sorry! This page doesn't exist.")).toBeTruthy();
    });
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('redirects to the resolved category from the fallback fetch', async () => {
    fetchPostByPermlinkMock.mockResolvedValue({
      category: 'photography',
    });
    renderClient({ username: 'alice', permlink: 'my-post' });
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/photography/@alice/my-post');
    });
  });

  it('never redirects to a fabricated /general/ category', async () => {
    fetchPostByPermlinkMock.mockResolvedValue(null);
    renderClient({ username: 'alice', permlink: 'my-post' });
    await waitFor(() => {
      expect(screen.getByText("Sorry! This page doesn't exist.")).toBeTruthy();
    });
    expect(replaceMock.mock.calls.flat().join(' ')).not.toContain('/general/');
  });
});

function pageParams(username: string, permlink: string) {
  return Promise.resolve({ username, permlink });
}

describe('PostNoCategoryPage (server shell decides 404 vs redirect)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(cleanup);

  it('passes the resolved category to the client (no 404)', async () => {
    getDiscussionMock.mockResolvedValue({
      'alice/my-post': { category: 'steem', author: 'alice' },
    });
    const element = await PostNoCategoryPage({
      params: pageParams('@alice', 'my-post'),
    });
    render(
      <Provider store={configureStore({ reducer: { user: userReducer } })}>
        <IntlWrapper>{element}</IntlWrapper>
      </Provider>
    );
    expect(notFoundMock).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/steem/@alice/my-post');
    });
  });

  it('throws notFound() when the discussion has no such post', async () => {
    getDiscussionMock.mockResolvedValue({});
    await expect(
      PostNoCategoryPage({ params: pageParams('alice', 'missing-post') })
    ).rejects.toBe(NOT_FOUND_ERROR);
  });

  it('throws notFound() when the discussion is null', async () => {
    getDiscussionMock.mockResolvedValue(null);
    await expect(
      PostNoCategoryPage({ params: pageParams('alice', 'missing-post') })
    ).rejects.toBe(NOT_FOUND_ERROR);
  });

  it('falls back to the client fetch path when the RPC throws', async () => {
    getDiscussionMock.mockRejectedValue(new Error('rpc down'));
    const element = await PostNoCategoryPage({
      params: pageParams('alice', 'my-post'),
    });
    expect(notFoundMock).not.toHaveBeenCalled();
    // Client fallback engaged (Loading shell, fetch in flight).
    fetchPostByPermlinkMock.mockResolvedValue({ category: 'life' });
    render(
      <Provider store={configureStore({ reducer: { user: userReducer } })}>
        <IntlWrapper>{element}</IntlWrapper>
      </Provider>
    );
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/life/@alice/my-post');
    });
  });
});
