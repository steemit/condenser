'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { fetchFollowers, fetchFollowing, FollowItem } from '@/lib/api/steem';
import Follow from '@/components/elements/Follow';
import LoadingIndicator from '@/components/elements/LoadingIndicator';
import { useAppSelector } from '@/store/hooks';

interface FollowListProps {
  accountname: string;
  type: 'followers' | 'following';
  /** Total count from profile stats (for page-number pagination). */
  total?: number;
}

const PAGE_SIZE = 20;

/**
 * FollowList — legacy UserList table rows (@username + Follow button column)
 * with page-number pagination (ReactPaginate style).
 */
export default function FollowList({ accountname, type, total }: FollowListProps) {
  const t = useTranslations();
  const currentUser = useAppSelector((s) => s.user.current?.username);
  const [items, setItems] = useState<FollowItem[]>([]);
  const [loading, setLoading] = useState(true);
  // 0-based page: condenser_api.get_followers_by_page expects a 0-based page
  // and legacy passes its 0-based currentPage straight through
  // (elements/UserList.jsx + FetchDataSaga.js getFollowers).
  const [page, setPage] = useState(0);

  const loadPage = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const fetchFunction =
          type === 'followers' ? fetchFollowers : fetchFollowing;
        const data = await fetchFunction(accountname, p, PAGE_SIZE);
        setItems(data);
        setPage(p);
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
      } finally {
        setLoading(false);
      }
    },
    [accountname, type]
  );

  useEffect(() => {
    void loadPage(0);
  }, [loadPage]);

  const totalPages =
    typeof total === 'number' && total > 0
      ? Math.ceil(total / PAGE_SIZE)
      : items.length >= PAGE_SIZE
        ? page + 2 // unknown total; at least one more page
        : page + 1;

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingIndicator type="circle" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[6px] border border-border bg-card px-6 py-8 text-center text-muted-foreground">
        {type === 'followers'
          ? t('follow_list.no_followers', { username: accountname })
          : t('follow_list.not_following', { username: accountname })}
      </div>
    );
  }

  // Page number window (ReactPaginate-like: prev/next + numbered pages).
  // Internal pages are 0-based; the UI displays 1-based labels.
  const pageNumbers: number[] = [];
  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
  for (let p = start; p <= Math.min(totalPages - 1, start + 4); p++) {
    pageNumbers.push(p);
  }

  return (
    <div>
      <table className="w-full">
        <tbody>
          {items.map((item, index) => {
            const username =
              type === 'followers' ? item.follower : item.following;
            return (
              <tr key={`${username}-${index}`} className="border-b border-border">
                <td className="py-2 pr-4">
                  <Link
                    href={`/@${username}`}
                    className="font-bold text-foreground hover:text-accent-foreground"
                  >
                    @{username}
                  </Link>
                </td>
                {currentUser && (
                  <td className="w-[250px] py-2 text-right">
                    <Follow following={username} showMute={false} />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {totalPages > 1 && (
        <nav
          aria-label={t('g.pagination')}
          className="mt-6 flex items-center justify-center gap-1 text-sm"
        >
          <button
            type="button"
            disabled={page <= 0 || loading}
            onClick={() => void loadPage(page - 1)}
            className="rounded px-2 py-1 text-foreground hover:bg-accent disabled:opacity-40"
          >
            {t('g.previous')}
          </button>
          {start > 0 && <span className="px-1 text-muted-foreground">…</span>}
          {pageNumbers.map((p) => (
            <button
              key={p}
              type="button"
              disabled={loading}
              onClick={() => void loadPage(p)}
              className={`rounded px-2 py-1 ${
                p === page
                  ? 'bg-accent font-bold text-accent-foreground'
                  : 'text-foreground hover:bg-accent'
              } disabled:opacity-40`}
            >
              {p + 1}
            </button>
          ))}
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span className="px-1 text-muted-foreground">…</span>
          )}
          <button
            type="button"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => void loadPage(page + 1)}
            className="rounded px-2 py-1 text-foreground hover:bg-accent disabled:opacity-40"
          >
            {t('g.next')}
          </button>
        </nav>
      )}
    </div>
  );
}
