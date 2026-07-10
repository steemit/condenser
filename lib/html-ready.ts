/**
 * HtmlReady — HTML mutation/normalization layer for post bodies.
 *
 * Ported from master's src/shared/HtmlReady.js, scoped to the next branch MVP.
 * Runs AFTER remarkable (markdown→HTML) and BEFORE sanitize-html.
 *
 * What it does:
 *  - link():  normalize <a> href protocols, unlink obvious phishing.
 *  - iframe():wrap <iframe> in <div class="videoWrapper"> for responsive sizing.
 *  - img():   normalize IPFS prefixes, force https, wrap in clickable <a>.
 *  - linkify():convert #tags and @mentions in text to links; turn naked image
 *             URLs into <img>; linkify naked URLs.
 *  - proxifyImages(): prepend the image proxy to non-local <img> src.
 *
 * NOT ported to MVP (video embed replacement chains): the `~~~ embed ~~~`
 * processing for YouTube/Vimeo/Twitch/DTube/3Speak. sanitize-config's iframe
 * whitelist already handles those safely; the rich-component rendering is a
 * separate enhancement. Phishing detection is reduced to a basic href/text
 * mismatch heuristic (master used an external Phishing module).
 */

import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import linksRe, { any as linksAny } from '@/lib/media/links';
import { proxifyImageUrl } from '@/lib/media/proxify-url';

const PHISHY_MESSAGE = '(Warning: link is a possible phishing attempt)';

// @xmldom/xmldom v0.9 replaced the `errorHandler` object with an `onError`
// callback (level, message). We swallow warnings/errors: malformed post HTML
// should not crash rendering — HtmlReady returns '' on a thrown parse instead.
// xmldom's typed surface clashes with lib.dom, so we treat nodes as `any`
// internally (this is a self-contained transform layer, not public API).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNode = any;
const domParser = new DOMParser({
  onError: () => {
    /* swallow: malformed HTML must not crash the render */
  },
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

/** Minimal account-name validation: 3-16 chars, lowercase, .-_ allowed. */
function validateAccountName(name: string): string | null {
  if (!name) return 'Account name should not be empty.';
  const len = name.length;
  if (len < 3) return 'Account name should be longer.';
  if (len > 16) return 'Account name should be shorter.';
  if (/[A-Z]/.test(name)) return 'Account name should be lowercase.';
  if (/^[^a-z]/.test(name)) return 'Account name should start with a letter.';
  if (/[0-9-]$/.test(name)) return 'Account name should end in a letter.';
  const match = name.match(/[^\sa-z0-9.-]/);
  if (match) return `Invalid character: ${match[0]}.`;
  const dbl = name.match(/\.\.|\--|_-/);
  if (dbl) return `Account name should have only one ${dbl[0][0]} in a row.`;
  if (/\./.test(name)) {
    const segments = name.split('.');
    if (segments.length > 2) return 'Account name should have only one dot.';
    const lastSegment = segments[1];
    if (!lastSegment) return 'Account name should end with a letter.';
  }
  return null;
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
    const doc = domParser.parseFromString(`<html>${html}</html>`, 'text/html');
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

  // Unlink obvious phishing: text claims steemit.com but href doesn't.
  const text = (child as unknown as { textContent?: string }).textContent || '';
  if (
    url.indexOf('#') !== 0 &&
    text.match(/(www\.)?steemit\.com/i) &&
    !url.match(/https?:\/\/(.*@)?(www\.)?steemit\.com/i)
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
    state.links.add(url);
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

    const data = child.data;
    if (!data) return;

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
  content = content.replace(/(^|\s)(#[-a-z\d]+)/gi, (tagStr) => {
    if (/#[\d]+$/.test(tagStr)) return tagStr; // Don't allow numbers-only tags
    const space = /^\s/.test(tagStr) ? tagStr[0] : '';
    const tag2 = tagStr.trim().substring(1);
    const tagLower = tag2.toLowerCase();
    if (hashtags) hashtags.add(tagLower);
    if (!mutate) return tagStr;
    return space + `<a href="/trending/${tagLower}">${tagStr.trim()}</a>`;
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
    if (/\.(zip|exe)$/i.test(ln)) return ln;
    if (links) links.add(ln);
    return `<a href="${ipfsPrefix(ln)}">${ln}</a>`;
  });
  return content;
}

function ipfsPrefix(url: string): string {
  // No IPFS gateway configured on next; pass through unchanged.
  return url;
}
