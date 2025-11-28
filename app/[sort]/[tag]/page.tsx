'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setPathname } from '@/store/slices/globalSlice';
import { fetchRankedPosts, Post } from '@/lib/api/steem';
import PostsList from '@/components/cards/PostsList';

const VALID_SORTS = ['hot', 'trending', 'promoted', 'payout', 'payout_comments', 'muted', 'created'];

interface SortTagPageProps {
  params: {
    sort: string;
    tag: string;
  };
}

export default function SortTagPage({ params }: SortTagPageProps) {
  const dispatch = useAppDispatch();
  const { sort, tag } = useParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastPost, setLastPost] = useState<{ author: string; permlink: string } | null>(null);

  // Validate parameters
  const sortString = Array.isArray(sort) ? sort[0] : sort;
  const tagString = Array.isArray(tag) ? tag[0] : tag;
  const isValidSort = VALID_SORTS.includes(sortString?.toLowerCase());

  useEffect(() => {
    dispatch(setPathname(`/${sortString}/${tagString}`));
  }, [dispatch, sortString, tagString]);

  const loadPosts = useCallback(async () => {
    if (!hasMore || !isValidSort) return;

    setLoading(true);
    try {
      const newPosts = await fetchRankedPosts({
        order: sortString as any,
        tag: tagString,
        limit: 20,
        start_author: lastPost?.author,
        start_permlink: lastPost?.permlink,
      });

      if (newPosts.length === 0 || (lastPost && newPosts.length === 1 && newPosts[0].author === lastPost.author && newPosts[0].permlink === lastPost.permlink)) {
        setHasMore(false);
      } else {
        setPosts((prevPosts) => {
          // Filter out duplicates if any
          const uniqueNewPosts = newPosts.filter(
            (np) => !prevPosts.some((p) => p.author === np.author && p.permlink === np.permlink)
          );
          return [...prevPosts, ...uniqueNewPosts];
        });
        setLastPost({
          author: newPosts[newPosts.length - 1].author,
          permlink: newPosts[newPosts.length - 1].permlink,
        });
      }
    } catch (error) {
      console.error(`Error loading ${sortString} posts for tag ${tagString}:`, error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [hasMore, lastPost, sortString, tagString, isValidSort]);

  useEffect(() => {
    if (isValidSort) {
      loadPosts();
    }
  }, [loadPosts, isValidSort]);

  const handleLoadMore = () => {
    if (!loading && hasMore && isValidSort) {
      loadPosts();
    }
  };

  if (!isValidSort) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-800 mb-2">Invalid Sort Type</h1>
          <p className="text-red-600">
            "{sortString}" is not a valid sort type. Valid options are: {VALID_SORTS.join(', ')}.
          </p>
        </div>
      </div>
    );
  }

  const sortDisplayName = sortString.charAt(0).toUpperCase() + sortString.slice(1).replace('_', ' ');
  const isHiveCommunity = tagString?.startsWith('hive-');
  const tagDisplayName = isHiveCommunity ? `Community ${tagString}` : `#${tagString}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{sortDisplayName} Posts</h1>
        <div className="flex items-center space-x-2">
          <span className="text-lg text-gray-600">in</span>
          <span className="text-lg font-semibold text-blue-600">{tagDisplayName}</span>
        </div>
        {isHiveCommunity && (
          <p className="text-sm text-gray-500 mt-1">
            Showing posts from the {tagString} community
          </p>
        )}
      </div>
      <PostsList posts={posts} loading={loading} onLoadMore={handleLoadMore} order={sortString} />
    </div>
  );
}
