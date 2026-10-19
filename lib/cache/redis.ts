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

// Prefix namespace for content-cache keys (also namespaces the pending-
// broadcast overlay and the rate limiter, which share this module's client).
// Distinct from the session prefix (`steem:session:`, lib/auth/
// redis-session.ts) so a shared Redis instance can serve both safely.
//
// REDIS_KEY_PREFIX is the pre-split (S8) shared name: it set BOTH stores'
// prefixes at once, so the two could not be namespaced independently — one
// value inevitably leaked one store's keys into the other's namespace. It
// still works with the old both-at-once semantics for existing deployments,
// but new setups should set REDIS_CACHE_KEY_PREFIX here and
// REDIS_SESSION_KEY_PREFIX for sessions.
const KEY_PREFIX =
  process.env.REDIS_CACHE_KEY_PREFIX ||
  process.env.REDIS_KEY_PREFIX ||
  'condenser';

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

    // Stale-client guard (S9, same pattern as lib/auth/redis-session.ts):
    // only this client may vacate the singleton slot. Without the guard, a
    // late 'close' from a client that was already replaced (A closed -> next
    // getRedis() minted B -> A emitted another close) would null B's slot,
    // so the following getRedis() mints C and B leaks (bounded only by its
    // retryStrategy giving up after 10 attempts).
    const client = redis;
    redis.on('close', () => {
      // Allow reconnection on a future call once the link recovers.
      if (redis === client) {
        redis = null;
        redisUnavailable = false;
      }
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
 * Delete a single exact cache key (one DEL, no SCAN). The only delete
 * primitive on write paths: prefix deletes traverse the whole keyspace with
 * SCAN regardless of how many keys match, so a write path that cannot name
 * its keys exactly must use generation counters below instead (audits
 * N-10 / CD-03).
 */
export async function cacheDelete(key: string): Promise<void> {
  const r = getRedis();
  if (!r) return;

  try {
    await r.del(redisKey(key));
  } catch {
    // Cache delete failure is non-critical
  }
}

/**
 * Generation-scoped cache invalidation (audit CD-03).
 *
 * Some cache families key on per-request dimensions after a scope segment
 * (page/limit/cursor/query variants), so a write cannot enumerate the exact
 * keys to delete — and a prefix SCAN is not an answer: SCAN iterates the
 * ENTIRE keyspace regardless of match count, turning every broadcast into
 * an O(total keys) shared-Redis workload (the CD-03 regression of N-10).
 *
 * Instead, versioned families embed a generation number in their cache key
 * (read side: getCacheGeneration, called by lib/steem/client.ts when
 * building keys). A write bumps the scope's counter (bumpCacheGeneration)
 * — a single O(1) INCR. Every key of the previous generation becomes
 * unreachable immediately and expires on its own TTL; no SCAN, no DEL
 * fan-out, constant work per write. As a bonus this is also safer than a
 * DEL against the resurrection race: a read that fetched pre-write data
 * and completes after the bump writes it under the OLD generation, where
 * no later read will ever look.
 *
 * Counter-key TTL (24h, far above the 40-minute family maximum of
 * communities 600s + 1800s; refreshed on every bump): its jobs are to reap
 * the counters of idle scopes — one bounded key per scope ever bumped,
 * read traffic alone creates none (audit N-21) — while counters of actively
 * written scopes never expire at all.
 *
 * Residual, stated precisely: reads do NOT refresh the counter, so an entry
 * can be cached under the current generation right up to the counter's
 * expiry. A scope bumped exactly once (counter = 1), left write-idle past
 * the 24h expiry, and then bumped again within a family's total TTL of the
 * expiry restarts the counter at 1 — the same number the expired cycle
 * used — and entries cached under gen 1 in the final TTL window of that
 * cycle become reachable again until their own expiry. The staleness is
 * bounded by the family's total TTL (330s follow lists, 2400s communities),
 * i.e. exactly the Redis-less / no-invalidation convergence bound, and key
 * scoping is unchanged so no cross-account data can leak. Keeping the TTL
 * far above the family maximum cannot shrink that post-expiry overlap
 * window; it only makes expiry require a full day of write-idleness, which
 * keeps the boundary case rare.
 */
const GENERATION_TTL_SEC = 24 * 60 * 60;

function generationKey(scope: string): string {
  return redisKey(`steem:cachever:${scope}`);
}

/**
 * Current invalidation generation for `scope` (0 when never bumped, Redis
 * is off, or the read fails — reads then degrade to generation 0, exactly
 * like a Redis-less deployment).
 */
export async function getCacheGeneration(scope: string): Promise<number> {
  const r = getRedis();
  if (!r) return 0;

  try {
    const raw = await r.get(generationKey(scope));
    if (!raw) return 0;
    const n = Number(raw);
    return Number.isSafeInteger(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

/**
 * Invalidate every cached entry of a versioned family in one O(1) bump:
 * reads embed getCacheGeneration(scope) in their keys, so after the bump
 * they compute a fresh key and miss. Failure is non-critical — the
 * family's entries expire on their own TTLs.
 */
export async function bumpCacheGeneration(scope: string): Promise<void> {
  const r = getRedis();
  if (!r) return;

  try {
    // MULTI/EXEC so the counter can never be left without its TTL by a
    // crash between the INCR and the EXPIRE.
    await r
      .multi()
      .incr(generationKey(scope))
      .expire(generationKey(scope), GENERATION_TTL_SEC)
      .exec();
  } catch {
    // Invalidation failure is non-critical
  }
}
