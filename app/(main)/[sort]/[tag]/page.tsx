"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import {
  fetchRankedPosts,
  fetchCommunity,
  type FetchPostsParams,
  type Post,
} from "@/lib/api/steem";
import { SORT_TYPES } from "@/lib/routes";
import PostsList from "@/components/cards/PostsList";
import NotFound from "@/components/NotFound";
import { FeedLayout } from "@/components/layout/FeedLayout";
import { FeedListHeader } from "@/components/layout/FeedListHeader";
import CommunityBanner from "@/components/elements/CommunityBanner";
import { CommunityProvider } from "@/components/providers/CommunityProvider";
import { ifHive } from "@/lib/community";
import type { Community } from "@/types/steem";

export default function SortTagPage() {
  const { sort, tag } = useParams();
  const t = useTranslations();
  const observer = useAppSelector((s) => s.user.current?.username);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const loadingMoreRef = useRef(false);
  // bridge.get_community payload for hive-* tags (legacy CommunityBanner /
  // CommunityPane state). Null for plain tags and load failures — community
  // chrome simply does not render, like legacy's absent global.community.
  const [community, setCommunity] = useState<Community | null>(null);

  const sortString = (Array.isArray(sort) ? sort[0] : sort) ?? "";
  const tagString = (Array.isArray(tag) ? tag[0] : tag) ?? "";
  const isValidSort = SORT_TYPES.includes(sortString.toLowerCase());
  const showNotFound = !isValidSort;

  // Normalize sort/tag for API calls: proxy.ts lowercases only for validation
  // and passes the raw-cased segments through, so `/Trending/My` would query a
  // bogus sort/tag. Legacy lowercases the tag before querying
  // (PostsIndex.jsx mapStateToProps). Display values stay as-is.
  const order = sortString.toLowerCase() as FetchPostsParams["order"];
  const fetchCategory = tagString.toLowerCase();
  // Community detection uses the lowercased tag (proxy passes raw casing
  // through; legacy lowercased the category before ifHive too).
  const communityName = ifHive(fetchCategory);

  const loadInitial = useCallback(async () => {
    if (!isValidSort) return;
    setLoading(true);
    setHasMore(true);
    try {
      const newPosts = await fetchRankedPosts({
        order,
        category: fetchCategory,
        limit: 20,
        observer,
      });
      setPosts(newPosts);
      setHasMore(newPosts.length >= 20);
    } catch (error) {
      console.error(
        `Error loading ${sortString} posts for tag ${tagString}:`,
        error
      );
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [order, fetchCategory, sortString, tagString, isValidSort, observer]);

  useEffect(() => {
    if (!isValidSort) {
      setLoading(false);
      return;
    }
    void loadInitial();
  }, [loadInitial, isValidSort]);

  // Community payload for hive-* tags, fetched once here and shared with the
  // sidebar pane via CommunityProvider (cachedFetch does not dedupe
  // concurrent cold requests, so widgets must not refetch on their own).
  useEffect(() => {
    if (!communityName) {
      setCommunity(null);
      return;
    }
    let cancelled = false;
    fetchCommunity(communityName, observer).then((data) => {
      if (!cancelled) setCommunity(data);
    });
    return () => {
      cancelled = true;
    };
  }, [communityName, observer]);

  // Legacy renders the community title as the page <title> (SSR page_title).
  // Restore the previous title on unmount so it does not leak across routes.
  useEffect(() => {
    if (!community?.title) return;
    const previous = document.title;
    document.title = community.title;
    return () => {
      document.title = previous;
    };
  }, [community?.title]);

  const handleLoadMore = useCallback(async () => {
    if (!isValidSort || loading || !hasMore || posts.length === 0) return;
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoading(true);
    try {
      const last = posts[posts.length - 1];
      const morePosts = await fetchRankedPosts({
        order,
        category: fetchCategory,
        start_author: last.author,
        start_permlink: last.permlink,
        limit: 20,
        observer,
      });
      const slice =
        morePosts[0]?.author === last.author &&
        morePosts[0]?.permlink === last.permlink
          ? morePosts.slice(1)
          : morePosts;
      if (slice.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...slice]);
        setHasMore(slice.length >= 19);
      }
    } catch (error) {
      console.error("Error loading more tagged posts:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
      loadingMoreRef.current = false;
    }
  }, [isValidSort, loading, hasMore, posts, order, fetchCategory, observer]);

  const isMy = tagString.toLowerCase() === "my";
  const showMyCallout = isMy && !loading && (posts.length === 0 || !observer);

  if (showNotFound) {
    return <NotFound />;
  }

  return (
    <CommunityProvider community={community}>
      <FeedLayout>
        {/* Legacy renders CommunityBanner inside the articles column, above
            the sort header (PostsIndex.jsx) — not full-bleed. */}
        {community && <CommunityBanner community={community} />}
        <FeedListHeader
          sort={sortString}
          categoryTag={tagString}
          title={isMy ? t("g.my_communities") : undefined}
          hideSortSelector={isMy && posts.length === 0}
          unmoderatedTagHint={
            !communityName && Boolean(tagString) && tagString.toLowerCase() !== "my"
          }
        />
        {showMyCallout ? (
          // Legacy Callout with noCommunitiesText (PostsIndex.jsx): the
          // whole list is replaced while the feed is empty / logged out.
          <div className="my-8 rounded-[6px] border border-border bg-card px-6 py-8 text-center text-muted-foreground">
            <p className="mb-2">{t("posts_index.no_joined_communities")}</p>
            <Link
              href="/communities"
              className="text-[1.1rem] text-accent-foreground hover:underline"
            >
              {t("g.explore_communities")}
            </Link>
          </div>
        ) : (
          <PostsList
            posts={posts}
            loading={loading}
            onLoadMore={handleLoadMore}
            // Lowercased order: PostsList keys its empty-state copy on order
            // ("payout"/"muted"/"feed"), which a raw-cased sort ("/Payout/x")
            // would miss (proxy.ts preserves the original casing in rewrites).
            order={order}
            category={tagString}
            // Legacy hides the per-card "in #tag" prefix on community feeds
            // (PostsIndex hideCategory={!!community}).
            hideCategory={Boolean(communityName)}
          />
        )}
      </FeedLayout>
    </CommunityProvider>
  );
}
