import { describe, expect, it } from 'vitest';

import { serializeAccountUpdate2Transaction } from '@/lib/crypto/transaction-signer';

/**
 * Golden byte-level compatibility test: the hand-rolled account_update2
 * serializer must produce exactly the bytes the legacy steem-js 0.7
 * serializer emits (the format production condenser has always used).
 * Golden hex generated from condenser-legacy's operations.js.
 */
describe('serializeAccountUpdate2Transaction', () => {
  it('matches the legacy steem-js 0.7 wire format byte-for-byte', () => {
    const buf = serializeAccountUpdate2Transaction(
      {
        ref_block_num: 12345,
        ref_block_prefix: 67890,
        expiration: '2026-09-04T00:00:00',
      },
      {
        account: 'alice',
        json_metadata: '',
        posting_json_metadata: JSON.stringify({
          profile: { name: 'Alice', version: 2 },
        }),
      }
    );

    expect(buf.toString('hex')).toBe(
      '393032090100000a9a6a012b05616c696365000000000028' +
        '7b2270726f66696c65223a7b226e616d65223a22416c696365222c2276657273696f6e223a327d7d' +
        '0000'
    );
  });

  it('marks owner/active/posting/memo_key absent (0x00 flags)', () => {
    const buf = serializeAccountUpdate2Transaction(
      { ref_block_num: 1, ref_block_prefix: 2, expiration: '2026-09-04T00:00:00' },
      { account: 'bob', json_metadata: '', posting_json_metadata: '{}' }
    );
    const hex = buf.toString('hex');
    // 2B num + 4B prefix + 4B time + 01 op count + 2b op index +
    // 03 'bob' + 0000 0000 (owner/active/posting/memo_key absent) + ...
    expect(hex).toContain('2b03626f6200000000');
  });
});
