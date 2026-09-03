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
import { SearchIcon } from "lucide-react";
import Userpic from "@/components/elements/Userpic";
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

  // Redux search results are stored as untyped legacy payloads.
  const hits = searchState.result as SearchHitSource[];

  // Convert search results to Post format
  const posts: Post[] = hits.map((item) => ({
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
      {/* legacy: the in-page search box only shows ≤765px (desktop uses the
          header search) */}
      <div className="mb-6 min-[766px]:hidden">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(localQuery);
          }}
          className="relative"
        >
          <input
            type="search"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search"
            className="h-[42px] w-full border-none bg-transparent pr-10 text-[16px] text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            aria-label="Submit search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground"
          >
            <SearchIcon className="size-5" strokeWidth={1.2} />
          </button>
        </form>
      </div>

      {query.trim() ? (
        <>
          {/* legacy SearchTabs: module-bg bar, wide gaps, #00FFC8 active */}
          <div className="mb-4 flex flex-wrap items-center gap-y-2 border-b border-border pb-2">
            <div className="flex items-center">
              {[
                { value: 0, label: "Posts" },
                { value: 1, label: "Comments" },
                { value: 2, label: "Accounts" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleDepthChange(tab.value)}
                  className={cn(
                    "mr-[1rem] border-b-4 px-1 py-1 text-sm transition-colors min-[457px]:mr-[2.8rem]",
                    depth === tab.value
                      ? "border-[#00FFC8] text-[#00FFC8]"
                      : "border-transparent text-foreground hover:text-accent-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* legacy: sort only Newest / Highest Payout, hidden for Accounts */}
            {depth !== 2 && (
              <div className="ml-auto flex items-center gap-2">
                <label
                  htmlFor="search-sort"
                  className="text-sm text-muted-foreground"
                >
                  Sort by:
                </label>
                <select
                  id="search-sort"
                  value={sort === "payout" ? "payout" : "created_at"}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className={cn(
                    "h-9 border border-input bg-background px-3 text-sm text-foreground outline-none",
                    "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                  )}
                >
                  <option value="created_at">Newest</option>
                  <option value="payout">Highest Payout</option>
                </select>
              </div>
            )}
          </div>

          {searchState.pending && posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12">
              <p className="text-muted-foreground">Searching...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-[6px] border border-border bg-card px-6 py-8 text-center text-muted-foreground">
              Nothing was found.
            </div>
          ) : depth === 2 ? (
            <SearchUserList hits={hits} />
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
        <div className="rounded-[6px] border border-border bg-card px-6 py-8 text-center text-muted-foreground">
          Enter a search query above to find posts, comments, and accounts.
        </div>
      )}
    </FeedLayout>
  );
}

/** Legacy SearchUserList: one row per account (avatar + name + about). */
function SearchUserList({ hits }: { hits: SearchHitSource[] }) {
  return (
    <ul>
      {hits.map((hit, i) => {
        const account = (hit as { name?: string }).name || hit.author || "";
        if (!account) return null;
        const about = (hit as { about?: string }).about;
        return (
          <li
            key={`${account}-${i}`}
            className="flex items-center gap-3 border-b border-border py-2"
          >
            <a href={`/@${account}`} className="shrink-0">
              <Userpic account={account} className="!size-10" />
            </a>
            <div className="min-w-0">
              <a
                href={`/@${account}`}
                className="font-bold text-foreground hover:text-accent-foreground"
              >
                @{account}
              </a>
              {about && (
                <p className="truncate text-sm text-muted-foreground">{about}</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

