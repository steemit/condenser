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

describe('invalidation vs in-flight fetches (C3)', () => {
  beforeEach(() => {
    clientCache.clear();
    vi.restoreAllMocks();
  });

  /** fetch stub whose response can be released mid-test. */
  function deferredFetch() {
    let resolveFetch!: (r: Response) => void;
    const fetchMock = vi.fn().mockImplementation(
      () => new Promise<Response>((resolve) => (resolveFetch = resolve))
    );
    vi.stubGlobal('fetch', fetchMock);
    // A wrapper (not the captured binding) so the call site always reads the
    // resolver assigned by the latest fetch invocation.
    return { fetchMock, release: (r: Response) => resolveFetch(r) };
  }

  it('does not resurrect an evicted entry from an in-flight background refresh', async () => {
    const { fetchMock, release } = deferredFetch();

    // Seed an already-stale entry so the read returns it and fires a
    // background refresh (negative staleMs puts staleAt in the past).
    clientCache.set('/api/steem/post?author=bob&permlink=p', { title: 'old' }, -1, 120_000);
    const first = await cachedFetch('/api/steem/post?author=bob&permlink=p', OPTS);
    expect(first).toEqual({ data: { title: 'old' }, stale: true });

    // A write completes while the refresh is in flight → the entry is evicted.
    invalidateFromResponse(
      new Response(null, { headers: { 'X-Cache-Invalidate': 'permlink=p' } })
    );

    // The refresh resolves with the PRE-write snapshot it captured earlier.
    release(jsonResponse({ title: 'pre-write' }));
    await new Promise((r) => setTimeout(r, 0)); // let the .then chain settle

    // The eviction must hold: the next read goes to the network instead of
    // serving the resurrected snapshot from a fresh window.
    fetchMock.mockResolvedValue(jsonResponse({ title: 'fresh' }));
    const second = await cachedFetch('/api/steem/post?author=bob&permlink=p', OPTS);
    expect(second).toEqual({ data: { title: 'fresh' }, stale: false });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('drops the write-back when any invalidation raced the refresh (conservative)', async () => {
    const { fetchMock, release } = deferredFetch();

    clientCache.set('/api/steem/post?author=bob&permlink=p', { title: 'old' }, -1, 120_000);
    await cachedFetch('/api/steem/post?author=bob&permlink=p', OPTS);

    // An invalidation whose token matches nothing in the store still raced
    // the refresh: the guard cannot know whether the token targeted this URL
    // (the URL's entry is not always in the store), so the write-back is
    // dropped — one extra refetch — rather than risk a resurrection.
    invalidateFromResponse(
      new Response(null, { headers: { 'X-Cache-Invalidate': 'someoneelse' } })
    );

    release(jsonResponse({ title: 'refreshed' }));
    await new Promise((r) => setTimeout(r, 0));

    // The old entry survives (SWR serves it stale) and a new refresh runs;
    // the dropped write-back costs one network hit, nothing more.
    fetchMock.mockResolvedValueOnce(jsonResponse({ title: 'converged' }));
    const second = await cachedFetch('/api/steem/post?author=bob&permlink=p', OPTS);
    expect(second).toEqual({ data: { title: 'old' }, stale: true });
    await new Promise((r) => setTimeout(r, 0)); // second refresh settles

    // No invalidation raced the second refresh → its write-back lands.
    const third = await cachedFetch('/api/steem/post?author=bob&permlink=p', OPTS);
    expect(third).toEqual({ data: { title: 'converged' }, stale: false });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not cache a blocking fetch that raced an invalidation', async () => {
    const { fetchMock, release } = deferredFetch();

    // No cache yet → the read blocks on fetch. Release order: the write's
    // invalidation lands BEFORE the response does.
    const pending = cachedFetch('/api/steem/post?author=bob&permlink=p', OPTS);
    invalidateFromResponse(
      new Response(null, { headers: { 'X-Cache-Invalidate': 'permlink=p' } })
    );
    release(jsonResponse({ title: 'pre-write' }));
    expect(await pending).toEqual({ data: { title: 'pre-write' }, stale: false });

    // The racing snapshot must not have been cached: the next read refetches.
    fetchMock.mockResolvedValue(jsonResponse({ title: 'fresh' }));
    const second = await cachedFetch('/api/steem/post?author=bob&permlink=p', OPTS);
    expect(second.data).toEqual({ title: 'fresh' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('clientCache invalidation epoch', () => {
  beforeEach(() => {
    clientCache.clear();
    vi.restoreAllMocks();
  });

  it('advances on every invalidate() call and on clear()', () => {
    const before = clientCache.getInvalidationEpoch();

    // Even a match-less invalidate advances the epoch: an in-flight fetch's
    // key is not always in the store, so the guard cannot rely on matches.
    clientCache.invalidate('no-such-prefix');
    expect(clientCache.getInvalidationEpoch()).toBe(before + 1);

    clientCache.set('/api/steem/post?author=bob&permlink=p', { a: 1 }, 1000, 2000);
    clientCache.invalidate('permlink=p');
    expect(clientCache.getInvalidationEpoch()).toBe(before + 2);

    clientCache.clear();
    expect(clientCache.getInvalidationEpoch()).toBe(before + 3);
  });
});
