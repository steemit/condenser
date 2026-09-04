'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { showLogin } from '@/store/slices/userSlice';
import { broadcastCustomJson } from '@/lib/api/broadcast';
import { userActionRecord } from '@/lib/analytics/overseer';

interface ReblogProps {
  author: string;
  permlink: string;
  /** Icon-only rendering (legacy feed-card / post-footer style). */
  iconOnly?: boolean;
}

/**
 * Reblog component
 * Allows users to reblog (repost) posts to their own blog
 * Migrated from legacy/src/app/components/elements/Reblog.jsx
 */
export default function Reblog({ author, permlink, iconOnly = false }: ReblogProps) {
  const dispatch = useAppDispatch();
  const t = useTranslations();
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

  const handleReblog = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!username) {
      dispatch(showLogin());
      return;
    }

    if (active || loading) return;

    setLoading(true);

    const json = ['reblog', { account: username, author, permlink }];

    // Legacy Reblog.jsx:49 — record the reblog action at dispatch time.
    userActionRecord('reblog', { username, permlink, author });

    try {
      await broadcastCustomJson({
        id: 'follow',
        requiredAuths: [],
        requiredPostingAuths: [username],
        json: JSON.stringify(json),
      });
      setActive(true);
      setReblogged(username, author, permlink);
    } catch (err) {
      console.error('Reblog broadcast error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Legacy icon-only style: gray reblog icon, teal when active, spinner while
  // broadcasting (Reblog.scss).
  if (iconOnly) {
    return (
      <button
        onClick={handleReblog}
        disabled={loading || active}
        className={`inline-flex items-center p-0.5 transition-colors ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={active ? t('reblog_jsx.already_reblogged') : t('reblog_jsx.reblog_this_post')}
        aria-label={active ? t('reblog_jsx.already_reblogged') : t('reblog_jsx.reblog_this_post')}
      >
        {loading ? (
          <svg
            className="h-4 w-4 animate-spin rounded-full border-2 border-[#06D6A9] border-t-transparent"
            viewBox="0 0 24 24"
          />
        ) : (
          // Legacy assets/icons/reblog.svg (share-arrow glyph, fill-based)
          <svg
            className={`h-4 w-4 ${active ? 'text-[#06D6A9]' : 'text-[#cacaca] hover:text-[#06D6A9]'}`}
            viewBox="0 0 512 512"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path d="M448,192l-128,96v-64H128v128h248c4.4,0,8,3.6,8,8v48c0,4.4-3.6,8-8,8H72c-4.4,0-8-3.6-8-8V168c0-4.4,3.6-8,8-8h248V96 L448,192z" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleReblog}
      disabled={loading || active}
      className={`flex items-center gap-1 px-3 py-1.5 rounded transition-colors ${
        active
          ? 'bg-[#06D6A9]/15 text-[#0b8f68] dark:text-[#06D6A9]'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${active ? 'cursor-default' : ''}`}
      title={active ? t('reblog_jsx.already_reblogged') : t('reblog_jsx.reblog_this_post')}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 border-2 border-[#06D6A9] border-t-transparent rounded-full"
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
      <span className="text-sm">{active ? t('reblog_jsx.reblogged') : t('reblog_jsx.reblog')}</span>
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

