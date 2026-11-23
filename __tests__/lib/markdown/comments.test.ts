// @vitest-environment node
/**
 * HTML comments.
 *
 * The legacy viewer rewrites every `<!-- … -->` to the readable text
 * `(html comment removed: …)` before rendering. The new pipeline drops
 * complete comments and shows an unterminated one as escaped text. The
 * contract in both cases is the same: whatever an author put inside a comment
 * never reaches the page as markup, and the comment markers themselves are
 * never emitted as live markup.
 */
import { describe, expect, it } from 'vitest';

import { decodeEntities, renderClean, textContent } from '../../helpers/markdown';

/** True when `html` contains a comment opener as markup or as readable text. */
const hasCommentMarkers = (html: string) => /<!--|-->|html comment removed/.test(decodeEntities(html));

describe('HTML comments', () => {
  it('removes a complete comment and keeps the text around it', () => {
    const html = renderClean('hello <!-- secret --> world');

    expect(hasCommentMarkers(html)).toBe(false);
    expect(textContent(html)).toBe('hello  world');
  });

  it('removes the abruptly closed forms <!--> and <!--->', () => {
    for (const marker of ['<!-->', '<!--->', '<!---->']) {
      const html = renderClean(`a ${marker} b`);
      expect(hasCommentMarkers(html)).toBe(false);
      expect(textContent(html)).toBe('a  b');
    }
  });

  it('shows an unterminated comment as escaped text, without its script', () => {
    const html = renderClean('keep <!-- <script>alert(1)</script>');

    expect(html).not.toMatch(/<\s*!--/);
    expect(html).not.toMatch(/<\s*script|\bon\w+\s*=/i);
    expect(textContent(html)).toContain('keep');
    // The author's opener is still visible, as text: it is what they wrote.
    expect(textContent(html)).toContain('<!--');
  });

  it('keeps comment markers an author escaped, as the text they typed', () => {
    const html = renderClean('Use &lt;!-- note --&gt; to add a comment');

    expect(textContent(html)).toBe('Use <!-- note --> to add a comment');
  });

  it('removes a comment that spans lines inside one paragraph', () => {
    const html = renderClean('a <!-- first\nsecond --> b');

    expect(hasCommentMarkers(html)).toBe(false);
    expect(textContent(html)).toBe('a  b');
  });

  it('treats a comment broken by a blank line as text', () => {
    const html = renderClean('a <!-- x\n\ny --> b');

    expect(textContent(html)).toContain('<!-- x');
    expect(textContent(html)).toContain('y --> b');
  });

  it('ends a comment at the first -->, even when the dash run is longer', () => {
    const html = renderClean('x <!-- a---> <b>bold</b> --> z');

    expect(html).toContain('<b>bold</b>');
    expect(textContent(html)).toBe('x  bold --> z');
  });

  it('removes a block comment across blank lines, markup included', () => {
    const html = renderClean('x\n<!-- old draft\n\n<div onclick="x()">y</div>\n-->\nz');

    expect(html).not.toMatch(/<div|onclick/);
    expect(textContent(html)).toContain('x');
    expect(textContent(html)).toContain('z');
  });

  it('does not treat an escaped or coded opener as a comment', () => {
    expect(textContent(renderClean('a \\<!-- x --> b'))).toBe('a <!-- x --> b');
    expect(renderClean('a `<!-- x -->` b')).toContain('<code>&#x3C;!-- x --></code>');
  });

  it.each([
    'hello <!-- secret --> world',
    'a <!--> b',
    'keep <!-- <script>alert(1)</script>',
    'Use &lt;!-- note --&gt; to add a comment',
    '<p>a <!-- <script>x</script> --> b</p>',
    '<html><body><!-- <img src=x onerror=alert(1)> --><p>ok</p></body></html>',
    '<div><!-- [x](javascript:alert(1)) --></div>',
    'a <!--x--!><script>alert(1)</script>--> b',
  ])('never lets a payload inside a comment through: %j', (body) => {
    const html = renderClean(body);

    expect(html).not.toMatch(/<\s*(script|img|a)\b[^>]*(javascript|onerror|alert)/i);
    expect(html).not.toMatch(/<\s*script/i);
  });
});
