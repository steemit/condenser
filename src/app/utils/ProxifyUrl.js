/*global $STM_Config:false*/
import base58 from 'bs58';

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
const DOUBLE_CAPPED_SIZE = '1280x0/';

export const imageProxy = () => $STM_Config.img_proxy_prefix;
export const defaultSrcSet = url => {
    // Back-compat: legacy path-based sizing
    if (typeof url === 'string' && url.includes(CAPPED_SIZE)) {
        return `${url} 1x, ${url.replace(CAPPED_SIZE, DOUBLE_CAPPED_SIZE)} 2x`;
    }
    // New: /p/:base58url?width=640 => 2x is width=1280
    try {
        const u = new URL(url);
        const width = Number.parseInt(u.searchParams.get('width'), 10);
        if (!Number.isFinite(width) || width <= 0) return `${url} 1x`;
        u.searchParams.set('width', String(width * 2));
        return `${url} 1x, ${u.toString()} 2x`;
    } catch (e) {
        return `${url} 1x`;
    }
};
export const isDefaultImageSize = url => {
    // Back-compat: legacy path-based sizing
    if (url && url.startsWith(`${imageProxy()}${CAPPED_SIZE}`)) return true;
    try {
        const u = new URL(url);
        return (
            u.pathname.includes('/p/') &&
            u.searchParams.get('width') === String(defaultWidth())
        );
    } catch (e) {
        return false;
    }
};
export const defaultWidth = () => Number.parseInt(CAPPED_SIZE.split('x')[0]);

function ensureTrailingSlash(s) {
    return typeof s === 'string' && s.endsWith('/') ? s : `${s}/`;
}

function registrableDomain(hostname) {
    if (!hostname) return '';
    const parts = hostname
        .toLowerCase()
        .split('.')
        .filter(Boolean);
    if (parts.length <= 2) return parts.join('.');
    // Good enough for our current configs (e.g. steemitimages.com).
    return parts.slice(-2).join('.');
}

function isFirstPartyImageHost(hostname) {
    try {
        const proxyHost = new URL(imageProxy()).hostname;
        const base = registrableDomain(proxyHost);
        const h = (hostname || '').toLowerCase();
        return h === base || h.endsWith(`.${base}`);
    } catch (e) {
        return false;
    }
}

/**
 * Strips all proxy domains from the beginning of the url. Adds the global proxy if dimension is specified
 * @param {string} url
 * @param {string|boolean} dimensions - optional -  if provided. url is proxied && global var $STM_Config.img_proxy_prefix is avail. resp will be "$STM_Config.img_proxy_prefix{dimensions}/{sanitized url}"
 *                                          if falsy, all proxies are stripped.
 *                                          if true, preserves the first {int}x{int} in a proxy url. If not found, uses 0x0
 * @returns string
 */
export function proxifyImageUrl(url, dimensions = false) {
    const proxyList = url.match(rProxyDomainsDimensions);
    let respUrl = url;
    if (proxyList) {
        const lastProxy = proxyList[proxyList.length - 1];
        respUrl = url.substring(url.lastIndexOf(lastProxy) + lastProxy.length);
    }
    if (!dimensions) return respUrl;

    if (dimensions && $STM_Config && $STM_Config.img_proxy_prefix) {
        let dims =
            typeof dimensions === 'string' && dimensions.endsWith('/')
                ? dimensions
                : dimensions + '/';
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

        // Third-party images: never proxy/transform. Only first-party domains can go via /p/.
        try {
            const target = new URL(respUrl);
            if (!isFirstPartyImageHost(target.hostname)) return respUrl;

            const dimsNoSlash = dims.endsWith('/') ? dims.slice(0, -1) : dims;
            const [wStr, hStr] = String(dimsNoSlash).split('x');
            const width = Number.parseInt(wStr, 10);
            const height = Number.parseInt(hStr, 10);

            // Idempotency: if the URL is already a /p/ URL, do not base58-encode again.
            // Force query params to match the current /p/ policy (mode/format/width/height).
            if (target.pathname.includes('/p/')) {
                target.searchParams.set('mode', 'fit');
                target.searchParams.set('format', 'match');
                if (Number.isFinite(width) && width > 0) {
                    target.searchParams.set('width', String(width));
                } else {
                    target.searchParams.delete('width');
                }
                // Important: omit height when 0, to preserve aspect ratio (e.g. 640x0).
                if (Number.isFinite(height) && height > 0) {
                    target.searchParams.set('height', String(height));
                } else {
                    target.searchParams.delete('height');
                }
                return target.toString();
            }

            const b58 = base58.encode(Buffer.from(respUrl, 'utf8'));
            const pBase = `${ensureTrailingSlash(imageProxy())}p/${b58}`;
            const pUrl = new URL(pBase);
            pUrl.searchParams.set('mode', 'fit');
            pUrl.searchParams.set('format', 'match');
            if (Number.isFinite(width) && width > 0) {
                pUrl.searchParams.set('width', String(width));
            }
            // Important: omit height when 0, to preserve aspect ratio (e.g. 640x0).
            if (Number.isFinite(height) && height > 0) {
                pUrl.searchParams.set('height', String(height));
            }
            return pUrl.toString();
        } catch (e) {
            return respUrl;
        }
    }
    return respUrl;
}
