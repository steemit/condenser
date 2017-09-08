/*global $STM_Config:false*/

//this regular expression should capture all possible proxy domains
const rProxyDomains = /http(s)?:\/\/steemit(dev|stage)?images.com\/([0-9]+x[0-9]+)?\//g

/**
 * Strips all proxy domains from the beginning of the url. Adds the global proxy if dimension is specified
 * @param {string} url
 * @param {string} dimensions - optional -  if provided. url is proxied && global var $STM_Config.img_proxy_prefix is avail. resp will be "$STM_Config.img_proxy_prefix{dimensions}/{sanitized url}"
 *                                          if falsy, all proxies are stripped.
 * @returns string
 */
export default (url, dimensions = false) => {
    const proxyList = url.match(rProxyDomains)
    let respUrl = url
    if(proxyList && proxyList.length > 0) {
        const lastProxy = proxyList.pop();
        respUrl = url.substring(url.lastIndexOf(lastProxy) + lastProxy.length)
    }
    if(dimensions && $STM_Config && $STM_Config.img_proxy_prefix) {
        respUrl = $STM_Config.img_proxy_prefix + dimensions + '/' + respUrl;
    }
    return respUrl;
}

