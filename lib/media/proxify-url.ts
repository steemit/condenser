/**
 * Image URL proxy utilities.
 *
 * Ported from master's src/app/utils/ProxifyUrl.js, including the fixes from
 * #3976 (only first-party via /p), #3977 (idempotent /p/ URLs), and #3978
 * (canonicalize steemitimages.com/D* to cdn before /p/ encoding).
 *
 * The proxy prefix is read from NEXT_PUBLIC_IMAGE_PROXY_PREFIX (defaults to
 * https://steemitimages.com/), matching master's $STM_Config.img_proxy_prefix.
 */

import bs58 from 'bs58';

/** Proxy / image-host prefix, e.g. "https://steemitimages.com/". */
export const imageProxy = (): string =>
  process.env.NEXT_PUBLIC_IMAGE_PROXY_PREFIX || 'https://steemitimages.com/';

const NATURAL_SIZE = '0x0/';
const CAPPED_SIZE = '640x0/';
const DOUBLE_CAPPED_SIZE = '1280x0/';

export const defaultWidth = (): number =>
  Number.parseInt(CAPPED_SIZE.split('x')[0], 10);

/**
 * Build a srcset string (1x / 2x) for a proxied image URL.
 * Handles both legacy path-based sizing and the new /p/:base58?width= form.
 */
export const defaultSrcSet = (url: string): string => {
  // Back-compat: legacy path-based sizing
  if (typeof url === 'string' && url.includes(CAPPED_SIZE)) {
    return `${url} 1x, ${url.replace(CAPPED_SIZE, DOUBLE_CAPPED_SIZE)} 2x`;
  }
  // New: /p/:base58url?width=640 => 2x is width=1280
  try {
    const u = new URL(url);
    const width = Number.parseInt(u.searchParams.get('width') || '', 10);
    if (!Number.isFinite(width) || width <= 0) return `${url} 1x`;
    u.searchParams.set('width', String(width * 2));
    return `${url} 1x, ${u.toString()} 2x`;
  } catch {
    return `${url} 1x`;
  }
};

/** True when a URL is at the default proxied width (the capped 640px size). */
export const isDefaultImageSize = (url: string): boolean => {
  // Back-compat: legacy path-based sizing
  if (url && url.startsWith(`${imageProxy()}${CAPPED_SIZE}`)) return true;
  try {
    const u = new URL(url);
    return (
      u.pathname.includes('/p/') &&
      u.searchParams.get('width') === String(defaultWidth())
    );
  } catch {
    return false;
  }
};

function ensureTrailingSlash(s: string): string {
  return typeof s === 'string' && s.endsWith('/') ? s : `${s}/`;
}

function registrableDomain(hostname: string): string {
  if (!hostname) return '';
  const parts = hostname
    .toLowerCase()
    .split('.')
    .filter(Boolean);
  if (parts.length <= 2) return parts.join('.');
  // Good enough for our current configs (e.g. steemitimages.com).
  return parts.slice(-2).join('.');
}

/** Whether a hostname belongs to the first-party image host family. */
function isFirstPartyImageHost(hostname: string): boolean {
  try {
    const proxyHost = new URL(imageProxy()).hostname;
    const base = registrableDomain(proxyHost);
    const h = (hostname || '').toLowerCase();
    return h === base || h.endsWith(`.${base}`);
  } catch {
    return false;
  }
}

/**
 * Canonicalize first-party upload URLs (steemitimages.com/D... → cdn) before
 * base58 encoding. Fix from #3978: legacy profile cover_image values stored as
 * steemitimages.com/D... are rewritten to the canonical CDN host.
 */
function normalizeFirstPartyUploadURL(targetUrl: URL): URL {
  try {
    const proxyHost = new URL(imageProxy()).hostname;
    const base = registrableDomain(proxyHost);
    if (base !== 'steemitimages.com') return targetUrl;

    const h = (targetUrl.hostname || '').toLowerCase();
    if (h !== base) return targetUrl;

    if (
      typeof targetUrl.pathname === 'string' &&
      targetUrl.pathname.startsWith('/D')
    ) {
      targetUrl.hostname = `cdn.${base}`;
    }
    return targetUrl;
  } catch {
    return targetUrl;
  }
}

