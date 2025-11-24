'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { receiveNotifications, receiveUnreadNotifications, notificationsLoading } from '@/store/slices/globalSlice';
import LoadingIndicator from '@/components/elements/LoadingIndicator';
import Link from 'next/link';

interface Notification {
  id: number;
  type: string;
  score?: number;
  date: string;
  msg: string;
  url?: string;
  [key: string]: any;
}

interface NotificationsListProps {
  username: string;
}

/**
 * NotificationsList component
 * Displays user notifications with filtering and pagination
 * Migrated from legacy/src/app/components/cards/NotificationsList.jsx
 */
export default function NotificationsList({ username }: NotificationsListProps) {
  const dispatch = useAppDispatch();
  const notificationsState = useAppSelector((state) => 
    state.global.notifications?.[username]
  );
  const loading = useAppSelector((state) => state.global.notifications?.loading);

  const [filter, setFilter] = useState<'all' | 'replies' | 'follows' | 'upvotes' | 'resteems' | 'mentions'>('all');
  const [lastId, setLastId] = useState<number | null>(null);

  const notifications: Notification[] = notificationsState?.notifications || [];
  const isLastPage = notificationsState?.isLastPage || false;
  const unreadCount = Object.keys(notificationsState?.unreadNotifications || {}).length;

  // Load notifications on mount
  useEffect(() => {
    if (username) {
      loadNotifications(username);
    }
  }, [username]);

  const loadNotifications = async (accountName: string, startId?: number) => {
    dispatch(notificationsLoading(true));
    try {
      const searchParams = new URLSearchParams({
        account: accountName,
        limit: '100',
      });
      if (startId) searchParams.set('last_id', startId.toString());

      const response = await fetch(`/api/steem/notifications?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }

      const notifications = await response.json();
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
    const timeNow = new Date().toISOString().slice(0, 19);
    try {
      // TODO: Implement actual API call to mark notifications as read
      // This requires broadcasting a custom_json operation
      // For now, just update the local state
      
      // Update unread notifications state
      dispatch(
        receiveUnreadNotifications({
          name: username,
          unreadNotifications: {},
        })
      );
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      reply: '💬',
      reply_post: '💬',
      reply_comment: '💬',
      follow: '👥',
      set_label: '✏️',
      set_role: '✏️',
      vote: '⬆️',
      error: '⚙️',
      reblog: '🔄',
      mention: '💭',
    };
    return iconMap[type] || '🔔';
  };

  const getNotificationTypeLabel = (type: string) => {
    const labelMap: Record<string, string> = {
      reply: 'Reply',
      reply_post: 'Reply',
      reply_comment: 'Reply',
      follow: 'Follow',
      set_label: 'Label',
      set_role: 'Role',
      vote: 'Upvote',
      error: 'Error',
      reblog: 'Reblog',
      mention: 'Mention',
    };
    return labelMap[type] || type;
  };

  const filterNotifications = (notifs: Notification[]) => {
    if (filter === 'all') return notifs;

    const filterMap: Record<string, string[]> = {
      replies: ['reply_comment', 'reply'],
      follows: ['follow'],
      upvotes: ['vote'],
      resteems: ['reblog'],
      mentions: ['mention'],
    };

    const types = filterMap[filter] || [];
    return notifs.filter((n) => types.includes(n.type));
  };

  const filteredNotifications = filterNotifications(notifications);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notifications-list">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Mark all as read ({unreadCount})
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-4">
          {(['all', 'replies', 'follows', 'upvotes', 'resteems', 'mentions'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 -mb-px border-b-2 transition-colors ${
                filter === filterType
                  ? 'border-blue-500 text-blue-600 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications list */}
      {loading && notifications.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <LoadingIndicator type="circle" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No notifications found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                notification.type ? `notification-${notification.type}` : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-1">{getNotificationIcon(notification.type)}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">
                      {getNotificationTypeLabel(notification.type)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(notification.date)}
                    </span>
                  </div>
                  {notification.url ? (
                    <Link
                      href={notification.url}
                      className="text-gray-800 hover:text-blue-600"
                    >
                      {notification.msg}
                    </Link>
                  ) : (
                    <p className="text-gray-800">{notification.msg}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Load more button */}
          {!isLastPage && (
            <div className="text-center py-4">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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

