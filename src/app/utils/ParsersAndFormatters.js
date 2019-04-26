import tt from 'counterpart';

function fractional_part_len(value) {
    const parts = (Number(value) + '').split('.');
    return parts.length < 2 ? 0 : parts[1].length;
}

// FIXME this should be unit tested.. here is one bug: 501,695,.505
export function formatDecimal(value, decPlaces = 2, truncate0s = true) {
    let decSeparator, fl, i, j, sign, thouSeparator, abs_value;
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
    const decPart = decPlaces
        ? decSeparator +
          Math.abs(abs_value - i)
              .toFixed(decPlaces)
              .slice(2)
        : '';
    return [
        sign +
            (j ? i.substr(0, j) + thouSeparator : '') +
            i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thouSeparator),
        decPart,
    ];
}

export function parsePayoutAmount(amount) {
    return parseFloat(String(amount).replace(/\s[A-Z]*$/, ''));
}

/**
    This is a rough approximation of log10 that works with huge digit-strings.
    Warning: Math.log10(0) === NaN
    The 0.00000001 offset fixes cases of Math.log(1000)/Math.LN10 = 2.99999999~
*/
function log10(str) {
    const leadingDigits = parseInt(str.substring(0, 4));
    const log = Math.log(leadingDigits) / Math.LN10 + 0.00000001;
    const n = str.length - 1;
    return n + (log - parseInt(log));
}

export const repLog10 = rep2 => {
    if (rep2 == null) return rep2;
    let rep = String(rep2);
    const neg = rep.charAt(0) === '-';
    rep = neg ? rep.substring(1) : rep;

    let out = log10(rep);
    if (isNaN(out)) out = 0;
    out = Math.max(out - 9, 0); // @ -9, $0.50 earned is approx magnitude 1
    out = (neg ? -1 : 1) * out;
    out = out * 9 + 25; // 9 points per magnitude. center at 25
    // base-line 0 to darken and < 0 to auto hide (grep rephide)
    out = parseInt(out);
    return out;
};

export function countDecimals(amount) {
    if (amount == null) return amount;
    amount = String(amount)
        .match(/[\d\.]+/g)
        .join(''); // just dots and digits
    const parts = amount.split('.');
    return parts.length > 2
        ? undefined
        : parts.length === 1 ? 0 : parts[1].length;
}

// this function searches for right translation of provided error (usually from back-end)
export function translateError(string) {
    if (typeof string != 'string') return string;
    switch (string) {
        case 'Account not found':
            return tt('g.account_not_found');
        case 'Incorrect Password':
            return tt('g.incorrect_password');
        case 'Username does not exist':
            return tt('g.username_does_not_exist');
        case 'Account name should be longer.':
            return tt('g.account_name_should_be_longer');
        case 'Account name should be shorter.':
            return tt('g.account_name_should_be_shorter');
        case 'Account name should start with a letter.':
            return tt('g.account_name_should_start_with_a_letter');
        case 'Account name should have only letters, digits, periods or dashes.':
            return tt(
                'g.account_name_should_have_only_letters_digits_or_dashes'
            );
        case 'Only one Steem account allowed per IP address every 10 minutes':
            return tt(
                'g.only_one_APP_NAME_account_allowed_per_ip_address_every_10_minutes'
            );
        case 'Cannot increase reward of post within the last minute before payout':
            return tt(
                'g.cannot_increase_reward_of_post_within_the_last_minute_before_payout'
            );
        default:
            return string;
    }
}
