/**
 * HtmlReady — HTML mutation/normalization layer for post bodies.
 *
 * Ported from master's src/shared/HtmlReady.js. Runs AFTER markdown-it
 * (markdown→HTML) and BEFORE sanitize-html.
 *
 * What it does:
 *  - link():  normalize <a> href protocols, unlink obvious phishing.
 *  - iframe():wrap <iframe> in <div class="videoWrapper"> for responsive sizing.
 *  - img():   normalize IPFS prefixes, force https, wrap in clickable <a>.
 *  - linkify():convert #tags and @mentions in text to links; turn naked image
 *             URLs into <img>; linkify naked URLs.
 *  - embed*Node(): replace naked YouTube/Vimeo/Twitch/DTube/3Speak URLs with
 *             `~~~ embed: ~~~` placeholders (rendered as players downstream).
 *  - proxifyImages(): prepend the image proxy to non-local <img> src.
 */

import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import linksRe, { any as linksAny } from '@/lib/media/links';
import { proxifyImageUrl } from '@/lib/media/proxify-url';
import { looksPhishy } from '@/lib/phishing';
import { validateAccountName } from '@/lib/chain-validation';

const PHISHY_MESSAGE = '(Warning: link is a possible phishing attempt)';

// Pinned to @xmldom/xmldom 0.8.x on purpose: 0.9 reports tag mismatches as
// fatal ParseErrors that abort parsing, while legacy (xmldom 0.1.27) and 0.8
// tolerate them and keep parsing — malformed post HTML must still render.
// Swallow warnings/errors via the errorHandler object like legacy did.
// xmldom's typed surface clashes with lib.dom, so we treat nodes as `any`
// internally (this is a self-contained transform layer, not public API).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNode = any;
const noop = () => {};
const domParser = new DOMParser({
  errorHandler: { warning: noop, error: noop },
});
const xmlSerializer = new XMLSerializer();

export interface HtmlReadyResult {
  html: string;
  hashtags: Set<string>;
  usertags: Set<string>;
  htmltags: Set<string>;
  images: Set<string>;
  links: Set<string>;
}

interface HtmlReadyState {
  mutate: boolean;
  hashtags: Set<string>;
  usertags: Set<string>;
  htmltags: Set<string>;
  images: Set<string>;
  links: Set<string>;
}

interface HtmlReadyOptions {
  mutate?: boolean;
  hideImages?: boolean;
  isProxifyImages?: boolean;
}

/**
 * Parse an HTML fragment string and return its root element (documentElement),
 * not the Document itself. domParser.parseFromString yields a Document
 * (nodeType 9); passing that to replaceChild throws "Unexpected node type 9".
 * Using documentElement gives an insertable Element instead.
 */
function parseFragment(html: string): AnyNode {
  return domParser.parseFromString(html, 'text/html').documentElement;
}

export default function htmlReady(
  html: string,
  { mutate = true, hideImages = false, isProxifyImages = false }: HtmlReadyOptions = {}
): HtmlReadyResult {
  const state: HtmlReadyState = {
    mutate,
    hashtags: new Set(),
    usertags: new Set(),
    htmltags: new Set(),
    images: new Set(),
    links: new Set(),
  };
  try {
    const doc = domParser.parseFromString(
      preprocessHtml(`<html>${html}</html>`),
      'text/html'
    );
    traverse(doc, state);
    if (mutate) {
      if (hideImages) {
        for (const image of Array.from(doc.getElementsByTagName('img')) as AnyNode[]) {
          const pre = doc.createElement('pre');
          pre.setAttribute('class', 'image-url-only');
          pre.appendChild(doc.createTextNode(image.getAttribute('src') || ''));
          if (image.parentNode) image.parentNode.replaceChild(pre, image);
        }
      } else if (isProxifyImages) {
        // Historical note (master): `isProxifyImages` disables proxying, but we
        // still strip legacy proxy shells like `https://{imagehoster}/{dims}/…`
        // so cross-environment chain data doesn't keep a wrong proxy prefix.
        stripLegacyProxyImages(doc);
      } else {
        proxifyImages(doc);
      }
    }
    return {
      html: doc ? xmlSerializer.serializeToString(doc) : '',
      hashtags: state.hashtags,
      usertags: state.usertags,
      htmltags: state.htmltags,
      images: state.images,
      links: state.links,
    };
  } catch (error) {
    console.error('rendering error', (error as Error).message);
    return {
      html: '',
      hashtags: new Set(),
      usertags: new Set(),
      htmltags: new Set(),
      images: new Set(),
      links: new Set(),
    };
  }
}

