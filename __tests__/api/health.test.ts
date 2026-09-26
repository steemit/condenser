// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * GET /api/health response matrix (review X8).
 *
 * The route layers three staleness strategies (fresh cache, stale cache +
 * probe lock, live probe) plus a no-Redis in-process throttle, and maps the
 * outcome onto 200/503. None of the state transitions had CI coverage. The
 * health monitor, Redis singleton and the Steem probe are all module-mocked;
 * the route keeps module-level state (single-flight probe, throttle clock),
 * so each test imports a fresh copy via vi.resetModules.
 */

vi.mock('@/lib/cache/health-monitor', async (importOriginal) => {
  // The real module is all Redis-guarded no-ops under vitest (no REDIS_URL);
  // keep the real constant and mock only the functions the route uses. The
  // test then imports FRESH_THRESHOLD from this mock — the same value the
  // route's own import resolves to, with no hand-copied constant to drift.
  const actual = await importOriginal<typeof import('@/lib/cache/health-monitor')>();
  return {
    FRESH_THRESHOLD: actual.FRESH_THRESHOLD,
    getSteemHealthStale: vi.fn(),
    markSteemHealthy: vi.fn(),
    markSteemUnhealthy: vi.fn(),
    acquireProbeLock: vi.fn(),
    releaseProbeLock: vi.fn(),
  };
});

vi.mock('@/lib/cache/redis', () => ({
  getRedis: vi.fn(),
}));

vi.mock('@/lib/steem/client', () => ({
  checkSteemNodeHealth: vi.fn(),
}));

import {
  FRESH_THRESHOLD,
  acquireProbeLock,
  getSteemHealthStale,
  markSteemHealthy,
  markSteemUnhealthy,
  releaseProbeLock,
} from '@/lib/cache/health-monitor';
import { getRedis } from '@/lib/cache/redis';
import { checkSteemNodeHealth } from '@/lib/steem/client';

const getSteemHealthStaleMock = vi.mocked(getSteemHealthStale);
const markSteemHealthyMock = vi.mocked(markSteemHealthy);
const markSteemUnhealthyMock = vi.mocked(markSteemUnhealthy);
const acquireProbeLockMock = vi.mocked(acquireProbeLock);
const releaseProbeLockMock = vi.mocked(releaseProbeLock);
const getRedisMock = vi.mocked(getRedis);
const checkSteemNodeHealthMock = vi.mocked(checkSteemNodeHealth);

const fakeRedis = {} as never;

