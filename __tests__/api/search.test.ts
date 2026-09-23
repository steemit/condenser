import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makePostRequest } from '@/__tests__/helpers/request';
import { POST } from '@/app/api/search/route';

// Partial mock: keep the real RATE_LIMITS / rateLimitResponse, stub only the
// Redis-backed check (audit N-08).
vi.mock('@/lib/cache/rate-limit', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/cache/rate-limit')>();
  return {
    ...actual,
    checkRateLimit: vi.fn(async () => ({ allowed: true })),
  };
});

import { checkRateLimit } from '@/lib/cache/rate-limit';

const checkRateLimitMock = vi.mocked(checkRateLimit);

const ES_URL = 'http://es.example:9200';

const ES_RESULT = {
  hits: { hits: [{ _source: { author: 'alice' } }], total: { value: 1 } },
  _scroll_id: 'scroll-1',
};

function mockEsOk(body: unknown = ES_RESULT) {
  return vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  );
}

describe('POST /api/search', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubEnv('ELASTICSEARCH_URL', ES_URL);
    checkRateLimitMock.mockResolvedValue({ allowed: true });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns 400 when q is empty', async () => {
    const res = await POST(makePostRequest('/api/search', { q: '  ' }));
    expect(res.status).toBe(400);
  });

  it('returns empty mock results when no endpoint is configured', async () => {
    vi.stubEnv('ELASTICSEARCH_URL', '');
    vi.stubEnv('ELASTICSEARCH_ENDPOINT', '');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST(makePostRequest('/api/search', { q: 'steem' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      hits: { hits: [], total: { value: 0 } },
      _scroll_id: null,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends the query object unwrapped (no { searchQuery } wrapper)', async () => {
    const fetchMock = mockEsOk();
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST(makePostRequest('/api/search', { q: 'steem' }));
    expect(res.status).toBe(200);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, init] = fetchMock.mock.calls[0];
    expect(endpoint).toBe(`${ES_URL}/hive_posts/_search`);
    expect(JSON.parse(init.body)).toEqual({
      size: 30,
      query: { match_phrase: { searchable: { query: 'steem', slop: 3 } } },
      sort: { created_at: { order: 'desc' } }, // legacy default sort field
    });
    expect(init.signal).toBeDefined();
    expect(await res.json()).toEqual(ES_RESULT);
  });

  it('does not open an ES scroll context on new queries (audit N-09)', async () => {
    // Legacy appended ?scroll=1m to every new search, holding a 1m scroll
    // context per request (ES max_open_scroll_context=500 → global 502s).
    const fetchMock = mockEsOk();
    vi.stubGlobal('fetch', fetchMock);

    await POST(makePostRequest('/api/search', { q: 'steem' }));
    await POST(makePostRequest('/api/search', { q: 'steem', depth: 1 }));
    await POST(makePostRequest('/api/search', { q: 'steem', depth: 2 }));

    for (const [endpoint] of fetchMock.mock.calls) {
      expect(endpoint).not.toContain('scroll');
      expect(endpoint).toMatch(/\/hive_(posts|replies|accounts)\/_search$/);
    }
  });

  it('honors the legacy ELASTICSEARCH_ENDPOINT alias', async () => {
    vi.stubEnv('ELASTICSEARCH_URL', '');
    vi.stubEnv('ELASTICSEARCH_ENDPOINT', ES_URL);
    const fetchMock = mockEsOk();
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST(makePostRequest('/api/search', { q: 'steem' }));
    expect(res.status).toBe(200);
    expect(fetchMock.mock.calls[0][0]).toBe(`${ES_URL}/hive_posts/_search`);
  });

  it('targets hive_replies / hive_accounts by depth', async () => {
    const fetchMock = mockEsOk();
    vi.stubGlobal('fetch', fetchMock);

    await POST(makePostRequest('/api/search', { q: 'steem', depth: 1 }));
    await POST(makePostRequest('/api/search', { q: 'steem', depth: 2 }));

    expect(fetchMock.mock.calls[0][0]).toBe(`${ES_URL}/hive_replies/_search`);
    expect(fetchMock.mock.calls[1][0]).toBe(
      `${ES_URL}/hive_accounts/_search`
    );
    // Account search uses a wildcard on `name`, no sort.
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      size: 30,
      query: { wildcard: { name: { value: 'steem*' } } },
    });
  });

  it('escapes wildcard metacharacters in user (depth=2) queries (audit N-09)', async () => {
    const fetchMock = mockEsOk();
    vi.stubGlobal('fetch', fetchMock);

    // `a*b?c\d` must not inject its own wildcards; only the server-owned
    // trailing `*` (prefix semantics) remains.
    await POST(
      makePostRequest('/api/search', { q: 'a*b?c\\d', depth: 2 })
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      size: 30,
      query: { wildcard: { name: { value: 'a\\*b\\?c\\\\d*' } } },
    });

    // Clean names pass through untouched.
    await POST(makePostRequest('/api/search', { q: 'steem', depth: 2 }));
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).query).toEqual({
      wildcard: { name: { value: 'steem*' } },
    });
  });

  it('sorts only by whitelisted fields, falling back to created_at (audit N-09)', async () => {
    const fetchMock = mockEsOk();
    vi.stubGlobal('fetch', fetchMock);

    // Both UI-exposed sorts pass through.
    await POST(makePostRequest('/api/search', { q: 'steem', s: 'payout' }));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).sort).toEqual({
      payout: { order: 'desc' },
    });

    // Anything else is not forwarded as an arbitrary ES field name.
    await POST(
      makePostRequest('/api/search', { q: 'steem', s: '_score' })
    );
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).sort).toEqual({
      created_at: { order: 'desc' },
    });
  });

  it('paginates with a clamped from offset instead of scroll (audit N-09)', async () => {
    const fetchMock = mockEsOk();
    vi.stubGlobal('fetch', fetchMock);

    await POST(
      makePostRequest('/api/search', { q: 'steem', from: 60 })
    );
    const body1 = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body1.from).toBe(60);
    expect(fetchMock.mock.calls[0][0]).not.toContain('scroll');

    // Kept inside ES's 10000-doc result window (from + size <= 10000).
    await POST(
      makePostRequest('/api/search', { q: 'steem', from: 99999 })
    );
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).from).toBe(9970);

    // Non-positive / invalid offsets are simply omitted.
    await POST(
      makePostRequest('/api/search', { q: 'steem', from: -5 })
    );
    expect(JSON.parse(fetchMock.mock.calls[2][1].body).from).toBeUndefined();
    await POST(
      makePostRequest('/api/search', { q: 'steem', from: 'nan' })
    );
    expect(JSON.parse(fetchMock.mock.calls[3][1].body).from).toBeUndefined();
  });

  it('posts scroll_id to the scroll endpoint for legacy pagination', async () => {
    const fetchMock = mockEsOk();
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST(
      makePostRequest('/api/search', { q: 'steem', scroll_id: 'abc123' })
    );
    expect(res.status).toBe(200);

    const [endpoint, init] = fetchMock.mock.calls[0];
    expect(endpoint).toBe(`${ES_URL}/_search/scroll`);
    expect(JSON.parse(init.body)).toEqual({ scroll: '1m', scroll_id: 'abc123' });
  });

  it('returns 502 when ES responds non-2xx', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('bad request', { status: 400 }));
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST(makePostRequest('/api/search', { q: 'steem' }));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({
      error: 'Search backend error',
      code: 'SEARCH_BACKEND_ERROR',
      es_status: 400,
    });
  });

  it('returns 503 when the ES fetch times out', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValue(new DOMException('The operation timed out', 'TimeoutError'));
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST(makePostRequest('/api/search', { q: 'steem' }));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({
      error: 'Search temporarily unavailable',
      code: 'SEARCH_UNAVAILABLE',
    });
  });

  it('returns 503 when ES is unreachable (network error)', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValue(new TypeError('fetch failed'));
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST(makePostRequest('/api/search', { q: 'steem' }));
    expect(res.status).toBe(503);
  });

  it('checks the search limit (30/min/IP) before querying ES', async () => {
    const fetchMock = mockEsOk();
    vi.stubGlobal('fetch', fetchMock);

    await POST(makePostRequest('/api/search', { q: 'steem' }));
    expect(checkRateLimitMock).toHaveBeenCalledWith(expect.anything(), {
      key: 'search',
      limit: 30,
      windowSeconds: 60,
    });
  });

  it('returns 429 with Retry-After and never reaches ES when limited', async () => {
    checkRateLimitMock.mockResolvedValue({ allowed: false, retryAfterSeconds: 33 });
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST(makePostRequest('/api/search', { q: 'steem' }));
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('33');
    expect(await res.json()).toEqual({
      error: 'Too many requests. Please try again later.',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 413 when the body exceeds the 64KB cap', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST(makePostRequest('/api/search', { q: 'x'.repeat(70 * 1024) }));
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: 'Request body too large' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
