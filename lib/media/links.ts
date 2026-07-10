/**
 * URL link/image regexes used by the post-body rendering pipeline.
 * Ported from master's src/app/utils/Links.js — only the subset needed by
 * HtmlReady + ProxifyUrl (any, local, image).
 */

const urlChar = '[^\\s"<>\\]\\[\\(\\)]';
const urlCharEnd = urlChar.replace(/\]$/, ".,']");
const imagePath =
  '(?:(?:\\.(?:tiff?|jpe?g|gif|png|svg|ico)|ipfs/[a-z\\d]{40,}))';
const domainPath = '(?:[-a-zA-Z0-9\\._]*[-a-zA-Z0-9])';
const urlChars = '(?:' + urlChar + '*' + urlCharEnd + ')?';

const urlSet = ({
  domain = domainPath,
  path,
}: { domain?: string; path?: string } = {}) => {
  return `https?:\\/\\/${domain}(?::\\d{2,5})?(?:[\\/\\?#]${urlChars}${
    path ? path : ''
  })${path ? '' : '?'}`;
};

/** Match any http(s) URL. */
export const any = (flags = 'i') => new RegExp(urlSet(), flags);

/**
 * Match local / first-party URLs (localhost or *.steemit.com). Used by
 * HtmlReady to decide whether an <img src> should be proxied (non-local only).
 */
export const local = (flags = 'i') =>
  new RegExp(urlSet({ domain: '(?:localhost|(?:.*\\.)?steemit.com)' }), flags);

/** Match image URLs (by extension or IPFS hash). */
export const image = (flags = 'i') =>
  new RegExp(urlSet({ path: imagePath }), flags);

const linksRe = {
  any: any(),
  local: local(),
  image: image(),
};

export default linksRe;
