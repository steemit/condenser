// @vitest-environment node
/**
 * Dialect baseline of the new pipeline.
 *
 * These tests pin the markdown flavour the site renders before any Steemit
 * semantics are layered on (linkify, embeds, hardening). They exist so that a
 * plugin change cannot quietly move the dialect: every case here is either a
 * deliberate match of the legacy markdown-it configuration (`breaks: true`,
 * `linkify: false`) or a deliberate, recorded difference (tables, task lists,
 * strikethrough).
 */
import { describe, expect, it } from 'vitest';

import { renderClean } from '../../helpers/markdown';

describe('markdown dialect baseline', () => {
  describe('line breaks', () => {
    it('renders a single newline as <br> (Steemit dialect: breaks on)', () => {
      expect(renderClean('line one\nline two')).toBe('<p>line one<br>\nline two</p>');
    });

    it('keeps a blank line as a paragraph break, without <br>', () => {
      const html = renderClean('para one\n\npara two');
      expect(html).not.toContain('<br>');
      expect(html).toContain('</p>\n<p>para two</p>');
    });
  });

  describe('tables', () => {
    it('renders header, head and body', () => {
      const html = renderClean('| a | b |\n| - | - |\n| 1 | 2 |');
      expect(html).toContain('<table>');
      expect(html).toContain('<thead><tr><th>a</th><th>b</th></tr></thead>');
      expect(html).toContain('<tbody><tr><td>1</td><td>2</td></tr></tbody>');
      expect(html).toContain('</table>');
    });

    it('carries column alignment through the align attribute', () => {
      const html = renderClean('| a | b | c |\n| :- | :-: | -: |\n| 1 | 2 | 3 |');
      expect(html).toContain('<th align="left">a</th>');
      expect(html).toContain('<th align="center">b</th>');
      expect(html).toContain('<th align="right">c</th>');
      expect(html).toContain('<td align="center">2</td>');
    });

    it('does not treat a pipe without a delimiter row as a table', () => {
      expect(renderClean('a | b\n1 | 2')).not.toContain('<table');
    });
  });

  describe('task lists', () => {
    it('renders checked and unchecked boxes as disabled inputs', () => {
      const html = renderClean('- [x] done\n- [ ] todo');
      expect(html).toContain('<li class="task-list-item"><input type="checkbox" checked disabled> done</li>');
      expect(html).toContain('<li class="task-list-item"><input type="checkbox" disabled> todo</li>');
    });

    it('leaves an ordinary list alone', () => {
      const html = renderClean('- (x) in parentheses\n- plain');
      expect(html).not.toContain('task-list-item');
      expect(html).toContain('<li>(x) in parentheses</li>');
    });
  });

  describe('strikethrough', () => {
    it('strikes through double tildes', () => {
      expect(renderClean('~~x~~')).toBe('<p><del>x</del></p>');
    });

    it('leaves a single tilde alone (no single-tilde strikethrough)', () => {
      const html = renderClean('~5~ costs ~~gone~~ and ~y~ too');
      expect(html).toBe('<p>~5~ costs <del>gone</del> and ~y~ too</p>');
    });
  });

  describe('bare URLs, domains and addresses stay plain text', () => {
    it.each([
      ['www.example.com/x', 'bare domain'],
      ['me@steemit.com', 'bare address'],
      ['https://a.b/c', 'bare URL'],
    ])('does not link the %s (%s)', (text) => {
      const html = renderClean(`see ${text} now`);
      expect(html).toBe(`<p>see ${text} now</p>`);
    });

    it('does not turn a URL with a path and query into an autolink literal', () => {
      const html = renderClean('https://steemit.com/trending/@a/b?x=1&y=2#z');
      expect(html).not.toContain('<a');
      expect(html).toContain('https://steemit.com/trending/@a/b?x=1&#x26;y=2#z');
    });

    it('still renders an explicit markdown link', () => {
      expect(renderClean('[x](https://a.b/c)')).toBe('<p><a href="https://a.b/c">x</a></p>');
    });
  });
});
