import BadActorList from 'app/utils/BadActorList';

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
    if (BadActorList.test(value)) {
        return suffix = 'Use caution sending to this account. Please double check your spelling for possible phishing. ';
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
