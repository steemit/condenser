/**
 * Steem account-name validation.
 * Ported from master's src/app/utils/ChainValidation.js
 * (validate_account_name), with counterpart i18n messages inlined as English.
 */

import badActorList from '@/lib/bad-actor-list';

/**
 * Returns an error message when the account name is invalid, null when valid.
 */
export function validateAccountName(value: string): string | null {
  if (!value) return 'Account name should not be empty.';
  const length = value.length;
  if (length < 3) return 'Account name should be longer.';
  if (length > 16) return 'Account name should be shorter.';
  if (badActorList.includes(value)) return 'Bad actor.';
  const ref = value.split('.');
  for (const label of ref) {
    if (!/^[a-z]/.test(label)) {
      return 'Each account segment should start with a letter.';
    }
    if (!/^[a-z0-9-]*$/.test(label)) {
      return 'Each account segment should have only letters, digits, or dashes.';
    }
    if (/--/.test(label)) {
      return 'Each account segment should have only one dash in a row.';
    }
    if (!/[a-z0-9]$/.test(label)) {
      return 'Each account segment should end with a letter or digit.';
    }
    if (!(label.length >= 3)) {
      return 'Each account segment should be longer.';
    }
  }
  return null;
}
