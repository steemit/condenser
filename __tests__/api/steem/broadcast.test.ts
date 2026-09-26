import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makePostRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  initializeSteemApi: vi.fn(),
  callSteemApi: vi.fn(),
}));

vi.mock('@/lib/cache/redis', () => ({
  cacheDelete: vi.fn().mockResolvedValue(undefined),
  cacheDeleteByPrefix: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/steem/pending-overlay', () => ({
  recordPendingVote: vi.fn().mockResolvedValue(undefined),
  recordPendingRootPost: vi.fn().mockResolvedValue(undefined),
  recordPendingChild: vi.fn().mockResolvedValue(undefined),
  recordPendingDeletion: vi.fn().mockResolvedValue(undefined),
  recordPendingProfile: vi.fn().mockResolvedValue(undefined),
  synthesizePostFromCommentOp: vi.fn((op: Record<string, unknown>) => ({
    author: op.author,
    permlink: op.permlink,
  })),
}));

// Partial mock: keep the real RATE_LIMITS / rateLimitResponse, stub only the
// Redis-backed check (audit N-08).
vi.mock('@/lib/cache/rate-limit', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/cache/rate-limit')>();
  return {
    ...actual,
    checkRateLimit: vi.fn(async () => ({ allowed: true })),
  };
});

import { POST } from '@/app/api/steem/broadcast/route';
import { callSteemApi } from '@/lib/steem/client';
import { cacheDelete, cacheDeleteByPrefix } from '@/lib/cache/redis';
import { checkRateLimit } from '@/lib/cache/rate-limit';
import {
  recordPendingVote,
  recordPendingRootPost,
  recordPendingChild,
  recordPendingDeletion,
  recordPendingProfile,
} from '@/lib/steem/pending-overlay';

const callSteemApiMock = vi.mocked(callSteemApi);
const cacheDeleteMock = vi.mocked(cacheDelete);
const cacheDeleteByPrefixMock = vi.mocked(cacheDeleteByPrefix);
const checkRateLimitMock = vi.mocked(checkRateLimit);
const recordVoteMock = vi.mocked(recordPendingVote);
const recordRootMock = vi.mocked(recordPendingRootPost);
const recordChildMock = vi.mocked(recordPendingChild);
const recordDeleteMock = vi.mocked(recordPendingDeletion);
const recordProfileMock = vi.mocked(recordPendingProfile);

/** Minimal well-formed signed transaction (structure, not crypto). */
// Param accepts a non-array so tests can exercise validation failures.
function signedTx(operations: unknown[] | string) {
  return {
    ref_block_num: 1,
    ref_block_prefix: 2,
    expiration: '2026-01-01T00:00:00',
    operations,
    extensions: [],
    signatures: ['SIG_K1_sig'],
  };
}

