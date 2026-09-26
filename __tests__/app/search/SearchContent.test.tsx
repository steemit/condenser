import { configureStore } from '@reduxjs/toolkit';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import searchReducer, {
  searchError,
} from '@/store/slices/searchSlice';
import appReducer from '@/store/slices/appSlice';
import userReducer from '@/store/slices/userSlice';
import globalReducer from '@/store/slices/globalSlice';
import { IntlWrapper } from '@/__tests__/helpers/i18n';

// Hoisted so the hoisted vi.mock factory below can close over it; tests may
// swap the params (query switch) to drive the mount effect.
const { searchParamsMock } = vi.hoisted(() => ({
  searchParamsMock: vi.fn(() => new URLSearchParams('q=steem&s=created_at')),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/search',
  useSearchParams: () => searchParamsMock(),
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
  const wrap = () => (
    <Provider store={store}>
      <IntlWrapper>
        <SearchContent />
      </IntlWrapper>
    </Provider>
  );
  const view = render(wrap());
  return { store, rerenderSearch: () => view.rerender(wrap()) };
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
    // The hoisted params mock survives restoreAllMocks (it is a vi.fn, not
    // a spy) — undo any per-test mockReturnValue swap so each test starts
    // from the default URL.
    searchParamsMock.mockReturnValue(
      new URLSearchParams('q=steem&s=created_at')
    );
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

  it('does not auto-retry a failed load-more (review follow-up)', async () => {
    // First page succeeds with more pages available; the first load-more
    // fails. PostsList's mount-time scroll check auto-fires that load-more
    // (jsdom geometry pins the list at the viewport bottom), and the error
    // re-render re-fires the effect with a fresh onLoadMore identity — the
    // error guard must keep that automatic re-fire from looping requests.
    const fetchMock = stubSearchFetch(
      jsonResponse(200, {
        hits: { hits: [ES_HIT], total: { value: 5 } },
      }),
      jsonResponse(503, {
        error: 'Search temporarily unavailable',
        code: 'SEARCH_UNAVAILABLE',
      }),
      jsonResponse(200, {
        hits: {
          hits: [
            {
              _index: 'hive_posts',
              _source: {
                author: 'bob',
                permlink: 'b-post',
                title: 'B post',
                created_at: '2026-01-02T00:00:00',
              },
            },
          ],
          total: { value: 5 },
        },
      })
    );
    vi.stubGlobal('fetch', fetchMock);
    renderSearch();

    expect(await screen.findByText('A post')).toBeInTheDocument();
    expect(
      await screen.findByText(/Search is temporarily unavailable/i)
    ).toBeInTheDocument();

    const searchCalls = () =>
      fetchMock.mock.calls.filter(([url]) => String(url) === '/api/search');
    expect(searchCalls()).toHaveLength(2);

    // Let any (guarded) automatic re-fire have its chance.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    expect(searchCalls()).toHaveLength(2);

    // The explicit retry button is the only path that fetches again.
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    await waitFor(() => {
      expect(screen.getByText('B post')).toBeInTheDocument();
    });
    expect(
      screen.queryByText(/Search is temporarily unavailable/i)
    ).not.toBeInTheDocument();
    expect(searchCalls()).toHaveLength(3);
  });

  it('clears the previous query\'s results when the new query fails (review follow-up)', async () => {
    const fetchMock = stubSearchFetch(
      jsonResponse(200, {
        hits: { hits: [ES_HIT], total: { value: 1 } },
      }),
      jsonResponse(503, {
        error: 'Search temporarily unavailable',
        code: 'SEARCH_UNAVAILABLE',
      })
    );
    vi.stubGlobal('fetch', fetchMock);
    const { rerenderSearch } = renderSearch();

    expect(await screen.findByText('A post')).toBeInTheDocument();

    // New query in the URL — the mount effect re-fires performSearch.
    searchParamsMock.mockReturnValue(
      new URLSearchParams('q=other&s=created_at')
    );
    rerenderSearch();

    expect(
      await screen.findByText(/Search is temporarily unavailable/i)
    ).toBeInTheDocument();
    // The failed new query must not render the old query's hits.
    expect(screen.queryByText('A post')).not.toBeInTheDocument();
  });

  it('surfaces an error below the account list at depth 2 (review follow-up)', async () => {
    // Mount (depth 0) answers empty; switching to the Accounts tab
    // re-searches at depth 2 with one account hit and more pages.
    const ES_ACCOUNT_HIT = {
      _index: 'hive_accounts',
      _source: { name: 'alice', about: 'Steem user' },
    };
    const fetchMock = stubSearchFetch(
      jsonResponse(200, { hits: { hits: [], total: { value: 0 } } }),
      jsonResponse(200, {
        hits: { hits: [ES_ACCOUNT_HIT], total: { value: 5 } },
      })
    );
    vi.stubGlobal('fetch', fetchMock);
    const { store } = renderSearch();

    fireEvent.click(screen.getByRole('button', { name: 'Accounts' }));

    expect(await screen.findByText('@alice')).toBeInTheDocument();

    // A failure arriving while account hits are displayed must render the
    // shared error card below the list, not disappear silently.
    act(() => {
      store.dispatch(searchError({ kind: 'unavailable' }));
    });
    expect(
      await screen.findByText(/Search is temporarily unavailable/i)
    ).toBeInTheDocument();
    expect(screen.getByText('@alice')).toBeInTheDocument();

    // The explicit retry fetches the next accounts page.
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    await waitFor(() => {
      const calls = fetchMock.mock.calls.filter(
        ([url]) => String(url) === '/api/search'
      );
      expect(calls).toHaveLength(3);
      expect(JSON.parse(String(calls[2][1]?.body))).toMatchObject({
        q: 'steem',
        depth: 2,
        from: 1,
      });
    });
  });
});
