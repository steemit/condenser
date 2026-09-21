import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * In-memory Redis fake covering the subset used by pending-overlay:
 * get/set/expire/hset/hgetall + pipeline. hgetall matches ioredis semantics
 * (empty object for missing keys).
 */
class FakeRedis {
  strings = new Map<string, string>();
  hashes = new Map<string, Map<string, string>>();

  async set(key: string, value: string) {
    this.strings.set(key, value);
    return 'OK';
  }
  async get(key: string) {
    return this.strings.get(key) ?? null;
  }
  async expire() {
    return 1;
  }
  async hset(key: string, field: string, value: string) {
    if (!this.hashes.has(key)) this.hashes.set(key, new Map());
    this.hashes.get(key)!.set(field, value);
    return 1;
  }
  async hgetall(key: string) {
    return Object.fromEntries(this.hashes.get(key) ?? []);
  }
  pipeline() {
    const cmds: Array<() => Promise<unknown>> = [];
    const self = this; // eslint-disable-line @typescript-eslint/no-this-alias
    return {
      hgetall(key: string) {
        cmds.push(() => self.hgetall(key));
        return this;
      },
      get(key: string) {
        cmds.push(() => self.get(key));
        return this;
      },
      async exec() {
        const out: Array<[null, unknown]> = [];
        for (const cmd of cmds) out.push([null, await cmd()]);
        return out;
      },
    };
  }
}

let fake: FakeRedis | null;

vi.mock('@/lib/cache/redis', () => ({
  getRedis: () => fake,
  redisKey: (key: string) => `condenser:${key}`,
}));

import {
  applyDiscussionOverlays,
  applyVoteOverlayToPosts,
  applyProfileOverlay,
  mergePendingVotes,
  recordPendingChild,
  recordPendingDeletion,
  recordPendingProfile,
  recordPendingRootPost,
  recordPendingVote,
  synthesizePostFromCommentOp,
} from '@/lib/steem/pending-overlay';

describe('mergePendingVotes', () => {
  it('adds a new upvote with a synthesized positive rshares', () => {
    const post = { author: 'bob', permlink: 'p', active_votes: [] };
    const merged = mergePendingVotes(post, { alice: { weight: 10000, ts: 1 } });
    expect(merged.active_votes).toEqual([{ voter: 'alice', rshares: '1' }]);
  });

  it('adds a new downvote with a synthesized negative rshares', () => {
    const post = { author: 'bob', permlink: 'p', active_votes: [] };
    const merged = mergePendingVotes(post, { alice: { weight: -10000, ts: 1 } });
    expect(merged.active_votes).toEqual([{ voter: 'alice', rshares: '-1' }]);
  });

  it('removes the voter on cancellation (weight 0)', () => {
    const post = {
      author: 'bob',
      permlink: 'p',
      active_votes: [{ voter: 'alice', rshares: '999' }],
    };
    const merged = mergePendingVotes(post, { alice: { weight: 0, ts: 1 } });
    expect(merged.active_votes).toEqual([]);
  });

  it('lets chain data win once it shows the intended direction', () => {
    const post = {
      author: 'bob',
      permlink: 'p',
      active_votes: [{ voter: 'alice', rshares: '123456' }],
    };
    const merged = mergePendingVotes(post, { alice: { weight: 10000, ts: 1 } });
    expect(merged.active_votes).toEqual([{ voter: 'alice', rshares: '123456' }]);
  });

  it('overrides the direction when the chain still shows the old vote', () => {
    const post = {
      author: 'bob',
      permlink: 'p',
      active_votes: [{ voter: 'alice', rshares: '-500' }],
    };
    const merged = mergePendingVotes(post, { alice: { weight: 10000, ts: 1 } });
    expect(merged.active_votes).toEqual([{ voter: 'alice', rshares: '1' }]);
  });

  it('keeps stats.total_votes consistent with overlaid adds/removals', () => {
    const post = {
      author: 'bob',
      permlink: 'p',
      active_votes: [{ voter: 'carol', rshares: '10' }],
      stats: { total_votes: 1 },
    };
    const added = mergePendingVotes(post, { alice: { weight: 10000, ts: 1 } });
    expect(added.stats?.total_votes).toBe(2);
    const removed = mergePendingVotes(added, {
      alice: { weight: 0, ts: 2 },
      carol: { weight: 0, ts: 2 },
    });
    expect(removed.active_votes).toEqual([]);
    expect(removed.stats?.total_votes).toBe(0);
  });

  it('treats zero-rshares (cleared) entries as not counted', () => {
    // Chain already shows the cancel as rshares "0"; a pending cancel must
    // not decrement again (would go negative).
    const cleared = {
      author: 'bob',
      permlink: 'p',
      active_votes: [{ voter: 'alice', rshares: '0' }],
      stats: { total_votes: 0 },
    };
    const out = mergePendingVotes(cleared, { alice: { weight: 0, ts: 1 } });
    expect(out.active_votes).toEqual([]);
    expect(out.stats?.total_votes).toBe(0);

    // A re-vote replacing a cleared entry counts again.
    const revote = mergePendingVotes(cleared, { alice: { weight: 10000, ts: 2 } });
    expect(revote.active_votes).toEqual([{ voter: 'alice', rshares: '1' }]);
    expect(revote.stats?.total_votes).toBe(1);
  });
});

