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


// copypaste from https://gist.github.com/tamr/5fb00a1c6214f5cab4f6
var d = /\t+/g,
    rus = "щ	щ	ш	ч	ц	ю	ю	я	я	ё	ё	ж	ъ	ъ	ы	э	э	а	б	в	г	д	е	з	и	й	й	й	к	л	м	н	о	п	р	с	т	у	ф	х	х	ь	ь".split(d),
    eng = "shh	w	sh	ch	cz	yu	ju	ya	q	yo	jo	zh	``	''	y	e`	e'	a	b	v	g	d	e	z	i	j	i`	i'	k	l	m	n	o	p	r	s	t	u	f	x	h	`	'".split(d);

export function detransliterate(str) {
    // TODO add 'ru-' checker
    if (str.substring(0, 3) !== 'ru-') return str
    str = str.substring(3)

    var i,
        s = /[^[\]]+(?=])/g, orig = str.match(s),
        t = /<(.|\n)*?>/g, tags = str.match(t);

    for(i = 0; i < rus.length; ++i) {
        str = str.split(eng[i]).join(rus[i]);
        str = str.split(eng[i].toUpperCase()).join(rus[i].toUpperCase());
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
