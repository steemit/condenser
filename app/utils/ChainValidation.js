import tt from 'counterpart';

export function validate_account_name(value) {
    let i, label, len, length, ref, suffix;

    suffix = tt('account_name_should');
    if (!value) {
        return suffix + tt('not_be_empty');
    }
    length = value.length;
    if (length < 3) {
        return suffix + tt('be_longer');
    }
    if (length > 16) {
        return suffix + tt('be_shorter');
    }
    if (/\./.test(value)) {
        suffix = tt('each_account_segment_should');
    }
    ref = value.split('.');
    for (i = 0, len = ref.length; i < len; i++) {
        label = ref[i];
        if (!/^[a-z]/.test(label)) {
            return suffix + tt('start_with_a_letter');
        }
        if (!/^[a-z0-9-]*$/.test(label)) {
            return suffix + tt('have_only_letters_digits_or_dashes');
        }
        if (/--/.test(label)) {
            return suffix + tt('have_only_one_dash_in_a_row');
        }
        if (!/[a-z0-9]$/.test(label)) {
            return suffix + tt('end_with_a_letter_or_digit');
        }
        if (!(label.length >= 3)) {
            return suffix + tt('be_longer');
        }
    }
    return null;
}