describe('synthesizePostFromCommentOp', () => {
  it('builds a root post: category from parent_permlink, depth 0', () => {
    const post = synthesizePostFromCommentOp({
      parent_author: '',
      parent_permlink: 'life',
      author: 'erin',
      permlink: 'hello',
      title: 'Hi',
      body: 'Body',
      json_metadata: '{"tags":["life"]}',
    });
    expect(post).toMatchObject({
      author: 'erin',
      permlink: 'hello',
      category: 'life',
      title: 'Hi',
      body: 'Body',
      depth: 0,
      active_votes: [],
      json_metadata: { tags: ['life'] },
      url: '/life/@erin/hello',
    });
  });

  it('builds a reply: depth 1, empty category, keeps parent refs', () => {
    const post = synthesizePostFromCommentOp({
      parent_author: 'bob',
      parent_permlink: 'p',
      author: 'erin',
      permlink: 're-p',
      body: 'Nice',
    });
    expect(post).toMatchObject({
      depth: 1,
      category: '',
      parent_author: 'bob',
      parent_permlink: 'p',
      json_metadata: {},
    });
  });

  it('tolerates malformed json_metadata', () => {
    const post = synthesizePostFromCommentOp({
      author: 'erin',
      permlink: 'x',
      json_metadata: '{bad json',
    });
    expect(post.json_metadata).toEqual({});
  });
});

describe('applyVoteOverlayToPosts', () => {
  beforeEach(() => {
    fake = new FakeRedis();
  });

  it('merges pending votes into the matching post only', async () => {
    await recordPendingVote('bob', 'p1', 'alice', 10000);
    const posts = [
      { author: 'bob', permlink: 'p1', active_votes: [] },
      { author: 'bob', permlink: 'p2', active_votes: [] },
    ];
    const out = await applyVoteOverlayToPosts(posts);
    expect(out[0].active_votes).toEqual([{ voter: 'alice', rshares: '1' }]);
    expect(out[1].active_votes).toEqual([]);
  });

  it('returns posts unchanged when Redis is off', async () => {
    fake = null;
    const posts = [{ author: 'bob', permlink: 'p1', active_votes: [] }];
    const out = await applyVoteOverlayToPosts(posts);
    expect(out).toBe(posts);
  });
});

