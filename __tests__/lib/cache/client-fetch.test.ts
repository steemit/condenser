import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cachedFetch, invalidateFromResponse } from '@/lib/cache/client-fetch';
import { clientCache } from '@/lib/cache/client-cache';

const OPTS = { staleMs: 15_000, maxAgeMs: 120_000 };

function jsonResponse(data: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status: 200, headers });
}

describe('cachedFetch', () => {
  beforeEach(() => {
    clientCache.clear();
    vi.restoreAllMocks();
  });

  it('serves a fresh cache entry without hitting the network', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: 1 }));
    vi.stubGlobal('fetch', fetchMock);

    await cachedFetch('/api/steem/post?author=bob&permlink=p', OPTS);
    const second = await cachedFetch('/api/steem/post?author=bob&permlink=p', OPTS);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second).toEqual({ data: { ok: 1 }, stale: false });
  });
});

describe('invalidateFromResponse', () => {
  beforeEach(() => {
    clientCache.clear();
    vi.restoreAllMocks();
  });

  it('applies comma-separated X-Cache-Invalidate tokens to matching entries only', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    // Seed a post entry and a feed entry.
    fetchMock.mockResolvedValueOnce(jsonResponse({ title: 'old' }));
    await cachedFetch('/api/steem/post?author=bob&permlink=p', OPTS);
    fetchMock.mockResolvedValueOnce(jsonResponse(['feed']));
    await cachedFetch('/api/steem/posts?sort=trending&limit=20', OPTS);

    // The broadcast client applies the write response's invalidation tokens
    // (voter + permlink) directly — the broadcast POST is a raw fetch, not a
    // cachedFetch.
    invalidateFromResponse(
      new Response(null, { headers: { 'X-Cache-Invalidate': 'alice,permlink=p' } })
    );

    // The post entry was evicted by the permlink token → network hit.
    fetchMock.mockResolvedValueOnce(jsonResponse({ title: 'fresh' }));
    const post = await cachedFetch('/api/steem/post?author=bob&permlink=p', OPTS);
    expect(post.data).toEqual({ title: 'fresh' });

    // The feed entry matches no token → still served from cache.
    const feed = await cachedFetch('/api/steem/posts?sort=trending&limit=20', OPTS);
    expect(feed.data).toEqual(['feed']);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('ignores blank tokens and a missing header', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    fetchMock.mockResolvedValueOnce(jsonResponse(['feed']));
    await cachedFetch('/api/steem/posts?sort=trending&limit=20', OPTS);

    invalidateFromResponse(
      new Response(null, { headers: { 'X-Cache-Invalidate': ' , ' } })
    );
    invalidateFromResponse(new Response(null));

    const feed = await cachedFetch('/api/steem/posts?sort=trending&limit=20', OPTS);
    expect(feed.data).toEqual(['feed']);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
