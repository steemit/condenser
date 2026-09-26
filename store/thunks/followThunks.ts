/**
 * Follow state thunks
 * Seeds global.follow.getFollowingAsync[username] from chain data once the
 * current user is known (session hydration / successful login).
 *
 * Rewrite of legacy FollowSaga.loadFollows + loadFollowsLoop
 * (condenser-legacy/src/app/redux/FollowSaga.js), which UserSaga's
 * usernamePasswordLogin forked for both 'blog' and 'ignore' after login
 * (UserSaga.js) — including the localStorage auto-login path, i.e. every
 * session start of a logged-in user. The Next.js app has no saga, so this
 * thunk is dispatched from useSessionHydration (mount) and loginThunk
 * (login) instead.
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { followListLoading, receiveFollowList } from '../slices/globalSlice';
import type { AppDispatch, RootState } from '../index';

// Legacy pages through the following list in blocks of 1000
// (FollowSaga.js loadFollowsLoop default limit).
const PAGE_LIMIT = 1000;

type FollowKind = 'blog' | 'ignore';

interface FollowEntry {
  following?: string;
  what?: string[];
  [key: string]: unknown;
}

/** Fetch one page from /api/steem/following (legacy getFollowingAsync shape). */
async function fetchFollowingPage(
  account: string,
  start: string,
  type: FollowKind,
  limit: number
): Promise<FollowEntry[]> {
  const searchParams = new URLSearchParams({
    account,
    type,
    limit: limit.toString(),
  });
  if (start) searchParams.set('start', start);
  const res = await fetch(`/api/steem/following?${searchParams.toString()}`, {
    credentials: 'same-origin',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${type} list (${res.status})`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error(`Malformed ${type} list response`);
  }
  return data as FollowEntry[];
}

async function loadFollowList(
  username: string,
  type: FollowKind,
  dispatch: AppDispatch,
  isLoaded: (type: FollowKind) => boolean
): Promise<void> {
  // Legacy loadFollows skips when `<type>_result` is already present — the
  // in-memory map is kept fresh by updateFollowState's optimistic writes.
  if (isLoaded(type)) return;

  dispatch(followListLoading({ follower: username, type, loading: true }));
  try {
    // Legacy accumulates into an OrderedSet; a Set keeps the same
    // duplicate-collapsing behavior for cursor boundary overlaps.
    const accounts = new Set<string>();
    let start = '';
    // Page with the last account name as the start cursor until a page
    // comes back short — exactly legacy loadFollowsLoop's loop condition.
    for (;;) {
      const page = await fetchFollowingPage(username, start, type, PAGE_LIMIT);
      for (const entry of page) {
        // Member semantics (the RPC already filters by kind; this mirrors
        // legacy's defensive whatList.forEach grouping).
        if (entry.following && entry.what?.includes(type)) {
          accounts.add(entry.following);
        }
      }
      if (page.length < PAGE_LIMIT) break;
      start = page[page.length - 1]?.following ?? '';
      if (!start) break; // lost cursor — bail instead of looping forever
    }
    dispatch(
      receiveFollowList({ follower: username, type, accounts: [...accounts] })
    );
  } catch (error) {
    console.error(`Failed to load ${type} follow list for ${username}:`, error);
    // Legacy leaves the loading flag stuck on error; clearing it means the
    // buttons render from the (empty) map instead of spinning forever. The
    // list stays unseeded and is retried on the next page load.
    dispatch(followListLoading({ follower: username, type, loading: false }));
  }
}

/**
 * Load the logged-in user's full following ('blog') and ignoring ('ignore')
 * sets into global.follow.getFollowingAsync[username].
 */
export const loadFollowState = createAsyncThunk<
  void,
  string,
  { dispatch: AppDispatch; state: RootState }
>('follow/loadFollowState', async (username, { dispatch, getState }) => {
  if (!username) return;
  const isLoaded = (type: FollowKind) =>
    Boolean(
      getState().global.follow?.getFollowingAsync?.[username]?.[`${type}_result`]
    );
  // Legacy forks both loads concurrently (UserSaga.js yield fork x2).
  await Promise.all(
    (['blog', 'ignore'] as const).map((type) =>
      loadFollowList(username, type, dispatch, isLoaded)
    )
  );
});
