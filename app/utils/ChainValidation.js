import tt from 'counterpart';
import BadActorList from 'app/utils/BadActorList';
import VerifiedExchangeList from 'app/utils/VerifiedExchangeList';
import {PrivateKey, PublicKey} from 'steem/lib/auth/ecc';

export function validate_account_name(value, memo) {
    let i, label, len, length, ref, suffix;

    suffix = tt('chainvalidation_js.account_name_should');
    if (!value) {
        return suffix + tt('chainvalidation_js.not_be_empty');
    }
    length = value.length;
    if (length < 3) {
        return suffix + tt('chainvalidation_js.be_longer');
    }
    if (length > 16) {
        return suffix + tt('chainvalidation_js.be_shorter');
    }
    if (/\./.test(value)) {
        suffix = tt('chainvalidation_js.each_account_segment_should');
    }
    if (BadActorList.includes(value)) {
        return 'Use caution sending to this account. Please double check your spelling for possible phishing. ';
    }
    if (VerifiedExchangeList.includes(value) && !memo) {
        return 'Must include memo'
    }
    ref = value.split('.');
    for (i = 0, len = ref.length; i < len; i++) {
        label = ref[i];
        if (!/^[a-z]/.test(label)) {
            return suffix + tt('chainvalidation_js.start_with_a_letter');
        }
        if (!/^[a-z0-9-]*$/.test(label)) {
            return suffix + tt('chainvalidation_js.have_only_letters_digits_or_dashes');
        }
        if (/--/.test(label)) {
            return suffix + tt('chainvalidation_js.have_only_one_dash_in_a_row');
        }
        if (!/[a-z0-9]$/.test(label)) {
            return suffix + tt('chainvalidation_js.end_with_a_letter_or_digit');
        }
        if (!(label.length >= 3)) {
            return suffix + tt('chainvalidation_js.be_longer');
        }
    }
    return null;
}

export function validate_memo_field(value, username, memokey) {
    let suffix;
    value = value.split(' ').filter(v=>v!='');
    for (var w in value) {
        if (PrivateKey.isWif(value[w])) {
            return suffix = 'Do not use private keys in memos. ';
        }
        if (memokey === PrivateKey.fromSeed(username + 'memo' + value[w]).toPublicKey().toString()) {
            return suffix = 'Do not use passwords in memos. ';
        }
        if (/5[HJK]\w{40,45}/i.test(value[w])) {
            return suffix = 'Please do not include what appears to be a private key or password. '
        }
    }
    return null;
}
