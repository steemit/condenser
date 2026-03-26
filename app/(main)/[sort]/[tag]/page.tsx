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

export default function SortTagPage() {
  const dispatch = useAppDispatch();
  const { sort, tag } = useParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const loadingMoreRef = useRef(false);

  const sortString = (Array.isArray(sort) ? sort[0] : sort) ?? "";
  const tagString = (Array.isArray(tag) ? tag[0] : tag) ?? "";
  const isValidSort = VALID_SORTS.includes(sortString.toLowerCase());
  const showNotFound = !isValidSort;

  useEffect(() => {
    if (!isValidSort) return;
    dispatch(setPathname(`/${sortString}/${tagString}`));
  }, [dispatch, sortString, tagString, isValidSort]);

  const loadInitial = useCallback(async () => {
    if (!isValidSort) return;
    setLoading(true);
    setHasMore(true);
    try {
      const newPosts = await fetchRankedPosts({
        order: sortString as FetchPostsParams["order"],
        category: tagString,
        limit: 20,
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
  }, [sortString, tagString, isValidSort]);

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
        category: tagString,
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
      console.error("Error loading more tagged posts:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
      loadingMoreRef.current = false;
    }
  }, [isValidSort, loading, hasMore, posts, sortString, tagString]);

  const isHiveCommunity = tagString.startsWith("hive-");
  const feedTitle =
    tagString.toLowerCase() === "my"
      ? "My communities"
      : isHiveCommunity
        ? tagString
        : `#${tagString}`;

  if (showNotFound) {
    return <NotFound />;
  }

  return (
    <FeedLayout>
      <FeedListHeader
        title={feedTitle}
        sort={sortString}
        categoryTag={tagString}
        unmoderatedTagHint={
          !isHiveCommunity &&
          Boolean(tagString) &&
          tagString.toLowerCase() !== "my"
        }
      />
      {isHiveCommunity ? (
        <p className="-mt-2 mb-4 text-sm text-muted-foreground">
          Showing posts from the {tagString} community
        </p>
      ) : null}
      <PostsList
        posts={posts}
        loading={loading}
        onLoadMore={handleLoadMore}
        order={sortString}
        category={tagString}
      />
    </FeedLayout>
  );
}
