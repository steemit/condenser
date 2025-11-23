export function immutableAccessor(obj, ...keys) {
    if (!obj) return {};
    if (keys.length === 1) return obj.get(keys[0]);
    return keys.reduce((res, key) => {
        res[key] = obj.get(key);
        return res;
    }, {});
}

export function objAccessor(obj, ...keys) {
    if (!obj) return {};
    if (keys.length === 1) return obj[keys[0]];
    return keys.reduce((res, key) => {
        res[key] = obj[key];
        return res;
    }, {});
}
