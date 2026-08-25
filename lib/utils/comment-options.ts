/**
 * Payout (comment_options) helpers for root posts.
 * Ported from legacy:
 * - src/app/components/elements/ReplyEditor.jsx (~1458-1495):
 *   payoutType -> __config.comment_options config
 * - src/app/components/cards/BeneficiarySelector.jsx (validateBeneficiaries)
 * The final op assembly (author/permlink fill-in + defaults) happens in
 * lib/crypto/transaction-signer.ts, mirroring legacy TransactionSaga.js
 * preBroadcast_comment.
 */

import { validateAccountName } from '@/lib/chain-validation';

/** Legacy payoutType values (ReplyEditor.jsx switch). */
export type PayoutType = '50%' | '100%' | '0%';
export const DEFAULT_PAYOUT_TYPE: PayoutType = '50%';

/** One beneficiary row as edited in the UI (legacy {username, percent}). */
export interface BeneficiaryEntry {
  username: string;
  percent: string;
}

/** Serialized beneficiary route inside the comment_options extension. */
export interface BeneficiaryRoute {
  account: string;
  /** percent * 100 (10000 === 100%). */
  weight: number;
}

/**
 * Partial comment_options payload, like legacy __config.comment_options:
 * only the fields that differ from the chain defaults are set.
 */
export interface CommentOptionsConfig {
  maxAcceptedPayout?: string;
  percentSteemDollars?: number;
  extensions?: Array<[number, { beneficiaries: BeneficiaryRoute[] }]>;
}

// Legacy BeneficiarySelector handleAddBeneficiary caps the list at 8.
export const MAX_BENEFICIARIES = 8;

/**
 * Ported from legacy BeneficiarySelector.jsx validateBeneficiaries, with
 * counterpart i18n messages inlined as English (locales/en.json
 * beneficiary_selector_jsx.*). Returns an error message or null when valid.
 */
export function validateBeneficiaries(
  username: string,
  beneficiaries: BeneficiaryEntry[],
  required = true
): string | null {
  if (beneficiaries.length > MAX_BENEFICIARIES) {
    return 'Can have at most 8 beneficiaries';
  }
  let totalPercent = 0;
  const beneficiaryNames = new Set<string>();
  for (const beneficiary of beneficiaries) {
    const accountError = validateAccountName(beneficiary.username);
    if ((required || beneficiary.username) && accountError) {
      return accountError;
    }
    if (beneficiary.username === username) {
      return 'Cannot specify self as beneficiary';
    }
    if (beneficiaryNames.has(beneficiary.username)) {
      return 'Beneficiary cannot be duplicate';
    }
    beneficiaryNames.add(beneficiary.username);
    if (
      (required || beneficiary.percent) &&
      !/^[1-9]\d{0,2}$/.test(beneficiary.percent)
    ) {
      return 'Beneficiary percentage must be from 1-100';
    }
    totalPercent += parseInt(beneficiary.percent);
  }
  if (totalPercent > 100) {
    return 'Beneficiary total percentage must be less than 100';
  }
  return null;
}

/**
 * Build the comment_options config for a new root post, mirroring legacy
 * ReplyEditor.jsx:1458-1495. Returns undefined when the defaults apply
 * (50% payout, no beneficiaries), in which case no comment_options op is
 * appended at all.
 */
export function buildCommentOptionsConfig(
  payoutType: PayoutType,
  beneficiaries: BeneficiaryEntry[]
): CommentOptionsConfig | undefined {
  let config: CommentOptionsConfig | undefined;
  switch (payoutType) {
    case '0%': // decline payout
      config = { maxAcceptedPayout: '0.000 SBD' };
      break;
    case '100%': // 100% steem power payout
      config = { percentSteemDollars: 0 }; // 10000 === 100% (of 50%)
      break;
    default: // 50% steem power, 50% SBD
  }
  if (beneficiaries.length > 0) {
    if (!config) config = {};
    // Serialization requires beneficiaries sorted by account name ascending;
    // weight is percent * 100 (10000 === 100%).
    const sorted = [...beneficiaries].sort((a, b) =>
      a.username < b.username ? -1 : a.username > b.username ? 1 : 0
    );
    config.extensions = [
      [
        0,
        {
          beneficiaries: sorted.map((elt) => ({
            account: elt.username,
            weight: parseInt(elt.percent) * 100,
          })),
        },
      ],
    ];
  }
  return config;
}
