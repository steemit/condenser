'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.repLog10 = undefined;
exports.formatDecimal = formatDecimal;
exports.parsePayoutAmount = parsePayoutAmount;
exports.countDecimals = countDecimals;
exports.translateError = translateError;

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function fractional_part_len(value) {
    var parts = (Number(value) + '').split('.');
    return parts.length < 2 ? 0 : parts[1].length;
}

// FIXME this should be unit tested.. here is one bug: 501,695,.505
function formatDecimal(value) {
    var decPlaces = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
    var truncate0s = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    var decSeparator = void 0,
        fl = void 0,
        i = void 0,
        j = void 0,
        sign = void 0,
        thouSeparator = void 0,
        abs_value = void 0;
    if (value === null || value === void 0 || isNaN(value)) {
        return ['N', 'a', 'N'];
    }
    if (truncate0s) {
        fl = fractional_part_len(value);
        if (fl < 2) fl = 2;
        if (fl < decPlaces) decPlaces = fl;
    }
    decSeparator = '.';
    thouSeparator = ',';
    sign = value < 0 ? '-' : '';
    abs_value = Math.abs(value);
    i = parseInt(abs_value.toFixed(decPlaces), 10) + '';
    j = i.length;
    j = i.length > 3 ? j % 3 : 0;
    var decPart = decPlaces ? decSeparator + Math.abs(abs_value - i).toFixed(decPlaces).slice(2) : '';
    return [sign + (j ? i.substr(0, j) + thouSeparator : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thouSeparator), decPart];
}

function parsePayoutAmount(amount) {
    return parseFloat(String(amount).replace(/\s[A-Z]*$/, ''));
}

/**
    This is a rough approximation of log10 that works with huge digit-strings.
    Warning: Math.log10(0) === NaN
    The 0.00000001 offset fixes cases of Math.log(1000)/Math.LN10 = 2.99999999~
*/
function log10(str) {
    var leadingDigits = parseInt(str.substring(0, 4));
    var log = Math.log(leadingDigits) / Math.LN10 + 0.00000001;
    var n = str.length - 1;
    return n + (log - parseInt(log));
}

var repLog10 = exports.repLog10 = function repLog10(rep2) {
    if (rep2 == null) return rep2;
    var rep = String(rep2);
    var neg = rep.charAt(0) === '-';
    rep = neg ? rep.substring(1) : rep;

    var out = log10(rep);
    if (isNaN(out)) out = 0;
    out = Math.max(out - 9, 0); // @ -9, $0.50 earned is approx magnitude 1
    out = (neg ? -1 : 1) * out;
    out = out * 9 + 25; // 9 points per magnitude. center at 25
    // base-line 0 to darken and < 0 to auto hide (grep rephide)
    out = parseInt(out);
    return out;
};

function countDecimals(amount) {
    if (amount == null) return amount;
    amount = String(amount).match(/[\d\.]+/g).join(''); // just dots and digits
    var parts = amount.split('.');
    return parts.length > 2 ? undefined : parts.length === 1 ? 0 : parts[1].length;
}

// this function searches for right translation of provided error (usually from back-end)
function translateError(string) {
    if (typeof string != 'string') return string;
    switch (string) {
        case 'Account not found':
            return (0, _counterpart2.default)('g.account_not_found');
        case 'Incorrect Password':
            return (0, _counterpart2.default)('g.incorrect_password');
        case 'Username does not exist':
            return (0, _counterpart2.default)('g.username_does_not_exist');
        case 'Account name should be longer.':
            return (0, _counterpart2.default)('g.account_name_should_be_longer');
        case 'Account name should be shorter.':
            return (0, _counterpart2.default)('g.account_name_should_be_shorter');
        case 'Account name should start with a letter.':
            return (0, _counterpart2.default)('g.account_name_should_start_with_a_letter');
        case 'Account name should have only letters, digits, periods or dashes.':
            return (0, _counterpart2.default)('g.account_name_should_have_only_letters_digits_or_dashes');
        case 'Only one Steem account allowed per IP address every 10 minutes':
            return (0, _counterpart2.default)('g.only_one_APP_NAME_account_allowed_per_ip_address_every_10_minutes');
        case 'Cannot increase reward of post within the last minute before payout':
            return (0, _counterpart2.default)('g.cannot_increase_reward_of_post_within_the_last_minute_before_payout');
        default:
            return string;
    }
}