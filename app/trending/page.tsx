'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setPathname } from '@/store/slices/globalSlice';
import { fetchRankedPosts, Post } from '@/lib/api/steem';
import PostsList from '@/components/cards/PostsList';

/**
 * Trending posts page
 * This is the main feed page showing trending posts
 * Equivalent to old route: PostsIndex with params ['trending']
 */
export default function TrendingPage() {
  const dispatch = useAppDispatch();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // Set pathname in global state
  useEffect(() => {
    dispatch(setPathname('/trending'));
  }, [dispatch]);

  // Fetch initial trending posts
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const fetchedPosts = await fetchRankedPosts({
          order: 'trending',
          limit: 20,
        });
        setPosts(fetchedPosts);
        setHasMore(fetchedPosts.length >= 20);
      } catch (error) {
        console.error('Error loading trending posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Load more posts for infinite scroll
  const handleLoadMore = async () => {
    if (loading || !hasMore || posts.length === 0) return;

    setLoading(true);
    try {
      const lastPost = posts[posts.length - 1];
      const morePosts = await fetchRankedPosts({
        order: 'trending',
        start_author: lastPost.author,
        start_permlink: lastPost.permlink,
        limit: 20,
      });

      if (morePosts.length > 0) {
        // Remove the first post if it's the same as the last post (pagination overlap)
        const newPosts = morePosts[0]?.author === lastPost.author && 
                        morePosts[0]?.permlink === lastPost.permlink 
                        ? morePosts.slice(1) 
                        : morePosts;
        
        setPosts(prev => [...prev, ...newPosts]);
        setHasMore(newPosts.length >= 19); // Account for potential overlap removal
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Trending Posts</h1>
      <PostsList
        posts={posts}
        loading={loading}
        onLoadMore={handleLoadMore}
        category=""
        order="trending"
      />
    </div>
  );
}

