// @vitest-environment node
/**
 * The pre-parse guard against pathological input.
 *
 * Three layers:
 *
 * 1. The inputs that make the pipeline super-linear are refused, quickly.
 * 2. Ordinary content is not refused, however large or however dense.
 * 3. The rules behind the nesting estimate, case by case. Each case records
 *    what parse5, the parser rehype-raw uses, really builds.
 */
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import {
  MAX_CONTAINER_MARKERS_PER_LINE,
  MAX_DELIMITER_RUN_LENGTH,
  MAX_HTML_NESTING_DEPTH,
  MAX_INDENT_COLUMNS,
  MAX_INLINE_RESOLVE_WORK,
  MAX_QUOTE_MARKERS_PER_LINE,
  MAX_TABLE_CELLS,
  describePathology,
  estimateHtmlNesting,
  findPathology,
  isPathological,
  type PathologyReason,
} from '@/lib/markdown/pathology';
import { isRawHtmlPost } from '@/lib/markdown/raw-html-post';
import { renderMarkdown } from '@/lib/markdown/render';

/** A single line of `count` blockquote markers. */
const quotes = (count: number) => '> '.repeat(count) + 'x';

/** A markdown table with `cells` columns: a header row and its delimiter row. */
const table = (cells: number) => `|${' a |'.repeat(cells)}\n|${' - |'.repeat(cells)}`;

/** The deepest element nesting the estimate reaches in an HTML fragment. */
const nestingOf = estimateHtmlNesting;

/** The three shapes the plan review measured: 22 s, 6.9 s and 28 s unguarded. */
const MEASURED_SHAPES: ReadonlyArray<readonly [string, string, PathologyReason]> = [
  ['<b> x 21800 (64 KiB)', '<b>'.repeat(21800), 'html-nesting'],
  ['> x 32768 (64 KiB)', '> '.repeat(32768), 'quote-markers'],
  [
    '50000 nested <div> in a raw-HTML post',
    `<html>${'<div>'.repeat(50000)}x${'</div>'.repeat(50000)}</html>`,
    'html-nesting',
  ],
];

/** Other shapes measured during this feature point: 0.7 s to 17 s unguarded. */
const OTHER_SHAPES: ReadonlyArray<readonly [string, string, PathologyReason]> = [
  ['50000 nested <div>, no shell', '<div>'.repeat(50000) + 'x', 'html-nesting'],
  ['<b/> x 21800: in HTML a self-closing tag opens an element', '<b/>'.repeat(21800), 'html-nesting'],
  ['> x 65536, no spaces', '>'.repeat(65536), 'quote-markers'],
  ['> - x 8192: quotes and lists interleaved', '> - '.repeat(8192), 'quote-markers'],
  ['1. x 16384: lists nested on one line', '1. '.repeat(16384), 'container-markers'],
  ['- x 16384: bullets nested on one line', '- '.repeat(16384), 'container-markers'],
  ['a line indented by 64 KiB', ' '.repeat(65536) + '- x', 'indent-columns'],
  ['] x 16000', ']'.repeat(16000), 'inline-resolve-work'],
  ['a* x 8000 in one paragraph', 'a* '.repeat(8000), 'inline-resolve-work'],
  ['[a](<b> x 8000', '[a](<b>'.repeat(8000), 'inline-resolve-work'],
  ['an emphasis run of 32000 markers', `x${'*'.repeat(32000)}y`, 'delimiter-run'],
  ['two facing runs of 2000 markers', `${'*'.repeat(2000)}x${'*'.repeat(2000)}`, 'delimiter-run'],
  ['a table of 1600 cells', table(800), 'table-cells'],
];

let consoleError: MockInstance<typeof console.error>;

beforeEach(() => {
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleError.mockRestore();
});

describe('pathological input is refused, quickly', () => {
  const cases: ReadonlyArray<readonly [string, string, PathologyReason]> = [...MEASURED_SHAPES, ...OTHER_SHAPES];

  it.each(cases)('%s', (_label, body, reason) => {
    expect(isPathological(body)).toBe(true);
    expect(findPathology(body)).toBe(reason);
    expect(describePathology(reason)).not.toBe('');

    const started = performance.now();
    const result = renderMarkdown(body);
    const elapsed = performance.now() - started;

    expect(result.html).toBe('');
    expect(result.noImageActive).toBe(false);
    expect(result.file).toBeNull();
    expect(result.isHtml).toBe(isRawHtmlPost(body));
    // The guard reads little more of the body than the threshold requires.
    expect(elapsed).toBeLessThan(50);
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(String(consoleError.mock.calls[0][0])).toContain('pathological');
  });
});

