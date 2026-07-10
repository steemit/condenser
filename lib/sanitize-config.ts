/**
 * sanitize-html configuration for post-body HTML.
 *
 * Ported from master's src/app/utils/SanitizeConfig.js. This is the actual XSS
 * filter — it runs AFTER remarkable (markdown→HTML) and HtmlReady (mutation).
 * The iframe whitelist is security-critical: only these 6 embed origins are
 * allowed through; everything else is replaced with a placeholder.
 */

import sanitizeHtml from 'sanitize-html';
import {
  isDefaultImageSize,
  defaultSrcSet,
} from '@/lib/media/proxify-url';

// Inline message constants (master used counterpart/i18n; next has no i18n yet).
const PHISHY_MESSAGE = '(Warning: link is a possible phishing attempt)';
const EXTERNAL_LINK_MESSAGE = 'This link will take you away from Steemit';
const INTERNAL_IMAGE_MESSAGE = '';

export const noImageText = '(Image not shown due to low ratings)';

export const getPhishingWarningMessage = () => PHISHY_MESSAGE;
export const getExternalLinkWarningMessage = () => EXTERNAL_LINK_MESSAGE;
export const getInternalImageMessage = () => INTERNAL_IMAGE_MESSAGE;

interface IframeRule {
  re: RegExp;
  fn: (src: string) => string | null;
}

/** Whitelist of allowed iframe embed origins. Non-matching src → placeholder. */
const iframeWhitelist: IframeRule[] = [
  {
    re: /^(https?:)?\/\/player.vimeo.com\/video\/.*/i,
    fn: (src) => {
      if (!src) return null;
      const m = src.match(/https:\/\/player\.vimeo\.com\/video\/([0-9]+)/);
      if (!m || m.length !== 2) return null;
      return 'https://player.vimeo.com/video/' + m[1];
    },
  },
  {
    re: /^(https?:)?\/\/www.youtube.com\/embed\/.*/i,
    fn: (src) => src.replace(/\?.+$/, ''), // strip query (autoplay, etc)
  },
  {
    re: /^(https?:)?\/\/3speak.online\/embed\?v=.*/i,
    fn: (src) => src,
  },
  {
    re: /^https:\/\/w.soundcloud.com\/player\/.*/i,
    fn: (src) => {
      if (!src) return null;
      const m = src.match(/url=(.+?)&/);
      if (!m || m.length !== 2) return null;
      return (
        'https://w.soundcloud.com/player/?url=' +
        m[1] +
        '&auto_play=false&hide_related=false&show_comments=true' +
        '&show_user=true&show_reposts=false&visual=true'
      );
    },
  },
  {
    re: /^(https?:)?\/\/player.twitch.tv\/.*/i,
    fn: (src) => src,
  },
  {
    re: /^https:\/\/emb\.d\.tube\/\#\!\/([a-zA-Z0-9\-\.\/]+)$/,
    fn: (src) => src,
  },
];

const allowedTags = [
  'div',
  'iframe',
  'del',
  'a',
  'p',
  'b',
  'i',
  'q',
  'br',
  'ul',
  'li',
  'ol',
  'img',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'blockquote',
  'pre',
  'code',
  'em',
  'strong',
  'center',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'strike',
  'sup',
  'sub',
];

export interface SanitizeOptions {
  large?: boolean;
  highQualityPost?: boolean;
  noImage?: boolean;
  sanitizeErrors?: string[];
}

