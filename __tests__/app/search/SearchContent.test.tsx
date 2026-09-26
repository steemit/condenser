import { configureStore } from '@reduxjs/toolkit';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import searchReducer from '@/store/slices/searchSlice';
import appReducer from '@/store/slices/appSlice';
import userReducer from '@/store/slices/userSlice';
import globalReducer from '@/store/slices/globalSlice';
import { IntlWrapper } from '@/__tests__/helpers/i18n';

vi.mock('next/navigation', () => ({
  usePathname: () => '/search',
  useSearchParams: () => new URLSearchParams('q=steem&s=created_at'),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

import SearchContent from '@/app/(main)/search/SearchContent';

function renderSearch() {
  // FeedLayout pulls in the navigation rails and sidebar widgets, which
  // read user/app/global and fire their own fetches.
  const store = configureStore({
    reducer: {
      search: searchReducer,
      app: appReducer,
      user: userReducer,
      global: globalReducer,
    },
  });
  return {
    store,
    ...render(
      <Provider store={store}>
        <IntlWrapper>
          <SearchContent />
        </IntlWrapper>
      </Provider>
    ),
  };
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/**
 * Stub global fetch, queueing responses for POST /api/search only. The
 * sidebar modules mounted by FeedLayout also fetch (notices, market) —
 * those must not consume the queued search responses, so they get a
 * benign 200 instead.
 */
function stubSearchFetch(...searchResponses: Response[]) {
  return vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url === '/api/search' && init?.method === 'POST') {
      const next = searchResponses.shift();
      if (next) return Promise.resolve(next);
      return Promise.resolve(
        jsonResponse(200, { hits: { hits: [], total: { value: 0 } } })
      );
    }
    return Promise.resolve(jsonResponse(200, { data: [] }));
  });
}

const ES_HIT = {
  _index: 'hive_posts',
  _source: {
    author: 'alice',
    permlink: 'a-post',
    category: 'steem',
    title: 'A post',
    body: '',
    created_at: '2026-01-01T00:00:00',
    net_rshares: '1',
    children: 0,
  },
};

describe('SearchContent error state', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // No vitest globals → RTL auto-cleanup does not register; do it
    // explicitly (same convention as SortFeed.test.tsx).
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders the unavailable error with a retry on 503, not "nothing found"', async () => {
    const fetchMock = stubSearchFetch(
      jsonResponse(503, {
        error: 'Search temporarily unavailable',
        code: 'SEARCH_UNAVAILABLE',
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    renderSearch();

    expect(
      await screen.findByText(/Search is temporarily unavailable/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Try Again' })
    ).toBeInTheDocument();
    // The failure must not masquerade as an empty result set.
    expect(screen.queryByText('Nothing was found.')).not.toBeInTheDocument();
  });

  it('retry refetches and the error clears on success', async () => {
    const fetchMock = stubSearchFetch(
      jsonResponse(502, {
        error: 'Search backend error',
        code: 'SEARCH_BACKEND_ERROR',
      }),
      jsonResponse(200, {
        hits: { hits: [ES_HIT], total: { value: 1 } },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    renderSearch();

    const retry = await screen.findByRole('button', { name: 'Try Again' });
    fireEvent.click(retry);

    await waitFor(() => {
      expect(screen.getByText('A post')).toBeInTheDocument();
    });
    expect(
      screen.queryByText(/Search is temporarily unavailable/i)
    ).not.toBeInTheDocument();
    expect(
      fetchMock.mock.calls.filter(([url]) => String(url) === '/api/search')
    ).toHaveLength(2);
  });

  it('shows the unavailable error on a network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === '/api/search' && init?.method === 'POST') {
          return Promise.reject(new TypeError('fetch failed'));
        }
        return Promise.resolve(jsonResponse(200, { data: [] }));
      })
    );

    renderSearch();

    expect(
      await screen.findByText(/Search is temporarily unavailable/i)
    ).toBeInTheDocument();
  });
});
