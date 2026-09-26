'use client';

import { useTranslations } from 'next-intl';
import { useUnreadNotifications } from '@/hooks/use-unread-notifications';

interface NotificationBadgeProps {
  username: string;
  className?: string;
  showZero?: boolean;
}

/**
 * NotificationBadge component
 * Displays the unread notification count for a user (header avatar overlay).
 *
 * The count is NOT local state: useUnreadNotifications polls
 * /api/steem/unread-notifications into Redux (legacy parity — the legacy
 * header read `global.notifications[username].unreadNotifications.unread`),
 * and this badge renders that store slot. The notifications page reads the
 * same slot, so the badge and the list can no longer disagree (T16).
 */
export default function NotificationBadge({
  username,
  className = '',
  showZero = false,
}: NotificationBadgeProps) {
  const t = useTranslations();
  const unreadCount = useUnreadNotifications(username);

  // Nothing to show while logged out or before the first poll lands.
  if (!username) {
    return null;
  }

  if (unreadCount === 0 && !showZero) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center justify-center min-w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full ${className}`}
      title={t('notificationslist_jsx.unread_notifications', { count: unreadCount })}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}
