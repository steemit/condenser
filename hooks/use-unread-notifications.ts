'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { receiveUnreadNotifications } from '@/store/slices/globalSlice';
import { fetchUnreadNotificationsCount } from '@/lib/api/steem';

// Legacy Header polled unread notifications every 10 minutes; the rewrite
// shortened this to one minute and keeps that cadence here.
const POLL_INTERVAL_MS = 60_000;

/**
 * Single source of truth for the unread notifications count (T16).
 *
 * Legacy parity: the legacy header read the count from
 * `global.notifications[username].unreadNotifications` and refreshed it by
 * polling `getUnreadAccountNotifications` into the same store slot. This hook
 * restores that shape: it polls /api/steem/unread-notifications, writes the
 * result into Redux via receiveUnreadNotifications and returns the stored
 * count. The header badge and the notifications list both consume this hook,
 * so there is exactly one unread count in the app (no per-component local
 * state, no CustomEvent bridge).
 *
 * The reducer's stale-write guard (see receiveUnreadNotifications) drops poll
 * snapshots that predate a locally applied read marker, so a mark-all-as-read
 * is never un-zeroed by an in-flight poll.
 */
export function useUnreadNotifications(username: string | undefined): number {
  const dispatch = useAppDispatch();
  const unread = useAppSelector((state) => {
    if (!username) return 0;
    const entry = state.global.notifications?.[username]?.unreadNotifications as
      | { unread?: number | string }
      | undefined;
    return Number(entry?.unread ?? 0);
  });

  useEffect(() => {
    if (!username) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetchUnreadNotificationsCount(username);
        // Route errors (session mismatch, 5xx) come back as {error}; keep
        // the last known count rather than zeroing the badge on a hiccup.
        if (cancelled || res.error) return;
        dispatch(
          receiveUnreadNotifications({
            name: username,
            unreadNotifications: {
              lastread: res.lastread ?? '',
              unread: res.unread_count ?? 0,
            },
          })
        );
      } catch {
        // Network failure — the next tick retries.
      }
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [username, dispatch]);

  return unread;
}
