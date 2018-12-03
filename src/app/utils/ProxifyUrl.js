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
const rProxyDomain = /^http(s)?:\/\/steemit(dev|stage)?images.com\//g;
const rProxyDomainsDimensions = /http(s)?:\/\/steemit(dev|stage)?images.com\/([0-9]+x[0-9]+)\//g;
const NATURAL_SIZE = '0x0/';
const CAPPED_SIZE = '640x0/';

export const imageProxy = () => $STM_Config.img_proxy_prefix;

/**
 * Strips all proxy domains from the beginning of the url. Adds the global proxy if dimension is specified
 * @param {string} url
 * @param {string|boolean} dimensions - optional -  if provided. url is proxied && global var $STM_Config.img_proxy_prefix is avail. resp will be "$STM_Config.img_proxy_prefix{dimensions}/{sanitized url}"
 *                                          if falsy, all proxies are stripped.
 *                                          if true, preserves the first {int}x{int} in a proxy url. If not found, uses 0x0
 * @returns string
 */
export default (url, dimensions = false) => {
    const proxyList = url.match(rProxyDomainsDimensions);
    let respUrl = url;
    if (proxyList) {
        const lastProxy = proxyList[proxyList.length - 1];
        respUrl = url.substring(url.lastIndexOf(lastProxy) + lastProxy.length);
    }
    if (dimensions && $STM_Config && $STM_Config.img_proxy_prefix) {
        let dims = dimensions + '/';
        if (typeof dimensions !== 'string') {
            dims = proxyList
                ? proxyList.shift().match(/([0-9]+x[0-9]+)\//g)[0]
                : NATURAL_SIZE;
        }

        // NOTE: This forces the dimensions to be `CAPPED_SIZE` to save on
        // bandwidth costs. Do not modify gifs.
        if (!respUrl.match(/\.gif$/) && dims === NATURAL_SIZE) {
            dims = CAPPED_SIZE;
        }

        if (
            (NATURAL_SIZE !== dims && CAPPED_SIZE !== dims) ||
            !rProxyDomain.test(respUrl)
        ) {
            return $STM_Config.img_proxy_prefix + dims + respUrl;
        }
    }
    return respUrl;
};
