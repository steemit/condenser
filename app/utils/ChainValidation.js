import tt from 'counterpart';
import BadActorList from 'app/utils/BadActorList';

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
    if (BadActorList.includes(value)) {
        return tt('chainvalidation_js.use_caution_sending_to_this_account');
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

