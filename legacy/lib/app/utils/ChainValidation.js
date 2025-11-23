'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.validate_account_name = validate_account_name;

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _BadActorList = require('app/utils/BadActorList');

var _BadActorList2 = _interopRequireDefault(_BadActorList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function validate_account_name(value) {
    var i = void 0,
        label = void 0,
        len = void 0,
        length = void 0,
        ref = void 0;

    if (!value) {
        return (0, _counterpart2.default)('chainvalidation_js.account_name_should_not_be_empty');
    }
    length = value.length;
    if (length < 3) {
        return (0, _counterpart2.default)('chainvalidation_js.account_name_should_be_longer');
    }
    if (length > 16) {
        return (0, _counterpart2.default)('chainvalidation_js.account_name_should_be_shorter');
    }
    if (_BadActorList2.default.includes(value)) {
        return (0, _counterpart2.default)('chainvalidation_js.badactor');
    }
    ref = value.split('.');
    for (i = 0, len = ref.length; i < len; i++) {
        label = ref[i];
        if (!/^[a-z]/.test(label)) {
            return (0, _counterpart2.default)('chainvalidation_js.each_account_segment_should_start_with_a_letter');
        }
        if (!/^[a-z0-9-]*$/.test(label)) {
            return (0, _counterpart2.default)('chainvalidation_js.each_account_segment_should_have_only_letters_digits_or_dashes');
        }
        if (/--/.test(label)) {
            return (0, _counterpart2.default)('chainvalidation_js.each_account_segment_should_have_only_one_dash_in_a_row');
        }
        if (!/[a-z0-9]$/.test(label)) {
            return (0, _counterpart2.default)('chainvalidation_js.each_account_segment_should_end_with_a_letter_or_digit');
        }
        if (!(label.length >= 3)) {
            return (0, _counterpart2.default)('chainvalidation_js.each_account_segment_should_be_longer');
        }
    }
    return null;
}