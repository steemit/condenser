/**
 * GET /api/health
 * Steem node health check with stale-while-revalidate caching.
 *
 * - Fresh cache (<60s): return immediately, no RPC.
 * - Stale cache: another instance may be probing; if we cannot acquire the
 *   probe lock, serve stale data (X-Health-Stale) instead of triggering a
 *   probe storm.
 * - No cache / lock acquired: run a single shared in-flight probe, write the
 *   result to Redis, and return it.
 * - No Redis: cache/lock layers are no-ops; an in-process minimum interval
 *   (5s) replays the last probe result to avoid amplifying the 60s client
 *   poll into per-request node probes.
 *
 * Returns 200 when healthy, 503 when degraded.
 */

import { NextResponse } from 'next/server';
import { checkSteemNodeHealth } from '@/lib/steem/client';
import { getRedis } from '@/lib/cache/redis';
import {
  getSteemHealthStale,
  markSteemHealthy,
  markSteemUnhealthy,
  acquireProbeLock,
  releaseProbeLock,
  FRESH_THRESHOLD,
} from '@/lib/cache/health-monitor';

// In-process single-flight: concurrent requests share one probe within an instance.
let inFlightProbe: Promise<Awaited<ReturnType<typeof checkSteemNodeHealth>>> | null = null;

// No-Redis throttle: without Redis, the three cache/lock layers are all no-ops
// and every request would probe the node directly. With use-service-health
// polling every 60s across N instances that is an amplification risk. This
// in-process minimum interval caps the no-Redis path so a probe runs at most
// once per NO_REDIS_MIN_INTERVAL within each instance. (Redis path is already
// throttled by cache + probe lock and ignores this.)
const NO_REDIS_MIN_INTERVAL = 5_000; // ms
let lastProbeAt = 0;

// In-process last probe result, used only on the no-Redis path to answer
// requests within the throttle window without re-probing the node.
interface InMemoryHealth {
  healthy: boolean;
  blockNumber?: number;
  latency?: number;
  error?: string;
}
let lastInMemoryHealth: InMemoryHealth | null = null;

function runSharedProbe() {
  if (!inFlightProbe) {
    inFlightProbe = checkSteemNodeHealth()
      .then((result) => {
        lastInMemoryHealth = {
          healthy: result.healthy,
          ...(result.blockNumber !== undefined && { blockNumber: result.blockNumber }),
          ...(result.latency !== undefined && { latency: result.latency }),
          ...(result.error !== undefined && { error: result.error }),
        };
        return result;
      })
      .finally(() => {
        inFlightProbe = null;
        lastProbeAt = Date.now();
      });
  }
  return inFlightProbe;
}

function buildResponse(
  healthy: boolean,
  blockNumber?: number,
  latency?: number,
  error?: string,
  stale = false
) {
  if (!healthy) {
    console.warn(
      '[api/health] Steem degraded',
      stale ? '(stale cache)' : '(live probe)',
      error ?? '(no error detail)'
    );
  }

  const headers: Record<string, string> = {};
  if (stale) headers['X-Health-Stale'] = 'true';

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        steem: {
          healthy,
          ...(blockNumber !== undefined && { blockNumber }),
          ...(latency !== undefined && { latency }),
          ...(error !== undefined && { error }),
        },
      },
    },
    { status: healthy ? 200 : 503, headers }
  );
}

export async function GET() {
  const cached = await getSteemHealthStale();

  // Fresh cache — return immediately, no RPC.
  if (cached && Date.now() - cached.checkedAt <= FRESH_THRESHOLD) {
    return buildResponse(
      cached.healthy,
      cached.blockNumber,
      cached.latency,
      cached.error
    );
  }

  // No-Redis throttle: when Redis is unavailable the cache/lock layers are all
  // no-ops. Without this guard, every request (including the 60s client poll
  // from use-service-health across instances) would hit the node directly. We
  // self-limit: within NO_REDIS_MIN_INTERVAL of the last probe, replay the
  // in-memory result instead of re-probing.
  const noRedis = !getRedis();
  if (noRedis && lastInMemoryHealth && Date.now() - lastProbeAt < NO_REDIS_MIN_INTERVAL) {
    return buildResponse(
      lastInMemoryHealth.healthy,
      lastInMemoryHealth.blockNumber,
      lastInMemoryHealth.latency,
      lastInMemoryHealth.error
    );
  }

  // Stale cache — another instance may be probing; serve stale if we cannot lock.
  let acquiredLock = false;
  if (cached) {
    acquiredLock = await acquireProbeLock();
    if (!acquiredLock) {
      return buildResponse(
        cached.healthy,
        cached.blockNumber,
        cached.latency,
        cached.error,
        true
      );
    }
  }

  try {
    const steemHealth = await runSharedProbe();

    if (steemHealth.healthy) {
      await markSteemHealthy(steemHealth.blockNumber, steemHealth.latency);
    } else {
      await markSteemUnhealthy(steemHealth.error);
    }

    return buildResponse(
      steemHealth.healthy,
      steemHealth.blockNumber,
      steemHealth.latency,
      steemHealth.error
    );
  } catch (error) {
    const message = (error as Error).message;
    await markSteemUnhealthy(message);
    return buildResponse(false, undefined, undefined, message);
  } finally {
    if (acquiredLock) await releaseProbeLock();
  }
}
