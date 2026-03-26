"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setPathname } from "@/store/slices/globalSlice";
import { fetchRankedPosts, Post } from "@/lib/api/steem";
import PostsList from "@/components/cards/PostsList";
import { FeedLayout } from "@/components/layout/FeedLayout";
import { FeedListHeader } from "@/components/layout/FeedListHeader";

/**
 * Trending posts — Legacy PostsIndex with order trending.
 */
export default function TrendingPage() {
  const dispatch = useAppDispatch();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    dispatch(setPathname("/trending"));
  }, [dispatch]);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const fetchedPosts = await fetchRankedPosts({
          order: "trending",
          limit: 20,
        });
        setPosts(fetchedPosts);
        setHasMore(fetchedPosts.length >= 20);
      } catch (error) {
        console.error("Error loading trending posts:", error);
      } finally {
        setLoading(false);
      }
    };
    void loadPosts();
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMore || posts.length === 0) return;
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoading(true);
    try {
      const lastPost = posts[posts.length - 1];
      const morePosts = await fetchRankedPosts({
        order: "trending",
        start_author: lastPost.author,
        start_permlink: lastPost.permlink,
        limit: 20,
      });
      const newPosts =
        morePosts[0]?.author === lastPost.author &&
        morePosts[0]?.permlink === lastPost.permlink
          ? morePosts.slice(1)
          : morePosts;
      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
        setHasMore(newPosts.length >= 19);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
      loadingMoreRef.current = false;
    }
  }, [loading, hasMore, posts]);

  return (
    <FeedLayout>
      <FeedListHeader title="All posts" sort="trending" />
      <PostsList
        posts={posts}
        loading={loading}
        onLoadMore={handleLoadMore}
        category=""
        order="trending"
      />
    </FeedLayout>
  );
}
