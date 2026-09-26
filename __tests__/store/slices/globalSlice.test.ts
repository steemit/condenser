import { describe, expect, it } from 'vitest';

import globalReducer, {
  followListLoading,
  receiveFollowList,
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
  });
});
