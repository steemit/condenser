"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isPhone = isPhone;
function isPhone() {
    if (/(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent)) {
        //移动端
        return true;
    }
    return false;
}