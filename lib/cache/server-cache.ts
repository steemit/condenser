/**
 * Server-side stale-while-error cache wrapper.
 *
 * Strategy (ported from the wallet project, validated in production):
 *  1. Fresh cache hit  → return immediately, no RPC.
 *  2. Steem known down → serve stale (degraded) if we have it.
 *  3. Try the fetcher  → on success, cache & return fresh.
 *  4. Fetcher failed   → serve stale (degraded) if we have it.
 *  5. No stale at all  → rethrow (caller returns 5xx).
 *
 * When Redis is unavailable the fetcher runs directly with no caching —
 * behaviour identical to before this layer existed.
 */

import { cacheGet, cacheSet, getRedis } from './redis';
import { isSteemKnownDown } from './health-monitor';

export interface WithCacheResult<T> {
  data: T;
  degraded: boolean;
  staleAge?: number;
}

/**
 * Execute `fetcher` with stale-while-error caching under `key`.
 *
 * @param key      Cache key (already namespaced by redisKey() internally).
 * @param ttl      Fresh window in seconds.
 * @param staleTtl Grace window in seconds; stale data may be served on error.
 * @param fetcher  The underlying RPC call.
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  staleTtl: number,
  fetcher: () => Promise<T>
): Promise<WithCacheResult<T>> {
  const redis = getRedis();

  // No Redis → just run the fetcher, no caching.
  if (!redis) {
    const data = await fetcher();
    return { data, degraded: false };
  }

  // Check for fresh cached data.
  const cached = await cacheGet<T>(key, ttl, staleTtl);
  if (cached && !cached.degraded) {
    return { data: cached.data, degraded: false };
  }

  // If Steem is known to be down, skip the RPC attempt and serve stale.
  if (await isSteemKnownDown()) {
    if (cached) {
      return {
        data: cached.data,
        degraded: true,
        ...(cached.staleAge !== undefined && { staleAge: cached.staleAge }),
      };
    }
  }

  // Try a fresh fetch.
  try {
    const fresh = await fetcher();
    await cacheSet(key, ttl, staleTtl, fresh);
    return { data: fresh, degraded: false };
  } catch (error) {
    // Fresh fetch failed — serve stale if we have it.
    if (cached) {
      return {
        data: cached.data,
        degraded: true,
        ...(cached.staleAge !== undefined && { staleAge: cached.staleAge }),
      };
    }
    throw error;
  }
}
