'use client';

import { useState, useEffect } from 'react';
import { fetchUnreadNotificationsCount, UnreadNotificationsResponse } from '@/lib/api/steem';

interface NotificationBadgeProps {
  username: string;
  className?: string;
  showZero?: boolean;
}

/**
 * NotificationBadge component
 * Displays unread notification count for a user
 * Can be used in navigation bars or profile headers
 */
export default function NotificationBadge({ 
  username, 
  className = '', 
  showZero = false 
}: NotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }

    const fetchCount = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result: UnreadNotificationsResponse = await fetchUnreadNotificationsCount(username);
        
        if (result.error) {
          setError(result.error);
          setUnreadCount(0);
        } else {
          setUnreadCount(result.unread_count);
        }
      } catch (err) {
        console.error('Error fetching notification count:', err);
        setError('Failed to load notifications');
        setUnreadCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();

    // Optionally refresh count periodically
    const interval = setInterval(fetchCount, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [username]);

  // Don't render if loading or no username
  if (loading || !username) {
    return null;
  }

  // Don't render if zero count and showZero is false
  if (unreadCount === 0 && !showZero) {
    return null;
  }

  // Error state - show a small indicator
  if (error) {
    return (
      <span 
        className={`inline-flex items-center justify-center w-2 h-2 bg-red-500 rounded-full ${className}`}
        title={error}
      />
    );
  }

  return (
    <span 
      className={`inline-flex items-center justify-center min-w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full ${className}`}
      title={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}
