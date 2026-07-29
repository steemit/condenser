'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

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
  const currentUser = useAppSelector((s) => s.user.current?.username);
  const [items, setItems] = useState<FollowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

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
    void loadPage(1);
  }, [loadPage]);

  const totalPages =
    typeof total === 'number' && total > 0
      ? Math.ceil(total / PAGE_SIZE)
      : items.length >= PAGE_SIZE
        ? page + 1 // unknown total; at least one more page
        : page;

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
          ? `@${accountname} has no followers yet.`
          : `@${accountname} is not following anyone yet.`}
      </div>
    );
  }

  // Page number window (ReactPaginate-like: prev/next + numbered pages).
  const pageNumbers: number[] = [];
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  for (let p = start; p <= Math.min(totalPages, start + 4); p++) {
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
          aria-label="Pagination"
          className="mt-6 flex items-center justify-center gap-1 text-sm"
        >
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => void loadPage(page - 1)}
            className="rounded px-2 py-1 text-foreground hover:bg-accent disabled:opacity-40"
          >
            previous
          </button>
          {start > 1 && <span className="px-1 text-muted-foreground">…</span>}
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
              {p}
            </button>
          ))}
          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <span className="px-1 text-muted-foreground">…</span>
          )}
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => void loadPage(page + 1)}
            className="rounded px-2 py-1 text-foreground hover:bg-accent disabled:opacity-40"
          >
            next
          </button>
        </nav>
      )}
    </div>
  );
}
