export default function contentPreview(content, length) {
    const txt = content.replace(/ +/g, ' '); // only 1 space in a row
    const max_words = length / 7;
    let words = 0;
    let res = '';
    for (let i = 0; i < txt.length; i++) {
        const ch = txt.charAt(i);
        if (ch === '.') break;
        if (ch === ' ' || ch === '\n') {
            words++;
            if (words > max_words) break;
            if (i > length) break;
        }
        res += ch;
    }
    return res;
}
