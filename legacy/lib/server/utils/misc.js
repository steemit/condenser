'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getRemoteIp(req) {
    var remote_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var ip_match = remote_address ? remote_address.match(/(\d+\.\d+\.\d+\.\d+)/) : null;
    return ip_match ? ip_match[1] : remote_address;
}

var ip_last_hit = new _map2.default();
function rateLimitReq(ctx, req) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var now = Date.now();

    // purge hits older than minutes_max
    ip_last_hit.forEach(function (v, k) {
        var seconds = (now - v) / 1000;
        if (seconds > 1) {
            ip_last_hit.delete(ip);
        }
    });

    var result = false;
    // if ip is still in the map, abort
    if (ip_last_hit.has(ip)) {
        // console.log(`api rate limited for ${ip}: ${req}`);
        // throw new Error(`Rate limit reached: one call per ${minutes_max} minutes allowed.`);
        console.error('Rate limit reached: one call per 1 second allowed.');
        ctx.status = 429;
        ctx.body = 'Too Many Requests';
        result = true;
    }

    // record api hit
    ip_last_hit.set(ip, now);
    return result;
}

function checkCSRF(ctx, csrf) {
    try {
        ctx.assertCSRF(csrf);
    } catch (e) {
        ctx.status = 403;
        ctx.body = 'invalid csrf token';
        console.log('-- invalid csrf token -->', ctx.request.method, ctx.request.url, ctx.session.uid);
        return false;
    }
    return true;
}

function getSupportedLocales() {
    var locales = [];
    var files = _fs2.default.readdirSync(_path2.default.join(__dirname, '../../..', 'src/app/locales'));
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = (0, _getIterator3.default)(files), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var filename = _step.value;

            var match_res = filename.match(/(\w+)\.json?$/);
            if (match_res) locales.push(match_res[1]);
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return locales;
}

module.exports = {
    getRemoteIp: getRemoteIp,
    rateLimitReq: rateLimitReq,
    checkCSRF: checkCSRF,
    getSupportedLocales: getSupportedLocales
};