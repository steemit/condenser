'use client';

import {
  useServiceHealth,
  type ServiceHealthStatus,
} from '@/hooks/use-service-health';

/**
 * Top banner shown when the Steem node is unreachable or serving stale data.
 * Hidden entirely while healthy or before the first health check resolves.
 *
 * - degraded: the node is serving stale cache (RPC failing but data still
 *   available). Reads still work, but may be slightly out of date.
 * - outage:   /api/health itself is unreachable. Writes may fail.
 */
const bannerStyles: Record<ServiceHealthStatus, string> = {
  healthy: '',
  degraded:
    'bg-amber-100 dark:bg-amber-900/30 border-b border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200',
  outage:
    'bg-red-100 dark:bg-red-900/30 border-b border-red-300 dark:border-red-700 text-red-800 dark:text-red-200',
  unknown: '',
};

export function DegradationBanner() {
  const status = useServiceHealth();

  if (status === 'healthy' || status === 'unknown') return null;

  const message =
    status === 'outage'
      ? 'Connection to the Steem network is unstable. Some actions may fail.'
      : 'Showing cached content — the Steem network is slow to respond.';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`px-4 py-2 text-center text-sm ${bannerStyles[status]}`}
    >
      {message}
    </div>
  );
}