async function importRoute() {
  return import('@/app/api/health/route');
}

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-26T00:00:00Z'));
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    // Default: Redis present, no cached entry, lock acquirable, probe healthy.
    getRedisMock.mockReturnValue(fakeRedis);
    getSteemHealthStaleMock.mockResolvedValue(null);
    acquireProbeLockMock.mockResolvedValue(true);
    checkSteemNodeHealthMock.mockResolvedValue({
      healthy: true,
      blockNumber: 12345,
      latency: 42,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 200 from a fresh healthy cache entry without probing', async () => {
    getSteemHealthStaleMock.mockResolvedValue({
      healthy: true,
      checkedAt: Date.now() - 10_000,
      blockNumber: 999,
      latency: 5,
    });
    const { GET } = await importRoute();

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('healthy');
    expect(body.checks.steem).toMatchObject({ healthy: true, blockNumber: 999 });
    expect(checkSteemNodeHealthMock).not.toHaveBeenCalled();
    expect(acquireProbeLockMock).not.toHaveBeenCalled();
  });

  it('returns 503 from a fresh degraded entry, with a generic error only', async () => {
    getSteemHealthStaleMock.mockResolvedValue({
      healthy: false,
      checkedAt: Date.now() - 10_000,
      error: 'upstream ETIMEDOUT stack internals',
    });
    const { GET } = await importRoute();

    const res = await GET();

    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.status).toBe('degraded');
    expect(body.checks.steem.healthy).toBe(false);
    // Audit N-20: raw probe internals stay in server logs; the response
    // carries the generic message.
    expect(body.checks.steem.error).toBe('Steem node check failed');
    expect(JSON.stringify(body)).not.toContain('ETIMEDOUT');
    expect(checkSteemNodeHealthMock).not.toHaveBeenCalled();
  });

  it('serves a stale entry with X-Health-Stale when the probe lock is held elsewhere', async () => {
    getSteemHealthStaleMock.mockResolvedValue({
      healthy: true,
      checkedAt: Date.now() - FRESH_THRESHOLD - 5_000,
      blockNumber: 777,
    });
    acquireProbeLockMock.mockResolvedValue(false);
    const { GET } = await importRoute();

    const res = await GET();

    expect(res.status).toBe(200);
    expect(res.headers.get('X-Health-Stale')).toBe('true');
    expect((await res.json()).checks.steem.blockNumber).toBe(777);
    // Lock contention means: no probe from this instance (probe storm guard).
    expect(checkSteemNodeHealthMock).not.toHaveBeenCalled();
  });

  it('serves a stale DEGRADED entry as 503 + X-Health-Stale when the lock is held elsewhere', async () => {
    // Staleness and degraded-ness are orthogonal: a cached unhealthy entry
    // past the fresh window still answers 503 while another instance
    // revalidates — the stale header tells the client the verdict is dated.
    getSteemHealthStaleMock.mockResolvedValue({
      healthy: false,
      checkedAt: Date.now() - FRESH_THRESHOLD - 5_000,
      error: 'upstream ETIMEDOUT stack internals',
    });
    acquireProbeLockMock.mockResolvedValue(false);
    const { GET } = await importRoute();

    const res = await GET();

    expect(res.status).toBe(503);
    expect(res.headers.get('X-Health-Stale')).toBe('true');
    const body = await res.json();
    expect(body.status).toBe('degraded');
    // Audit N-20 still applies on the stale path: generic message only.
    expect(body.checks.steem.error).toBe('Steem node check failed');
    expect(JSON.stringify(body)).not.toContain('ETIMEDOUT');
    // Contended lock: this instance neither probes nor rewrites the shared
    // entry — the lock holder owns the revalidation.
    expect(checkSteemNodeHealthMock).not.toHaveBeenCalled();
    expect(markSteemUnhealthyMock).not.toHaveBeenCalled();
  });

  it('acquires the lock on a stale entry, probes healthy and records it', async () => {
    getSteemHealthStaleMock.mockResolvedValue({
      healthy: true,
      checkedAt: Date.now() - FRESH_THRESHOLD - 5_000,
    });
    const { GET } = await importRoute();

    const res = await GET();

    expect(res.status).toBe(200);
    expect(res.headers.get('X-Health-Stale')).toBeNull();
    expect(checkSteemNodeHealthMock).toHaveBeenCalledTimes(1);
    expect(markSteemHealthyMock).toHaveBeenCalledWith(12345, 42);
    expect(releaseProbeLockMock).toHaveBeenCalledTimes(1);
  });

  it('records unhealthy and answers 503 when the live probe finds the node down', async () => {
    getSteemHealthStaleMock.mockResolvedValue({
      healthy: true,
      checkedAt: Date.now() - FRESH_THRESHOLD - 5_000,
    });
    checkSteemNodeHealthMock.mockResolvedValue({
      healthy: false,
      error: 'connection refused',
    });
    const { GET } = await importRoute();

    const res = await GET();

    expect(res.status).toBe(503);
    expect(markSteemUnhealthyMock).toHaveBeenCalledWith('connection refused');
    expect(markSteemHealthyMock).not.toHaveBeenCalled();
  });

  it('probes directly with no cached entry and shares one probe across concurrent requests', async () => {
    const { GET } = await importRoute();

    const [a, b] = await Promise.all([GET(), GET()]);

    // Single-flight: two concurrent requests, one node probe.
    expect(checkSteemNodeHealthMock).toHaveBeenCalledTimes(1);
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    // No cache entry → the lock is not attempted (nothing stale to guard).
    expect(acquireProbeLockMock).not.toHaveBeenCalled();
  });

  it('answers 503 and marks unhealthy when the probe itself throws', async () => {
    checkSteemNodeHealthMock.mockRejectedValue(new Error('probe crashed'));
    const { GET } = await importRoute();

    const res = await GET();

    expect(res.status).toBe(503);
    expect(markSteemUnhealthyMock).toHaveBeenCalledWith('probe crashed');
  });

  describe('no-Redis throttle', () => {
    beforeEach(() => {
      getRedisMock.mockReturnValue(null);
    });

    it('replays the in-memory probe result within the 5s window', async () => {
      const { GET } = await importRoute();

      const first = await GET();
      expect(first.status).toBe(200);

      vi.advanceTimersByTime(2_000);
      const second = await GET();

      expect(second.status).toBe(200);
      expect(checkSteemNodeHealthMock).toHaveBeenCalledTimes(1);
    });

    it('replays an UNHEALTHY probe result within the window as 503, without re-probing', async () => {
      // The throttle is verdict-agnostic: an unhealthy in-memory answer is
      // replayed too, so a down node is not re-probed per request during the
      // window and clients consistently see 503.
      checkSteemNodeHealthMock.mockResolvedValue({
        healthy: false,
        error: 'connection refused',
      });
      const { GET } = await importRoute();

      const first = await GET();
      expect(first.status).toBe(503);

      vi.advanceTimersByTime(2_000);
      const second = await GET();

      expect(second.status).toBe(503);
      expect((await second.json()).status).toBe('degraded');
      expect(checkSteemNodeHealthMock).toHaveBeenCalledTimes(1);
    });

    it('re-probes once the 5s window has elapsed', async () => {
      const { GET } = await importRoute();

      await GET();
      vi.advanceTimersByTime(5_001);
      await GET();

      expect(checkSteemNodeHealthMock).toHaveBeenCalledTimes(2);
    });
  });
});
