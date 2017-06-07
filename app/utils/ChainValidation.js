import BadActorList from 'app/utils/BadActorList';
import {PrivateKey, PublicKey} from 'steem/lib/auth/ecc';

export function validate_account_name(value) {
    let i, label, len, length, ref, suffix;

    suffix = 'Account name should ';
    if (!value) {
        return suffix + 'not be empty.';
    }
    length = value.length;
    if (length < 3) {
        return suffix + 'be longer.';
    }
    if (length > 16) {
        return suffix + 'be shorter.';
    }
    if (/\./.test(value)) {
        suffix = 'Each account segment should ';
    }
    if (BadActorList.includes(value)) {
        return 'Use caution sending to this account. Please double check your spelling for possible phishing. ';
    }
    ref = value.split('.');
    for (i = 0, len = ref.length; i < len; i++) {
        label = ref[i];
        if (!/^[a-z]/.test(label)) {
            return suffix + 'start with a letter.';
        }
        if (!/^[a-z0-9-]*$/.test(label)) {
            return suffix + 'have only letters, digits, or dashes.';
        }
        if (/--/.test(label)) {
            return suffix + 'have only one dash in a row.';
        }
        if (!/[a-z0-9]$/.test(label)) {
            return suffix + 'end with a letter or digit.';
        }
        if (!(label.length >= 3)) {
            return suffix + 'be longer';
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
