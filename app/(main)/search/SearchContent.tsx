"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  searchDispatch,
  searchPending,
  searchResult,
  searchReset,
  searchDepth,
  searchError,
} from "@/store/slices/searchSlice";
import PostsList from "@/components/cards/PostsList";
import { Post } from "@/lib/api/steem";
import { FeedLayout } from "@/components/layout/FeedLayout";
import { SearchIcon } from "lucide-react";
import Userpic from "@/components/elements/Userpic";
import { Button } from "@/components/ui/button";
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
 * Classify a failed /api/search response.
 *
 * The route answers non-2xx with {error, code?}: 502 SEARCH_BACKEND_ERROR
 * (ES returned an error), 503 SEARCH_UNAVAILABLE (ES unreachable/timeout),
 * 500 for anything unexpected. The structured detail goes to the log; the
 * returned semantic kind is localized at render time (searchSlice.error).
 */
async function searchErrorKind(response: Response): Promise<'unavailable' | 'failed'> {
  let unavailable = response.status === 502 || response.status === 503;
  try {
    const body = (await response.json()) as { error?: unknown; code?: unknown };
    console.error(
      "Search request failed:",
      response.status,
      body.code ?? body.error
    );
    if (body.code === "SEARCH_UNAVAILABLE" || body.code === "SEARCH_BACKEND_ERROR") {
      unavailable = true;
    }
  } catch {
    console.error("Search request failed:", response.status);
  }
  return unavailable ? "unavailable" : "failed";
}

/**
 * SearchContent component
 * Handles search functionality with useSearchParams
 */
