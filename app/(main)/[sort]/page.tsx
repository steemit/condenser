"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setPathname } from "@/store/slices/globalSlice";
import {
  fetchRankedPosts,
  type FetchPostsParams,
  type Post,
} from "@/lib/api/steem";
import PostsList from "@/components/cards/PostsList";
import NotFound from "@/components/NotFound";
import { FeedLayout } from "@/components/layout/FeedLayout";
import { FeedListHeader } from "@/components/layout/FeedListHeader";

const VALID_SORTS = [
  "hot",
  "trending",
  "promoted",
  "payout",
  "payout_comments",
  "muted",
  "created",
];

export default function SortPage() {
  const dispatch = useAppDispatch();
  const { sort } = useParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const loadingMoreRef = useRef(false);

  const sortString = (Array.isArray(sort) ? sort[0] : sort) ?? "";
  const isValidSort = VALID_SORTS.includes(sortString.toLowerCase());
  const showNotFound =
    !isValidSort || sortString.toLowerCase() === "404";

  useEffect(() => {
    if (!isValidSort) return;
    dispatch(setPathname(`/${sortString}`));
  }, [dispatch, sortString, isValidSort]);

  const loadInitial = useCallback(async () => {
    if (!isValidSort) return;
    setLoading(true);
    setHasMore(true);
    try {
      const newPosts = await fetchRankedPosts({
        order: sortString as FetchPostsParams["order"],
        limit: 20,
      });
      setPosts(newPosts);
      setHasMore(newPosts.length >= 20);
    } catch (error) {
      console.error(`Error loading ${sortString} posts:`, error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [sortString, isValidSort]);

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
        order: sortString as FetchPostsParams["order"],
        start_author: last.author,
        start_permlink: last.permlink,
        limit: 20,
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
  }, [isValidSort, loading, hasMore, posts, sortString]);

  if (showNotFound) {
    return <NotFound />;
  }

  return (
    <FeedLayout>
      <FeedListHeader title="All posts" sort={sortString} />
      <PostsList
        posts={posts}
        loading={loading}
        onLoadMore={handleLoadMore}
        order={sortString}
      />
    </FeedLayout>
  );
}
