'use client';

import { useMemo } from 'react';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import htmlReady from '@/lib/html-ready';
import sanitizeConfig from '@/lib/sanitize-config';

interface MarkdownViewerProps {
  text: string;
  className?: string;
  large?: boolean;
  hideImages?: boolean;
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
 *   2. HtmlReady:  URL normalization + link/mention/#tag linkify + image proxy
 *   3. sanitize-html (SanitizeConfig): XSS filter — allowedTags/Attributes,
 *      iframe whitelist, link/image hardening.
 *
 * Ported from master's MarkdownViewer.jsx, adapted to the next branch.
 */
export default function MarkdownViewer({
  text,
  className = '',
  large = false,
  hideImages = false,
}: MarkdownViewerProps) {
  const html = useMemo(() => {
    if (!text) return '';

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

    // 2. HtmlReady mutation (linkify, proxify images, wrap iframes, …).
    rendered = htmlReady(rendered, { hideImages }).html;

    // 3. sanitize-html (XSS filter + iframe whitelist).
    const sanitizeErrors: string[] = [];
    const clean = sanitizeHtml(
      rendered,
      sanitizeConfig({ large, highQualityPost: true, sanitizeErrors })
    );

    if (sanitizeErrors.length > 0) {
      console.warn('MarkdownViewer sanitize errors:', sanitizeErrors);
    }

    // Secondary trap: refuse to render any <script> that slipped through.
    if (/<\s*script/gi.test(clean)) {
      console.error('Refusing to render script tag in post text');
      return '';
    }
    return clean;
  }, [text, large, hideImages]);

  const cn = `MarkdownViewer ${className} ${large ? '' : 'MarkdownViewer--small'}`;

  return (
    <div
      className={cn}
      style={{ wordBreak: 'break-word' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
