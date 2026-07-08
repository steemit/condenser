/**
 * Steem node health monitor (shared across instances via Redis).
 *
 * Only GET /api/health writes the status (markSteemHealthy / markSteemUnhealthy).
 * Other server code may read isSteemKnownDown() to skip RPC attempts while the
 * node is known to be unhealthy — this is what makes withCache() serve stale
 * data instead of hammering an overloaded node.
 *
 * The probe lock (SET NX) ensures that when multiple instances observe a stale
 * health entry, only one of them actually probes the node; the rest serve
 * stale data. This prevents a probe storm right after the fresh window expires.
 */

import { getRedis, redisKey } from './redis';

const HEALTH_KEY = 'health:steem';
const PROBE_LOCK_KEY = 'health:steem:probe-lock';
const HEALTH_TTL = 60; // seconds
// Must exceed the worst-case probe duration so the lock survives a slow probe.
const PROBE_LOCK_TTL = 30; // seconds
/** A health entry is considered fresh for 60s. */
export const FRESH_THRESHOLD = 60_000; // ms

export interface SteemHealthStatus {
  healthy: boolean;
  checkedAt: number;
  blockNumber?: number;
  latency?: number;
  error?: string;
}

/** Read fresh health status; returns null when absent or older than 60s. */
export async function getSteemHealth(): Promise<SteemHealthStatus | null> {
  const redis = getRedis();
  if (!redis) return null;

  try {
    const raw = await redis.get(redisKey(HEALTH_KEY));
    if (!raw) return null;

    const status = JSON.parse(raw) as SteemHealthStatus;
    if (Date.now() - status.checkedAt > FRESH_THRESHOLD) return null;
    return status;
  } catch {
    return null;
  }
}

/**
 * Read health status regardless of freshness.
 * Used by /api/health to serve stale-while-revalidate.
 */
export async function getSteemHealthStale(): Promise<SteemHealthStatus | null> {
  const redis = getRedis();
  if (!redis) return null;

  try {
    const raw = await redis.get(redisKey(HEALTH_KEY));
    if (!raw) return null;
    return JSON.parse(raw) as SteemHealthStatus;
  } catch {
    return null;
  }
}

export async function markSteemHealthy(
  blockNumber?: number,
  latency?: number
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.set(
      redisKey(HEALTH_KEY),
      JSON.stringify({ healthy: true, checkedAt: Date.now(), blockNumber, latency }),
      'EX',
      HEALTH_TTL
    );
  } catch {
    // Non-critical
  }
}

export async function markSteemUnhealthy(error?: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.set(
      redisKey(HEALTH_KEY),
      JSON.stringify({ healthy: false, checkedAt: Date.now(), error }),
      'EX',
      HEALTH_TTL
    );
  } catch {
    // Non-critical
  }
}

/** True when the shared health entry exists and marks Steem as unhealthy. */
export async function isSteemKnownDown(): Promise<boolean> {
  const health = await getSteemHealth();
  if (!health) return false;
  return !health.healthy;
}

/**
 * Try to acquire the exclusive probe lock.
 * Returns true when this caller should probe; false means another instance is
 * already probing and the caller should serve stale data instead.
 */
export async function acquireProbeLock(): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;

  try {
    const result = await redis.set(
      redisKey(PROBE_LOCK_KEY),
      String(Date.now()),
      'EX',
      PROBE_LOCK_TTL,
      'NX'
    );
    return result === 'OK';
  } catch {
    return false;
  }
}

/** Release the probe lock once the probe completes. */
export async function releaseProbeLock(): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.del(redisKey(PROBE_LOCK_KEY));
  } catch {
    // Non-critical
  }
}
