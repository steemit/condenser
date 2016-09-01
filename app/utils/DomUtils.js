export function findParent(el, class_name) {
    if (el.className && el.className.indexOf && el.className.indexOf(class_name) !== -1) return el;
    if (el.parentElement) return findParent(el.parentElement, class_name);
    return null;
}
