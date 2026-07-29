"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { SearchIcon } from "lucide-react";

import { FeedLayout } from "@/components/layout/FeedLayout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPathname } from "@/store/slices/globalSlice";
import {
  fetchCommunities,
  type CommunitySubscription,
} from "@/lib/api/steem";
import { getSteemitWalletBaseUrl } from "@/lib/steemitWallet";
import SubscribeButton from "@/components/elements/SubscribeButton";
import LoadingIndicator from "@/components/elements/LoadingIndicator";

const SORT_OPTIONS = [
  { value: "rank", label: "Rank" },
  { value: "subs", label: "Subscribers" },
  { value: "new", label: "New" },
];

/**
 * Communities explore page — legacy CommunitiesIndex: search + sort + table
 * of communities with a subscribe button per row.
 */
export default function CommunitiesPage() {
  const dispatch = useAppDispatch();
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
      <div className="CommunitiesIndex c-sidebar__module">
        {username && (
          <div className="float-right">
            <a
              href={`${walletBase}/@${username}/communities`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-foreground"
            >
              Create a community
            </a>
          </div>
        )}

        <h4 className="mb-2 font-bold text-foreground">
          Communities: Find your people
        </h4>

        <div className="articles__header flex items-center gap-4">
          <form
            className="relative flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              void performSearch(query, sort);
            }}
          >
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search communities"
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
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              void performSearch(query, e.target.value);
            }}
            aria-label="Sort communities"
            className="h-10 max-w-[300px] cursor-pointer border border-input bg-card px-2 text-sm text-foreground"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <hr className="my-4 border-border" />

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingIndicator type="circle" />
          </div>
        ) : communities.length === 0 ? (
          <div className="rounded-[6px] border border-border bg-card px-6 py-8 text-center text-muted-foreground">
            Nothing was found.
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
                      {comm.subscribers} subscribers &bull; {comm.num_authors}{" "}
                      posters &bull; {comm.num_pending} posts
                    </small>
                  </th>
                  <td className="w-[40px] py-2 text-center align-middle">
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
