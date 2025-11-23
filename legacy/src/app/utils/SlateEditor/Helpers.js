const findParentTag = (el, tag, depth = 0) => {
    if (!el) return null;
    if (el.tagName == tag) return el;
    return findParentTag(el.parentNode, tag, depth + 1);
};

export const getCollapsedClientRect = () => {
    const selection = document.getSelection();
    if (
        selection.rangeCount === 0 ||
        !selection.getRangeAt ||
        !selection.getRangeAt(0) ||
        !selection.getRangeAt(0).startContainer ||
        !selection.getRangeAt(0).startContainer.getBoundingClientRect
    ) {
        return null;
    }

    const node = selection.getRangeAt(0).startContainer;
    if (!findParentTag(node, 'P')) return; // only show sidebar at the beginning of an empty <p>

    const rect = node.getBoundingClientRect();
    return rect;
};
