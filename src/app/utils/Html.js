export const htmlDecode = txt =>
    txt.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, ch => {
        const body = ch.substring(1, ch.length - 1);
        if (body[0] === '#') {
            const code =
                body[1] === 'x' || body[1] === 'X'
                    ? parseInt(body.substring(2), 16)
                    : parseInt(body.substring(1), 10);
            return Number.isFinite(code) && code > 0 && code <= 0x10ffff
                ? String.fromCodePoint(code)
                : ch;
        }
        const char = htmlCharMap[body];
        return char ? char : ch;
    });

const htmlCharMap = {
    amp: '&',
    quot: '"',
    apos: "'",
    lt: '<',
    gt: '>',
    nbsp: ' ',
    iexcl: '¡',
    cent: '¢',
    pound: '£',
    curren: '¤',
    yen: '¥',
    sect: '§',
    copy: '©',
    reg: '®',
    deg: '°',
    plusmn: '±',
    sup2: '²',
    sup3: '³',
    middot: '·',
    frac14: '¼',
    frac12: '½',
    frac34: '¾',
    iquest: '¿',
    times: '×',
    divide: '÷',
    ndash: '–',
    mdash: '—',
    lsquo: '‘',
    rsquo: '’',
    sbquo: '‚',
    ldquo: '“',
    rdquo: '”',
    bdquo: '„',
    bull: '•',
    hellip: '…',
    prime: '′',
    Prime: '″',
    oline: '‾',
    frasl: '⁄',
    euro: '€',
    trade: '™',
    larr: '←',
    uarr: '↑',
    rarr: '→',
    darr: '↓',
    minus: '−',
    infin: '∞',
    ne: '≠',
    le: '≤',
    ge: '≥',
    hearts: '♥',
};
