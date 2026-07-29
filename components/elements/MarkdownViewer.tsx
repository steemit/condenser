'use client';

import { useMemo, useState } from 'react';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import htmlReady from '@/lib/html-ready';
import sanitizeConfig, { noImageText } from '@/lib/sanitize-config';
import YoutubePreview from '@/components/elements/YoutubePreview';

interface MarkdownViewerProps {
  text: string;
  className?: string;
  large?: boolean;
  /** When false, external links get rel="nofollow noopener". */
  highQualityPost?: boolean;
  /** When true, images are replaced with a low-ratings notice until shown. */
  noImage?: boolean;
  /** Whether to replace images with just a span containing the src url. */
  hideImages?: boolean;
  /** Strip legacy proxy shells without adding a new proxy prefix. */
  isProxifyImages?: boolean;
}

// Markdown→HTML renderer. html:true so author HTML passes through to sanitize;
// breaks:true so single newlines render as <br> (Steemit's markdown dialect).
// Uses markdown-it (actively maintained, CommonMark-spec) — replaces the
// unmaintained remarkable, with an identical options surface.
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: false,
  typographer: false,
  quotes: '“”‘’',
});

/**
 * MarkdownViewer — renders post-body markdown as sanitized, proxied HTML.
 *
 * Pipeline (order is security-critical):
 *   1. markdown-it: markdown → HTML
 *   2. HtmlReady:  video embed placeholders + URL normalization +
 *      link/mention/#tag linkify + image proxy
 *   3. sanitize-html (SanitizeConfig): XSS filter — allowedTags/Attributes,
 *      iframe whitelist, link/image hardening
 *   4. `~~~ embed: ~~~` placeholders are split out and rendered as players
 *      (YoutubePreview for YouTube, iframes for the rest).
 *
 * Ported from master's src/app/components/cards/MarkdownViewer.jsx.
 */
export default function MarkdownViewer({
  text,
  className = '',
  large = false,
  highQualityPost = true,
  noImage = false,
  hideImages = false,
  isProxifyImages = false,
}: MarkdownViewerProps) {
  // Low-ratings posts hide images until the user clicks the banner.
  const [allowNoImage, setAllowNoImage] = useState(true);

  const { html, isHtml } = useMemo(() => {
    if (!text) return { html: '', isHtml: false };

    let body = text;

    // Detect raw-HTML posts (wrapped in <html>…</html> or a leading <p>).
    let isHtml = false;
    const m = body.match(/^<html>([\S\s]*)<\/html>$/);
    if (m && m.length === 2) {
      isHtml = true;
      body = m[1];
    } else if (/^<p>[\S\s]*<\/p>/.test(body)) {
      isHtml = true;
    }

    // Strip HTML comments ("JS-DOS" mitigation).
    body = body.replace(/<!--([\s\S]+?)(-->|$)/g, '(html comment removed: $1)');

    // 1. markdown → HTML (skip for raw-HTML posts).
    let rendered = isHtml ? body : md.render(body);

    // 2. HtmlReady mutation (embeds, linkify, proxify images, wrap iframes, …).
    rendered = htmlReady(rendered, { hideImages, isProxifyImages }).html;

    // 3. sanitize-html (XSS filter + iframe whitelist).
    const sanitizeErrors: string[] = [];
    const clean = sanitizeHtml(
      rendered,
      sanitizeConfig({
        large,
        highQualityPost,
        noImage: noImage && allowNoImage,
        sanitizeErrors,
      })
    );

    if (sanitizeErrors.length > 0) {
      console.warn('MarkdownViewer sanitize errors:', sanitizeErrors);
    }

    // Secondary trap: refuse to render any <script> that slipped through.
    if (/<\s*script/gi.test(clean)) {
      console.error('Refusing to render script tag in post text');
      return { html: '', isHtml };
    }
    return { html: clean, isHtml };
  }, [text, large, highQualityPost, noImage, hideImages, isProxifyImages, allowNoImage]);

  const noImageActive = html.indexOf(noImageText) !== -1;

  // In addition to inserting the youtube component, splitting sections allows
  // react to compare separately, preventing excessive re-rendering.
  let idx = 0;
  const sections: React.ReactNode[] = [];

  // HtmlReady inserts `~~~ embed:${id} ${type} [${startTime}] ~~~`
  for (let section of html.split('~~~ embed:')) {
    const match = section.match(
      /^([A-Za-z0-9?=\_\-\/\.]+) (youtube|vimeo|twitch|dtube|threespeak)\s?(\d+)? ~~~/
    );
    if (match && match.length >= 3) {
      const id = match[1];
      const type = match[2];
      const startTime = match[3] ? parseInt(match[3], 10) : 0;
      const w = large ? 640 : 480;
      const h = large ? 360 : 270;

      if (type === 'youtube') {
        sections.push(
          <YoutubePreview
            key={id}
            width={w}
            height={h}
            youTubeId={id}
            startTime={startTime}
            frameBorder="0"
            allowFullScreen="true"
          />
        );
      } else {
        let url: string | null = null;
        let title = '';
        if (type === 'threespeak') {
          url = `https://3speak.online/embed?v=${id}`;
          title = `ThreeSpeak video ${id}`;
        } else if (type === 'vimeo') {
          url = `https://player.vimeo.com/video/${id}#t=${startTime}s`;
          title = `Vimeo video ${id}`;
        } else if (type === 'twitch') {
          url = `https://player.twitch.tv/${id}`;
          title = `Twitch video ${id}`;
        } else if (type === 'dtube') {
          url = `https://emb.d.tube/#!/${id}`;
          title = `DTube video ${id}`;
        } else {
          console.error('MarkdownViewer unknown embed type', type);
        }
        if (url) {
          sections.push(
            <div className="videoWrapper" key={id}>
              <iframe
                src={url}
                width={w}
                height={h}
                frameBorder="0"
                // @ts-expect-error legacy non-standard fullscreen attributes
                webkitallowfullscreen="true"
                mozallowfullscreen="true"
                allowFullScreen
                title={title}
              />
            </div>
          );
        }
      }
      if (match[3]) {
        section = section.substring(`${id} ${type} ${startTime} ~~~`.length);
      } else {
        section = section.substring(`${id} ${type} ~~~`.length);
      }
      if (section === '') continue;
    }
    sections.push(
      <div key={idx++} dangerouslySetInnerHTML={{ __html: section }} />
    );
  }

  const cn =
    'Markdown' +
    (className ? ` ${className}` : '') +
    (isHtml ? ' html' : '') +
    (large ? '' : ' MarkdownViewer--small');

  return (
    <div className={'MarkdownViewer ' + cn} style={{ wordBreak: 'break-word' }}>
      {sections}
      {noImageActive && allowNoImage && (
        <div
          onClick={() => setAllowNoImage(false)}
          className="MarkdownViewer__negative_group"
        >
          Images were hidden due to low ratings
          <button
            style={{ marginBottom: 0 }}
            className="button hollow tiny float-right"
          >
            Show
          </button>
        </div>
      )}
    </div>
  );
}
