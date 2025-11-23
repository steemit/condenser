'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { showLogin } from '@/store/slices/userSlice';
import { broadcastOperation } from '@/store/slices/transactionSlice';

interface ReblogProps {
  author: string;
  permlink: string;
}

/**
 * Reblog component
 * Allows users to reblog (repost) posts to their own blog
 * Migrated from legacy/src/app/components/elements/Reblog.jsx
 */
export default function Reblog({ author, permlink }: ReblogProps) {
  const dispatch = useAppDispatch();
  const username = useAppSelector((state) => state.user.current?.username);

  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if post is already reblogged
  useEffect(() => {
    if (username) {
      const isReblogged = checkReblogged(username, author, permlink);
      setActive(isReblogged);
    }
  }, [username, author, permlink]);

  const handleReblog = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!username) {
      dispatch(showLogin());
      return;
    }

    if (active || loading) return;

    setLoading(true);

    const json = ['reblog', { account: username, author, permlink }];

    dispatch(
      broadcastOperation({
        type: 'custom_json',
        confirm: 'This post will be added to your blog and shared with your followers.',
        operation: {
          id: 'follow',
          required_posting_auths: [username],
          json: JSON.stringify(json),
          __config: {
            title: 'Resteem this post',
          },
        },
        successCallback: () => {
          // Record user action (optional, for analytics)
          // userActionRecord('reblog', { username, author, permlink });

          setActive(true);
          setLoading(false);
          setReblogged(username, author, permlink);
        },
        errorCallback: () => {
          setActive(false);
          setLoading(false);
        },
      })
    );
  };

  return (
    <button
      onClick={handleReblog}
      disabled={loading || active}
      className={`flex items-center gap-1 px-3 py-1.5 rounded transition-colors ${
        active
          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${active ? 'cursor-default' : ''}`}
      title={active ? 'Already reblogged' : 'Reblog this post'}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      )}
      <span className="text-sm">{active ? 'Reblogged' : 'Reblog'}</span>
    </button>
  );
}

// Cache for reblogged posts
let lastAccount: string | null = null;
let cachedPosts: string[] = [];

/**
 * Get list of reblogged posts for an account from localStorage
 */
function getRebloggedList(account: string): string[] {
  if (typeof window === 'undefined') return [];

  if (lastAccount === account) return cachedPosts;

  lastAccount = account;
  const posts = localStorage.getItem(`reblogged_${account}`);
  try {
    cachedPosts = posts ? JSON.parse(posts) : [];
  } catch (e) {
    cachedPosts = [];
  }
  return cachedPosts;
}

/**
 * Check if a post is already reblogged
 */
function checkReblogged(account: string, author: string, permlink: string): boolean {
  const posts = getRebloggedList(account);
  return posts.includes(`${author}/${permlink}`);
}

/**
 * Mark a post as reblogged in localStorage
 */
function setReblogged(account: string, author: string, permlink: string): void {
  if (typeof window === 'undefined') return;

  clearRebloggedCache();
  let posts = getRebloggedList(account);
  const postKey = `${author}/${permlink}`;

  if (!posts.includes(postKey)) {
    posts.push(postKey);
    // Keep only last 200 reblogged posts
    if (posts.length > 200) {
      posts = posts.slice(-200);
    }
    localStorage.setItem(`reblogged_${account}`, JSON.stringify(posts));
  }
}

/**
 * Clear the reblogged cache
 */
function clearRebloggedCache(): void {
  lastAccount = null;
  cachedPosts = [];
}

