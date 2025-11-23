"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.immutableAccessor = immutableAccessor;
exports.objAccessor = objAccessor;
function immutableAccessor(obj) {
    if (!obj) return {};

    for (var _len = arguments.length, keys = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        keys[_key - 1] = arguments[_key];
    }

    if (keys.length === 1) return obj.get(keys[0]);
    return keys.reduce(function (res, key) {
        res[key] = obj.get(key);
        return res;
    }, {});
}

function objAccessor(obj) {
    if (!obj) return {};

    for (var _len2 = arguments.length, keys = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        keys[_key2 - 1] = arguments[_key2];
    }

    if (keys.length === 1) return obj[keys[0]];
    return keys.reduce(function (res, key) {
        res[key] = obj[key];
        return res;
    }, {});
}