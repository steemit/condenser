import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makePostRequest } from '@/__tests__/helpers/request';
import { POST } from '@/app/api/search/route';

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
    expect(endpoint).toBe(`${ES_URL}/hive_posts/_search?scroll=1m`);
    expect(JSON.parse(init.body)).toEqual({
      size: 30,
      query: { match_phrase: { searchable: { query: 'steem', slop: 3 } } },
      sort: { created_at: { order: 'desc' } }, // legacy default sort field
    });
    expect(init.signal).toBeDefined();
    expect(await res.json()).toEqual(ES_RESULT);
  });

  it('honors the legacy ELASTICSEARCH_ENDPOINT alias', async () => {
    vi.stubEnv('ELASTICSEARCH_URL', '');
    vi.stubEnv('ELASTICSEARCH_ENDPOINT', ES_URL);
    const fetchMock = mockEsOk();
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST(makePostRequest('/api/search', { q: 'steem' }));
    expect(res.status).toBe(200);
    expect(fetchMock.mock.calls[0][0]).toBe(
      `${ES_URL}/hive_posts/_search?scroll=1m`
    );
  });

  it('targets hive_replies / hive_accounts by depth', async () => {
    const fetchMock = mockEsOk();
    vi.stubGlobal('fetch', fetchMock);

    await POST(makePostRequest('/api/search', { q: 'steem', depth: 1 }));
    await POST(makePostRequest('/api/search', { q: 'steem', depth: 2 }));

    expect(fetchMock.mock.calls[0][0]).toBe(
      `${ES_URL}/hive_replies/_search?scroll=1m`
    );
    expect(fetchMock.mock.calls[1][0]).toBe(
      `${ES_URL}/hive_accounts/_search?scroll=1m`
    );
    // Account search uses a wildcard on `name`, no sort.
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      size: 30,
      query: { wildcard: { name: { value: 'steem*' } } },
    });
  });

  it('posts scroll_id to the scroll endpoint for pagination', async () => {
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
});
