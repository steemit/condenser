'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.defaultWidth = exports.isDefaultImageSize = exports.defaultSrcSet = exports.imageProxy = undefined;

var _parseInt = require('babel-runtime/core-js/number/parse-int');

var _parseInt2 = _interopRequireDefault(_parseInt);

exports.proxifyImageUrl = proxifyImageUrl;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*global $STM_Config:false*/
/**
 * this regular expression should capture all possible proxy domains
 * Possible URL schemes are:
 * <proxy>/<file url>
 * <proxy>/{int}x{int}/<external domain and file url>
 * <proxy>/{int}x{int}/[...<proxy>/{int}x{int}/]<external domain and file url>
 * <proxy>/{int}x{int}/[<proxy>/{int}x{int}/]<proxy>/<file url>
 * @type {RegExp}
 */
var rProxyDomain = /^http(s)?:\/\/steemit(dev|stage)?images.com\//g;
var rProxyDomainsDimensions = /http(s)?:\/\/steemit(dev|stage)?images.com\/([0-9]+x[0-9]+)\//g;
var NATURAL_SIZE = '0x0/';
var CAPPED_SIZE = '640x0/';
var DOUBLE_CAPPED_SIZE = '1280x0/';

var imageProxy = exports.imageProxy = function imageProxy() {
    return $STM_Config.img_proxy_prefix;
};
var defaultSrcSet = exports.defaultSrcSet = function defaultSrcSet(url) {
    return url + ' 1x, ' + url.replace(CAPPED_SIZE, DOUBLE_CAPPED_SIZE) + ' 2x';
};
var isDefaultImageSize = exports.isDefaultImageSize = function isDefaultImageSize(url) {
    return url.startsWith('' + imageProxy() + CAPPED_SIZE);
};
var defaultWidth = exports.defaultWidth = function defaultWidth() {
    return (0, _parseInt2.default)(CAPPED_SIZE.split('x')[0]);
};

/**
 * Strips all proxy domains from the beginning of the url. Adds the global proxy if dimension is specified
 * @param {string} url
 * @param {string|boolean} dimensions - optional -  if provided. url is proxied && global var $STM_Config.img_proxy_prefix is avail. resp will be "$STM_Config.img_proxy_prefix{dimensions}/{sanitized url}"
 *                                          if falsy, all proxies are stripped.
 *                                          if true, preserves the first {int}x{int} in a proxy url. If not found, uses 0x0
 * @returns string
 */
function proxifyImageUrl(url) {
    var dimensions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var proxyList = url.match(rProxyDomainsDimensions);
    var respUrl = url;
    if (proxyList) {
        var lastProxy = proxyList[proxyList.length - 1];
        respUrl = url.substring(url.lastIndexOf(lastProxy) + lastProxy.length);
    }
    if (dimensions && $STM_Config && $STM_Config.img_proxy_prefix) {
        var dims = dimensions + '/';
        if (typeof dimensions !== 'string') {
            dims = proxyList ? proxyList.shift().match(/([0-9]+x[0-9]+)\//g)[0] : NATURAL_SIZE;
        }

        // NOTE: This forces the dimensions to be `CAPPED_SIZE` to save on
        // bandwidth costs. Do not modify gifs.
        if (!respUrl.match(/\.gif$/) && dims === NATURAL_SIZE) {
            dims = CAPPED_SIZE;
        }

        if (NATURAL_SIZE !== dims && CAPPED_SIZE !== dims || !rProxyDomain.test(respUrl)) {
            return $STM_Config.img_proxy_prefix + dims + respUrl;
        }
    }
    return respUrl;
}