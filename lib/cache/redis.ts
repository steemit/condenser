/**
 * Content-cache Redis singleton.
 *
 * Separate from lib/auth/redis-session.ts (which uses the `steem:session:`
 * prefix). This module caches Steem RPC responses under the `condenser:`
 * prefix so the two stores never collide even when sharing one Redis instance.
 *
 * When REDIS_URL is not configured, every function here is a no-op and the
 * caller falls back to direct RPC — i.e. behaviour is identical to pre-cache.
 */

import Redis from 'ioredis';

let redis: Redis | null = null;
let redisUnavailable = false;

// Prefix namespace for content cache keys. Distinct from the session prefix
// (`steem:session:`) so a shared Redis instance can serve both safely.
const KEY_PREFIX = process.env.REDIS_KEY_PREFIX || 'condenser';

/** Build a namespaced cache key. */
export function redisKey(key: string): string {
  return `${KEY_PREFIX}:${key}`;
}

/**
 * Lazily create and reuse the content-cache Redis client.
 * Returns null when Redis is not configured or unreachable — callers must
 * treat null as "cache disabled" and degrade gracefully.
 */
export function getRedis(): Redis | null {
  if (redis) return redis;
  if (redisUnavailable) return null;

  const url = process.env.REDIS_URL;
  if (!url) {
    redisUnavailable = true;
    return null;
  }

  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 10) return null;
        return Math.min(times * 100, 2000);
      },
      lazyConnect: true,
      connectTimeout: 5000,
    });

    redis.on('error', (err) => {
      console.warn('Content cache Redis error:', err.message);
    });

    redis.on('close', () => {
      // Allow reconnection on a future call once the link recovers.
      redis = null;
      redisUnavailable = false;
    });

    return redis;
  } catch {
    redisUnavailable = true;
    return null;
  }
}

export interface CacheEntry<T> {
  data: T;
  /** True when the entry is past its fresh TTL but still within staleTtl. */
  degraded: boolean;
  /** Age (seconds) of a stale entry, when applicable. */
  staleAge?: number;
}

/**
 * Read a cached entry. Uses the remaining TTL to determine whether the value
 * is fresh or stale (degraded). Returns null on miss or when Redis is off.
 */
export async function cacheGet<T>(
  key: string,
  ttl: number,
  staleTtl: number
): Promise<CacheEntry<T> | null> {
  const r = getRedis();
  if (!r) return null;

  try {
    const namespaced = redisKey(key);
    const [raw, remaining] = await Promise.all([
      r.get(namespaced),
      r.ttl(namespaced),
    ]);

    if (!raw || remaining < 0) return null;

    const totalTtl = ttl + staleTtl;
    const age = totalTtl - remaining;
    const data = JSON.parse(raw) as T;

    if (age <= ttl) {
      return { data, degraded: false };
    }

    return { data, degraded: true, staleAge: age };
  } catch {
    return null;
  }
}

/**
 * Store an entry with a combined fresh+stale TTL (EX seconds).
 * Write failures are non-critical — the next read simply misses.
 */
export async function cacheSet<T>(
  key: string,
  ttl: number,
  staleTtl: number,
  data: T
): Promise<void> {
  const r = getRedis();
  if (!r) return;

  try {
    const totalTtl = ttl + staleTtl;
    await r.set(redisKey(key), JSON.stringify(data), 'EX', totalTtl);
  } catch {
    // Cache write failure is non-critical
  }
}

/**
 * Delete all keys matching a prefix (SCAN + DEL, non-blocking for large sets).
 * Used for write-after-invalidation on broadcast routes.
 */
export async function cacheDeleteByPrefix(prefix: string): Promise<void> {
  const r = getRedis();
  if (!r) return;

  try {
    let cursor = '0';
    do {
      const [next, keys] = await r.scan(
        cursor,
        'MATCH',
        `${redisKey(prefix)}*`,
        'COUNT',
        100
      );
      if (keys.length > 0) await r.del(...keys);
      cursor = next;
    } while (cursor !== '0');
  } catch {
    // Cache delete failure is non-critical
  }
}
