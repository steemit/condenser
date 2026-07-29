/**
 * URL link/image regexes used by the post-body rendering pipeline.
 * Ported from master's src/app/utils/Links.js.
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

/** Match remote (non-local) URLs. */
export const remote = (flags = 'i') =>
  new RegExp(
    urlSet({ domain: `(?!localhost|(?:.*\\.)?steemit.com)${domainPath}` }),
    flags
  );

/** Match YouTube / youtu.be URLs. */
export const youTube = (flags = 'i') =>
  new RegExp(urlSet({ domain: '(?:(?:.*.)?youtube.com|youtu.be)' }), flags);

/** Match image URLs (by extension or IPFS hash). */
export const image = (flags = 'i') =>
  new RegExp(urlSet({ path: imagePath }), flags);

/** Match an image file path/extension. */
export const imageFile = (flags = 'i') => new RegExp(imagePath, flags);

const linksRe = {
  any: any(),
  local: local(),
  remote: remote(),
  image: image(),
  imageFile: imageFile(),
  youTube: youTube(),
  /** Extracts a YouTube video id from watch/embed/shorts/youtu.be URLs. */
  youTubeId:
    /(?:(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/))|(?:youtu\.be\/))([A-Za-z0-9_-]+)/i,
  vimeo:
    /https?:\/\/(?:vimeo.com\/|player.vimeo.com\/video\/)([0-9]+)\/?(#t=((\d+)s?))?\/?/,
  vimeoId: /(?:vimeo.com\/|player.vimeo.com\/video\/)([0-9]+)/,
  ipfsPrefix: /(https?:\/\/.*)?\/ipfs/i,
  twitch:
    /https?:\/\/(?:www.)?twitch.tv\/(?:(videos)\/)?([a-zA-Z0-9][\w]{3,24})/i,
  dtube: /https:\/\/(?:emb\.)?(?:d.tube\/\#\!\/(?:v\/)?)([a-zA-Z0-9\-\.\/]*)/,
  dtubeId: /(?:d\.tube\/#!\/(?:v\/)?([a-zA-Z0-9\-\.\/]*))+/,
  threespeak:
    /(?:https?:\/\/(?:(?:3speak.online\/watch\?v=)|(?:3speak.online\/embed\?v=)))([A-Za-z0-9_\-\/]+)(&.*)?/i,
  /** Matches the anchor+image combo the 3Speak dApp embeds in post bodies. */
  threespeakImageLink:
    /<a href="(https?:\/\/3speak.online\/watch\?v=([A-Za-z0-9_\-\/]+))".*<img.*?><\/a>/i,
};

export default linksRe;
