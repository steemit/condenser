/**
 * Post content extraction for summary cards.
 * Ported from legacy src/app/utils/ExtractContent.js.
 */

import MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';
import sanitizeHtml from 'sanitize-html';
import htmlReady from '@/lib/html-ready';
import { proxifyImageUrl } from '@/lib/media/proxify-url';

const md = new MarkdownIt({ html: true, linkify: false });
// Legacy RemarkableStripper used `new Remarkable()` with default options —
// html disabled — so tags like <center> do NOT form html blocks and the
// markdown inside them is still parsed (then sanitize drops the tags).
const mdStrip = new MarkdownIt({ html: false, linkify: false });

const getValidImage = (arr: unknown): string | null =>
  Array.isArray(arr) && arr.length >= 1 && typeof arr[0] === 'string'
    ? arr[0]
    : null;

/** Minimal HTML entity decode for the entities sanitize-html leaves behind. */
function htmlDecode(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

interface JsonMetadata {
  image?: unknown;
  [key: string]: unknown;
}

/** First usable image for a post: json_metadata.image[0], else first body image. */
export function extractImageLink(
  jsonMetadata: JsonMetadata | undefined,
  body: string | null = null
): string | null {
  let imageLink: string | null = null;
  try {
    imageLink = jsonMetadata ? getValidImage(jsonMetadata.image) : null;
  } catch {
    /* fall through to body parsing */
  }

  if (!imageLink && body) {
    const isHtml = /^<html>([\S\s]*)<\/html>$/.test(body);
    const htmlText = isHtml
      ? body
      : md.render(
          body.replace(/<!--([\s\S]+?)(-->|$)/g, '(html comment removed: $1)')
        );
    const rtags = htmlReady(htmlText, { mutate: false });
    [imageLink] = Array.from(rtags.images);
  }

  return imageLink;
}

/**
 * Render markdown to plain text, 1:1 with legacy RemarkableStripper:
 * inline tokens contribute their children's text; every other token
 * contributes its raw content. Image tokens contribute nothing, so a post
 * that starts with an image never leaks the URL/alt into the excerpt.
 */
function stripMarkdown(body: string): string {
  let str = '';
  const walk = (tokens: Token[]) => {
    for (const t of tokens) {
      if (t.type === 'inline') {
        walk((t.children ?? []) as Token[]);
      } else if (t.type !== 'image') {
        // markdown-it puts alt text in image token content; remarkable did
        // not, and legacy dropped it — keep parity by skipping images.
        str += (t.content || '') + ' ';
      }
    }
  };
  walk(mdStrip.parse(body, {}));
  return str;
}

/** Short plain-text description: strip markdown/html, URLs, truncate to ~140. */
export function extractBodySummary(body: string, stripQuotes = false): string {
  let desc = body;
  if (stripQuotes) {
    desc = desc.replace(/(^(\n|\r|\s)*)>([\s\S]*?).*\s*/g, '');
  }
  desc = stripMarkdown(desc); // render markdown to plain text
  desc = sanitizeHtml(desc, { allowedTags: [] }); // remove all html, leaving text
  desc = htmlDecode(desc);

  // Strip any raw URLs from preview text.
  desc = desc.replace(/https?:\/\/[^\s]+/g, '');

  // Grab only the first line.
  desc = desc.trim().split('\n')[0];

  if (desc.length > 140) {
    desc = desc.substring(0, 140).trim();
    // Truncate, remove the last (likely partial) word, add ellipsis.
    desc = desc
      .substring(0, 120)
      .trim()
      .replace(/[,!?]?\s+[^\s]+$/, '…');
  }

  return desc;
}

/** Thumbnail URL for a summary card (proxied, capped at 640px wide). */
export function summaryThumbnail(imageLink: string | null): string | null {
  if (!imageLink) return null;
  return proxifyImageUrl(imageLink, '640x0/');
}

/**
 * Convert a raw chain reputation (big number string/number) to the familiar
 * 25-based score, e.g. (73). Ported from legacy ParsersAndFormatters.reputation.
 */
export function reputation(raw: string | number | undefined | null): number | null {
  if (raw === undefined || raw === null || raw === '') return null;
  let rep = typeof raw === 'string' ? Number(raw) : raw;
  if (!Number.isFinite(rep)) return null;
  const neg = rep < 0;
  rep = Math.abs(rep);
  let out = Math.log10(rep);
  out = Math.max(out - 9, 0);
  out = (neg ? -1 : 1) * out;
  out = out * 9 + 25;
  return Math.floor(out);
}
