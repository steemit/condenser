export function isPhone() {
    if (/(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent)) {
        // Mobile device
        return true;
    }
    return false;
}
