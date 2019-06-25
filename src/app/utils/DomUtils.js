export function findParent(el, class_name) {
    if (
        el.className &&
        el.className.indexOf &&
        el.className.indexOf(class_name) !== -1
    )
        return el;
    if (el.parentNode) return findParent(el.parentNode, class_name);
    return null;
}

// From https://stackoverflow.com/a/18284182
export function getViewportDimensions(w) {
    // Bail if server-side
    if (!process.env.BROWSER) return { w: 0, h: 0 };

    // Use the specified window or the current window if no argument
    w = w || window;

    // This works for all browsers except IE8 and before
    if (w.innerWidth != null) return { w: w.innerWidth, h: w.innerHeight };

    // For IE (or any browser) in Standards mode
    var d = w.document;
    if (document.compatMode == 'CSS1Compat')
        return {
            w: d.documentElement.clientWidth,
            h: d.documentElement.clientHeight,
        };

    // For browsers in Quirks mode
    return { w: d.body.clientWidth, h: d.body.clientHeight };
}
