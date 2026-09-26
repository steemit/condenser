import { configureStore } from '@reduxjs/toolkit';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import userReducer from '@/store/slices/userSlice';
import globalReducer from '@/store/slices/globalSlice';
import { IntlWrapper } from '@/__tests__/helpers/i18n';

const fetchRankedPostsMock = vi.fn();
vi.mock('@/lib/api/steem', () => ({
  fetchRankedPosts: (...args: unknown[]) => fetchRankedPostsMock(...args),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/trending',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

import { SortFeed } from '@/components/feed/SortFeed';

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

function renderFeed(sort: string) {
  const store = configureStore({
    reducer: { user: userReducer, global: globalReducer },
  });
  return render(
    <Provider store={store}>
      <IntlWrapper>
        <SortFeed sort={sort} />
      </IntlWrapper>
    </Provider>
  );
}

describe('SortFeed (shared /[sort] + home feed body)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true, json: async () => ({ data: [] }) }))
    );
  });
  afterEach(cleanup);

  it('serves /trending (the old static page route) through the shared component', async () => {
    fetchRankedPostsMock.mockResolvedValue([makePost('alice', 'p1')]);
    renderFeed('trending');
    expect(await screen.findByText('Post by alice')).toBeTruthy();
    expect(fetchRankedPostsMock).toHaveBeenCalledWith(
      expect.objectContaining({ order: 'trending' })
    );
  });

  it('normalizes cased sort segments to the lowercase API order', async () => {
    fetchRankedPostsMock.mockResolvedValue([]);
    renderFeed('Trending');
    await waitFor(() => {
      expect(fetchRankedPostsMock).toHaveBeenCalledWith(
        expect.objectContaining({ order: 'trending' })
      );
    });
  });

  it('renders the 404 view for invalid sorts', () => {
    renderFeed('notasort');
    expect(
      screen.getByText("Sorry! This page doesn't exist.")
    ).toBeTruthy();
    expect(fetchRankedPostsMock).not.toHaveBeenCalled();
  });
});