describe('applyProfileOverlay', () => {
  beforeEach(() => {
    fake = new FakeRedis();
  });

  const savedProfile = {
    name: 'Alice',
    about: 'New about',
    location: 'Springfield',
    version: 2,
  };

  it('replaces metadata.profile with the saved profile during the window', async () => {
    await recordPendingProfile('alice', savedProfile);
    const chain = {
      id: 42,
      name: 'alice',
      metadata: { profile: { name: 'Old Name', about: 'Old', version: 2 } },
    };
    const out = await applyProfileOverlay('alice', chain);
    expect(out?.metadata?.profile).toEqual(savedProfile);
    // Everything outside metadata.profile is chain-owned and preserved.
    expect(out?.id).toBe(42);
    expect(out?.name).toBe('alice');
  });

  it('drops fields the user cleared (replace, not merge)', async () => {
    // The save cleared location + website (absent from the new sub-object).
    await recordPendingProfile('alice', {
      name: 'Alice',
      about: 'New about',
      version: 2,
    });
    const chain = {
      id: 42,
      name: 'alice',
      metadata: {
        profile: {
          name: 'Alice',
          about: 'New about',
          location: 'Nowhere',
          website: 'https://x',
          version: 2,
        },
      },
    };
    const out = await applyProfileOverlay('alice', chain);
    expect(out?.metadata?.profile).toEqual({ name: 'Alice', about: 'New about', version: 2 });
    expect((out?.metadata?.profile as Record<string, unknown>).location).toBeUndefined();
    expect((out?.metadata?.profile as Record<string, unknown>).website).toBeUndefined();
  });

  it('is a no-op once the chain profile equals the saved one (indexed)', async () => {
    await recordPendingProfile('alice', savedProfile);
    const chain = { id: 42, name: 'alice', metadata: { profile: savedProfile } };
    const out = await applyProfileOverlay('alice', chain);
    expect(out).toBe(chain);
  });

  it('anchors on a minimal object when chain data is missing', async () => {
    await recordPendingProfile('alice', savedProfile);
    const out = await applyProfileOverlay('alice', null);
    expect(out).toMatchObject({ name: 'alice', metadata: { profile: savedProfile } });
  });

  it('keys by the lowercased account (URLs may carry uppercase)', async () => {
    await recordPendingProfile('Alice', savedProfile);
    const chain = { id: 42, metadata: { profile: { name: 'Old' } } };
    const out = await applyProfileOverlay('ALICE', chain);
    expect(out?.metadata?.profile).toEqual(savedProfile);
  });

  it('passes data through when no overlay was recorded', async () => {
    const chain = { id: 42, metadata: { profile: { name: 'Old' } } };
    const out = await applyProfileOverlay('alice', chain);
    expect(out).toBe(chain);
  });

  it('passes data through when Redis is off', async () => {
    fake = null;
    const chain = { id: 42, metadata: { profile: { name: 'Old' } } };
    const out = await applyProfileOverlay('alice', chain);
    expect(out).toBe(chain);
  });

  it('a second save rewrites the overlay — newest intent wins', async () => {
    await recordPendingProfile('alice', { name: 'First', version: 2 });
    await recordPendingProfile('alice', { name: 'Second', version: 2 });
    const chain = { id: 42, name: 'alice', metadata: { profile: { name: 'Old' } } };
    const out = await applyProfileOverlay('alice', chain);
    expect(out?.metadata?.profile).toEqual({ name: 'Second', version: 2 });
  });

  it('passes data through when the stored overlay JSON is corrupted', async () => {
    await fake?.set('condenser:steem:pendingprofile:alice', '{not json');
    const chain = { id: 42, metadata: { profile: { name: 'Old' } } };
    const out = await applyProfileOverlay('alice', chain);
    expect(out).toBe(chain);
  });

  it('passes data through when the stored profile is an array', async () => {
    await fake?.set(
      'condenser:steem:pendingprofile:alice',
      JSON.stringify({ ts: 1, profile: ['not', 'an', 'object'] })
    );
    const chain = { id: 42, metadata: { profile: { name: 'Old' } } };
    const out = await applyProfileOverlay('alice', chain);
    expect(out).toBe(chain);
  });
});

