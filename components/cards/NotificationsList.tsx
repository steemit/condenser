'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { receiveNotifications, receiveUnreadNotifications, notificationsLoading } from '@/store/slices/globalSlice';
import { broadcastCustomJson } from '@/lib/api/broadcast';
import { fetchUnreadNotificationsCount } from '@/lib/api/steem';
import { cachedFetch } from '@/lib/cache/client-fetch';
import LoadingIndicator from '@/components/elements/LoadingIndicator';
import Userpic from '@/components/elements/Userpic';
import TimeAgo from '@/components/elements/TimeAgo';
import Link from 'next/link';
import {
  AtSign,
  Bell,
  ChevronUp,
  MessageCircle,
  Repeat,
  UserPlus,
} from 'lucide-react';

interface Notification {
  id: number;
  type: string;
  score?: number;
  date: string;
  msg: string;
  url?: string;
  [key: string]: unknown;
}

interface NotificationsListProps {
  username: string;
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'replies', label: 'Replies' },
  { key: 'mentions', label: 'Mentions' },
  { key: 'follows', label: 'Follows' },
  { key: 'upvotes', label: 'Upvotes' },
  { key: 'resteems', label: 'Resteems' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  reply: MessageCircle,
  reply_post: MessageCircle,
  reply_comment: MessageCircle,
  follow: UserPlus,
  vote: ChevronUp,
  reblog: Repeat,
  mention: AtSign,
};

/** First @account mentioned in a notification message (for the avatar). */
function firstAccount(msg: string): string | null {
  const m = msg.match(/@([a-z][a-z0-9.-]*)/);
  return m ? m[1] : null;
}

/** Render the message with the first @mention bolded (legacy behavior). */
function renderMsg(msg: string): React.ReactNode {
  const m = msg.match(/@([a-z][a-z0-9.-]*)/);
  if (!m || m.index === undefined) return msg;
  return (
    <>
      {msg.slice(0, m.index)}
      <strong>@{m[1]}</strong>
      {msg.slice(m.index + m[0].length)}
    </>
  );
}

/**
 * NotificationsList — legacy layout: pipe-separated text filters, avatar +
 * linked message + icon/time row, unread accent dot, score-tinted rows.
 */
