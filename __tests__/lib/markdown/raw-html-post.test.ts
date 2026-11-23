// @vitest-environment node
/**
 * Raw-HTML posts: bodies that are HTML documents, not markdown.
 *
 * The decision and the shell-stripping must match the legacy viewer exactly
 * (`components/elements/MarkdownViewer.tsx`), because `isHtml` also decides
 * the `html` class on the viewer and the `format` field of the JSON metadata.
 */
import { describe, expect, it } from 'vitest';

import { renderClean } from '../../helpers/markdown';
import { isRawHtmlPost } from '@/lib/markdown/raw-html-post';
import { renderMarkdown } from '@/lib/markdown/render';

// The two legacy expressions, copied verbatim from MarkdownViewer.tsx:71-77.
const LEGACY_SHELL = /^<html>([\S\s]*)<\/html>$/;
const LEGACY_LEADING_P = /^<p>[\S\s]*<\/p>/;
const legacyIsHtml = (body: string) =>
  body.match(LEGACY_SHELL) !== null || LEGACY_LEADING_P.test(body);

describe('raw-HTML posts', () => {
  describe('isRawHtmlPost', () => {
    it.each([
      ['<html><body><p>x</p></body></html>', true, 'full document'],
      ['<html>x</html>', true, 'shell without body'],
      ['<p>Intro</p>', true, 'leading paragraph'],
      ['<p>Intro</p>\n\nmore text', true, 'leading paragraph, then anything'],
      ['<html>a</html>b</html>', true, 'greedy shell: outermost pair wins'],
      ['**bold**', false, 'markdown'],
      ['', false, 'empty'],
      ['text <p>later</p>', false, 'the paragraph has to come first'],
      ['<P>x</P>', false, 'case-sensitive'],
      ['<html lang="en">x</html>', false, 'the shell must be exactly <html>'],
      ['<html>x</html>\n', false, 'nothing may follow the shell, not even a newline'],
      ['<html>x</html>trailing', false, 'trailing content'],
      ['<!DOCTYPE html><html>x</html>', false, 'a doctype before the shell'],
      ['<div>x</div>', false, 'other tags do not count'],
    ])('%j -> %s (%s)', (body, expected) => {
      expect(isRawHtmlPost(body)).toBe(expected);
    });

    it.each([
      '',
      '<p>',
      '<p></p>',
      '<html></html>',
      '<html>\n</html>',
      ' <p>x</p>',
      '<html>x</html></html>',
      '<html><html>x</html></html>',
      '<p>a</p>\n<html>b</html>',
      '<p>a\n\nb</p>',
      'x\n<p>a</p>',
    ])('agrees with the legacy expressions on %j', (body) => {
      expect(isRawHtmlPost(body)).toBe(legacyIsHtml(body));
    });
  });

  describe('rendering', () => {
    it('strips the <html> shell and does not parse the body as markdown', () => {
      const body =
        '<html><body><p>Hello _world_ #x</p>\n\n<img src="https://a.b/x.png">\n\n</body></html>';
      const result = renderMarkdown(body);

      expect(result.isHtml).toBe(true);
      // Markdown stays literal: no emphasis, no heading, and the blank lines
      // do not become paragraphs of their own.
      expect(result.html).toContain('<p>Hello _world_ #x</p>');
      expect(result.html).toContain('<img src="https://a.b/x.png">');
      expect(result.html).not.toMatch(/<em>|<h[1-6]|<\/?(html|body)\b/i);
    });

    it('strips only the outermost shell', () => {
      // The shell is the outermost pair: everything between them is content,
      // including the inner close tag, which the HTML parser then discards
      // (so does the legacy sanitizer).
      const html = renderClean('<html><p>a</p></html><p>b</p></html>');
      expect(html).toBe('<p>a</p><p>b</p>');
    });

    it('does not parse markdown after a leading <p> block', () => {
      const result = renderMarkdown('<p>Intro</p>\n\n**bold?** no');

      expect(result.isHtml).toBe(true);
      expect(result.html).toContain('<p>Intro</p>');
      expect(result.html).toContain('**bold?**');
      expect(result.html).not.toMatch(/<strong>/);
    });

    it('still parses ordinary markdown', () => {
      const result = renderMarkdown('**bold** and _em_\nnext line');

      expect(result.isHtml).toBe(false);
      expect(result.html).toBe('<p><strong>bold</strong> and <em>em</em><br>\nnext line</p>');
    });

    it('sanitizes a raw-HTML post like any other body', () => {
      const html = renderClean(
        '<html><p onclick="steal()">a</p><script>alert(1)</script><b onmouseover="x()">c</b></html>',
      );

      expect(html).not.toMatch(/onclick|onmouseover|<script/i);
      expect(html).toContain('<p>a</p>');
      expect(html).toContain('<b>c</b>');
    });
  });
});