/** Factory returning a sanitize-html options object. */
export default function sanitizeConfig({
  large = true,
  highQualityPost = true,
  noImage = false,
  sanitizeErrors = [],
}: SanitizeOptions = {}): sanitizeHtml.IOptions {
  return {
    allowedTags,
    // SEE https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
    allowedAttributes: {
      // "src" MUST pass a whitelist (below)
      iframe: [
        'src',
        'width',
        'height',
        'frameborder',
        'allowfullscreen',
        'webkitallowfullscreen',
        'mozallowfullscreen',
      ],
      // class attribute is strictly whitelisted (below)
      // title only set in case of a phishing warning
      div: ['class', 'title'],
      // style is subject to attack, filtering more below
      td: ['style'],
      img: ['src', 'srcset', 'alt', 'class'],
      // title only set in case of an external link warning
      a: ['href', 'rel', 'title', 'target', 'class'],
    },
    allowedSchemes: ['http', 'https', 'steem', 'esteem'],
    transformTags: {
      iframe: (_tagName, attribs): sanitizeHtml.Tag => {
        const srcAtty = attribs.src;
        for (const item of iframeWhitelist) {
          if (item.re.test(srcAtty)) {
            const src = item.fn(srcAtty);
            if (!src) break;
            return {
              tagName: 'iframe',
              attribs: {
                frameborder: '0',
                allowfullscreen: 'allowfullscreen',
                webkitallowfullscreen: 'webkitallowfullscreen',
                mozallowfullscreen: 'mozallowfullscreen',
                src,
                width: large ? '640' : '480',
                height: large ? '360' : '270',
              },
            };
          }
        }
        sanitizeErrors.push('Invalid iframe URL: ' + srcAtty);
        return { tagName: 'div', attribs: {}, text: `(Unsupported ${srcAtty})` };
      },
      img: (_tagName, attribs): sanitizeHtml.Tag => {
        if (noImage) return { tagName: 'div', attribs: {}, text: noImageText };
        const { src, alt } = attribs;
        if (!/^(https?:)?\/\//i.test(src || '')) {
          sanitizeErrors.push('An image in this post did not save properly.');
          return { tagName: 'img', attribs: { src: 'brokenimg.jpg' } };
        }
        const cleanSrc = src!.replace(/^http:\/\//i, '//');
        const atts: Record<string, string> = { src: cleanSrc };
        if (alt && alt !== '') atts.alt = alt;
        if (isDefaultImageSize(cleanSrc)) {
          atts.srcset = defaultSrcSet(cleanSrc);
        }
        return { tagName: 'img', attribs: atts };
      },
      div: (_tagName, attribs): sanitizeHtml.Tag => {
        const attys: Record<string, string> = {};
        const classWhitelist = [
          'pull-right',
          'pull-left',
          'text-justify',
          'text-rtl',
          'text-center',
          'text-right',
          'videoWrapper',
          'phishy',
        ];
        const validClass = classWhitelist.find((e) => attribs.class === e);
        if (validClass) attys.class = validClass;
        if (
          validClass === 'phishy' &&
          attribs.title === getPhishingWarningMessage()
        ) {
          attys.title = attribs.title;
        }
        return { tagName: 'div', attribs: attys };
      },
      td: (_tagName, attribs): sanitizeHtml.Tag => {
        const attys: Record<string, string> = {};
        if (attribs.style === 'text-align:right') {
          attys.style = 'text-align:right';
        }
        return { tagName: 'td', attribs: attys };
      },
      a: (_tagName, attribs): sanitizeHtml.Tag => {
        let href = attribs.href;
        if (!href) href = '#';
        href = href.trim();
        const attys: Record<string, string> = { href };
        // This prevents unexpected target values.
        // (attribs.target is intentionally not copied.)

        // CDN image links open in new tab, no warning.
        if (
          href.startsWith('https://cdn.steemitimages.com') ||
          href.startsWith('https://steemitimages.com')
        ) {
          attys.target = '_blank';
          attys.rel = 'noopener';
          attys.class = 'postImage';
          attys.title = getInternalImageMessage();
        } else if (
          !href.match(/^(\/(?!\/)|https:\/\/steemit.com)/) &&
          !href.startsWith('/')
        ) {
          // External link: new tab + rel + warning title.
          attys.target = '_blank';
          attys.rel = highQualityPost ? 'noopener' : 'nofollow noopener';
          attys.title = getExternalLinkWarningMessage();
          attys.class = 'postImage postLink';
        }
        return { tagName: 'a', attribs: attys };
      },
    },
  };
}
