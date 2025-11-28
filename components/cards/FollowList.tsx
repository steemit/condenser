'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchFollowers, fetchFollowing, FollowItem } from '@/lib/api/steem';

interface FollowListProps {
  accountname: string;
  type: 'followers' | 'following';
}

/**
 * FollowList component
 * Displays followers or following list for a user
 * Migrated from legacy/src/app/components/elements/FollowList.jsx
 */
export default function FollowList({ accountname, type }: FollowListProps) {
  const [items, setItems] = useState<FollowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const fetchFunction = type === 'followers' ? fetchFollowers : fetchFollowing;
        const data = await fetchFunction(accountname, 1, 20);
        setItems(data);
        setHasMore(data.length >= 20);
        setPage(1);
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [accountname, type]);

  // Load more data
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const fetchFunction = type === 'followers' ? fetchFollowers : fetchFollowing;
      const data = await fetchFunction(accountname, nextPage, 20);
      
      if (data.length > 0) {
        setItems(prev => [...prev, ...data]);
        setPage(nextPage);
        setHasMore(data.length >= 20);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error(`Error loading more ${type}:`, error);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">Loading {type}...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">
          {type === 'followers' 
            ? `@${accountname} has no followers yet.`
            : `@${accountname} is not following anyone yet.`
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {items.map((item, index) => {
          const username = type === 'followers' ? item.follower : item.following;
          return (
            <div
              key={`${username}-${index}`}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-400">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <Link
                    href={`/@${username}`}
                    className="font-medium text-gray-900 hover:text-blue-600"
                  >
                    @{username}
                  </Link>
                  <div className="text-sm text-gray-500">
                    {item.what.includes('blog') && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs mr-1">
                        Blog
                      </span>
                    )}
                    {item.what.includes('ignore') && (
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        Muted
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Link
                  href={`/@${username}`}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="text-center pt-6">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Total count */}
      <div className="text-center text-sm text-gray-500 pt-4">
        Showing {items.length} {type}
      </div>
    </div>
  );
}