export default function NotificationsList({ username }: NotificationsListProps) {
  const dispatch = useAppDispatch();
  const notificationsState = useAppSelector((state) =>
    state.global.notifications?.[username]
  );
  const loading = useAppSelector((state) => state.global.notifications?.loading);

  const [filter, setFilter] = useState<FilterKey>('all');
  const [markReadPending, setMarkReadPending] = useState(false);
  const [markReadError, setMarkReadError] = useState('');

  // The slice stores untyped legacy items; this component owns the shape.
  const notifications = (notificationsState?.notifications ??
    []) as Notification[];
  const isLastPage = notificationsState?.isLastPage || false;
  // Legacy store shape: unreadNotifications = { lastread, unread }.
  const unreadState = (notificationsState?.unreadNotifications ?? {}) as {
    lastread?: string;
    unread?: number;
  };
  const unreadCount = Number(unreadState.unread ?? 0);
  const lastRead = unreadState.lastread;

  // Load notifications on mount
  useEffect(() => {
    if (username) {
      loadNotifications(username);
      // Legacy FetchDataSaga.getUnreadAccountNotificationsSaga: populate the
      // unread state (lastread + count) so rows can show unread markers.
      fetchUnreadNotificationsCount(username)
        .then((res) => {
          dispatch(
            receiveUnreadNotifications({
              name: username,
              unreadNotifications: {
                lastread: res.lastread ?? '',
                unread: res.unread_count ?? 0,
              },
            })
          );
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const loadNotifications = async (accountName: string, startId?: number) => {
    dispatch(notificationsLoading(true));
    try {
      const searchParams = new URLSearchParams({
        account: accountName,
        limit: '100',
      });
      if (startId) searchParams.set('last_id', startId.toString());

      // Initial load is cacheable (SWR); pagination cursors bypass the cache
      // to avoid stitching a stale page onto a shifted feed.
      const { data: notifications } = await cachedFetch<Notification[]>(
        `/api/steem/notifications?${searchParams.toString()}`,
        { staleMs: 10_000, maxAgeMs: 30_000, noStore: Boolean(startId) }
      );
      const isLastPage = notifications.length < 100;

      dispatch(
        receiveNotifications({
          name: accountName,
          notifications,
          isLastPage,
        })
      );
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      dispatch(notificationsLoading(false));
    }
  };

  const handleLoadMore = () => {
    if (!isLastPage && notifications.length > 0) {
      const lastNotificationId = notifications[notifications.length - 1].id;
      loadNotifications(username, lastNotificationId);
    }
  };

  const handleMarkAsRead = async () => {
    // Legacy FetchDataSaga.markNotificationsAsReadSaga: the read marker is
    // a custom_json (id: 'notify') broadcast carrying setLastRead; hivemind
    // needs a few seconds to index it, so legacy clears the unread state
    // after a 6s delay.
    if (markReadPending) return;
    setMarkReadPending(true);
    setMarkReadError('');
    // Legacy naive format (no trailing Z): python-hivemind's VALID_DATE
    // requires exactly this shape. NOTE: the Go hivemind rewrite parses with
    // time.RFC3339 and rejects naive timestamps — cross-repo follow-up.
    const timeNow = new Date().toISOString().slice(0, 19);
    try {
      await broadcastCustomJson({
        requiredAuths: [],
        requiredPostingAuths: [username],
        id: 'notify',
        json: JSON.stringify(['setLastRead', { date: timeNow }]),
      });
      setTimeout(() => {
        dispatch(
          receiveUnreadNotifications({
            name: username,
            unreadNotifications: { lastread: timeNow, unread: 0 },
          })
        );
        // The header badge polls on its own timer; tell it to zero now.
        window.dispatchEvent(
          new CustomEvent('notifications:marked-read', { detail: { username } })
        );
      }, 6000);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      setMarkReadError('Failed to mark notifications as read. Please try again.');
    } finally {
      setMarkReadPending(false);
    }
  };

  const filterNotifications = (notifs: Notification[]) => {
    if (filter === 'all') return notifs;

    const filterMap: Record<string, string[]> = {
      replies: ['reply_comment', 'reply', 'reply_post'],
      follows: ['follow'],
      upvotes: ['vote'],
      resteems: ['reblog'],
      mentions: ['mention'],
    };

    const types = filterMap[filter] || [];
    return notifs.filter((n) => types.includes(n.type));
  };

  const filteredNotifications = filterNotifications(notifications);

  return (
    <div className="notifications-list mt-4">
      {/* Filter links (legacy: centered, pipe-separated, selected = bold) */}
      <div className="mb-4 text-center">
        {FILTERS.map((f, i) => (
          <span key={f.key}>
            <button
              type="button"
              onClick={() => setFilter(f.key)}
              className={`px-[5px] text-foreground hover:text-accent-foreground ${
                filter === f.key ? 'font-bold' : ''
              } ${i > 0 ? 'border-l border-[#ababab]' : ''}`}
            >
              {f.label}
            </button>
          </span>
        ))}
      </div>

      {unreadCount > 0 && (
        <div className="mb-4 text-center">
          <button
            type="button"
            onClick={handleMarkAsRead}
            disabled={markReadPending}
            className="font-bold text-foreground hover:text-accent-foreground disabled:opacity-50"
          >
            {markReadPending ? 'Marking...' : 'Mark all as read'}
          </button>
          {markReadError && (
            <p className="mt-1 text-sm text-destructive">{markReadError}</p>
          )}
        </div>
      )}

      {loading && notifications.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <LoadingIndicator type="circle" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="rounded-[6px] border border-border bg-card px-6 py-8 text-center text-muted-foreground">
          Welcome! You don&apos;t have any notifications yet.
        </div>
      ) : (
        <div>
          {filteredNotifications.map((notification) => {
            const account = firstAccount(notification.msg || '');
            const TypeIcon = TYPE_ICONS[notification.type] || Bell;
            // Legacy: a row is unread when its date is newer than lastread.
            const isUnread = lastRead
              ? Date.parse(`${lastRead}Z`) <= Date.parse(`${notification.date}Z`)
              : false;
            const score = notification.score ?? 0;
            return (
              <div
                key={notification.id}
                className="relative border-b border-border px-4 py-2"
                style={{
                  background:
                    score > 0
                      ? `rgba(225,255,225,${Math.min(score, 100) / 100})`
                      : undefined,
                }}
              >
                {isUnread && (
                  <span
                    className="absolute right-4 top-3 text-[2em] leading-none text-accent-foreground"
                    title="Unread"
                  >
                    •
                  </span>
                )}
                <div className="flex items-start gap-3">
                  {account && (
                    <Link href={`/@${account}`} className="mt-0.5 shrink-0">
                      <Userpic account={account} className="!size-10" />
                    </Link>
                  )}
                  <div className="min-w-0 flex-1">
                    {notification.url ? (
                      <Link
                        href={notification.url}
                        className="text-foreground hover:text-accent-foreground"
                      >
                        {renderMsg(notification.msg || '')}
                      </Link>
                    ) : (
                      <p className="text-foreground">
                        {renderMsg(notification.msg || '')}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <TypeIcon className="size-4" aria-hidden />
                      <TimeAgo date={notification.date} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {!isLastPage && (
            <div className="py-4 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loading}
                className="font-bold text-foreground hover:text-accent-foreground disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