// Matches proxy domains with dimensions, e.g. https://steemitimages.com/640x0/
const rProxyDomainsDimensions =
  /http(s)?:\/\/steemit(dev|stage)?images.com\/([0-9]+x[0-9]+)\//g;

/**
 * Strip proxy wrappers from a URL, optionally re-applying a proxy prefix.
 *
 * @param url        The image URL.
 * @param dimensions Falsy → strip all proxies, return bare URL.
 *                   `true` → proxy ON, preserve first {int}x{int} or fall back to 0x0.
 *                   A string like "640x0/" → proxy ON with explicit dimensions.
 * @returns The (possibly re-)proxied URL.
 *
 * Absorbs #3976 (only first-party via /p), #3977 (idempotent /p/ URLs — if the
 * target is already a /p/ URL, do not base58-encode again), and #3978 (cdn
 * canonicalization).
 */
export function proxifyImageUrl(
  url: string,
  dimensions: string | boolean = false
): string {
  // Reset lastIndex because rProxyDomainsDimensions is /g (stateful).
  rProxyDomainsDimensions.lastIndex = 0;
  const proxyList = url.match(rProxyDomainsDimensions);
  let respUrl = url;
  if (proxyList) {
    const lastProxy = proxyList[proxyList.length - 1];
    respUrl = url.substring(url.lastIndexOf(lastProxy) + lastProxy.length);
  }
  if (!dimensions) return respUrl;

  let dims: string;
  if (typeof dimensions === 'string') {
    dims = dimensions.endsWith('/') ? dimensions : dimensions + '/';
  } else {
    // dimensions === true
    dims = proxyList
      ? (proxyList.shift() as string).match(/([0-9]+x[0-9]+)\//g)![0]
      : NATURAL_SIZE;
  }

  // Force capped size for bandwidth savings, except for gifs (animated).
  if (!respUrl.match(/\.gif$/) && dims === NATURAL_SIZE) {
    dims = CAPPED_SIZE;
  }

  // Third-party images: never proxy/transform. Only first-party can go via /p/.
  try {
    const target = new URL(respUrl);
    if (!isFirstPartyImageHost(target.hostname)) return respUrl;

    normalizeFirstPartyUploadURL(target);

    const dimsNoSlash = dims.endsWith('/') ? dims.slice(0, -1) : dims;
    const [wStr, hStr] = String(dimsNoSlash).split('x');
    const width = Number.parseInt(wStr, 10);
    const height = Number.parseInt(hStr, 10);

    // Idempotency (#3977): if already a /p/ URL, don't base58-encode again —
    // just force query params to the current /p/ policy.
    if (target.pathname.includes('/p/')) {
      target.searchParams.set('mode', 'fit');
      target.searchParams.set('format', 'match');
      if (Number.isFinite(width) && width > 0) {
        target.searchParams.set('width', String(width));
      } else {
        target.searchParams.delete('width');
      }
      // Omit height when 0, to preserve aspect ratio (e.g. 640x0).
      if (Number.isFinite(height) && height > 0) {
        target.searchParams.set('height', String(height));
      } else {
        target.searchParams.delete('height');
      }
      return target.toString();
    }

    const b58 = bs58.encode(Buffer.from(target.toString(), 'utf8'));
    const pUrl = new URL(`${ensureTrailingSlash(imageProxy())}p/${b58}`);
    pUrl.searchParams.set('mode', 'fit');
    pUrl.searchParams.set('format', 'match');
    if (Number.isFinite(width) && width > 0) {
      pUrl.searchParams.set('width', String(width));
    }
    if (Number.isFinite(height) && height > 0) {
      pUrl.searchParams.set('height', String(height));
    }
    return pUrl.toString();
  } catch {
    return respUrl;
  }
}
