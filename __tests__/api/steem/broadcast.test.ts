import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makePostRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  initializeSteemApi: vi.fn(),
  callSteemApi: vi.fn(),
}));

vi.mock('@/lib/cache/redis', () => ({
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
import { cacheDeleteByPrefix } from '@/lib/cache/redis';
import { checkRateLimit } from '@/lib/cache/rate-limit';
import {
  recordPendingVote,
  recordPendingRootPost,
  recordPendingChild,
  recordPendingDeletion,
  recordPendingProfile,
} from '@/lib/steem/pending-overlay';

const callSteemApiMock = vi.mocked(callSteemApi);
const cacheDeleteMock = vi.mocked(cacheDeleteByPrefix);
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
    const prefixes = cacheDeleteMock.mock.calls.map((c) => c[0]);
    // steem:post: is deliberately NOT deleted: the indexer needs a few
    // seconds to see the vote, so an immediate delete would re-cache
    // pre-vote data as fresh for a full TTL.
    expect(prefixes).not.toContain('steem:post:bob:my-post');
    expect(prefixes).toContain('steem:posts:ranked:');
    expect(prefixes).toContain('steem:profile:alice');
    expect(prefixes).toContain('steem:profile:bob');
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
    // The account's cached profile is dropped (pre-existing behaviour).
    const prefixes = cacheDeleteMock.mock.calls.map((c) => c[0]);
    expect(prefixes).toContain('steem:profile:alice');
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
    expect(res.headers.get('X-Cache-Invalidate')).toBe('carol');
    const prefixes = cacheDeleteMock.mock.calls.map((c) => c[0]);
    expect(prefixes).toContain('steem:posts:ranked:');
    expect(prefixes).toContain('steem:profile:');
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
    const prefixes = cacheDeleteMock.mock.calls.map((c) => c[0]);
    expect(prefixes).toContain('steem:posts:account:erin:');
    expect(prefixes).toContain('steem:profile:erin');
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

  it('omits X-Cache-Invalidate when no actor can be extracted', async () => {
    const tx = signedTx([['transfer', { from: 'a', to: 'b', amount: '1.000 STEEM', memo: '' }]]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.headers.get('X-Cache-Invalidate')).toBeNull();
    // Transfer does not touch feed/profile caches.
    expect(cacheDeleteMock).not.toHaveBeenCalled();
  });

  it('propagates RPC failures as 500 with the error message', async () => {
    callSteemApiMock.mockRejectedValue(new Error('missing_active_authority'));

    const tx = signedTx([['vote', { voter: 'alice', author: 'bob', permlink: 'p', weight: 1 }]]);
    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('missing_active_authority');
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
