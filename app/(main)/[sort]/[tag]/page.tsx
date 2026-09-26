"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import {
  fetchRankedPosts,
  type FetchPostsParams,
  type Post,
} from "@/lib/api/steem";
import { SORT_TYPES } from "@/lib/routes";
import PostsList from "@/components/cards/PostsList";
import NotFound from "@/components/NotFound";
import { FeedLayout } from "@/components/layout/FeedLayout";
import { FeedListHeader } from "@/components/layout/FeedListHeader";

export default function SortTagPage() {
  const { sort, tag } = useParams();
  const t = useTranslations();
  const observer = useAppSelector((s) => s.user.current?.username);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const loadingMoreRef = useRef(false);

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

  const isHiveCommunity = tagString.startsWith("hive-");
  // Legacy /<sort>/my ("My Subscriptions") special cases (PostsIndex.jsx):
  // a dedicated empty state, a "My Communities" title, the sort selector
  // hidden while empty, and logged-out visitors always get the empty
  // state — "my" is meaningless without an account.
  const isMy = tagString.toLowerCase() === "my";
  const showMyCallout = isMy && !loading && (posts.length === 0 || !observer);

  if (showNotFound) {
    return <NotFound />;
  }

  return (
    <FeedLayout>
      <FeedListHeader
        sort={sortString}
        categoryTag={tagString}
        title={isMy ? t("g.my_communities") : undefined}
        hideSortSelector={isMy && posts.length === 0}
        unmoderatedTagHint={
          !isHiveCommunity &&
          Boolean(tagString) &&
          tagString.toLowerCase() !== "my"
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
          order={sortString}
          category={tagString}
        />
      )}
    </FeedLayout>
  );
}
