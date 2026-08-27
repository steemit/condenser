import { beforeEach, describe, expect, it, vi } from 'vitest';

import { signCommentOperation } from '@/lib/crypto/transaction-signer';
import { steem } from '@steemit/steem-js';

vi.mock('@steemit/steem-js', () => ({
  steem: {
    operations: {
      createComment: vi.fn(
        (
          parentAuthor: string,
          parentPermlink: string,
          author: string,
          permlink: string,
          title: string,
          body: string,
          jsonMetadata: string
        ) => ({
          0: 'comment',
          1: {
            parent_author: parentAuthor,
            parent_permlink: parentPermlink,
            author,
            permlink,
            title,
            body,
            json_metadata: jsonMetadata,
          },
        })
      ),
      createVote: vi.fn(),
      createCustomJson: vi.fn(),
    },
    auth: {
      signTransaction: vi.fn((trx: Record<string, unknown>) => ({
        ...trx,
        signatures: ['deadbeef'],
      })),
    },
  },
}));

const signTransactionMock = steem.auth.signTransaction as ReturnType<typeof vi.fn>;

const PARAMS = {
  parentAuthor: '',
  parentPermlink: 'test',
  author: 'alice',
  permlink: 'my-post',
  title: 'My Post',
  body: 'hello',
  jsonMetadata: '{}',
};

/** Operations of the transaction handed to steem.auth.signTransaction. */
function signedOperations(): Array<[string, Record<string, unknown>]> {
  return signTransactionMock.mock.calls[0][0].operations;
}

describe('signCommentOperation comment_options', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          head_block_number: 1000,
          head_block_id:
            '000003e800000000000000000000000000000000000000000000000000000000',
          // Chain head block time (UTC, no Z) — the signer derives the
          // expiration from it.
          time: '2026-08-27T12:00:00',
        }),
      })
    );
  });

  it('signs a bare comment op when no commentOptions are given', async () => {
    const signed = await signCommentOperation('wif', PARAMS);
    expect(signed.signatures).toEqual(['deadbeef']);
    const ops = signedOperations();
    expect(ops).toHaveLength(1);
    expect(ops[0][0]).toBe('comment');
    expect(ops[0][1]).toMatchObject({ author: 'alice', permlink: 'my-post' });
  });

  it('derives the expiration from the chain head block time (+10min), not the client clock', async () => {
    await signCommentOperation('wif', PARAMS);
    const trx = signTransactionMock.mock.calls[0][0];
    expect(trx.expiration).toBe('2026-08-27T12:10:00');
    expect(trx.ref_block_num).toBe(1000 & 0xffff);
  });

  it('appends comment_options immediately after comment with legacy defaults', async () => {
    await signCommentOperation('wif', PARAMS, {});
    const ops = signedOperations();
    expect(ops).toHaveLength(2);
    expect(ops[0][0]).toBe('comment');
    expect(ops[1][0]).toBe('comment_options');
    expect(ops[1][1]).toEqual({
      author: 'alice',
      permlink: 'my-post',
      max_accepted_payout: '1000000.000 SBD',
      percent_steem_dollars: 10000,
      allow_votes: true,
      allow_curation_rewards: true,
      extensions: [],
    });
  });

  it("pins '0%' (decline payout) field values", async () => {
    await signCommentOperation('wif', PARAMS, {
      maxAcceptedPayout: '0.000 SBD',
    });
    const options = signedOperations()[1][1];
    expect(options.max_accepted_payout).toBe('0.000 SBD');
    expect(options.percent_steem_dollars).toBe(10000);
  });

  it("pins '100%' (power up) field values — 0 must not fall back to the default", async () => {
    await signCommentOperation('wif', PARAMS, { percentSteemDollars: 0 });
    const options = signedOperations()[1][1];
    expect(options.percent_steem_dollars).toBe(0);
    expect(options.max_accepted_payout).toBe('1000000.000 SBD');
  });

  it('passes the beneficiaries extension through verbatim', async () => {
    const extensions: Array<[number, { beneficiaries: Array<{ account: string; weight: number }> }]> = [
      [
        0,
        {
          beneficiaries: [
            { account: 'bob', weight: 1000 },
            { account: 'carol', weight: 500 },
          ],
        },
      ],
    ];
    await signCommentOperation('wif', PARAMS, { extensions });
    const options = signedOperations()[1][1];
    expect(options.extensions).toEqual(extensions);
  });
});
