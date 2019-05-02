import tt from 'counterpart';
import BadActorList from 'app/utils/BadActorList';

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
