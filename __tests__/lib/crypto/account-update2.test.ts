// @vitest-environment node
//
// Uses the real steem-js (noble crypto requires same-realm Uint8Array, which
// jsdom's Buffer breaks); the signing path needs Node's realm.

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { signAccountUpdate2Operation } from '@/lib/crypto/transaction-signer';
import { steem } from '@steemit/steem-js';

/**
 * account_update2 metadata-only signing (condenser profile settings save).
 * The byte-level wire-format guarantee lives in steem-js's own golden tests
 * (steemit/steem-js#552); here we verify our signing path end to end with
 * the real steem-js: no throw on absent authorities, well-formed signature.
 */

const DGP = {
  head_block_number: 100000000,
  head_block_id:
    '05f5e100a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c',
  time: '2026-09-09T12:00:00',
};

describe('signAccountUpdate2Operation', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => DGP })
    );
  });

  it('signs a metadata-only account_update2 with the real steem-js', async () => {
    const wif = steem.auth.toWif('alice', 'testpass', 'posting');
    const signed = await signAccountUpdate2Operation(wif, {
      account: 'alice',
      jsonMetadata: '',
      postingJsonMetadata: JSON.stringify({
        profile: { name: 'Alice', version: 2 },
      }),
    });

    const [opName, payload] = signed.operations[0] as [
      string,
      Record<string, unknown>,
    ];
    expect(opName).toBe('account_update2');
    expect(payload).toEqual({
      account: 'alice',
      json_metadata: '',
      posting_json_metadata: JSON.stringify({
        profile: { name: 'Alice', version: 2 },
      }),
      extensions: [],
    });
    expect(signed.signatures).toHaveLength(1);
    expect(signed.signatures[0]).toMatch(/^[0-9a-f]{130}$/);
  });
});
