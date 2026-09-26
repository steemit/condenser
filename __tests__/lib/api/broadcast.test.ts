import { beforeEach, describe, expect, it, vi } from 'vitest';

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
    // Indirect assertion: invalidateFromResponse must not throw on the
    // broadcast response; the eviction behaviour itself is covered in
    // __tests__/lib/cache/client-fetch.test.ts.
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      broadcastVote({
        voter: 'erin',
        author: 'bob',
        permlink: 'root-p',
        weight: 100,
        rootPermlink: 'root-p',
      })
    ).resolves.toEqual({ success: true });
  });
});
