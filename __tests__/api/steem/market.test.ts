// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The market route keeps module-level cache/inflight state, so each test
// imports a fresh module copy (vi.resetModules + dynamic import).

const MARKET = {
  steem: {
    name: 'Steem',
    symbol: 'STEEM',
    timepoints: [{ price_usd: '0.25', timepoint: '2026-01-01T00:00:00' }],
  },
};

async function importRoute() {
  return import('@/app/api/steem/market/route');
}

describe('GET /api/steem/market', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.useRealTimers();
    vi.stubEnv('STEEM_MARKET_ENDPOINT', 'https://market.example/feed');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('answers 503 when the endpoint is not configured', async () => {
    vi.stubEnv('STEEM_MARKET_ENDPOINT', '');
    const { GET } = await importRoute();

    const res = await GET();
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'Market endpoint not configured' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns the fetched data with 200', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(MARKET), { status: 200 })
    );
    const { GET } = await importRoute();

    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: MARKET });
  });

  it('answers 500 {error} when the upstream fails and no stale copy exists', async () => {
    fetchMock.mockResolvedValue(new Response('down', { status: 502 }));
    const { GET } = await importRoute();

    const res = await GET();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Failed to fetch market data' });
  });

  it('serves the stale cached copy when the upstream fails past the TTL', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(MARKET), { status: 200 })
    );
    const { GET } = await importRoute();

    const fresh = await GET();
    expect(fresh.status).toBe(200);

    // Past the 2h TTL the next request refetches; that fetch fails.
    vi.setSystemTime(new Date('2026-01-01T03:00:00Z'));
    fetchMock.mockResolvedValueOnce(new Response('down', { status: 500 }));

    const stale = await GET();
    expect(stale.status).toBe(200);
    expect(await stale.json()).toEqual({ data: MARKET });
  });

  it('does not refetch while a fresh cache entry exists', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(MARKET), { status: 200 })
    );
    const { GET } = await importRoute();

    await GET();
    await GET();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
