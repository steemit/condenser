import BadActorList from 'app/utils/BadActorList';
import {translate} from 'app/Translator';

export function validate_account_name(value) {
    let i, label, len, length, ref, suffix;

    suffix = translate('account_name_should');
    if (!value) {
        return suffix + translate('not_be_empty');
    }
    length = value.length;
    if (length < 3) {
        return suffix + translate('be_longer');
    }
    if (length > 16) {
        return suffix + translate('be_shorter');
    }
    if (/\./.test(value)) {
        suffix = translate('each_account_segment_should');
    }
    if (BadActorList.includes(value)) {
        return translate('use_caution_sending_to_this_account');
    }
    ref = value.split('.');
    for (i = 0, len = ref.length; i < len; i++) {
        label = ref[i];
        if (!/^[a-z]/.test(label)) {
            return suffix + translate('start_with_a_letter');
        }
        if (!/^[a-z0-9-]*$/.test(label)) {
            return suffix + translate('have_only_letters_digits_or_dashes');
        }
        if (/--/.test(label)) {
            return suffix + translate('have_only_one_dash_in_a_row');
        }
        if (!/[a-z0-9]$/.test(label)) {
            return suffix + translate('end_with_a_letter_or_digit');
        }
        if (!(label.length >= 3)) {
            return suffix + translate('be_longer');
        }
    }
    return null;
}
