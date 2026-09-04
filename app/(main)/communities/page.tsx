"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { FeedLayout } from "@/components/layout/FeedLayout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPathname } from "@/store/slices/globalSlice";
import {
  fetchCommunities,
  type CommunitySubscription,
} from "@/lib/api/steem";
import { getSteemitWalletBaseUrl } from "@/lib/steemitWallet";
import SubscribeButton from "@/components/elements/SubscribeButton";
import { Skeleton } from "@/components/ui/skeleton";

const SORT_OPTIONS = [
  { value: "rank", labelKey: "g.rank" },
  { value: "subs", labelKey: "communities_jsx.subscribers" },
  { value: "new", labelKey: "g.new" },
];

/**
 * Communities explore page — legacy CommunitiesIndex: search + sort + table
 * of communities with a subscribe button per row.
 */
export default function CommunitiesPage() {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const username = useAppSelector((s) => s.user.current?.username);
  const walletBase = getSteemitWalletBaseUrl();

  const [communities, setCommunities] = useState<CommunitySubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("rank");

  useEffect(() => {
    dispatch(setPathname("/communities"));
  }, [dispatch]);

  const performSearch = useCallback(
    async (q: string, order: string) => {
      setLoading(true);
      try {
        const data = await fetchCommunities({
          observer: username,
          query: q || undefined,
          sort: order,
          limit: 100,
        });
        setCommunities(data);
      } catch (error) {
        console.error("Error fetching communities:", error);
      } finally {
        setLoading(false);
      }
    },
    [username]
  );

  useEffect(() => {
    void performSearch("", sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  return (
    <FeedLayout>
      {/* Legacy CommunitiesIndex is itself a c-sidebar__module card
          (white bg, border, 1.5em 2em padding, 4em side padding ≥1025px). */}
      <div className="CommunitiesIndex c-sidebar__module mb-4 rounded-[6px] border border-border bg-card px-8 py-6 min-[1025px]:px-16">
        {/* Sticky under the 64px site header so search stays reachable
            while scrolling; opaque background masks the list below. */}
        <div className="articles__header sticky top-16 z-30 flex items-center gap-4 bg-card py-2">
          <form
            className="relative w-1/3 min-w-[160px]"
            onSubmit={(e) => {
              e.preventDefault();
              void performSearch(query, sort);
            }}
          >
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("g.search")}
              aria-label={t("communities_jsx.search_communities")}
              className="h-[42px] w-full rounded-full border border-[#06D6A9] bg-transparent pl-4 pr-10 text-[16px] text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              aria-label={t("g.submit_search")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground"
            >
              <SearchIcon className="size-5" strokeWidth={1.2} />
            </button>
          </form>
          <div className="ml-auto flex items-center gap-4">
            {username && (
              <a
                href={`${walletBase}/@${username}/communities`}
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap text-sm text-accent-foreground"
              >
                {t("g.create_community")}
              </a>
            )}
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                void performSearch(query, e.target.value);
              }}
              aria-label={t("communities_jsx.sort_communities")}
              className="h-10 w-[300px] max-w-[33vw] cursor-pointer border border-input bg-card px-2 text-sm text-foreground"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {t(o.labelKey)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          // Skeleton rows matching the community table shape (title + about
          // + stats + subscribe button), same approach as the feed skeletons.
          <div className="mt-4 w-full" aria-busy="true">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-border py-2"
              >
                <div className="w-[600px] max-w-full pr-[6%]">
                  <Skeleton className="h-6 w-2/5" />
                  <Skeleton className="mt-2 h-4 w-3/4" />
                  <Skeleton className="mt-2 h-3 w-1/3" />
                </div>
                <Skeleton className="h-8 w-24 shrink-0" />
              </div>
            ))}
          </div>
        ) : communities.length === 0 ? (
          <div className="rounded-[6px] border border-border bg-card px-6 py-8 text-center text-muted-foreground">
            {t("communities_jsx.nothing_found")}
          </div>
        ) : (
          <table className="mt-4 w-full">
            <tbody>
              {communities.map((comm) => (
                <tr key={comm.name} className="border-b border-border">
                  <th className="w-[600px] py-2 pr-[6%] text-left font-normal">
                    <Link
                      className="text-[1.3em] font-normal text-foreground hover:text-accent-foreground"
                      href={`/trending/${comm.name}`}
                    >
                      {comm.title}
                    </Link>
                    {comm.context?.role && comm.context.role !== "guest" && (
                      <span className="user_role mx-1 text-[0.8em] uppercase text-gray-500">
                        {comm.context.role}
                      </span>
                    )}
                    <br />
                    <span className="text-foreground">{comm.about}</span>
                    <small className="block text-[#999]">
                      {t("communities_jsx.stats", {
                        subscribers: comm.subscribers ?? 0,
                        posters: comm.num_authors ?? 0,
                        posts: comm.num_pending ?? 0,
                      })}
                    </small>
                  </th>
                  <td className="w-px whitespace-nowrap py-2 text-right align-middle">
                    <SubscribeButton
                      community={comm.name}
                      subscribed={Boolean(comm.context?.subscribed)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </FeedLayout>
  );
}
