import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import globalReducer, { receiveFollowList } from '@/store/slices/globalSlice';
import { loadFollowState } from '@/store/thunks/followThunks';
import type { AppDispatch, RootState } from '@/store';

// The thunk's dispatch signature is typed against the full app store; the
// partial reducer under test only touches global state, so widen the type.
type TestStore = { dispatch: AppDispatch; getState: () => RootState };
function makeStore(): TestStore {
  return configureStore({
    reducer: { global: globalReducer },
  }) as unknown as TestStore;
}

interface FollowEntry {
  follower: string;
  following: string;
  what: string[];
}

const entry = (following: string, what: string[]): FollowEntry => ({
  follower: 'alice',
  following,
  what,
});

type PageQueue = { blog: FollowEntry[][]; ignore: FollowEntry[][] };

/** Fetch mock routing by query params, like the real /api/steem/following. */
function stubFollowingRoute(pages: PageQueue) {
  const urls: string[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string) => {
      const url = new URL(input, 'http://localhost');
      urls.push(url.pathname + url.search);
      const type = url.searchParams.get('type') as 'blog' | 'ignore';
      const page = pages[type].shift() ?? [];
      return { ok: true, json: async () => page };
    })
  );
  return urls;
}

describe('loadFollowState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('seeds blog and ignore lists from single pages', async () => {
    const urls = stubFollowingRoute({
      blog: [[entry('bob', ['blog']), entry('carol', ['blog'])]],
      ignore: [[entry('mallory', ['ignore'])]],
    });
    const store = makeStore();

    await store.dispatch(loadFollowState('alice'));

    const followState = store.getState().global.follow!.getFollowingAsync!.alice;
    expect(followState.blog_result).toEqual(['bob', 'carol']);
    expect(followState.blog_count).toBe(2);
    expect(followState.blog_loading).toBe(false);
    expect(followState.ignore_result).toEqual(['mallory']);
    expect(followState.ignore_count).toBe(1);
    expect(followState.ignore_loading).toBe(false);

    expect(urls).toHaveLength(2);
    for (const u of urls) {
      expect(u).toContain('/api/steem/following?');
      expect(u).toContain('account=alice');
      expect(u).toContain('limit=1000');
    }
    expect(urls.some((u) => u.includes('type=blog'))).toBe(true);
    expect(urls.some((u) => u.includes('type=ignore'))).toBe(true);
  });

  it('sets the loading flag while a list is in flight', async () => {
    const releasers: Array<() => void> = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise((resolve) => {
            releasers.push(() => resolve({ ok: true, json: async () => [] }));
          })
      )
    );
    const store = makeStore();

    const pending = store.dispatch(loadFollowState('alice'));
    // Both lists are flagged before any page resolves.
    expect(store.getState().global.follow!.getFollowingAsync!.alice.blog_loading).toBe(true);
    expect(store.getState().global.follow!.getFollowingAsync!.alice.ignore_loading).toBe(true);

    releasers.forEach((release) => release());
    await pending;
    expect(store.getState().global.follow!.getFollowingAsync!.alice.blog_loading).toBe(false);
    expect(store.getState().global.follow!.getFollowingAsync!.alice.ignore_loading).toBe(false);
  });

  it('pages with the last account as cursor until a short page and dedupes boundary overlaps', async () => {
    const firstPage = Array.from({ length: 1000 }, (_, i) => entry(`user${i}`, ['blog']));
    const urls = stubFollowingRoute({
      blog: [firstPage, [entry('user999', ['blog']), entry('zoe', ['blog'])]],
      ignore: [[]],
    });
    const store = makeStore();

    await store.dispatch(loadFollowState('alice'));

    const blogUrls = urls.filter((u) => u.includes('type=blog'));
    expect(blogUrls).toHaveLength(2);
    expect(blogUrls[0]).not.toContain('start=');
    expect(blogUrls[1]).toContain('start=user999');

    const followState = store.getState().global.follow!.getFollowingAsync!.alice;
    // 1000 first-page accounts + zoe; user999 is a cursor-boundary duplicate.
    expect(followState.blog_result).toHaveLength(1001);
    expect(followState.blog_result).toContain('zoe');
    expect(followState.blog_count).toBe(1001);
  });

  it('skips a list whose result is already present (legacy loadFollows parity)', async () => {
    const urls = stubFollowingRoute({
      blog: [[]],
      ignore: [[entry('mallory', ['ignore'])]],
    });
    const store = makeStore();
    store.dispatch(
      receiveFollowList({ follower: 'alice', type: 'blog', accounts: ['bob'] })
    );

    await store.dispatch(loadFollowState('alice'));

    expect(urls).toHaveLength(1);
    expect(urls[0]).toContain('type=ignore');
    // The pre-seeded blog list is untouched.
    expect(store.getState().global.follow!.getFollowingAsync!.alice.blog_result).toEqual(['bob']);
  });

  it('skips a list already being loaded (hydration × login double dispatch)', async () => {
    // Legacy loadFollows returns early on `<type>_loading` (FollowSaga.js);
    // this collapses the window where useSessionHydration and loginThunk
    // dispatch loadFollowState concurrently.
    const releasers: Array<() => void> = [];
    const fetchMock = vi.fn(
      () =>
        new Promise((resolve) => {
          releasers.push(() =>
            resolve({ ok: true, json: async () => [entry('bob', ['blog'])] })
          );
        })
    );
    vi.stubGlobal('fetch', fetchMock);
    const store = makeStore();

    const pending = store.dispatch(loadFollowState('alice'));
    // Loading flags are set synchronously before the fetches suspend.
    expect(store.getState().global.follow!.getFollowingAsync!.alice.blog_loading).toBe(true);
    expect(store.getState().global.follow!.getFollowingAsync!.alice.ignore_loading).toBe(true);

    // A second dispatch while the first is in flight must not fetch.
    await store.dispatch(loadFollowState('alice'));
    expect(fetchMock).toHaveBeenCalledTimes(2);

    releasers.forEach((release) => release());
    await pending;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const followState = store.getState().global.follow!.getFollowingAsync!.alice;
    expect(followState.blog_loading).toBe(false);
    expect(followState.ignore_loading).toBe(false);
    expect(followState.blog_result).toEqual(['bob']);
    expect(followState.ignore_result).toEqual([]);
  });

  it('stops paging when the cursor does not advance (stalled RPC)', async () => {
    // Two identical full pages: after page 2 the cursor repeats page 1's
    // cursor — the loop must terminate instead of fetching forever.
    const fullPage = Array.from({ length: 1000 }, (_, i) => entry(`user${i}`, ['blog']));
    const urls = stubFollowingRoute({
      blog: [fullPage, fullPage],
      ignore: [[]],
    });
    const store = makeStore();

    await store.dispatch(loadFollowState('alice'));

    const blogUrls = urls.filter((u) => u.includes('type=blog'));
    expect(blogUrls).toHaveLength(2);
    expect(blogUrls[1]).toContain('start=user999');
    // Whatever was collected before the stall is kept and landed.
    const followState = store.getState().global.follow!.getFollowingAsync!.alice;
    expect(followState.blog_result).toHaveLength(1000);
    expect(followState.blog_loading).toBe(false);
  });

  it('stops at the page cap on an interminably long list and keeps collected data', async () => {
    // 25 advancing full pages — more than the 20-page cap.
    const fullPages = Array.from({ length: 25 }, (_, p) =>
      Array.from({ length: 1000 }, (_, i) => entry(`p${p}u${i}`, ['blog']))
    );
    const urls = stubFollowingRoute({ blog: fullPages, ignore: [[]] });
    const store = makeStore();

    await store.dispatch(loadFollowState('alice'));

    const blogUrls = urls.filter((u) => u.includes('type=blog'));
    expect(blogUrls).toHaveLength(20); // MAX_PAGES
    // Truncation is surfaced, not silent.
    expect(console.error).toHaveBeenCalled();
    // The data collected up to the cap is kept (no error thrown).
    const followState = store.getState().global.follow!.getFollowingAsync!.alice;
    expect(followState.blog_result).toHaveLength(20_000);
    expect(followState.blog_loading).toBe(false);
  });

  it('fetches nothing for an empty username', async () => {
    const urls = stubFollowingRoute({ blog: [[]], ignore: [[]] });
    const store = makeStore();

    await store.dispatch(loadFollowState(''));

    expect(fetch).not.toHaveBeenCalled();
    expect(urls).toHaveLength(0);
  });

  it('clears the loading flag and leaves the list unseeded when a page fails', async () => {
    stubFollowingRoute({ blog: [[]], ignore: [[]] });
    (fetch as Mock).mockImplementation(async (input: string) => {
      const url = new URL(input, 'http://localhost');
      const type = url.searchParams.get('type');
      if (type === 'blog') {
        return { ok: false, status: 500, json: async () => ({ error: 'boom' }) };
      }
      return { ok: true, json: async () => [entry('mallory', ['ignore'])] };
    });
    const store = makeStore();

    await store.dispatch(loadFollowState('alice'));

    const followState = store.getState().global.follow!.getFollowingAsync!.alice;
    expect(followState.blog_loading).toBe(false);
    expect(followState.blog_result).toBeUndefined();
    // The healthy list still lands.
    expect(followState.ignore_result).toEqual(['mallory']);
    expect(console.error).toHaveBeenCalled();
  });

  it('treats a non-array response as a failure', async () => {
    stubFollowingRoute({ blog: [[]], ignore: [[]] });
    (fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ authenticated: true }), // e.g. an HTML/error body
    });
    const store = makeStore();

    await store.dispatch(loadFollowState('alice'));

    const followState = store.getState().global.follow!.getFollowingAsync!.alice;
    expect(followState.blog_loading).toBe(false);
    expect(followState.ignore_loading).toBe(false);
    expect(followState.blog_result).toBeUndefined();
    expect(followState.ignore_result).toBeUndefined();
  });
});
