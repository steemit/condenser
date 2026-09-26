import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import globalReducer, {
  followListLoading,
  receiveFollowList,
  receiveNotifications,
  receiveUnreadNotifications,
  resetFollowState,
  updateFollowState,
} from '@/store/slices/globalSlice';
import type { GlobalState } from '@/store/slices/globalSlice';

function stateAfter(state: GlobalState | undefined, action: Parameters<typeof globalReducer>[1]) {
  return globalReducer(state ?? globalReducer(undefined, { type: 'init' }), action);
}

describe('globalSlice follow state', () => {
  describe('updateFollowState (member semantics, legacy TransactionSaga parity)', () => {
    it('treats a single-element chain-style what:["blog"] as following', () => {
      const state = stateAfter(
        undefined,
        updateFollowState({ follower: 'alice', following: 'bob', what: ['blog'] })
      );
      const entry = state.follow!.getFollowingAsync!.alice;
      expect(entry.blog_result).toEqual(['bob']);
      expect(entry.ignore_result).toEqual([]);
      expect(entry.blog_count).toBe(1);
      expect(entry.ignore_count).toBe(0);
    });

    it('treats a single-element chain-style what:["ignore"] as muting', () => {
      const state = stateAfter(
        undefined,
        updateFollowState({ follower: 'alice', following: 'bob', what: ['ignore'] })
      );
      const entry = state.follow!.getFollowingAsync!.alice;
      // Positional semantics (what[0] === 'blog') would have misread this
      // as a follow; member semantics must not.
      expect(entry.blog_result).toEqual([]);
      expect(entry.ignore_result).toEqual(['bob']);
      expect(entry.ignore_count).toBe(1);
    });

    it('supports blog and ignore at once regardless of order', () => {
      const state = stateAfter(
        undefined,
        updateFollowState({ follower: 'alice', following: 'bob', what: ['ignore', 'blog'] })
      );
      const entry = state.follow!.getFollowingAsync!.alice;
      expect(entry.blog_result).toEqual(['bob']);
      expect(entry.ignore_result).toEqual(['bob']);
    });

    it('removes both relations on an empty what array', () => {
      let state = stateAfter(
        undefined,
        updateFollowState({ follower: 'alice', following: 'bob', what: ['blog', 'ignore'] })
      );
      state = stateAfter(
        state,
        updateFollowState({ follower: 'alice', following: 'bob', what: [] })
      );
      const entry = state.follow!.getFollowingAsync!.alice;
      expect(entry.blog_result).toEqual([]);
      expect(entry.ignore_result).toEqual([]);
      expect(entry.blog_count).toBe(0);
      expect(entry.ignore_count).toBe(0);
    });

    it('keeps the Follow component two-slot payload working', () => {
      // Follow.tsx dispatches ['blog', ''] on follow and ['', 'ignore'] on
      // mute — member semantics must keep handling those shapes.
      let state = stateAfter(
        undefined,
        updateFollowState({ follower: 'alice', following: 'bob', what: ['blog', ''] })
      );
      expect(state.follow!.getFollowingAsync!.alice.blog_result).toEqual(['bob']);

      state = stateAfter(
        state,
        updateFollowState({ follower: 'alice', following: 'carol', what: ['', 'ignore'] })
      );
      const entry = state.follow!.getFollowingAsync!.alice;
      expect(entry.blog_result).toEqual(['bob']);
      expect(entry.ignore_result).toEqual(['carol']);
    });

    it('drops a stale relation when the payload no longer contains it', () => {
      let state = stateAfter(
        undefined,
        updateFollowState({ follower: 'alice', following: 'bob', what: ['blog'] })
      );
      state = stateAfter(
        state,
        updateFollowState({ follower: 'alice', following: 'bob', what: [] })
      );
      expect(state.follow!.getFollowingAsync!.alice.blog_result).toEqual([]);
    });
  });

  describe('followListLoading', () => {
    it('creates the follow structure and flags the requested list', () => {
      const state = stateAfter(
        undefined,
        followListLoading({ follower: 'alice', type: 'blog', loading: true })
      );
      expect(state.follow!.getFollowingAsync!.alice.blog_loading).toBe(true);
      expect(state.follow!.getFollowingAsync!.alice.ignore_loading).toBeUndefined();
    });

    it('clears the flag on completion', () => {
      let state = stateAfter(
        undefined,
        followListLoading({ follower: 'alice', type: 'ignore', loading: true })
      );
      state = stateAfter(
        state,
        followListLoading({ follower: 'alice', type: 'ignore', loading: false })
      );
      expect(state.follow!.getFollowingAsync!.alice.ignore_loading).toBe(false);
    });
  });

  describe('receiveFollowList', () => {
    it('seeds blog_result with accounts, count and cleared loading', () => {
      let state = stateAfter(
        undefined,
        followListLoading({ follower: 'alice', type: 'blog', loading: true })
      );
      state = stateAfter(
        state,
        receiveFollowList({ follower: 'alice', type: 'blog', accounts: ['bob', 'carol'] })
      );
      const entry = state.follow!.getFollowingAsync!.alice;
      expect(entry.blog_result).toEqual(['bob', 'carol']);
      expect(entry.blog_count).toBe(2);
      expect(entry.blog_loading).toBe(false);
    });

    it('seeds ignore_result independently of blog_result', () => {
      const state = stateAfter(
        undefined,
        receiveFollowList({ follower: 'alice', type: 'ignore', accounts: ['mallory'] })
      );
      const entry = state.follow!.getFollowingAsync!.alice;
      expect(entry.ignore_result).toEqual(['mallory']);
      expect(entry.ignore_count).toBe(1);
      expect(entry.ignore_loading).toBe(false);
      expect(entry.blog_result).toBeUndefined();
    });

    it('does not clobber an optimistic update for a different follower', () => {
      let state = stateAfter(
        undefined,
        updateFollowState({ follower: 'dave', following: 'erin', what: ['blog'] })
      );
      state = stateAfter(
        state,
        receiveFollowList({ follower: 'alice', type: 'blog', accounts: ['bob'] })
      );
      expect(state.follow!.getFollowingAsync!.dave.blog_result).toEqual(['erin']);
      expect(state.follow!.getFollowingAsync!.alice.blog_result).toEqual(['bob']);
    });

    // Documented semantics (legacy merge parity, PR #4046): the chain
    // snapshot replaces the whole per-kind list. An optimistic write that
    // is still in flight when the snapshot lands is overwritten wholesale —
    // the button bounces back even though the broadcast succeeded (the
    // ≤30s cache window in the following route makes this reachable).
    it('overwrites an in-flight optimistic write for the same follower (whole-list replacement)', () => {
      let state = stateAfter(
        undefined,
        updateFollowState({ follower: 'alice', following: 'bob', what: ['blog'] })
      );
      // The chain snapshot does not include 'bob' yet.
      state = stateAfter(
        state,
        receiveFollowList({ follower: 'alice', type: 'blog', accounts: ['carol'] })
      );
      const entry = state.follow!.getFollowingAsync!.alice;
      expect(entry.blog_result).toEqual(['carol']);
      expect(entry.blog_count).toBe(1);
    });
  });

  describe('resetFollowState', () => {
    it('clears all per-follower follow state', () => {
      let state = stateAfter(
        undefined,
        updateFollowState({ follower: 'alice', following: 'bob', what: ['blog'] })
      );
      state = stateAfter(state, resetFollowState());
      expect(state.follow).toBeUndefined();
    });
  });

  describe('receiveNotifications (id dedup, T4)', () => {
    const page = (ids: number[]) => ids.map((id) => ({ id, type: 'vote', msg: `n${id}` }));

    it('does not duplicate the first page when dispatched twice', () => {
      // Dev strict mode runs the mount effect twice and the SWR cache
      // returns the same page for both — legacy's blind concat appended it
      // twice (T4).
      let state = stateAfter(
        undefined,
        receiveNotifications({ name: 'alice', notifications: page([3, 2, 1]) })
      );
      state = stateAfter(
        state,
        receiveNotifications({ name: 'alice', notifications: page([3, 2, 1]) })
      );
      expect(state.notifications.alice.notifications.map((n) => n.id)).toEqual([3, 2, 1]);
    });

    it('appends cursor pages after the existing list', () => {
      let state = stateAfter(
        undefined,
        receiveNotifications({ name: 'alice', notifications: page([3, 2, 1]) })
      );
      state = stateAfter(
        state,
        receiveNotifications({ name: 'alice', notifications: page([0, -1]), append: true })
      );
      expect(state.notifications.alice.notifications.map((n) => n.id)).toEqual([3, 2, 1, 0, -1]);
    });

    it('does not duplicate a cursor page dispatched twice (double load-more)', () => {
      let state = stateAfter(
        undefined,
        receiveNotifications({ name: 'alice', notifications: page([3, 2, 1]) })
      );
      state = stateAfter(
        state,
        receiveNotifications({ name: 'alice', notifications: page([0, -1]), append: true })
      );
      state = stateAfter(
        state,
        receiveNotifications({ name: 'alice', notifications: page([0, -1]), append: true })
      );
      expect(state.notifications.alice.notifications.map((n) => n.id)).toEqual([3, 2, 1, 0, -1]);
    });

    it('refreshes the head of the list on a first-page reload and keeps older paged-in items', () => {
      // User paginated to [3..-1], navigates away and back while two new
      // notifications (5, 4) arrived: the first page now is [5, 4, 3, 2].
      // Expected: new items up front, previously paged items retained at the
      // tail, no duplicates.
      let state = stateAfter(
        undefined,
        receiveNotifications({ name: 'alice', notifications: page([3, 2, 1]) })
      );
      state = stateAfter(
        state,
        receiveNotifications({ name: 'alice', notifications: page([0, -1]), append: true })
      );
      state = stateAfter(
        state,
        receiveNotifications({ name: 'alice', notifications: page([5, 4, 3, 2]) })
      );
      expect(state.notifications.alice.notifications.map((n) => n.id)).toEqual([5, 4, 3, 2, 1, 0, -1]);
    });

    it('replaces the stored copy of an item refreshed by a first-page reload', () => {
      let state = stateAfter(
        undefined,
        receiveNotifications({ name: 'alice', notifications: [{ id: 1, type: 'vote', msg: 'old' }] })
      );
      state = stateAfter(
        state,
        receiveNotifications({ name: 'alice', notifications: [{ id: 1, type: 'vote', msg: 'new' }] })
      );
      expect(state.notifications.alice.notifications).toHaveLength(1);
      expect(state.notifications.alice.notifications[0].msg).toBe('new');
    });

    it('keeps accounts isolated (session binding, #4043)', () => {
      let state = stateAfter(
        undefined,
        receiveNotifications({ name: 'alice', notifications: page([1]) })
      );
      state = stateAfter(
        state,
        receiveNotifications({ name: 'bob', notifications: page([9]) })
      );
      expect(state.notifications.alice.notifications.map((n) => n.id)).toEqual([1]);
      expect(state.notifications.bob.notifications.map((n) => n.id)).toEqual([9]);
    });

    it('keeps id-less items on both merge paths', () => {
      let state = stateAfter(
        undefined,
        receiveNotifications({ name: 'alice', notifications: [{ type: 'vote' }] })
      );
      state = stateAfter(
        state,
        receiveNotifications({ name: 'alice', notifications: page([1]) })
      );
      state = stateAfter(
        state,
        receiveNotifications({ name: 'alice', notifications: [{ type: 'follow' }], append: true })
      );
      const items = state.notifications.alice.notifications;
      expect(items).toHaveLength(3);
    });

    it('stores isLastPage when provided', () => {
      let state = stateAfter(
        undefined,
        receiveNotifications({ name: 'alice', notifications: page([1]), isLastPage: false })
      );
      expect(state.notifications.alice.isLastPage).toBe(false);
      state = stateAfter(
        state,
        receiveNotifications({ name: 'alice', notifications: page([0]), isLastPage: true, append: true })
      );
      expect(state.notifications.alice.isLastPage).toBe(true);
    });

    it('self-dedups a duplicate id inside a single incoming page', () => {
      // One page carrying [5, 5, 3] must store 5 once — the cross-page id
      // check alone would pass both copies of 5 through.
      const state = stateAfter(
        undefined,
        receiveNotifications({ name: 'alice', notifications: page([5, 5, 3]) })
      );
      expect(state.notifications.alice.notifications.map((n) => n.id)).toEqual([5, 3]);
    });

    it('self-dedups a duplicate id inside an appended cursor page', () => {
      let state = stateAfter(
        undefined,
        receiveNotifications({ name: 'alice', notifications: page([3, 2, 1]) })
      );
      state = stateAfter(
        state,
        receiveNotifications({ name: 'alice', notifications: page([1, 1, 0]), append: true })
      );
      expect(state.notifications.alice.notifications.map((n) => n.id)).toEqual([3, 2, 1, 0]);
    });

    it('keeps the stored copy when a cursor page re-sends an existing id (append asymmetry)', () => {
      // Mirror of the first-page replacement test: the append path lets the
      // stored copy win instead of refreshing it.
      let state = stateAfter(
        undefined,
        receiveNotifications({ name: 'alice', notifications: [{ id: 1, type: 'vote', msg: 'old' }] })
      );
      state = stateAfter(
        state,
        receiveNotifications({
          name: 'alice',
          notifications: [{ id: 1, type: 'vote', msg: 'new' }],
          append: true,
        })
      );
      expect(state.notifications.alice.notifications).toHaveLength(1);
      expect(state.notifications.alice.notifications[0].msg).toBe('old');
    });
  });

  describe('receiveUnreadNotifications (stale-write guard, T16)', () => {
    // The guard only holds while the stored marker is fresh (5 min decay),
    // so every test in this block runs against a pinned clock instead of
    // the real one — fixed marker dates would otherwise make the suite
    // time-of-day dependent.
    beforeEach(() => {
      vi.useFakeTimers();
      // 2 minutes after the markers used below: inside the grace window.
      vi.setSystemTime(new Date('2026-09-26T10:02:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    // Naive-UTC timestamp this far from the pinned "now".
    const naiveFromNow = (offsetMs: number) =>
      new Date(Date.now() + offsetMs).toISOString().slice(0, 19);

    it('stores the first snapshot and seeds the entry', () => {
      const state = stateAfter(
        undefined,
        receiveUnreadNotifications({
          name: 'alice',
          unreadNotifications: { lastread: '2026-09-26 09:00:00', unread: 5 },
        })
      );
      expect(state.notifications.alice.unreadNotifications).toEqual({
        lastread: '2026-09-26 09:00:00',
        unread: 5,
      });
    });

    it('rejects a poll snapshot predating the stored read marker', () => {
      // The user marked everything read at 10:00; hivemind still serves the
      // pre-setLastRead pair (lastread 09:59, unread 7). Writing it back
      // would un-zero the badge right after the mark (T16 race).
      let state = stateAfter(
        undefined,
        receiveUnreadNotifications({
          name: 'alice',
          unreadNotifications: { lastread: '2026-09-26T10:00:00', unread: 0 },
        })
      );
      state = stateAfter(
        state,
        receiveUnreadNotifications({
          name: 'alice',
          unreadNotifications: { lastread: '2026-09-26T09:59:00', unread: 7 },
        })
      );
      expect(state.notifications.alice.unreadNotifications).toEqual({
        lastread: '2026-09-26T10:00:00',
        unread: 0,
      });
    });

    it('applies a poll snapshot at or past the stored read marker', () => {
      let state = stateAfter(
        undefined,
        receiveUnreadNotifications({
          name: 'alice',
          unreadNotifications: { lastread: '2026-09-26T10:00:00', unread: 0 },
        })
      );
      // Same marker, refreshed values: allowed.
      state = stateAfter(
        state,
        receiveUnreadNotifications({
          name: 'alice',
          unreadNotifications: { lastread: '2026-09-26T10:00:00', unread: 2 },
        })
      );
      expect(state.notifications.alice.unreadNotifications?.unread).toBe(2);
      // Newer marker (indexed setLastRead): allowed.
      state = stateAfter(
        state,
        receiveUnreadNotifications({
          name: 'alice',
          unreadNotifications: { lastread: '2026-09-26T10:05:00', unread: 3 },
        })
      );
      expect(state.notifications.alice.unreadNotifications).toEqual({
        lastread: '2026-09-26T10:05:00',
        unread: 3,
      });
    });

    it('compares hivemind space-separated timestamps against naive-T markers', () => {
      // bridge.unread_notifications emits 'YYYY-MM-DD HH:MM:SS'; the
      // mark-read dispatch emits 'YYYY-MM-DDTHH:MM:SS'. Both are naive UTC
      // and must compare chronologically, not lexically (' ' < 'T').
      let state = stateAfter(
        undefined,
        receiveUnreadNotifications({
          name: 'alice',
          unreadNotifications: { lastread: '2026-09-26 10:00:00', unread: 5 },
        })
      );
      state = stateAfter(
        state,
        receiveUnreadNotifications({
          name: 'alice',
          unreadNotifications: { lastread: '2026-09-26T10:01:30', unread: 0 },
        })
      );
      expect(state.notifications.alice.unreadNotifications?.unread).toBe(0);
      // Stale space-separated poll snapshot: lexically ' ' sorts before
      // 'T', but chronologically 10:01:00 predates 10:01:30 — guard fires.
      state = stateAfter(
        state,
        receiveUnreadNotifications({
          name: 'alice',
          unreadNotifications: { lastread: '2026-09-26 10:01:00', unread: 4 },
        })
      );
      expect(state.notifications.alice.unreadNotifications?.unread).toBe(0);
    });

    it('keeps accounts isolated', () => {
      let state = stateAfter(
        undefined,
        receiveUnreadNotifications({
          name: 'alice',
          unreadNotifications: { lastread: '2026-09-26T10:00:00', unread: 0 },
        })
      );
      state = stateAfter(
        state,
        receiveUnreadNotifications({
          name: 'bob',
          unreadNotifications: { lastread: '2026-09-26T09:00:00', unread: 9 },
        })
      );
      expect(state.notifications.bob.unreadNotifications?.unread).toBe(9);
      expect(state.notifications.alice.unreadNotifications?.unread).toBe(0);
    });

    it('still drops a pre-marker snapshot while the marker is fresh (decay)', () => {
      // Marker applied 1 minute ago; hivemind still serves the pre-op pair.
      let state = stateAfter(
        undefined,
        receiveUnreadNotifications({
          name: 'alice',
          unreadNotifications: { lastread: naiveFromNow(-60_000), unread: 0 },
        })
      );
      state = stateAfter(
        state,
        receiveUnreadNotifications({
          name: 'alice',
          unreadNotifications: { lastread: naiveFromNow(-120_000), unread: 7 },
        })
      );
      expect(state.notifications.alice.unreadNotifications?.unread).toBe(0);
    });

    it('lets a pre-marker snapshot through once the marker exceeds the grace window (self-heal)', () => {
      // The setLastRead op was dropped (never indexed): 6 minutes after the
      // local marker hivemind's snapshot — though older — is the only
      // authoritative state left. Pinning the badge at 0 forever would hide
      // real unread counts, so the guard yields.
      let state = stateAfter(
        undefined,
        receiveUnreadNotifications({
          name: 'alice',
          unreadNotifications: { lastread: naiveFromNow(-6 * 60_000), unread: 0 },
        })
      );
      state = stateAfter(
        state,
        receiveUnreadNotifications({
          name: 'alice',
          unreadNotifications: { lastread: naiveFromNow(-7 * 60_000), unread: 7 },
        })
      );
      expect(state.notifications.alice.unreadNotifications).toEqual({
        lastread: naiveFromNow(-7 * 60_000),
        unread: 7,
      });
    });
  });
});
