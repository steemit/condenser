'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var findParentTag = function findParentTag(el, tag) {
    var depth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    if (!el) return null;
    if (el.tagName == tag) return el;
    return findParentTag(el.parentNode, tag, depth + 1);
};

var getCollapsedClientRect = exports.getCollapsedClientRect = function getCollapsedClientRect() {
    var selection = document.getSelection();
    if (selection.rangeCount === 0 || !selection.getRangeAt || !selection.getRangeAt(0) || !selection.getRangeAt(0).startContainer || !selection.getRangeAt(0).startContainer.getBoundingClientRect) {
        return null;
    }

    var node = selection.getRangeAt(0).startContainer;
    if (!findParentTag(node, 'P')) return; // only show sidebar at the beginning of an empty <p>

    var rect = node.getBoundingClientRect();
    return rect;
};