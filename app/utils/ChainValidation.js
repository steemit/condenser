import tt from 'counterpart';

export function validate_account_name(value) {
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

export function validate_asset_symbol(value) {
    let suffix = tt('chainvalidation_js.asset_name_should');
    if (value == null || value.length === 0) {
        return suffix + tt('chainvalidation_js.not_be_empty');
    }
    if (value.split('.').length > 2) {
        return suffix + tt('chainvalidation_js.have_only_one_dot');
    }
    if (value.length < 3) {
        return suffix + tt('chainvalidation_js.be_longer');
    }
    if (value.length > 16) {
        return suffix + tt('chainvalidation_js.be_shorter');
    }
    if (!/^[A-Z]/.test(value)) {
        return suffix + tt('chainvalidation_js.start_with_a_letter');
    }
    if (!/[A-Z]$/.test(value)) {
        return suffix + tt('chainvalidation_js.end_with_a_letter');
    }
    if (/^[A-Z0-9\.]$/.test(value)) {
        return suffix + tt('chainvalidation_js.contain_only_letters_numbers_and_perhaps_a_dot');
    }
    return null;
}