export default function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const t = useTranslations();

  const query = searchParams.get('q') || '';
  const sortParam = searchParams.get('s') || 'created_at';

  const searchState = useAppSelector((state) => state.search);
  const [localQuery, setLocalQuery] = useState(query);
  const [sort, setSort] = useState(sortParam);
  const [depth, setDepth] = useState(0);

  const performSearch = useCallback(
    async (
      searchQuery: string,
      searchSort: string,
      searchDepth: number
    ) => {
    if (!searchQuery.trim()) return;

    dispatch(searchPending({ pending: true }));
    dispatch(searchDispatch());
    // A new search is not an append: drop the previous query's hits up
    // front, so a failure renders a pure error card instead of the new
    // query over the old query's results.
    dispatch(searchResult({ hits: { hits: [], total: { value: 0 } } }));

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
        // Surface the structured failure as an error state — not as an
        // empty result set ("nothing found" would mask the outage).
        dispatch(searchError({ kind: await searchErrorKind(response) }));
        return;
      }

      const results = await response.json();
      dispatch(searchResult({
        hits: results.hits || { hits: [], total: { value: 0 } },
      }));
    } catch (error) {
      console.error('Search error:', error);
      // Network-level failure — same "temporarily unavailable" state.
      dispatch(searchError({ kind: 'unavailable' }));
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
    // No explicit performSearch here: the effect above already re-runs on
    // the depth change — calling it directly as well would double-fetch,
    // and the two responses race for the final result.
  };

  // Redux search results are stored as untyped legacy payloads.
  const hits = searchState.result as SearchHitSource[];

  // Semantic error kind from the slice, localized here (searchSlice stores
  // no display strings).
  const errorMessage = searchState.error
    ? searchState.error === 'unavailable'
      ? t('search_jsx.search_unavailable')
      : t('search_jsx.search_failed')
    : null;

  // Offset pagination (audit N-09): the first query no longer opens an ES
  // scroll context, so responses carry no _scroll_id. "Load more" requests
  // the next page with a `from` offset instead; there are more pages as
  // long as loaded hits < the reported total.
  const hasMore = hits.length < searchState.total_result;

  const handleLoadMore = async (manual = false) => {
    if (!query.trim() || searchState.pending || !hasMore) return;
    // While an error is showing, only an explicit retry (the error card's
    // button) may fetch again. PostsList's scroll effect re-fires whenever
    // this callback's identity changes — including on the very re-render
    // that shows the error — so an unguarded automatic call would retry in
    // a loop for as long as the viewport sits at the bottom of the list.
    if (searchState.error != null && !manual) return;

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
          from: hits.length,
        }),
      });

      if (!response.ok) {
        // Keep the already-rendered pages; surface a retryable error below
        // the list instead of silently stopping pagination.
        dispatch(searchError({ kind: await searchErrorKind(response) }));
        return;
      }

      const results = await response.json();
      dispatch(searchResult({
        hits: {
          hits: results.hits?.hits || [],
          total: results.hits?.total || { value: 0 },
        },
        append: true,
      }));
    } catch (error) {
      console.error('Error loading more results:', error);
      dispatch(searchError({ kind: 'unavailable' }));
    } finally {
      dispatch(searchPending({ pending: false }));
    }
  };

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
            placeholder={t("g.search")}
            aria-label={t("g.search")}
            className="h-[42px] w-full border-none bg-transparent pr-10 text-[16px] text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            aria-label={t("g.submit_search")}
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
                { value: 0, label: t("g.posts") },
                { value: 1, label: t("g.comments") },
                { value: 2, label: t("search_jsx.accounts") },
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
                  {t("search_jsx.sort_by")}
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
                  <option value="created_at">{t("search_jsx.newest")}</option>
                  <option value="payout">{t("search_jsx.highest_payout")}</option>
                </select>
              </div>
            )}
          </div>

          {searchState.pending && posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12">
              <p className="text-muted-foreground">{t("search_jsx.searching")}</p>
            </div>
          ) : errorMessage && posts.length === 0 ? (
            // Structured API failure (502/503/500 from /api/search) — an
            // error state with a retry, not "nothing found".
            <SearchErrorCard
              message={errorMessage}
              onRetry={() => performSearch(query, sort, depth)}
              className="py-8"
            />
          ) : posts.length === 0 ? (
            <div className="rounded-[6px] border border-border bg-card px-6 py-8 text-center text-muted-foreground">
              {t("search_jsx.nothing_found")}
            </div>
          ) : depth === 2 ? (
            <>
              <SearchUserList hits={hits} />
              {errorMessage ? (
                // Same contract as the posts branch: a failure while hits
                // are displayed surfaces below the list instead of
                // rendering silently.
                <SearchErrorCard
                  message={errorMessage}
                  onRetry={() => handleLoadMore(true)}
                  className="mt-4"
                />
              ) : null}
            </>
          ) : (
            <>
              <PostsList
                posts={posts}
                loading={searchState.pending}
                // Wrapped so no argument can leak into handleLoadMore's
                // `manual` flag: PostsList currently calls onLoadMore()
                // bare, but if it ever forwarded the scroll event, a bare
                // handleLoadMore(event) would see a truthy `manual` and
                // bypass the error-state retry guard above.
                onLoadMore={hasMore ? () => handleLoadMore() : undefined}
              />
              {errorMessage ? (
                // Load-more failure: the list stays, pagination retries —
                // only via the button (handleLoadMore guards the
                // automatic PostsList re-fire while an error is showing).
                <SearchErrorCard
                  message={errorMessage}
                  onRetry={() => handleLoadMore(true)}
                  className="mt-4"
                />
              ) : null}
            </>
          )}
        </>
      ) : (
        <div className="rounded-[6px] border border-border bg-card px-6 py-8 text-center text-muted-foreground">
          {t("search_jsx.enter_query_hint")}
        </div>
      )}
    </FeedLayout>
  );
}

/**
 * Error card shared by every result branch: full-width when it replaces an
 * empty result list, compact (mt-4) when it sits below an already-rendered
 * list after a load-more failure. Retry is always explicit — the button.
 */
function SearchErrorCard({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry: () => void;
  className?: string;
}) {
  const t = useTranslations();
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-[6px] border border-border bg-card px-6 py-4 text-center",
        className
      )}
    >
      <p className="text-foreground">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        {t("g.try_again")}
      </Button>
    </div>
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

