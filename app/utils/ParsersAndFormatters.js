import { translate } from 'app/Translator';

function fractional_part_len(value) {
    const parts = (Number(value) + '').split('.');
    return parts.length < 2 ? 0 : parts[1].length;
}

// FIXME this should be unit tested.. here is one bug: 501,695,.505
export function formatDecimal(value, decPlaces = 2, truncate0s = true) {
    let decSeparator, fl, i, j, sign, thouSeparator, abs_value;
    if (value === null || value === void 0 || isNaN(value)) {
        return 'NaN';
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
    const decPart = (decPlaces ? decSeparator + Math.abs(abs_value - i).toFixed(decPlaces).slice(2) : '');
    return [sign + (j ? i.substr(0, j) + thouSeparator : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thouSeparator), decPart];
}

export function parsePayoutAmount(amount) {
    return parseFloat(String(amount).replace(/\s[A-Z]*$/, ''));
}

/**
    This is a rough approximation of log10 that works with huge digit-strings.
    Warning: Math.log10(0) === NaN
*/
function log10(str) {
    const leadingDigits = parseInt(str.substring(0, 4));
    const log = Math.log(leadingDigits) / Math.log(10)
    const n = str.length - 1;
    return n + (log - parseInt(log));
}

export const repLog10 = rep2 => {
    if(rep2 == null) return rep2
    let rep = String(rep2)
    const neg = rep.charAt(0) === '-'
    rep = neg ? rep.substring(1) : rep

    let out = log10(rep)
    if(isNaN(out)) out = 0
    out = Math.max(out - 9, 0); // @ -9, $0.50 earned is approx magnitude 1
    out = (neg ? -1 : 1) * out
    out = (out * 9) + 25 // 9 points per magnitude. center at 25
    // base-line 0 to darken and < 0 to auto hide (grep rephide)
    out = parseInt(out)
    return out
}

// this function searches for right translation of provided error (usually from back-end)
export function translateError(string) {
    if (typeof(string) != 'string') return string
    switch (string) {
        case 'Account not found':
            return translate('account_not_found')
        case 'Incorrect Password':
            return translate('incorrect_password')
        case 'Username does not exist':
            return translate('username_does_not_exist')
        case 'Account name should be longer.':
            return translate('account_name_should_be_longer')
        case 'Account name should be shorter.':
            return translate('account_name_should_be_shorter')
        case 'Comment is nested 5 posts deep, maximum depth is 5':
            return translate('comment_is_nested_5_posts_deep')
        case 'You may only comment once every 20 seconds':
            return translate('you_may_only_comment_once_every_20_seconds')
        case 'Account name should start with a letter.':
            return translate('account_name_should_start_with_a_letter')
        case 'Account name should have only letters, digits, or dashes.':
            return translate('account_name_should_have_only_letters_digits_or_dashes')
        case 'vote currently exists, user must be indicate a desire to reject witness':
            return translate('vote_currently_exists_user_must_be_indicate_a_to_reject_witness')
        case 'Only one Steem account allowed per IP address every 10 minutes':
            return translate('only_one_APP_NAME_account_allowed_per_ip_address_every_10_minutes')
        case 'Cannot increase reward of post within the last minute before payout':
            return translate('cannot_increase_reward_of_post_within_the_last_minute_before_payout')
        default:
            return string
    }
}
//  Missing Active Authority gsteem
// copypaste from https://gist.github.com/tamr/5fb00a1c6214f5cab4f6
// (it have been modified: ий > iy and so on)
// this have been done beecause we cannot use special symbols in url (`` and '')
// and url seems to be the only source of thruth
var d = /\s+/g,
    //rus = "щ	ш	ч	ц	ю	ю	я	я  ые	ий	ё	ё	ж	ъ	э	ы	а	б	в	г	д	е	з	и	й	к	л	м	н	о	п	р	с	т	у	ф	х	х   ь".split(d),
    //eng = "sch	sh	ch	cz	yu	ju	ya	q  yie	iy	yo	jo	zh	w	ye	y	a	b	v	g	d	e	z	i	yi	k	l	m	n	o	p	r	s	t	u	f	x	h	j".split(d);

    rus = "щ    ш  ч  ц  й  ё  э  ю  я  х  ж  а б в г д е з и к л м н о п р с т у ф ъ  ы ь".split(d),
    eng = "shch sh ch cz ij yo ye yu ya kh zh a b v g d e z i k l m n o p r s t u f xx y x".split(d);

export function detransliterate(str, reverse) {
    if (!reverse && str.substring(0, 4) !== 'ru--') return str
    if (!reverse) str = str.substring(4)

    // TODO rework this
    // (didnt placed this earlier because something is breaking and i am too lazy to figure it out ;( )
    /*if(!reverse) {
        str = str.replace(/j/g, 'ь')
        str = str.replace(/w/g, 'ъ')
        str = str.replace(/yie/g, 'ые')
    }
    else {
        str = str.replace(/ь/g, 'j')
        str = str.replace(/ъ/g, 'w')
        str = str.replace(/ые/g, 'yie')
    }*/

    var i,
        s = /[^[\]]+(?=])/g, orig = str.match(s),
        t = /<(.|\n)*?>/g, tags = str.match(t);

    if(reverse) {
        for(i = 0; i < rus.length; ++i) {
            str = str.split(rus[i]).join(eng[i]);
            str = str.split(rus[i].toUpperCase()).join(eng[i].toUpperCase());
        }
    }
    else {
        for(i = 0; i < rus.length; ++i) {
            str = str.split(eng[i]).join(rus[i]);
            str = str.split(eng[i].toUpperCase()).join(rus[i].toUpperCase());
        }
    }

    if(orig) {
        var restoreOrig = str.match(s);

        for (i = 0; i < restoreOrig.length; ++i)
            str = str.replace(restoreOrig[i], orig[i]);
    }

    if(tags) {
        var restoreTags = str.match(t);

        for (i = 0; i < restoreTags.length; ++i)
            str = str.replace(restoreTags[i], tags[i]);

        str = str.replace(/\[/g, '').replace(/\]/g, '');
    }

    return str;
}
