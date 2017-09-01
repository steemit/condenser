//this regular expression should capture all possible proxy domains
const rProxyDomains = /http(s)?:\/\/steemit(dev|stage)?images.com\//g
const rHttp = /http(s)?:\/\//

/**
 * Strips all but final 'steemit' image proxy from the beginning of the url.
 * @param url
 * @param stripAllProxies //also strips the final proxy, unless it's the actual resource host
 * @returns string
 */
export default (url, stripAllProxies = false) => {
    const proxyList = url.match(rProxyDomains)
    if(proxyList && proxyList.length > 0) {
        if(stripAllProxies) {
            const finalProxy = proxyList.pop()
            let respUrl = url.substring(url.lastIndexOf(finalProxy) + finalProxy.length)
            switch(respUrl.indexOf(rHttp)) {
                case 0 :
                    break
                case -1 :
                    respUrl = finalProxy + respUrl //if the proxy we pulled is the *last* domain in the url, we want to keep it
                    break
                default :
                    respUrl = respUrl.substring(respUrl.indexOf(rHttp))
            }
            return respUrl;
        }
        return url.substring(url.lastIndexOf(proxyList.pop()))
    }
    return url;
}
