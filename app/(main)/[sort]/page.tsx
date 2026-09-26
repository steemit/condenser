"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
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

export default function SortPage() {
  const { sort } = useParams();
  const observer = useAppSelector((s) => s.user.current?.username);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const loadingMoreRef = useRef(false);

  const sortString = (Array.isArray(sort) ? sort[0] : sort) ?? "";
  const isValidSort = SORT_TYPES.includes(sortString.toLowerCase());
  const showNotFound =
    !isValidSort || sortString.toLowerCase() === "404";

  // Normalize the sort for API calls; proxy.ts lowercases only for validation
  // and passes the raw-cased segment through, so `/Trending` must still query
  // `trending`. Display values stay as-is.
  const order = sortString.toLowerCase() as FetchPostsParams["order"];

  const loadInitial = useCallback(async () => {
    if (!isValidSort) return;
    setLoading(true);
    setHasMore(true);
    try {
      const newPosts = await fetchRankedPosts({
        order,
        limit: 20,
        observer,
      });
      setPosts(newPosts);
      setHasMore(newPosts.length >= 20);
    } catch (error) {
      console.error(`Error loading ${sortString} posts:`, error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [order, sortString, isValidSort, observer]);

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
      console.error(`Error loading more ${sortString} posts:`, error);
      setHasMore(false);
    } finally {
      setLoading(false);
      loadingMoreRef.current = false;
    }
  }, [isValidSort, loading, hasMore, posts, order, sortString, observer]);

  if (showNotFound) {
    return <NotFound />;
  }

  return (
    <FeedLayout>
      <FeedListHeader sort={sortString} />
      <PostsList
        posts={posts}
        loading={loading}
        onLoadMore={handleLoadMore}
        order={sortString}
      />
    </FeedLayout>
  );
}
