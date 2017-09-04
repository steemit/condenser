/*global $STM_Config:false*/

//this regular expression should capture all possible proxy domains
const rProxyDomains = /http(s)?:\/\/steemit(dev|stage)?images.com\//g

/**
 * Strips all but final 'steemit' image proxy from the beginning of the url.
 * @param {string} url
 * @param {string} dimensions - optional - if provided. url is proxied && global var $STM_Config.img_proxy_prefix is avail. resp will be "$STM_Config.img_proxy_prefix{dimensions}/{sanitized url}"
 * @returns string
 */
export default (url, dimensions = false) => {
    const proxyList = url.match(rProxyDomains)
    let respUrl = url;
    if(proxyList && proxyList.length > 0) {
        respUrl = url.substring(url.lastIndexOf(proxyList.pop()))
        if(dimensions && $STM_Config && $STM_Config.img_proxy_prefix) {
            respUrl = $STM_Config.img_proxy_prefix + dimensions + '/' + respUrl;
        }
    }
    return respUrl;
}
