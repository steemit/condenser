'use client';

import { useEffect, useRef, useState } from 'react';
import { Post } from '@/lib/api/steem';

interface PostsListProps {
  posts: Post[];
  loading?: boolean;
  onLoadMore?: () => void;
  category?: string;
  order?: string;
}

/**
 * PostsList component
 * Displays a list of posts with infinite scroll support
 * Migrated from legacy/src/app/components/cards/PostsList.jsx
 */
export default function PostsList({
  posts,
  loading = false,
  onLoadMore,
  category,
  order,
}: PostsListProps) {
  const [thumbSize, setThumbSize] = useState<'desktop' | 'mobile'>('desktop');
  const listRef = useRef<HTMLDivElement>(null);
  const scrollListenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Detect mobile mode
    const mq = window.matchMedia('screen and (max-width: 39.9375em)');
    const handleResize = () => {
      setThumbSize(mq.matches ? 'mobile' : 'desktop');
    };
    
    mq.addEventListener('change', handleResize);
    handleResize();

    // Infinite scroll listener
    const handleScroll = () => {
      if (!listRef.current || !onLoadMore) return;

      const el = listRef.current;
      const scrollTop =
        window.pageYOffset !== undefined
          ? window.pageYOffset
          : (document.documentElement || document.body.parentNode || document.body).scrollTop;

      const threshold = 10;
      const distanceToBottom =
        el.offsetTop + el.offsetHeight - scrollTop - window.innerHeight;

      if (distanceToBottom < threshold && posts.length > 0) {
        onLoadMore();
      }
    };

    // Debounce scroll listener
    let scrollTimeout: NodeJS.Timeout;
    scrollListenerRef.current = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 150);
    };

    window.addEventListener('scroll', scrollListenerRef.current, { passive: true });

    return () => {
      mq.removeEventListener('change', handleResize);
      if (scrollListenerRef.current) {
        window.removeEventListener('scroll', scrollListenerRef.current);
      }
      clearTimeout(scrollTimeout);
    };
  }, [posts.length, onLoadMore]);

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">Loading posts...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">No posts found.</p>
      </div>
    );
  }

  return (
    <div id="posts_list" ref={listRef} className="space-y-4">
      {posts.map((post, index) => (
        <div
          key={`${post.author}/${post.permlink}`}
          className="border-b border-gray-200 pb-4 last:border-b-0"
        >
          {/* TODO: Implement PostSummary component */}
          <div className="post-summary-placeholder">
            <h3 className="text-lg font-semibold">
              <a
                href={`/${post.category}/@${post.author}/${post.permlink}`}
                className="text-blue-600 hover:underline"
              >
                {post.title || 'Untitled'}
              </a>
            </h3>
            <p className="text-sm text-gray-600">
              by <a href={`/@${post.author}`} className="text-blue-600 hover:underline">@{post.author}</a>
              {' '}in <a href={`/${post.category}`} className="text-blue-600 hover:underline">#{post.category}</a>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(post.created).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
      {loading && posts.length > 0 && (
        <div className="flex justify-center items-center py-4">
          <p className="text-gray-500">Loading more...</p>
        </div>
      )}
    </div>
  );
}

