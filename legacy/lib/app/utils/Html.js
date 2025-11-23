'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var htmlDecode = exports.htmlDecode = function htmlDecode(txt) {
    return txt.replace(/&[a-z]+;/g, function (ch) {
        var char = htmlCharMap[ch.substring(1, ch.length - 1)];
        return char ? char : ch;
    });
};

var htmlCharMap = {
    amp: '&',
    quot: '"',
    lsquo: '‘',
    rsquo: '’',
    sbquo: '‚',
    ldquo: '“',
    rdquo: '”',
    bdquo: '„',
    hearts: '♥',
    trade: '™',
    hellip: '…',
    pound: '£',
    copy: ''
};