describe('POST /api/steem/broadcast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    callSteemApiMock.mockResolvedValue({ id: 'tx-1' });
    checkRateLimitMock.mockResolvedValue({ allowed: true });
  });

  it('returns 400 when signedTransaction is missing', async () => {
    const res = await POST(makePostRequest('/api/steem/broadcast', {}));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Missing required field: signedTransaction',
    });
  });

  it('returns 400 when operations is not an array', async () => {
    const res = await POST(
      makePostRequest('/api/steem/broadcast', {
        signedTransaction: signedTx('not-an-array'),
      })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Invalid transaction: operations must be an array',
    });
  });

  it('returns 400 when there are no signatures', async () => {
    const tx = signedTx([['vote', { voter: 'alice', author: 'bob', permlink: 'p', weight: 10000 }]]);
    tx.signatures = [];
    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Invalid transaction: must have at least one signature',
    });
  });

  it('forwards the transaction via condenser_api and returns the tx id', async () => {
    const tx = signedTx([['vote', { voter: 'alice', author: 'bob', permlink: 'my-post', weight: 10000 }]]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      result: { id: 'tx-1' },
      transactionId: 'tx-1',
      permlink: 'my-post',
    });
    // Namespaced method with the transaction as the sole param.
    expect(callSteemApiMock).toHaveBeenCalledWith(
      'condenser_api.broadcast_transaction',
      [tx]
    );
  });

  it('sets X-Cache-Invalidate for vote ops and drops the affected caches', async () => {
    const tx = signedTx([['vote', { voter: 'alice', author: 'bob', permlink: 'my-post', weight: 10000 }]]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    // Voter token (per-user entries) + permlink token (post/comments URLs).
    expect(res.headers.get('X-Cache-Invalidate')).toBe('alice,permlink=my-post');
    const deletedKeys = cacheDeleteMock.mock.calls.map((c) => c[0]);
    // steem:post: is deliberately NOT deleted: the indexer needs a few
    // seconds to see the vote, so an immediate delete would re-cache
    // pre-vote data as fresh for a full TTL.
    expect(deletedKeys).not.toContain('steem:post:bob:my-post');
    // Exact profile keys only — ranked feeds are 3s-TTL caches left to
    // natural expiry + the pending vote overlay (audit N-10).
    expect(deletedKeys).toContain('steem:profile:alice');
    expect(deletedKeys).toContain('steem:profile:bob');
    // No prefix SCAN sweeps anywhere on the broadcast path (audit N-10).
    expect(cacheDeleteByPrefixMock).not.toHaveBeenCalled();
    // The vote lands in the pending overlay for the indexing window.
    expect(recordVoteMock).toHaveBeenCalledWith('bob', 'my-post', 'alice', 10000);
  });

  it('records a pending root post for root comment ops', async () => {
    const tx = signedTx([
      [
        'comment',
        {
          parent_author: '',
          parent_permlink: 'life',
          author: 'erin',
          permlink: 'new-post',
          title: 'Hi',
          body: 'Hello',
          json_metadata: '{}',
        },
      ],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(200);
    expect(recordRootMock).toHaveBeenCalledWith({ author: 'erin', permlink: 'new-post' });
    expect(recordChildMock).not.toHaveBeenCalled();
  });

  it('records a pending child for reply comment ops', async () => {
    const tx = signedTx([
      [
        'comment',
        {
          parent_author: 'bob',
          parent_permlink: 'my-post',
          author: 'erin',
          permlink: 're-my-post',
          title: '',
          body: 'Nice',
          json_metadata: '{}',
        },
      ],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(200);
    // Replies also drop the parent discussion's L1 entries (post + comments).
    expect(res.headers.get('X-Cache-Invalidate')).toBe('erin,permlink=my-post');
    expect(recordChildMock).toHaveBeenCalledWith('bob', 'my-post', {
      author: 'erin',
      permlink: 're-my-post',
    });
    expect(recordRootMock).not.toHaveBeenCalled();
  });

  it('records a pending deletion for delete_comment ops', async () => {
    const tx = signedTx([['delete_comment', { author: 'erin', permlink: 'new-post' }]]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(200);
    expect(recordDeleteMock).toHaveBeenCalledWith('erin', 'new-post');
  });

  it('records a pending profile and emits the account token for account_update2', async () => {
    const profile = { name: 'Alice', about: 'Hi', version: 2 };
    const tx = signedTx([
      [
        'account_update2',
        {
          account: 'alice',
          json_metadata: '',
          posting_json_metadata: JSON.stringify({ profile }),
          extensions: [],
        },
      ],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(200);
    // The account token doubles as the L1 invalidation (profile URL entries
    // are keyed by account), which the op previously never emitted.
    expect(res.headers.get('X-Cache-Invalidate')).toBe('alice');
    expect(recordProfileMock).toHaveBeenCalledWith('alice', profile);
    // The account's cached profile is dropped exactly (audit N-10).
    const deletedKeys = cacheDeleteMock.mock.calls.map((c) => c[0]);
    expect(deletedKeys).toContain('steem:profile:alice');
    expect(cacheDeleteByPrefixMock).not.toHaveBeenCalled();
  });

  it('records no profile overlay when posting_json_metadata is malformed', async () => {
    const tx = signedTx([
      [
        'account_update2',
        { account: 'alice', json_metadata: '', posting_json_metadata: '{bad json', extensions: [] },
      ],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(200);
    expect(recordProfileMock).not.toHaveBeenCalled();
  });

  it('records no profile overlay when posting_json_metadata is empty (key-only update)', async () => {
    // Empty metadata means "leave posting metadata unchanged" — a {} overlay
    // would blank the profile for the whole TTL window.
    const tx = signedTx([
      [
        'account_update2',
        { account: 'alice', json_metadata: '', posting_json_metadata: '', extensions: [] },
      ],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(200);
    expect(recordProfileMock).not.toHaveBeenCalled();
    // The L1/L2 invalidation still applies — key changes affect other reads.
    expect(res.headers.get('X-Cache-Invalidate')).toBe('alice');
  });

  it('records no profile overlay when metadata carries no profile key', async () => {
    const tx = signedTx([
      [
        'account_update2',
        { account: 'alice', json_metadata: '', posting_json_metadata: '{"other":1}', extensions: [] },
      ],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(200);
    expect(recordProfileMock).not.toHaveBeenCalled();
  });

  it('records no profile overlay when the profile field is an array', async () => {
    const tx = signedTx([
      [
        'account_update2',
        {
          account: 'alice',
          json_metadata: '',
          posting_json_metadata: JSON.stringify({ profile: ['not', 'an', 'object'] }),
          extensions: [],
        },
      ],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(200);
    expect(recordProfileMock).not.toHaveBeenCalled();
  });

  it('records no profile overlay without an account', async () => {
    const tx = signedTx([
      ['account_update2', { json_metadata: '', posting_json_metadata: '{}', extensions: [] }],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(200);
    expect(recordProfileMock).not.toHaveBeenCalled();
    expect(res.headers.get('X-Cache-Invalidate')).toBeNull();
  });

  it('does not record overlays when the broadcast fails', async () => {
    callSteemApiMock.mockRejectedValue(new Error('missing_active_authority'));

    const tx = signedTx([['vote', { voter: 'alice', author: 'bob', permlink: 'p', weight: 1 }]]);
    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(500);
    expect(recordVoteMock).not.toHaveBeenCalled();
  });

  it('uses required_posting_auths[0] as the actor for custom_json ops', async () => {
    const tx = signedTx([
      [
        'custom_json',
        {
          required_auths: [],
          required_posting_auths: ['carol'],
          id: 'follow',
          json: JSON.stringify(['follow', { follower: 'carol', following: 'dave', what: ['blog'] }]),
        },
      ],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    // Actor token + the follow target's token (drops the target's
    // followers-page L1 entries; the actor token covers the actor's own
    // following page) — see C1.
    expect(res.headers.get('X-Cache-Invalidate')).toBe('carol,dave');
    const deletedKeys = cacheDeleteMock.mock.calls.map((c) => c[0]);
    // The actor's and the follow target's profiles, exactly — the old code
    // swept the whole `steem:profile:` prefix (audit N-10).
    expect(deletedKeys).toContain('steem:profile:carol');
    expect(deletedKeys).toContain('steem:profile:dave');
    expect(deletedKeys).not.toContain('steem:profile:erin');
    // Follow lists are dropped account-scoped (C1): the follower's following
    // pages + follow-state seeds, the target's followers pages.
    const sweptPrefixes = cacheDeleteByPrefixMock.mock.calls.map((c) => c[0]);
    expect(sweptPrefixes).toContain('steem:following-page:carol:');
    expect(sweptPrefixes).toContain('steem:following:carol:');
    expect(sweptPrefixes).toContain('steem:followers-page:dave:');
    // Scoped to the two accounts only — nobody else's list entries.
    expect(sweptPrefixes).not.toContain('steem:followers-page:');
    expect(sweptPrefixes).not.toContain('steem:following-page:');
  });

  it('uses the author for comment ops and invalidates account posts', async () => {
    const tx = signedTx([
      [
        'comment',
        {
          parent_author: '',
          parent_permlink: 'life',
          author: 'erin',
          permlink: 'new-post',
          title: 'Hi',
          body: 'Hello',
          json_metadata: '{}',
        },
      ],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    // Root post/edit ops also emit their own permlink token so a post edit
    // drops the post's L1 entry (harmless for brand-new posts).
    expect(res.headers.get('X-Cache-Invalidate')).toBe('erin,permlink=new-post');
    const deletedKeys = cacheDeleteMock.mock.calls.map((c) => c[0]);
    // The author's profile exactly; their account-post lists are 3s-TTL
    // caches left to natural expiry (audit N-10 — no prefix sweeps).
    expect(deletedKeys).toContain('steem:profile:erin');
    expect(cacheDeleteByPrefixMock).not.toHaveBeenCalled();
  });

  it('drops invalidation tokens whose op-derived values leave the safe charset', async () => {
    const tx = signedTx([
      ['vote', { voter: 'alice', author: 'bob', permlink: 'bad\r\npermlink', weight: 10000 }],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    // Broadcast still succeeds; only the hostile token is dropped.
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Cache-Invalidate')).toBe('alice');
  });

  it('keeps permlink tokens containing uppercase (audit X9)', async () => {
    // base58 noise segments (and other clients' permlinks) legally contain
    // uppercase; URLSearchParams leaves it unescaped in the L1 key, so the
    // token must survive the safe-charset filter to match anything.
    const tx = signedTx([
      ['vote', { voter: 'alice', author: 'bob', permlink: 're-Bob-2026-Ab3xZ', weight: 10000 }],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Cache-Invalidate')).toBe(
      'alice,permlink=re-Bob-2026-Ab3xZ'
    );
  });

  it('emits a root-dimension token for a depth-2 reply via cacheContext (C2)', async () => {
    // parent_permlink names the parent COMMENT, not the root post — only
    // the client-supplied root context names the entries that must evict.
    const tx = signedTx([
      [
        'comment',
        {
          parent_author: 'carol',
          parent_permlink: 're-my-post-123',
          author: 'erin',
          permlink: 're-re-my-post-456',
          title: '',
          body: 'nested',
          json_metadata: '{}',
        },
      ],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', {
        signedTransaction: tx,
        cacheContext: { rootPermlink: 'my-post' },
      })
    );
    expect(res.status).toBe(200);
    // parent token (legacy behaviour, matches nothing useful at depth 2)
    // plus the root token that actually matches the post/comments URLs.
    expect(res.headers.get('X-Cache-Invalidate')).toBe(
      'erin,permlink=re-my-post-123,permlink=my-post'
    );
  });

  it('dedupes the root token when it equals the op-derived one (top-level reply)', async () => {
    const tx = signedTx([
      [
        'comment',
        {
          parent_author: 'bob',
          parent_permlink: 'my-post',
          author: 'erin',
          permlink: 're-my-post',
          title: '',
          body: 'Nice',
          json_metadata: '{}',
        },
      ],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', {
        signedTransaction: tx,
        cacheContext: { rootPermlink: 'my-post' },
      })
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Cache-Invalidate')).toBe('erin,permlink=my-post');
  });

  it('emits the root token for delete_comment via cacheContext (C2)', async () => {
    // The delete op carries no parent reference at all; without the hint
    // the discussion's L1 entries survived for the whole 15s fresh window.
    const tx = signedTx([['delete_comment', { author: 'erin', permlink: 're-my-post' }]]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', {
        signedTransaction: tx,
        cacheContext: { rootPermlink: 'my-post' },
      })
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Cache-Invalidate')).toBe('erin,permlink=my-post');
  });

  it('emits the root token for a comment vote via cacheContext (C2)', async () => {
    const tx = signedTx([
      ['vote', { voter: 'alice', author: 'carol', permlink: 're-my-post', weight: 10000 }],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', {
        signedTransaction: tx,
        cacheContext: { rootPermlink: 'my-post' },
      })
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Cache-Invalidate')).toBe(
      'alice,permlink=re-my-post,permlink=my-post'
    );
  });

  it('ignores a cacheContext that leaves the permlink charset', async () => {
    const tx = signedTx([['delete_comment', { author: 'erin', permlink: 're-my-post' }]]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', {
        signedTransaction: tx,
        cacheContext: { rootPermlink: 'bad\r\nroot*glob' },
      })
    );
    expect(res.status).toBe(200);
    // Hint dropped — behaviour falls back to the pre-C2 op-derived tokens.
    expect(res.headers.get('X-Cache-Invalidate')).toBe('erin');
  });

  it('ignores a non-string cacheContext.rootPermlink', async () => {
    const tx = signedTx([['delete_comment', { author: 'erin', permlink: 're-my-post' }]]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', {
        signedTransaction: tx,
        cacheContext: { rootPermlink: { evil: true } },
      })
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Cache-Invalidate')).toBe('erin');
  });

  it('rejects non-client operations (transfer) with 400 and never relays them', async () => {
    // audit N-10: the relay only accepts the operation set the client itself
    // constructs; transfer is not one of them.
    const tx = signedTx([['transfer', { from: 'a', to: 'b', amount: '1.000 STEEM', memo: '' }]]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Operation not allowed: transfer' });
    expect(callSteemApiMock).not.toHaveBeenCalled();
    expect(cacheDeleteMock).not.toHaveBeenCalled();
    expect(cacheDeleteByPrefixMock).not.toHaveBeenCalled();
  });

  it('rejects account_update (only account_update2 is a client operation)', async () => {
    const tx = signedTx([
      ['account_update', { account: 'alice', memo_key: 'STM5xyz', json_metadata: '' }],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Operation not allowed: account_update' });
    expect(callSteemApiMock).not.toHaveBeenCalled();
  });

  it('accepts every client-constructed operation type', async () => {
    const tx = signedTx([
      [
        'comment',
        { parent_author: '', parent_permlink: 'life', author: 'erin', permlink: 'p1', title: 'T', body: 'B', json_metadata: '{}' },
      ],
      [
        'comment_options',
        {
          author: 'erin',
          permlink: 'p1',
          max_accepted_payout: '1000000.000 SBD',
          percent_steem_dollars: 10000,
          allow_votes: true,
          allow_curation_rewards: true,
          extensions: [],
        },
      ],
      ['delete_comment', { author: 'erin', permlink: 'p2' }],
      [
        'custom_json',
        {
          required_auths: [],
          required_posting_auths: ['erin'],
          id: 'notify',
          json: JSON.stringify(['setLastRead', { date: '2026-01-01T00:00:00' }]),
        },
      ],
      ['account_update2', { account: 'erin', json_metadata: '', posting_json_metadata: '', extensions: [] }],
      ['vote', { voter: 'erin', author: 'bob', permlink: 'p3', weight: 100 }],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(200);
    expect(callSteemApiMock).toHaveBeenCalledWith(
      'condenser_api.broadcast_transaction',
      [tx]
    );
  });

  it('rejects custom_json with a non-client id', async () => {
    const tx = signedTx([
      [
        'custom_json',
        {
          required_auths: [],
          required_posting_auths: ['carol'],
          id: 'sm_market_operation',
          json: JSON.stringify([{ action: 'arbitrary' }]),
        },
      ],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Operation not allowed: custom_json id=sm_market_operation',
    });
    expect(callSteemApiMock).not.toHaveBeenCalled();
  });

  it('rejects custom_json with a missing id', async () => {
    const tx = signedTx([
      ['custom_json', { required_auths: [], required_posting_auths: ['carol'], json: '[]' }],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Operation not allowed: custom_json id=(missing)',
    });
    expect(callSteemApiMock).not.toHaveBeenCalled();
  });

  it('rejects active-auth custom_json (client ops are posting-auth only)', async () => {
    const tx = signedTx([
      [
        'custom_json',
        {
          required_auths: ['carol'],
          required_posting_auths: [],
          id: 'follow',
          json: JSON.stringify(['follow', { follower: 'carol', following: 'dave', what: [] }]),
        },
      ],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Operation not allowed: custom_json with required_auths',
    });
    expect(callSteemApiMock).not.toHaveBeenCalled();
  });

  it('rejects malformed operations', async () => {
    const tx = signedTx([['vote']]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Operation not allowed: malformed operation',
    });
    expect(callSteemApiMock).not.toHaveBeenCalled();
  });

  it('rejects the whole transaction when any single operation is not allowed', async () => {
    const tx = signedTx([
      ['vote', { voter: 'alice', author: 'bob', permlink: 'p', weight: 1 }],
      ['transfer', { from: 'a', to: 'b', amount: '1.000 STEEM', memo: '' }],
      ['witness_update', { owner: 'a', url: '', block_signing_key: 'STM5x', props: {} }],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    // Both rejected names are listed (order of appearance, deduplicated).
    expect(body.error).toBe('Operation not allowed: transfer, witness_update');
    expect(callSteemApiMock).not.toHaveBeenCalled();
  });

  it('deletes the community subscribers cache and sweeps the communities list on subscribe (C5)', async () => {
    const tx = signedTx([
      [
        'custom_json',
        {
          required_auths: [],
          required_posting_auths: ['erin'],
          id: 'community',
          json: JSON.stringify(['subscribe', { community: 'hive-106292' }]),
        },
      ],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(200);
    const deletedKeys = cacheDeleteMock.mock.calls.map((c) => c[0]);
    expect(deletedKeys).toContain('steem:profile:erin');
    expect(deletedKeys).toContain('steem:community-subscribers:hive-106292');
    // C5: the list cache embeds subscriber counts (600s fresh TTL) — the
    // unbounded sort x query x limit key space rules out exact deletes.
    expect(cacheDeleteByPrefixMock).toHaveBeenCalledWith('steem:communities:');
    // L1: the subscriber list entry (community-shaped URL) plus every
    // communities list/subscriptions entry (path-shaped token).
    expect(res.headers.get('X-Cache-Invalidate')).toBe(
      'erin,community=hive-106292,/api/steem/communities'
    );
  });

  it('invalidates the community caches on unsubscribe too (C5)', async () => {
    const tx = signedTx([
      [
        'custom_json',
        {
          required_auths: [],
          required_posting_auths: ['erin'],
          id: 'community',
          json: JSON.stringify(['unsubscribe', { community: 'hive-106292' }]),
        },
      ],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(200);
    const deletedKeys = cacheDeleteMock.mock.calls.map((c) => c[0]);
    expect(deletedKeys).toContain('steem:community-subscribers:hive-106292');
    expect(cacheDeleteByPrefixMock).toHaveBeenCalledWith('steem:communities:');
    expect(res.headers.get('X-Cache-Invalidate')).toBe(
      'erin,community=hive-106292,/api/steem/communities'
    );
  });

  it('only deletes the actor profile for reblog custom_json payloads', async () => {
    const tx = signedTx([
      [
        'custom_json',
        {
          required_auths: [],
          required_posting_auths: ['carol'],
          id: 'follow',
          json: JSON.stringify(['reblog', { account: 'carol', author: 'dave', permlink: 'x' }]),
        },
      ],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(200);
    const deletedKeys = cacheDeleteMock.mock.calls.map((c) => c[0]);
    // A reblog lands in the reblogger's own (3s-TTL) blog list; the target
    // author's cached entries are unchanged.
    expect(deletedKeys).toContain('steem:profile:carol');
    expect(deletedKeys).not.toContain('steem:profile:dave');
    // Reblogs don't touch follow lists — no prefix sweeps at all.
    expect(cacheDeleteByPrefixMock).not.toHaveBeenCalled();
  });

  it('invalidates follow lists for unfollow (what: []) the same as follow (C1)', async () => {
    const tx = signedTx([
      [
        'custom_json',
        {
          required_auths: [],
          required_posting_auths: ['carol'],
          id: 'follow',
          json: JSON.stringify(['follow', { follower: 'carol', following: 'dave', what: [] }]),
        },
      ],
    ]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Cache-Invalidate')).toBe('carol,dave');
    const sweptPrefixes = cacheDeleteByPrefixMock.mock.calls.map((c) => c[0]);
    expect(sweptPrefixes).toContain('steem:following-page:carol:');
    expect(sweptPrefixes).toContain('steem:following:carol:');
    expect(sweptPrefixes).toContain('steem:followers-page:dave:');
  });

  it('sweeps both case variants of a mixed-case follow payload account (C1)', async () => {
    const tx = signedTx([
      [
        'custom_json',
        {
          required_auths: [],
          required_posting_auths: ['carol'],
          id: 'follow',
          json: JSON.stringify(['follow', { follower: 'carol', following: 'Dave', what: ['blog'] }]),
        },
      ],
    ]);

    await POST(makePostRequest('/api/steem/broadcast', { signedTransaction: tx }));
    const sweptPrefixes = cacheDeleteByPrefixMock.mock.calls.map((c) => c[0]);
    // Read routes cache under whichever casing the reader used; both the
    // normalized and the raw variants must go, same as exact-key deletes.
    expect(sweptPrefixes).toContain('steem:followers-page:dave:');
    expect(sweptPrefixes).toContain('steem:followers-page:Dave:');
  });

  it('skips the follow-list sweep for payload names outside the account charset (C1)', async () => {
    // The chain rejects invalid account names, so this broadcast fails and
    // nothing should be invalidated — but the guard must hold even if a
    // relay ever let one through: glob metacharacters in a MATCH pattern
    // would widen the scoped sweep.
    const tx = signedTx([
      [
        'custom_json',
        {
          required_auths: [],
          required_posting_auths: ['carol'],
          id: 'follow',
          json: JSON.stringify([
            'follow',
            { follower: 'carol', following: 'dav*e?[$x', what: ['blog'] },
          ]),
        },
      ],
    ]);

    await POST(makePostRequest('/api/steem/broadcast', { signedTransaction: tx }));
    const sweptPrefixes = cacheDeleteByPrefixMock.mock.calls.map((c) => c[0]);
    expect(sweptPrefixes).toContain('steem:following-page:carol:');
    for (const prefix of sweptPrefixes) {
      expect(prefix).not.toContain('*');
      expect(prefix).not.toContain('?');
      expect(prefix).not.toContain('[');
    }
  });

  it('deletes both case variants of a mixed-case account profile key', async () => {
    const tx = signedTx([['vote', { voter: 'Alice', author: 'bob', permlink: 'p', weight: 1 }]]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(200);
    const deletedKeys = cacheDeleteMock.mock.calls.map((c) => c[0]);
    // Steem account names are case-insensitive; the profile route caches
    // under whichever casing the reader used, so both variants must go.
    expect(deletedKeys).toContain('steem:profile:alice');
    expect(deletedKeys).toContain('steem:profile:Alice');
  });

  it('omits X-Cache-Invalidate when no actor can be extracted', async () => {
    const tx = signedTx([['vote', { weight: 1 }]]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.headers.get('X-Cache-Invalidate')).toBeNull();
    // No actor fields to scope any invalidation to.
    expect(cacheDeleteMock).not.toHaveBeenCalled();
    expect(cacheDeleteByPrefixMock).not.toHaveBeenCalled();
  });

  it('propagates RPC failures as 500 with the error message but no details echo (audit N-20)', async () => {
    callSteemApiMock.mockRejectedValue(new Error('missing_active_authority'));

    const tx = signedTx([['vote', { voter: 'alice', author: 'bob', permlink: 'p', weight: 1 }]]);
    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(500);
    const body = await res.json();
    // The chain rejection message stays (Voting.tsx matches it); the former
    // `details: error.toString()` echo is gone.
    expect(body.error).toBe('missing_active_authority');
    expect(body.details).toBeUndefined();
  });

  it('checks the steem:broadcast limit (30/min/IP) before reading the body', async () => {
    const tx = signedTx([['vote', { voter: 'alice', author: 'bob', permlink: 'p', weight: 1 }]]);
    await POST(makePostRequest('/api/steem/broadcast', { signedTransaction: tx }));

    expect(checkRateLimitMock).toHaveBeenCalledWith(expect.anything(), {
      key: 'steem:broadcast',
      limit: 30,
      windowSeconds: 60,
    });
  });

  it('returns 429 with Retry-After and never forwards the transaction when limited', async () => {
    checkRateLimitMock.mockResolvedValue({ allowed: false, retryAfterSeconds: 21 });

    const tx = signedTx([['vote', { voter: 'alice', author: 'bob', permlink: 'p', weight: 1 }]]);
    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('21');
    expect(await res.json()).toEqual({
      error: 'Too many requests. Please try again later.',
    });
    expect(callSteemApiMock).not.toHaveBeenCalled();
  });

  it('accepts a maximal legitimate long-post body (~67KB) under the 256KB cap', async () => {
    // The client editor allows 65280-byte bodies; the JSON envelope,
    // escaping and signature inflate the HTTP body to ~67KB — the previous
    // 64KB cap rejected these with a 413 (audit follow-up).
    const tx = signedTx([
      ['comment', { author: 'alice', permlink: 'p'.repeat(67 * 1024), body: 'x'.repeat(65280) }],
    ]);
    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(200);
    expect(callSteemApiMock).toHaveBeenCalled();
  });

  it('accepts a 200KB body under the 256KB broadcast cap', async () => {
    const tx = signedTx([
      ['vote', { voter: 'alice', author: 'bob', permlink: 'p'.repeat(200 * 1024), weight: 1 }],
    ]);
    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(200);
    expect(callSteemApiMock).toHaveBeenCalled();
  });

  it('returns 413 when the body exceeds the 256KB broadcast cap', async () => {
    const tx = signedTx([
      ['vote', { voter: 'alice', author: 'bob', permlink: 'p'.repeat(300 * 1024), weight: 1 }],
    ]);
    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: 'Request body too large' });
    expect(callSteemApiMock).not.toHaveBeenCalled();
  });
});
