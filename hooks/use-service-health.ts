'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

export type ServiceHealthStatus = 'healthy' | 'degraded' | 'outage' | 'unknown';

const POLL_INTERVAL = 60_000; // 60s, matching the server health TTL

/**
 * Poll /api/health and surface the Steem node's service status.
 * - Polls every 60s while the tab is visible.
 * - Re-checks immediately on focus (visibilitychange → visible).
 * - Pauses polling when the tab is hidden to avoid needless load.
 *
 * 'unknown' is the initial state (before the first poll resolves) and is
 * treated as "no banner" by DegradationBanner.
 */
export function useServiceHealth(): ServiceHealthStatus {
  const [status, setStatus] = useState<ServiceHealthStatus>('unknown');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resolveStatus = useCallback(async (): Promise<ServiceHealthStatus> => {
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      // Derive status from the body, not res.ok: the route returns 503 for the
      // 'degraded' case (node slow, serving stale cache) as well as for full
      // outages. Keying only on res.ok would collapse both into 'outage' and
      // the amber "showing cached content" banner would never appear.
      const data = (await res.json()) as { status?: string };
      if (data.status === 'healthy') return 'healthy';
      if (data.status === 'degraded') return 'degraded';
      return 'outage';
    } catch {
      // Network failure reaching our own /api/health (or unparseable body) →
      // we cannot determine node health, so treat as an outage.
      return 'outage';
    }
  }, []);

  useEffect(() => {
    let active = true;

    const poll = async () => {
      const next = await resolveStatus();
      if (active) setStatus(next);
    };

    void poll();
    intervalRef.current = setInterval(() => {
      void poll();
    }, POLL_INTERVAL);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void poll();
        if (!intervalRef.current) {
          intervalRef.current = setInterval(poll, POLL_INTERVAL);
        }
      } else if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      active = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [resolveStatus]);

  return status;
}
