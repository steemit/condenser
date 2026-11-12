'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  AtSign,
  ChevronUp,
  Link2,
  MessageCircle,
  Pencil,
  Repeat,
  UserPlus,
} from 'lucide-react';

import { fetchCommunityNotifications } from '@/lib/api/steem';
import LoadingIndicator from '@/components/elements/LoadingIndicator';
import TimeAgo from '@/components/elements/TimeAgo';
import Userpic from '@/components/elements/Userpic';
import type { Community } from '@/types/steem';

interface Notification {
  id: number;
  type: string;
  score?: number;
  date: string;
  msg: string;
  url?: string;
  [key: string]: unknown;
}

// Legacy NotificationsList icon map (set_role/set_label → pencil, unknown →
// chain); moderation logs are mostly set_role / mute / subscribe rows.
const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  reply: MessageCircle,
  reply_post: MessageCircle,
  reply_comment: MessageCircle,
  follow: UserPlus,
  set_label: Pencil,
  set_role: Pencil,
  vote: ChevronUp,
  reblog: Repeat,
  mention: AtSign,
};

const FILTERS = [
  { key: 'all', labelKey: 'notificationslist_jsx.all' },
  { key: 'replies', labelKey: 'notificationslist_jsx.replies' },
  { key: 'mentions', labelKey: 'notificationslist_jsx.mentions' },
  { key: 'follows', labelKey: 'notificationslist_jsx.follows' },
  { key: 'upvotes', labelKey: 'notificationslist_jsx.upvotes' },
  { key: 'resteems', labelKey: 'notificationslist_jsx.resteems' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

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
 * CommunityActivityLog — legacy renders the community moderation-log dialog
 * as <NotificationsList username={community.name}/>. That component here is
 * wired to the session-gated /api/steem/notifications route plus the
 * personal unread/mark-read machinery, none of which applies to a public
 * community log, so this is a dedicated view over the public
 * /api/steem/community-notifications route with the same row layout
 * (avatar + linked message + icon/time), filters and last_id pagination.
 *
 * Legacy's "mark all as read" is deliberately not ported: it would broadcast
 * a notify setLastRead the viewer cannot sign for (community account).
 */
export default function CommunityActivityLog({
  community,
}: {
  community: Community;
}) {
  const t = useTranslations();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLastPage, setIsLastPage] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('all');

  const load = async (startId?: number) => {
    setLoading(true);
    try {
      const page = (await fetchCommunityNotifications(
        community.name,
        startId
      )) as Notification[];
      setIsLastPage(page.length < 100);
      setNotifications((prev) =>
        startId ? [...prev, ...page] : page
      );
    } catch (error) {
      console.error('Error loading community notifications:', error);
      if (!startId) setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setNotifications([]);
    setIsLastPage(false);
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [community.name]);

  const filterMap: Record<string, string[]> = {
    replies: ['reply_comment', 'reply', 'reply_post'],
    follows: ['follow'],
    upvotes: ['vote'],
    resteems: ['reblog'],
    mentions: ['mention'],
  };
  const filtered =
    filter === 'all'
      ? notifications
      : notifications.filter((n) => filterMap[filter]?.includes(n.type));

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
              {t(f.labelKey)}
            </button>
          </span>
        ))}
      </div>

      {loading && notifications.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <LoadingIndicator type="circle" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[6px] border border-border bg-card px-6 py-8 text-center text-muted-foreground">
          {t('notificationslist_jsx.empty')}
        </div>
      ) : (
        <div>
          {filtered.map((notification) => {
            const account = firstAccount(notification.msg || '');
            const TypeIcon = TYPE_ICONS[notification.type] || Link2;
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
                <div className="flex items-start gap-3">
                  {account && (
                    <Link href={`/@${account}`} className="mt-0.5 shrink-0">
                      <Userpic account={account} className="!size-10" />
                    </Link>
                  )}
                  <div className="min-w-0 flex-1">
                    {notification.url ? (
                      <Link
                        // Hivemind returns route paths without a leading
                        // slash (e.g. "trending/hive-x"); without it the
                        // href would resolve relative to the current page.
                        href={
                          notification.url.startsWith('/')
                            ? notification.url
                            : `/${notification.url}`
                        }
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
                onClick={() =>
                  void load(notifications[notifications.length - 1]?.id)
                }
                disabled={loading}
                className="font-bold text-foreground hover:text-accent-foreground disabled:opacity-50"
              >
                {loading ? t('g.loading') : t('notificationslist_jsx.load_more')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
