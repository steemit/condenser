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

// Guardrail the legacy recursion lacked (audit follow-up): a page cap. A
// full page whose cursor never advances would otherwise page forever.
// Chain reality (get_follow_count): the vast majority of accounts follow
// < 1k, so 20 pages x 1000 entries is ~4x headroom over even the largest
// real users (~5k). Bot accounts with hundreds of thousands of follows do
// exist on chain (e.g. ~682k) and are truncated here; the loss is only
// that account's Follow/Mute initial-state correctness — the pages
// collected before the cap are kept and the truncation logged (warn
// below).
const MAX_PAGES = 20;

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
  getState: () => RootState
): Promise<void> {
  const entry = getState().global.follow?.getFollowingAsync?.[username];
  // Legacy loadFollows returns early while `<type>_loading` is true
  // (FollowSaga.js): this collapses the narrow window where session
  // hydration and loginThunk dispatch loadFollowState concurrently, so the
  // same list is never fetched twice.
  if (entry?.[`${type}_loading`]) return;
  // Legacy loadFollows then skips when `<type>_result` is already present —
  // the in-memory map is kept fresh by updateFollowState's optimistic writes.
  if (entry?.[`${type}_result`]) return;

  dispatch(followListLoading({ follower: username, type, loading: true }));
  try {
    // Legacy accumulates into an OrderedSet; a Set keeps the same
    // duplicate-collapsing behavior for cursor boundary overlaps.
    const accounts = new Set<string>();
    let start = '';
    // Page with the last account name as the start cursor until a page
    // comes back short — exactly legacy loadFollowsLoop's loop condition —
    // plus two guardrails the saga lacked: a page cap and a stall check.
    for (let page = 1; ; page++) {
      const result = await fetchFollowingPage(username, start, type, PAGE_LIMIT);
      for (const e of result) {
        // Member semantics (the RPC already filters by kind; this mirrors
        // legacy's defensive whatList.forEach grouping).
        if (e.following && e.what?.includes(type)) {
          accounts.add(e.following);
        }
      }
      if (result.length < PAGE_LIMIT) break;
      const nextStart = result[result.length - 1]?.following ?? '';
      // Lost or stalled cursor (e.g. the RPC returning the same page for
      // the same cursor): bail and keep what was already collected.
      if (!nextStart || nextStart === start) break;
      if (page >= MAX_PAGES) {
        // Cap reached with a still-full page: keep the collected data and
        // surface the truncation instead of paging (or looping) forever.
        // An expected degradation path, not an error — warn keeps the
        // monitoring error signal clean (store/lib console.warn precedent).
        console.warn(
          `Follow list paging cap reached for ${username}/${type} after ${page} pages; keeping ${accounts.size} accounts`
        );
        break;
      }
      start = nextStart;
    }
    // Known race (accepted): a logout while this fetch is in flight lets
    // this late write re-create the old user's follow entry after
    // resetFollowState cleared it (see logoutThunk). The residue is inert —
    // Follow.tsx reads by the current username — and on par with legacy's
    // lazy residue; a session-generation check is deferred.
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
  // Legacy forks both loads concurrently (UserSaga.js yield fork x2).
  await Promise.all(
    (['blog', 'ignore'] as const).map((type) =>
      loadFollowList(username, type, dispatch, getState)
    )
  );
});
