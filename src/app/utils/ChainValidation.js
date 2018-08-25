import tt from 'counterpart';
import BadActorList from 'app/utils/BadActorList';
import VerifiedExchangeList from 'app/utils/VerifiedExchangeList';
import { PrivateKey, PublicKey } from '@steemit/steem-js/lib/auth/ecc';

export function validate_account_name(value) {
    let i, label, len, length, ref;

    if (!value) {
        return tt('chainvalidation_js.account_name_should_not_be_empty');
    }
    length = value.length;
    if (length < 3) {
        return tt('chainvalidation_js.account_name_should_be_longer');
    }
    if (length > 16) {
        return tt('chainvalidation_js.account_name_should_be_shorter');
    }
    if (BadActorList.includes(value)) {
        return tt('chainvalidation_js.badactor');
    }
    ref = value.split('.');
    for (i = 0, len = ref.length; i < len; i++) {
        label = ref[i];
        if (!/^[a-z]/.test(label)) {
            return tt(
                'chainvalidation_js.each_account_segment_should_start_with_a_letter'
            );
        }
        if (!/^[a-z0-9-]*$/.test(label)) {
            return tt(
                'chainvalidation_js.each_account_segment_should_have_only_letters_digits_or_dashes'
            );
        }
        if (/--/.test(label)) {
            return tt(
                'chainvalidation_js.each_account_segment_should_have_only_one_dash_in_a_row'
            );
        }
        if (!/[a-z0-9]$/.test(label)) {
            return tt(
                'chainvalidation_js.each_account_segment_should_end_with_a_letter_or_digit'
            );
        }
        if (!(label.length >= 3)) {
            return tt(
                'chainvalidation_js.each_account_segment_should_be_longer'
            );
        }
    }
    return null;
}

/**
 * Do some additional validation for situations where an account name is used along with a memo.
 * Currently only used in the Transfers compoonent.
 *
 * @param {string} name
 * @param {string} memo
 * @returns {null|string} string if there's a validation error
 */
export function validate_account_name_with_memo(name, memo) {
    if (VerifiedExchangeList.includes(name) && !memo) {
        return tt('chainvalidation_js.verified_exchange_no_memo');
    }
    return validate_account_name(name);
}

export function validate_memo_field(value, username, memokey) {
    value = value.split(' ').filter(v => v != '');
    for (var w in value) {
        // Only perform key tests if it might be a key, i.e. it is a long string.
        if (value[w].length >= 39) {
            if (/5[HJK]\w{40,45}/i.test(value[w])) {
                return tt('chainvalidation_js.memo_has_privatekey');
            }
            if (PrivateKey.isWif(value[w])) {
                return tt('chainvalidation_js.memo_is_privatekey');
            }
            if (
                memokey ===
                PrivateKey.fromSeed(username + 'memo' + value[w])
                    .toPublicKey()
                    .toString()
            ) {
                return tt('chainvalidation_js.memo_is_password');
            }
        }
    }
    return null;
}
