import { describe, expect, it } from 'vitest';

import {
  buildCommentOptionsConfig,
  validateBeneficiaries,
  MAX_BENEFICIARIES,
  type BeneficiaryEntry,
} from '@/lib/utils/comment-options';

describe('buildCommentOptionsConfig', () => {
  it("returns undefined for the default '50%' payout without beneficiaries", () => {
    expect(buildCommentOptionsConfig('50%', [])).toBeUndefined();
  });

  it("maps '100%' (power up) to percentSteemDollars 0 with default max payout", () => {
    // Legacy ReplyEditor.jsx: '100%' branch sets only percent_steem_dollars: 0.
    const config = buildCommentOptionsConfig('100%', []);
    expect(config).toEqual({ percentSteemDollars: 0 });
    expect(config?.maxAcceptedPayout).toBeUndefined();
  });

  it("maps '0%' (decline payout) to maxAcceptedPayout '0.000 SBD'", () => {
    // Legacy ReplyEditor.jsx: '0%' branch sets only max_accepted_payout.
    const config = buildCommentOptionsConfig('0%', []);
    expect(config).toEqual({ maxAcceptedPayout: '0.000 SBD' });
    expect(config?.percentSteemDollars).toBeUndefined();
  });

  it('converts beneficiaries to weight = percent * 100', () => {
    const config = buildCommentOptionsConfig('50%', [
      { username: 'bob', percent: '10' },
      { username: 'carol', percent: '100' },
    ]);
    expect(config?.extensions).toEqual([
      [
        0,
        {
          beneficiaries: [
            { account: 'bob', weight: 1000 },
            { account: 'carol', weight: 10000 },
          ],
        },
      ],
    ]);
  });

  it('sorts beneficiaries by account name ascending (serialization requirement)', () => {
    const config = buildCommentOptionsConfig('50%', [
      { username: 'charlie', percent: '10' },
      { username: 'alice', percent: '5' },
      { username: 'bob', percent: '1' },
    ]);
    const routes = config?.extensions?.[0]?.[1].beneficiaries;
    expect(routes?.map((r) => r.account)).toEqual(['alice', 'bob', 'charlie']);
  });

  it('combines payout overrides with beneficiaries', () => {
    const config = buildCommentOptionsConfig('0%', [
      { username: 'bob', percent: '25' },
    ]);
    expect(config?.maxAcceptedPayout).toBe('0.000 SBD');
    expect(config?.extensions?.[0]?.[1].beneficiaries).toEqual([
      { account: 'bob', weight: 2500 },
    ]);
  });
});

describe('validateBeneficiaries', () => {
  const valid = (rows: BeneficiaryEntry[]) =>
    validateBeneficiaries('alice', rows, true);

  it('accepts an empty list', () => {
    expect(valid([])).toBeNull();
  });

  it('rejects more than 8 beneficiaries', () => {
    const rows = Array.from({ length: MAX_BENEFICIARIES + 1 }, (_, i) => ({
      username: `user${i}abc`.slice(0, 16),
      percent: '1',
    }));
    expect(valid(rows)).toBe('Can have at most 8 beneficiaries');
  });

  it('rejects invalid account names', () => {
    expect(valid([{ username: 'ab', percent: '10' }])).toBe(
      'Account name should be longer.'
    );
    expect(valid([{ username: '1abc', percent: '10' }])).toBe(
      'Each account segment should start with a letter.'
    );
    expect(valid([{ username: 'ABc', percent: '10' }])).toBe(
      'Each account segment should start with a letter.'
    );
  });

  it('rejects the author as their own beneficiary', () => {
    expect(valid([{ username: 'alice', percent: '10' }])).toBe(
      'Cannot specify self as beneficiary'
    );
  });

  it('rejects duplicate beneficiaries', () => {
    expect(
      valid([
        { username: 'bob', percent: '10' },
        { username: 'bob', percent: '5' },
      ])
    ).toBe('Beneficiary cannot be duplicate');
  });

  it('rejects invalid percents', () => {
    expect(valid([{ username: 'bob', percent: '0' }])).toBe(
      'Beneficiary percentage must be from 1-100'
    );
    expect(valid([{ username: 'bob', percent: 'abc' }])).toBe(
      'Beneficiary percentage must be from 1-100'
    );
    expect(valid([{ username: 'bob', percent: '' }])).toBe(
      'Beneficiary percentage must be from 1-100'
    );
  });

  it('rejects a total percent over 100', () => {
    expect(valid([{ username: 'bob', percent: '101' }])).toBe(
      'Beneficiary total percentage must be less than 100'
    );
    expect(
      valid([
        { username: 'bob', percent: '60' },
        { username: 'carol', percent: '50' },
      ])
    ).toBe('Beneficiary total percentage must be less than 100');
  });

  it('accepts a valid list totaling exactly 100', () => {
    expect(
      valid([
        { username: 'bob', percent: '60' },
        { username: 'carol', percent: '40' },
      ])
    ).toBeNull();
  });
});
