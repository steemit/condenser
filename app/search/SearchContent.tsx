'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPathname } from '@/store/slices/globalSlice';
import {
  searchDispatch,
  searchPending,
  searchResult,
  searchReset,
  searchDepth,
  searchSort,
} from '@/store/slices/searchSlice';
import PostsList from '@/components/cards/PostsList';
import { Post } from '@/lib/api/steem';

/**
 * SearchContent component
 * Handles search functionality with useSearchParams
 */
export default function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  
  const query = searchParams.get('q') || '';
  const sortParam = searchParams.get('s') || 'created_at';
  
  const searchState = useAppSelector((state) => state.search);
  const [localQuery, setLocalQuery] = useState(query);
  const [sort, setSort] = useState(sortParam);
  const [depth, setDepth] = useState(0);

  // Set pathname in global state
  useEffect(() => {
    dispatch(setPathname('/search'));
  }, [dispatch]);

  // Perform search when query changes
  useEffect(() => {
    if (query.trim()) {
      performSearch(query, sort, depth);
    } else {
      dispatch(searchReset());
    }
  }, [query, sort, depth, dispatch]);

  const performSearch = async (
    searchQuery: string,
    searchSort: string,
    searchDepth: number
  ) => {
    if (!searchQuery.trim()) return;

    dispatch(searchPending({ pending: true }));
    dispatch(searchDispatch());

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: searchQuery,
          s: searchSort,
          depth: searchDepth,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search request failed: ${response.statusText}`);
      }

      const results = await response.json();
      dispatch(searchResult({ 
        hits: results.hits || { hits: [], total: { value: 0 } },
        _scroll_id: results._scroll_id,
      }));
    } catch (error) {
      console.error('Search error:', error);
      // Dispatch empty results on error
      dispatch(searchResult({ hits: { hits: [], total: { value: 0 } } }));
    } finally {
      dispatch(searchPending({ pending: false }));
    }
  };

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&s=${sort}`);
    } else {
      router.push('/search');
      dispatch(searchReset());
    }
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}&s=${newSort}`);
    }
  };

  const handleDepthChange = (newDepth: number) => {
    setDepth(newDepth);
    dispatch(searchDepth(newDepth));
    if (query.trim()) {
      performSearch(query, sort, newDepth);
    }
  };

  const handleLoadMore = async () => {
    if (!query.trim() || searchState.pending || !searchState.scrollId) return;

    try {
      dispatch(searchPending({ pending: true }));
      
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          s: sort,
          depth: depth,
          scroll_id: searchState.scrollId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search request failed: ${response.statusText}`);
      }

      const results = await response.json();
      dispatch(searchResult({ 
        hits: {
          hits: results.hits?.hits || [],
          total: results.hits?.total || { value: 0 },
        },
        _scroll_id: results._scroll_id,
        append: true,
      }));
    } catch (error) {
      console.error('Error loading more results:', error);
    } finally {
      dispatch(searchPending({ pending: false }));
    }
  };

  // Convert search results to Post format
  const posts: Post[] = searchState.result.map((item: any) => ({
    author: item.author || '',
    permlink: item.permlink || '',
    category: item.category || '',
    title: item.title || '',
    body: item.body || '',
    created: item.created_at || item.created || new Date().toISOString(),
    net_rshares: item.net_rshares || '0',
    children: item.children || 0,
    active_votes: item.active_votes || [],
    pending_payout_value: item.payout?.toString() || '0',
    json_metadata: item.json_metadata || {},
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Search</h1>

      {/* Search input */}
      <div className="mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(localQuery);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search posts, comments, and accounts..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Search tabs */}
      {query.trim() && (
        <>
          <div className="mb-4 flex items-center gap-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Search in:</label>
              <div className="flex gap-1">
                {[
                  { value: 0, label: 'Posts' },
                  { value: 1, label: 'Comments' },
                  { value: 2, label: 'Accounts' },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => handleDepthChange(tab.value)}
                    className={`px-3 py-1 text-sm rounded-t-lg transition-colors ${
                      depth === tab.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="created_at">Newest</option>
                <option value="trending">Trending</option>
                <option value="votes">Most Votes</option>
                <option value="payout">Highest Payout</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          {searchState.total_result > 0 && (
            <p className="text-sm text-gray-600 mb-4">
              Found {searchState.total_result.toLocaleString()} results
            </p>
          )}

          {/* Search results */}
          {searchState.pending && posts.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-gray-500">Searching...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600">
                {query.trim() ? 'No results found.' : 'Enter a search query to get started.'}
              </p>
            </div>
          ) : (
            <PostsList
              posts={posts}
              loading={searchState.pending}
              onLoadMore={
                searchState.scrollId ? handleLoadMore : undefined
              }
            />
          )}
        </>
      )}

      {!query.trim() && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">
            Enter a search query above to find posts, comments, and accounts.
          </p>
        </div>
      )}
    </div>
  );
}

