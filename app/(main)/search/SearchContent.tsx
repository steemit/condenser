"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPathname } from "@/store/slices/globalSlice";
import {
  searchDispatch,
  searchPending,
  searchResult,
  searchReset,
  searchDepth,
} from "@/store/slices/searchSlice";
import PostsList from "@/components/cards/PostsList";
import { Post } from "@/lib/api/steem";
import { FeedLayout } from "@/components/layout/FeedLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Elasticsearch hit shape (minimal fields used for Post mapping). */
interface SearchHitSource {
  author?: string;
  permlink?: string;
  category?: string;
  title?: string;
  body?: string;
  created_at?: string;
  created?: string;
  net_rshares?: string;
  children?: number;
  active_votes?: Post["active_votes"];
  payout?: number | string;
  json_metadata?: Post["json_metadata"];
}

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

  useEffect(() => {
    dispatch(setPathname("/search"));
  }, [dispatch]);

  const performSearch = useCallback(
    async (
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
    },
    [dispatch]
  );

  useEffect(() => {
    if (query.trim()) {
      void performSearch(query, sort, depth);
    } else {
      dispatch(searchReset());
    }
  }, [query, sort, depth, dispatch, performSearch]);

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
  const posts: Post[] = searchState.result.map((item: SearchHitSource) => ({
    author: item.author || "",
    permlink: item.permlink || "",
    category: item.category || "",
    title: item.title || "",
    body: item.body || "",
    created: item.created_at || item.created || new Date().toISOString(),
    net_rshares: item.net_rshares || "0",
    children: item.children || 0,
    active_votes: item.active_votes || [],
    pending_payout_value:
      item.payout !== undefined ? String(item.payout) : "0",
    json_metadata: item.json_metadata || {},
  }));

  return (
    <FeedLayout centerClassName="md:max-w-4xl lg:max-w-6xl">
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground md:text-3xl">
        Search
      </h1>

      <div className="mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(localQuery);
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <Input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search posts, comments, and accounts..."
            className="min-h-10 flex-1"
          />
          <Button type="submit" className="shrink-0">
            Search
          </Button>
        </form>
      </div>

      {query.trim() ? (
        <>
          <div className="mb-4 flex flex-col flex-wrap gap-4 border-b border-border pb-4 md:flex-row md:items-center">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-sm text-muted-foreground">Search in:</span>
              <div className="flex flex-wrap gap-1">
                {[
                  { value: 0, label: "Posts" },
                  { value: 1, label: "Comments" },
                  { value: 2, label: "Accounts" },
                ].map((tab) => (
                  <Button
                    key={tab.value}
                    type="button"
                    size="sm"
                    variant={depth === tab.value ? "default" : "outline"}
                    onClick={() => handleDepthChange(tab.value)}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:ml-auto sm:flex-row sm:items-center">
              <label
                htmlFor="search-sort"
                className="text-sm text-muted-foreground"
              >
                Sort by:
              </label>
              <select
                id="search-sort"
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className={cn(
                  "h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none",
                  "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                )}
              >
                <option value="created_at">Newest</option>
                <option value="trending">Trending</option>
                <option value="votes">Most Votes</option>
                <option value="payout">Highest Payout</option>
              </select>
            </div>
          </div>

          {searchState.total_result > 0 ? (
            <p className="mb-4 text-sm text-muted-foreground">
              Found {searchState.total_result.toLocaleString()} results
            </p>
          ) : null}

          {searchState.pending && posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12">
              <p className="text-muted-foreground">Searching...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/40 p-8 text-center">
              <p className="text-muted-foreground">
                {query.trim()
                  ? "No results found."
                  : "Enter a search query to get started."}
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
      ) : (
        <div className="rounded-lg border border-border bg-muted/40 p-8 text-center">
          <p className="text-muted-foreground">
            Enter a search query above to find posts, comments, and accounts.
          </p>
        </div>
      )}
    </FeedLayout>
  );
}