describe('applyDiscussionOverlays', () => {
  beforeEach(() => {
    fake = new FakeRedis();
  });

  it('returns null when there is no chain data and no pending root', async () => {
    expect(await applyDiscussionOverlays('bob', 'gone', null)).toBeNull();
  });

  it('serves a pending root post when hivemind has not indexed it (no 404)', async () => {
    const post = synthesizePostFromCommentOp({
      parent_author: '',
      parent_permlink: 'life',
      author: 'erin',
      permlink: 'hello',
      title: 'Hi',
      body: 'Body',
    });
    await recordPendingRootPost(post);
    const out = await applyDiscussionOverlays('erin', 'hello', null);
    expect(out?.['erin/hello']).toMatchObject({ author: 'erin', title: 'Hi' });
  });

  it('merges a pending reply into an indexed discussion', async () => {
    const discussion = {
      'bob/p': { author: 'bob', permlink: 'p', active_votes: [] },
    };
    const reply = synthesizePostFromCommentOp({
      parent_author: 'bob',
      parent_permlink: 'p',
      author: 'erin',
      permlink: 're-p',
      body: 'Nice',
    });
    await recordPendingChild('bob', 'p', reply);
    const out = await applyDiscussionOverlays('bob', 'p', discussion);
    expect(out?.['erin/re-p']).toMatchObject({ author: 'erin', body: 'Nice' });
  });

  it('merges a nested reply whose parent is itself still pending', async () => {
    const discussion = {
      'bob/p': { author: 'bob', permlink: 'p', active_votes: [] },
    };
    const reply1 = synthesizePostFromCommentOp({
      parent_author: 'bob',
      parent_permlink: 'p',
      author: 'erin',
      permlink: 're-p',
      body: 'level 1',
    });
    const reply2 = synthesizePostFromCommentOp({
      parent_author: 'erin',
      parent_permlink: 're-p',
      author: 'fred',
      permlink: 're-re-p',
      body: 'level 2',
    });
    await recordPendingChild('bob', 'p', reply1);
    await recordPendingChild('erin', 're-p', reply2);
    const out = await applyDiscussionOverlays('bob', 'p', discussion);
    expect(out?.['erin/re-p']).toBeDefined();
    expect(out?.['fred/re-re-p']).toMatchObject({ body: 'level 2' });
  });

  it('overlays an edit when the pending version is newer than chain data', async () => {
    const discussion = {
      'erin/hello': {
        author: 'erin',
        permlink: 'hello',
        title: 'Old',
        body: 'Old body',
        last_update: '2020-01-01T00:00:00',
        active_votes: [],
      },
    };
    await recordPendingRootPost({ author: 'erin', permlink: 'hello', title: 'New', body: 'New body' });
    const out = await applyDiscussionOverlays('erin', 'hello', discussion);
    expect(out?.['erin/hello']).toMatchObject({ title: 'New', body: 'New body' });
  });

  it('drops tombstoned nodes after delete_comment', async () => {
    const discussion = {
      'bob/p': { author: 'bob', permlink: 'p', active_votes: [] },
      'erin/re-p': { author: 'erin', permlink: 're-p', active_votes: [] },
    };
    await recordPendingDeletion('erin', 're-p');
    const out = await applyDiscussionOverlays('bob', 'p', discussion);
    expect(out?.['erin/re-p']).toBeUndefined();
    expect(out?.['bob/p']).toBeDefined();
  });

  it('returns null when a pending root post is deleted before indexing', async () => {
    const post = synthesizePostFromCommentOp({
      parent_author: '',
      parent_permlink: 'life',
      author: 'erin',
      permlink: 'gone',
      title: 'Hi',
      body: 'Body',
    });
    await recordPendingRootPost(post);
    await recordPendingDeletion('erin', 'gone');
    expect(await applyDiscussionOverlays('erin', 'gone', null)).toBeNull();
  });

  it('drops a pending reply that is deleted before indexing', async () => {
    const discussion = {
      'bob/p': { author: 'bob', permlink: 'p', active_votes: [] },
    };
    const reply = synthesizePostFromCommentOp({
      parent_author: 'bob',
      parent_permlink: 'p',
      author: 'erin',
      permlink: 're-p',
      body: 'Nice',
    });
    await recordPendingChild('bob', 'p', reply);
    await recordPendingDeletion('erin', 're-p');
    const out = await applyDiscussionOverlays('bob', 'p', discussion);
    expect(out?.['erin/re-p']).toBeUndefined();
    expect(out?.['bob/p']).toBeDefined();
  });

  it('applies pending votes to discussion nodes', async () => {
    const discussion = {
      'bob/p': { author: 'bob', permlink: 'p', active_votes: [] },
    };
    await recordPendingVote('bob', 'p', 'alice', -10000);
    const out = await applyDiscussionOverlays('bob', 'p', discussion);
    expect(out?.['bob/p'].active_votes).toEqual([{ voter: 'alice', rshares: '-1' }]);
  });

  it('passes chain data through unchanged when Redis is off', async () => {
    fake = null;
    const discussion = {
      'bob/p': { author: 'bob', permlink: 'p', active_votes: [] },
    };
    const out = await applyDiscussionOverlays('bob', 'p', discussion);
    expect(out).toBe(discussion);
  });
});
