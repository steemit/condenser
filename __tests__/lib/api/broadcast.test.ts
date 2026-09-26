import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clientCache } from '@/lib/cache/client-cache';

vi.mock('@/lib/crypto/transaction-signer', () => ({
  signCommentOperation: vi.fn(async () => ({ ref_block_num: 1, ref_block_prefix: 2, expiration: 'x', operations: [], extensions: [], signatures: ['SIG'] })),
  signVoteOperation: vi.fn(async () => ({ ref_block_num: 1, ref_block_prefix: 2, expiration: 'x', operations: [], extensions: [], signatures: ['SIG'] })),
  signCustomJsonOperation: vi.fn(async () => ({ ref_block_num: 1, ref_block_prefix: 2, expiration: 'x', operations: [], extensions: [], signatures: ['SIG'] })),
  signDeleteCommentOperation: vi.fn(async () => ({ ref_block_num: 1, ref_block_prefix: 2, expiration: 'x', operations: [], extensions: [], signatures: ['SIG'] })),
  signAccountUpdate2Operation: vi.fn(async () => ({ ref_block_num: 1, ref_block_prefix: 2, expiration: 'x', operations: [], extensions: [], signatures: ['SIG'] })),
}));

vi.mock('@/lib/crypto/key-storage', () => ({
  getCachedKey: vi.fn(() => '5J-test-key'),
  decryptAndRetrieveKey: vi.fn(),
}));

import { broadcastVote, broadcastDeleteComment } from '@/lib/api/broadcast';

function okResponse() {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'X-Cache-Invalidate': 'erin,permlink=root-p' },
  });
}

describe('broadcast client cacheContext (C2)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clientCache.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends cacheContext.rootPermlink alongside the signed transaction', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock);

    await broadcastDeleteComment({
      author: 'erin',
      permlink: 're-root-p',
      rootPermlink: 'root-p',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({
      signedTransaction: expect.objectContaining({ signatures: ['SIG'] }),
      cacheContext: { rootPermlink: 'root-p' },
    });
  });

  it('omits cacheContext entirely when no root context is known', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock);

    await broadcastVote({ voter: 'erin', author: 'bob', permlink: 'root-p', weight: 100 });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body.cacheContext).toBeUndefined();
    expect(body.signedTransaction).toBeDefined();
  });

  it('applies the write response invalidation tokens to L1 (per write-path contract)', async () => {
    // Seed L1 directly (same API as client-fetch.test.ts): the post entry's
    // URL carries the vote's `permlink=root-p` token; the feed entry matches
    // no token and must survive.
    clientCache.set('/api/steem/post?author=bob&permlink=root-p', { title: 'old' }, 15_000, 120_000);
    clientCache.set('/api/steem/posts?sort=trending&limit=20', ['feed'], 15_000, 120_000);
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock);

    await broadcastVote({
      voter: 'erin',
      author: 'bob',
      permlink: 'root-p',
      weight: 100,
      rootPermlink: 'root-p',
    });

    // broadcastSignedTransaction applies X-Cache-Invalidate ('erin,
    // permlink=root-p') to L1: the matching entry is evicted (next read goes
    // to the network), the unrelated one is untouched.
    expect(clientCache.get('/api/steem/post?author=bob&permlink=root-p')).toBeNull();
    expect(clientCache.get('/api/steem/posts?sort=trending&limit=20')).toEqual({
      data: ['feed'],
      stale: false,
    });
  });
});