describe('ordinary content is not refused', () => {
  it('renders a flat 64 KiB body, and logs how long that takes', () => {
    const sentence =
      'The quick brown fox jumps over the lazy dog while the sun sets behind the quiet hills and the river keeps flowing toward the sea. ';
    const body = Array.from({ length: Math.ceil(65536 / sentence.length) }, (_, i) =>
      i % 6 === 5
        ? `**Paragraph ${i}** has *some emphasis* and [a link](https://steemit.com/@a/b).`
        : `Paragraph ${i}. ${sentence}`,
    )
      .join('\n\n')
      .slice(0, 65536);

    expect(isPathological(body)).toBe(false);

    // Deliberately no assertion on the time: it is the pipeline's ordinary
    // cost for a full-size body and depends on the machine. Recorded for review.
    let best = Infinity;
    for (let run = 0; run < 3; run++) {
      const started = performance.now();
      const html = renderMarkdown(body).html;
      best = Math.min(best, performance.now() - started);
      expect(html.length).toBeGreaterThan(1000);
      expect(html).not.toMatch(/<\s*script/i);
    }
    console.log(`renderMarkdown, flat 64 KiB body: ${best.toFixed(1)} ms`);
  });

  it('does not count a fenced code block, however dense its punctuation', () => {
    const line = '{"user_id": 12, "post_id": "a_b_c", "tags": ["x", "y"], "meta": {"active": [*args, **kwargs]}}\n';
    const body = `Intro\n\n\`\`\`json\n${line.repeat(700).slice(0, 65536)}\n\`\`\`\n\nOutro with ] and * marks.\n`;

    expect(findPathology(body)).toBeNull();
    const html = renderMarkdown(body).html;
    expect(html).toContain('<pre><code>');
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('lets a list or a set of paragraphs carry more delimiters than one paragraph may', () => {
    // Each of these carries more closers in total than one paragraph may,
    // and none of them is one paragraph.
    const bullets = '- *bold* item\n'.repeat(1500);
    const numbered = '1. *bold* item\n'.repeat(1500);
    const paragraphs = 'A *bold* word and a [link](https://a.b/).\n\n'.repeat(400);

    for (const body of [bullets, numbered, paragraphs]) {
      expect(findPathology(body)).toBeNull();
    }
    expect(renderMarkdown(bullets).html).toContain('<li><em>bold</em> item</li>');
  });

  it('lets a post nest as deeply as posts do', () => {
    const body = [
      '> A quote.',
      '> > A reply.',
      '> > > A reply to the reply.',
      '',
      '- level 1',
      '  - level 2',
      '    - level 3',
      '      - level 4',
      '        - level 5',
      '',
      '| a | b | c | d |',
      '| - | :- | -: | :-: |',
      '| 1 | 2 | 3 | 4 |',
      '',
      '<div class="pull-right"><center><table><tr><td><b>layout</b></td></tr></table></center></div>',
    ].join('\n');

    expect(findPathology(body)).toBeNull();
    expect(renderMarkdown(body).html).toContain('<li>level 5</li>');
  });

  it('does not accumulate the tags sloppy HTML leaves open', () => {
    const list = `<ul>\n${'<li>item\n'.repeat(600)}</ul>`;
    const cells = `<table>\n${'<tr><td>a<td>b\n'.repeat(600)}</table>`;
    const paragraphs = '<div>\n' + '<p>text<br>\n'.repeat(600) + '</div>';
    const tables = '<table><tr><td>cell</table>\n'.repeat(600);

    for (const html of [list, cells, paragraphs, tables]) {
      expect(nestingOf(html)).toBeLessThan(6);
      expect(findPathology(html)).toBeNull();
      expect(renderMarkdown(`<p>${html}</p>`).html).not.toBe('');
    }
  });

  it('ignores the HTML an author commented out', () => {
    const draft = `<!-- old layout\n${'<div class="x"><p>draft<br>\n'.repeat(600)}-->\n\nLive text.`;

    expect(findPathology(draft)).toBeNull();
    const html = renderMarkdown(draft).html;
    expect(html).toContain('<p>Live text.</p>');
    expect(html).not.toContain('draft');
  });
});

describe('thresholds', () => {
  // Each row: at the limit the body passes, one more is refused.
  it.each([
    ['quote-markers', quotes(MAX_QUOTE_MARKERS_PER_LINE), quotes(MAX_QUOTE_MARKERS_PER_LINE + 1)],
    [
      'container-markers',
      '1. '.repeat(MAX_CONTAINER_MARKERS_PER_LINE) + 'x',
      '1. '.repeat(MAX_CONTAINER_MARKERS_PER_LINE + 1) + 'x',
    ],
    [
      'indent-columns',
      ' '.repeat(MAX_INDENT_COLUMNS) + '- x',
      ' '.repeat(MAX_INDENT_COLUMNS + 1) + '- x',
    ],
    [
      'html-nesting',
      '<div>'.repeat(MAX_HTML_NESTING_DEPTH) + 'x',
      '<div>'.repeat(MAX_HTML_NESTING_DEPTH + 1) + 'x',
    ],
    [
      'delimiter-run',
      '*'.repeat(MAX_DELIMITER_RUN_LENGTH) + 'x',
      '*'.repeat(MAX_DELIMITER_RUN_LENGTH + 1) + 'x',
    ],
    [
      'inline-resolve-work',
      // Each `a* ` is one token and one closer, so the work is n squared.
      'a* '.repeat(Math.floor(Math.sqrt(MAX_INLINE_RESOLVE_WORK))),
      'a* '.repeat(Math.floor(Math.sqrt(MAX_INLINE_RESOLVE_WORK)) + 1),
    ],
    // A row of n cells counts n + 2: its pipes, and the row itself.
    ['table-cells', table(MAX_TABLE_CELLS / 2 - 4), table(MAX_TABLE_CELLS / 2 + 4)],
  ] as const)('%s', (reason, atLimit, over) => {
    expect(findPathology(atLimit)).toBeNull();
    expect(findPathology(over)).toBe(reason);
  });

  it('counts quotes and list markers together', () => {
    expect(findPathology(`${'> '.repeat(32)}${'- '.repeat(32)}x`)).toBeNull();
    expect(findPathology(`${'> '.repeat(32)}${'- '.repeat(33)}x`)).toBe('container-markers');
  });
});

describe('the nesting estimate', () => {
  it('counts nesting, and nothing else', () => {
    expect(nestingOf('')).toBe(0);
    expect(nestingOf('plain < text')).toBe(0);
    expect(nestingOf('<b><i><u>x</u></i></b>')).toBe(3);
    expect(nestingOf('<div><span>a</span><span>b</span></div>')).toBe(2);
  });

  it('does not count elements that cannot have content', () => {
    expect(nestingOf('<br><hr><img src="x"><input type="checkbox">')).toBe(0);
    expect(nestingOf('<p>a<br>b</p>')).toBe(1);
  });

  it('reads `/>` as self-closing in SVG only: in HTML `<b/>` is `<b>`', () => {
    expect(nestingOf('<b/><b/><b/>')).toBe(3);
    expect(nestingOf('<svg/>')).toBe(0);
    expect(nestingOf('<svg><path/><circle/></svg>')).toBe(1);
  });

  it('closes a paragraph, a list item and a table cell at the next one', () => {
    expect(nestingOf('<p>one<p>two<p>three')).toBe(1);
    expect(nestingOf('<p>one<div>two')).toBe(1);
    expect(nestingOf('<li>one<li>two')).toBe(1);
    expect(nestingOf('<td>one<td>two')).toBe(1);
    expect(nestingOf('<dt>a<dd>b<dt>c')).toBe(1);
  });

  it('closes an element only as far as a browser does', () => {
    // An end tag for a phrasing element does not cross a block element.
    expect(nestingOf('<b><div>x</b>')).toBe(2);
    // `</th>` does not close a `<td>`.
    expect(nestingOf('<td><b></th>')).toBe(2);
  });

  it('carries nothing over from one block to the next', () => {
    // A block end tag closes what was left open inside it.
    expect(nestingOf('<ul><li><p>x</ul>'.repeat(300))).toBe(3);
    expect(nestingOf('<table><tr></table>'.repeat(300))).toBe(3);
    expect(nestingOf('<table><tr><td></table><td>x'.repeat(300))).toBe(4);
    expect(nestingOf('<table><tr><td></td><tr>'.repeat(300))).toBe(4);
    // A table inside a table closes the table around it.
    expect(nestingOf('<table><tr>'.repeat(300))).toBe(3);
  });

  it('supplies the table structure the parser supplies', () => {
    expect(nestingOf('<table><td>')).toBe(4); // table > tbody > tr > td
    expect(nestingOf('<table><caption><td>')).toBe(4);
    expect(nestingOf('<table><tr><td><table><tr><td>')).toBe(8); // a table in a cell nests
    expect(nestingOf('<td>')).toBe(1); // valid at the top of a fragment
  });

  it('ignores comments, and finds where a browser ends them', () => {
    expect(nestingOf('<!-- <div><div> -->')).toBe(0);
    expect(nestingOf('<!-- a---><b>x</b> -->')).toBe(1);
    expect(nestingOf('<!-- a--!><b>x</b>')).toBe(1);
    expect(nestingOf('<b title="<!--">x</b>')).toBe(1);
  });

  it('reads quotes inside a tag before anything else', () => {
    expect(nestingOf('<b title="x>y">t</b>')).toBe(1);
    expect(nestingOf('<b title="q <i>x</i> t">u')).toBe(1);
    expect(nestingOf('<a href="q<i>x</i>')).toBe(0); // the quote never closes
    expect(nestingOf('<b c=y/>t</b>')).toBe(1); // the `/` belongs to the value
  });

  it('treats SVG and MathML content as foreign', () => {
    // Nothing is void or implied there.
    expect(nestingOf('<svg><br><p><li>')).toBe(4);
    expect(nestingOf('<math><head><hr>')).toBe(3);
    // At an integration point HTML rules apply again.
    expect(nestingOf('<svg><foreignObject><br><p>1<p>2')).toBe(3);
    expect(nestingOf('<math><annotation-xml encoding="text/html"><li/>')).toBe(3);
    expect(nestingOf('<math><annotation-xml><li/>')).toBe(2);
  });

  it('keeps formatting elements that the parser will recreate', () => {
    // `</div>` closes the `<b>`, but the parser keeps it on a list and
    // recreates it around what follows.
    expect(nestingOf('<div><b>x</div><span>y')).toBe(2);
    expect(nestingOf('<div><b>x</div><div><b>y</div><span>z')).toBe(3);
    // Its own end tag takes it off the list.
    expect(nestingOf('<div><b>x</div></b><div><p>q</div></p><span>y')).toBe(2);
    // At most three of a kind are kept, however many are opened.
    expect(nestingOf('<div><b>x</div>'.repeat(8) + '<span>y')).toBe(4);
    // While they are really open, all of them count.
    expect(nestingOf('<b><b><b><b>x')).toBe(4);
  });
});

describe('the estimate as the pipeline uses it', () => {
  it('reads a paragraph by CommonMark rules: an invalid tag is text, not an element', () => {
    expect(findPathology('x <b:c>'.repeat(300))).toBeNull(); // no letter may follow the name directly
    expect(findPathology('x <b @c=x>'.repeat(300))).toBeNull();
    expect(findPathology('x </b x>'.repeat(300))).toBeNull();
    expect(findPathology('x \\<b>'.repeat(300))).toBeNull(); // escaped
    // The same tags in an HTML block are markup, and nest.
    expect(findPathology(`<div>\n${'<b @c=x>'.repeat(300)}`)).toBe('html-nesting');
  });

  it('reads a multi-line tag only inside one paragraph', () => {
    // Complete, and open across the paragraphs that follow.
    expect(findPathology('x <b\nc=y>'.repeat(300))).toBe('html-nesting');
    expect(findPathology('x <b\nc=y>\n\n'.repeat(300))).toBe('html-nesting');
    // Cut off by a blank line, the tag is not a tag: it is text.
    expect(findPathology('x <b\nc=y\n\n'.repeat(300))).toBeNull();
  });

  it('does not read markup inside fenced code', () => {
    const divs = '<div>'.repeat(300);
    expect(findPathology(`\`\`\`html\n${divs}\n\`\`\``)).toBeNull();
    // A fence inside a blockquote is not closed by an unprefixed fence line,
    // and such a line is not inside it either: the parser sees an HTML block
    // there, which nests.
    expect(findPathology(`> \`\`\`\n${divs}\n\`\`\``)).toBe('html-nesting');
  });
});

describe('known blind spot (recorded here, not fixed)', () => {
  it('does not see a code span: an end tag inside one pops although it is text', () => {
    // Each `</b>` sits in a code span and closes nothing, but closes a `<b>`
    // in the estimate. Measured on this pipeline: 2000 of these take 0.8 s,
    // and 5000 (45 KiB) take 2.1 s and then fail with a RangeError, which
    // the try/catch in renderMarkdown turns into an empty string. So the
    // damage is bounded by the body size instead of by the guard.
    expect(findPathology('<b>`</b>`'.repeat(MAX_HTML_NESTING_DEPTH + 1))).toBeNull();
  });
});