function preprocessHtml(html: string): string {
  // Replace 3Speak image/anchor combos (as produced by the 3Speak dApp)
  // with an embed placeholder before parsing.
  return embedThreeSpeakNode(html, null, null);
}

function traverse(node: AnyNode, state: HtmlReadyState, depth = 0): void {
  if (!node || !node.childNodes) return;
  // xmldom's childNodes typings yield `unknown`, so cast to any for traversal.
  (Array.from(node.childNodes) as AnyNode[]).forEach((child) => {
    const tag = child.tagName ? child.tagName.toLowerCase() : null;
    if (tag) state.htmltags.add(tag);

    if (tag === 'img') img(state, child);
    else if (tag === 'iframe') iframe(state, child);
    else if (tag === 'a') link(state, child);
    else if (child.nodeName === '#text') detectImageLinksOrLinkify(child, state);

    traverse(child, state, depth + 1);
  });
}

function link(state: HtmlReadyState, child: AnyNode): void {
  const url = child.getAttribute('href');
  if (!url) return;
  state.links.add(url);
  if (!state.mutate) return;

  // If the link is not relative/http/https/steem/esteem, prepend https://.
  if (!/^((#)|(\/(?!\/))|(((steem|esteem|https?):)?\/\/))/.test(url)) {
    child.setAttribute('href', 'https://' + url);
  }

  // Unlink potential phishing attempts.
  const text = (child as unknown as { textContent?: string }).textContent || '';
  if (
    (url.indexOf('#') !== 0 && // Allow in-page links
      text.match(/(www\.)?steemit\.com/i) &&
      !url.match(/https?:\/\/(.*@)?(www\.)?steemit\.com/i)) ||
    looksPhishy(url)
  ) {
    const phishyDiv = child.ownerDocument.createElement('div');
    phishyDiv.textContent = `${text} / ${url}`;
    phishyDiv.setAttribute('title', PHISHY_MESSAGE);
    phishyDiv.setAttribute('class', 'phishy');
    child.parentNode.replaceChild(phishyDiv, child);
  }
}

// wrap iframes in div.videoWrapper to control size/aspect ratio
function iframe(state: HtmlReadyState, child: AnyNode): void {
  const url = child.getAttribute('src');
  if (url) {
    const yt = youTubeId(url);
    if (yt) {
      state.links.add(yt.url);
      state.images.add('https://img.youtube.com/vi/' + yt.id + '/0.jpg');
    }
  }
  if (!state.mutate) return;

  const parentTag = child.parentNode?.tagName
    ? child.parentNode.tagName.toLowerCase()
    : '';
  if (parentTag === 'div' && child.parentNode.getAttribute('class') === 'videoWrapper') {
    return;
  }
  const serialized = xmlSerializer.serializeToString(child);
  const wrapper = parseFragment(`<div class="videoWrapper">${serialized}</div>`);
  child.parentNode.replaceChild(wrapper, child);
}

function img(state: HtmlReadyState, child: AnyNode): void {
  const url = child.getAttribute('src');
  if (!url) return;
  state.images.add(url);
  if (state.mutate) {
    let url2 = ipfsPrefix(url);
    if (/^\/\//.test(url2)) {
      url2 = 'https:' + url2;
    }
    if (url2 !== url) {
      child.setAttribute('src', url2);
    }
  }
  // Wrap standalone images in a clickable link to the full-size proxied image.
  if (child.parentNode && child.parentNode.nodeName.toLowerCase() !== 'a') {
    const wrapped = parseFragment(
      `<a href="${proxifyImageUrl(url, '0x0/')}" target="_blank">${xmlSerializer.serializeToString(
        child
      )}</a>`
    );
    child.parentNode.replaceChild(wrapped, child);
  }
}

/** For all img elements with non-local URLs, prepend the proxy URL. */
function proxifyImages(doc: AnyNode): void {
  if (!doc) return;
  (Array.from(doc.getElementsByTagName('img')) as AnyNode[]).forEach((node) => {
    const url = node.getAttribute('src');
    if (!url) return;
    if (!linksRe.local.test(url)) {
      node.setAttribute('src', proxifyImageUrl(url, true));
    }
  });
}

/** Strip legacy proxy wrappers without adding a new proxy prefix. */
function stripLegacyProxyImages(doc: AnyNode): void {
  if (!doc) return;
  (Array.from(doc.getElementsByTagName('img')) as AnyNode[]).forEach((node) => {
    const url = node.getAttribute('src');
    if (!url) return;
    if (!linksRe.local.test(url)) {
      node.setAttribute('src', proxifyImageUrl(url, false));
    }
  });
}

/** Detect naked image URLs in text → <img>; otherwise linkify #/@/URLs. */
function detectImageLinksOrLinkify(textNode: AnyNode, state: HtmlReadyState): void {
  const data = textNode.data || '';
  const imageRegex = /(https?:\/\/\S+\.(?:jpg|jpeg|png|gif)(?:\?[^\s]*)?)/gi;
  const match = data.match(imageRegex);

  if (match) {
    match.forEach((url: string) => {
      const linkURL = proxifyImageUrl(url, '0x0');
      const imgEl = textNode.ownerDocument.createElement('img');
      imgEl.setAttribute('src', linkURL);
      const anchorEl = textNode.ownerDocument.createElement('a');
      anchorEl.setAttribute('href', linkURL);
      anchorEl.appendChild(imgEl);
      textNode.parentNode.replaceChild(anchorEl, textNode);
      link(state, anchorEl);
      img(state, imgEl);
    });
  } else {
    linkifyNode(textNode, state);
  }
}

function linkifyNode(child: AnyNode, state: HtmlReadyState): void {
  try {
    const tag = child.parentNode?.tagName
      ? child.parentNode.tagName.toLowerCase()
      : '';
    if (tag === 'code' || tag === 'a') return;

    const data0 = child.data;
    if (!data0) return;

    // Replace naked video URLs with `~~~ embed: ~~~` placeholders first.
    child = embedYouTubeNode(child, state.links, state.images);
    child = embedVimeoNode(child, state.links);
    child = embedTwitchNode(child, state.links);
    child = embedDTubeNode(child, state.links);
    child = embedThreeSpeakNode(child, state.links, state.images);

    const serialized = xmlSerializer.serializeToString(child);
    const content = linkify(
      serialized,
      state.mutate,
      state.hashtags,
      state.usertags,
      state.images,
      state.links
    );
    if (state.mutate && content !== serialized) {
      const newChild = parseFragment(`<span>${content}</span>`);
      child.parentNode.replaceChild(newChild, child);
    }
  } catch (error) {
    console.error('linkify_error', error);
  }
}

function linkify(
  content: string,
  mutate: boolean,
  hashtags: Set<string>,
  usertags: Set<string>,
  images: Set<string>,
  links: Set<string>
): string {
  // hashtag
  content = content.replace(/(^|\s)(#[-a-z\d]+)/gi, (tag) => {
    if (/#[\d]+$/.test(tag)) return tag; // Don't allow numbers-only tags
    const space = /^\s/.test(tag) ? tag[0] : '';
    const tag2 = tag.trim().substring(1);
    const tagLower = tag2.toLowerCase();
    if (hashtags) hashtags.add(tagLower);
    if (!mutate) return tag;
    return space + `<a href="/trending/${tagLower}">${tag}</a>`;
  });

  // usertag (mention)
  content = content.replace(
    /(^|[^a-zA-Z0-9_!#$%&*@＠\/]|(^|[^a-zA-Z0-9_+~.-\/#]))[@＠]([a-z][-\.a-z\d]+[a-z\d])/gi,
    (matchStr, preceding1, preceding2, user) => {
      const userLower = user.toLowerCase();
      const valid = validateAccountName(userLower) == null;
      if (valid && usertags) usertags.add(userLower);
      const precedings = (preceding1 || '') + (preceding2 || '');
      if (!mutate) return `${precedings}${user}`;
      return valid
        ? `${precedings}<a href="/@${userLower}">@${user}</a>`
        : `${precedings}@${user}`;
    }
  );

  content = content.replace(linksAny('gi'), (ln) => {
    if (linksRe.image.test(ln)) {
      if (images) images.add(ln);
      return `<img src="${ipfsPrefix(ln)}" />`;
    }

    // do not linkify .exe or .zip urls
    if (/\.(zip|exe)$/i.test(ln)) return ln;

    // do not linkify phishy links
    if (looksPhishy(ln)) {
      return `<div title='${PHISHY_MESSAGE}' class='phishy'>${ln}</div>`;
    }

    if (links) links.add(ln);
    return `<a href="${ipfsPrefix(ln)}">${ln}</a>`;
  });
  return content;
}

// ---------------------------------------------------------------------------
// Video embed chains — replace naked URLs in text nodes with
// `~~~ embed:{id} {type} [{startTime}] ~~~` placeholders. MarkdownViewer
// splits on these and renders the actual players.
// ---------------------------------------------------------------------------

interface YouTubeInfo {
  id: string;
  url: string;
  startTime: string | number;
  thumbnail: string;
}

/** @return {id, url, startTime, thumbnail} or null */
function youTubeId(data: string): YouTubeInfo | null {
  if (!data) return null;

  const m1 = data.match(linksRe.youTube);
  const url = m1 ? m1[0] : null;
  if (!url) return null;

  const m2 = url.match(linksRe.youTubeId);
  const id = m2 && m2.length >= 2 ? m2[1] : null;
  if (!id) return null;

  const startTime = url.match(/t=(\d+)s?/);

  return {
    id,
    url,
    startTime: startTime ? startTime[1] : 0,
    thumbnail: 'https://img.youtube.com/vi/' + id + '/0.jpg',
  };
}

function embedYouTubeNode(
  child: AnyNode,
  links: Set<string> | null,
  images: Set<string> | null
): AnyNode {
  try {
    const data = child.data;
    const yt = youTubeId(data);
    if (!yt) return child;

    if (yt.startTime) {
      child.data = data.replace(
        yt.url,
        `~~~ embed:${yt.id} youtube ${yt.startTime} ~~~`
      );
    } else {
      child.data = data.replace(yt.url, `~~~ embed:${yt.id} youtube ~~~`);
    }

    if (links) links.add(yt.url);
    if (images) images.add(yt.thumbnail);
  } catch (error) {
    console.error('yt_node', error);
  }
  return child;
}

interface ThreeSpeakInfo {
  id: string;
  fullId: string;
  url: string;
  thumbnail: string;
}

/** @return {id, fullId, url, thumbnail} or null */
function getThreeSpeakId(data: string): ThreeSpeakInfo | null {
  if (!data) return null;

  const match = data.match(linksRe.threespeak);
  const url = match ? match[0] : null;
  if (!match || !url) return null;
  const fullId = match[1];
  const id = fullId.split('/').pop() as string;

  return {
    id,
    fullId,
    url,
    thumbnail: `https://img.3speakcontent.online/${id}/post.png`,
  };
}

function embedThreeSpeakNode(
  child: AnyNode,
  links: Set<string> | null,
  images: Set<string> | null
): AnyNode {
  try {
    if (typeof child === 'string') {
      // String input: preprocess HTML, replacing the image/anchor combo
      // created by the 3Speak dApp.
      const threespeakId = getThreeSpeakId(child);
      if (threespeakId) {
        child = child.replace(
          linksRe.threespeakImageLink,
          `~~~ embed:${threespeakId.fullId} threespeak ~~~`
        );
      }
    } else {
      // Text node input: replace a bare URL.
      const data = child.data;
      const threespeakId = getThreeSpeakId(data);
      if (!threespeakId) return child;

      child.data = data.replace(
        threespeakId.url,
        `~~~ embed:${threespeakId.fullId} threespeak ~~~`
      );

      if (links) links.add(threespeakId.url);
      if (images) images.add(threespeakId.thumbnail);
    }
  } catch (error) {
    console.log(error);
  }

  return child;
}

interface VimeoInfo {
  id: string;
  url: string;
  startTime: string | number;
  canonical: string;
}

/** @return {id, url, startTime, canonical} or null */
function vimeoId(data: string): VimeoInfo | null {
  if (!data) return null;
  const m = data.match(linksRe.vimeo);
  if (!m || m.length < 2) return null;

  const startTime = (m.input as string).match(/t=(\d+)s?/);

  return {
    id: m[1],
    url: m[0],
    startTime: startTime ? startTime[1] : 0,
    canonical: `https://player.vimeo.com/video/${m[1]}`,
  };
}

function embedVimeoNode(
  child: AnyNode,
  links: Set<string> | null
): AnyNode {
  try {
    const data = child.data;
    const vimeo = vimeoId(data);
    if (!vimeo) return child;

    const vimeoRegex = new RegExp(`${vimeo.url}(#t=${vimeo.startTime}s?)?`);
    if (Number(vimeo.startTime) > 0) {
      child.data = data.replace(
        vimeoRegex,
        `~~~ embed:${vimeo.id} vimeo ${vimeo.startTime} ~~~`
      );
    } else {
      child.data = data.replace(
        vimeoRegex,
        `~~~ embed:${vimeo.id} vimeo ~~~`
      );
    }

    if (links) links.add(vimeo.canonical);
  } catch (error) {
    console.error('vimeo_embed', error);
  }
  return child;
}

interface TwitchInfo {
  id: string;
  url: string;
  canonical: string;
}

/** @return {id, url, canonical} or null */
function twitchId(data: string): TwitchInfo | null {
  if (!data) return null;
  const m = data.match(linksRe.twitch);
  if (!m || m.length < 3) return null;

  return {
    id: m[1] === 'videos' ? `?video=${m[2]}` : `?channel=${m[2]}`,
    url: m[0],
    canonical:
      m[1] === 'videos'
        ? `https://player.twitch.tv/?video=${m[2]}`
        : `https://player.twitch.tv/?channel=${m[2]}`,
  };
}

function embedTwitchNode(
  child: AnyNode,
  links: Set<string> | null
): AnyNode {
  try {
    const data = child.data;
    const twitch = twitchId(data);
    if (!twitch) return child;

    child.data = data.replace(
      twitch.url,
      `~~~ embed:${twitch.id} twitch ~~~`
    );

    if (links) links.add(twitch.canonical);
  } catch (error) {
    console.error('twitch_error', error);
  }
  return child;
}

interface DTubeInfo {
  id: string;
  url: string;
  canonical: string;
}

/** @return {id, url, canonical} or null */
function dtubeId(data: string): DTubeInfo | null {
  if (!data) return null;
  const m = data.match(linksRe.dtube);
  if (!m || m.length < 2) return null;

  return {
    id: m[1],
    url: m[0],
    canonical: `https://emb.d.tube/#!/${m[1]}`,
  };
}

function embedDTubeNode(
  child: AnyNode,
  links: Set<string> | null
): AnyNode {
  try {
    const data = child.data;
    const dtube = dtubeId(data);
    if (!dtube) return child;

    child.data = data.replace(dtube.url, `~~~ embed:${dtube.id} dtube ~~~`);

    if (links) links.add(dtube.canonical);
  } catch (error) {
    console.error('dtube_embed', error);
  }
  return child;
}

function ipfsPrefix(url: string): string {
  // No IPFS gateway configured on next; pass through unchanged.
  return url;
}
