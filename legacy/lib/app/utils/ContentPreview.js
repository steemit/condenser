'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = contentPreview;
function contentPreview(content, length) {
    var txt = content.replace(/ +/g, ' '); // only 1 space in a row
    var max_words = length / 7;
    var words = 0;
    var res = '';
    for (var i = 0; i < txt.length; i++) {
        var ch = txt.charAt(i);
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