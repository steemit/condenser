import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makePostRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  initializeSteemApi: vi.fn(),
  callSteemApi: vi.fn(),
}));

vi.mock('@/lib/cache/redis', () => ({
  cacheDeleteByPrefix: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from '@/app/api/steem/broadcast/route';
import { callSteemApi } from '@/lib/steem/client';
import { cacheDeleteByPrefix } from '@/lib/cache/redis';

const callSteemApiMock = vi.mocked(callSteemApi);
const cacheDeleteMock = vi.mocked(cacheDeleteByPrefix);

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

  it('sets X-Cache-Invalidate to the voter for vote ops and drops the affected caches', async () => {
    const tx = signedTx([['vote', { voter: 'alice', author: 'bob', permlink: 'my-post', weight: 10000 }]]);

    const res = await POST(
      makePostRequest('/api/steem/broadcast', { signedTransaction: tx })
    );
    expect(res.headers.get('X-Cache-Invalidate')).toBe('alice');
    const prefixes = cacheDeleteMock.mock.calls.map((c) => c[0]);
    expect(prefixes).toContain('steem:post:bob:my-post');
    expect(prefixes).toContain('steem:posts:ranked:');
    expect(prefixes).toContain('steem:profile:alice');
    expect(prefixes).toContain('steem:profile:bob');
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
    expect(res.headers.get('X-Cache-Invalidate')).toBe('erin');
    const prefixes = cacheDeleteMock.mock.calls.map((c) => c[0]);
    expect(prefixes).toContain('steem:posts:account:erin:');
    expect(prefixes).toContain('steem:profile:erin');
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
});
