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
  MAX_INLINE_TOKENS,
  MAX_LINES,
  MAX_LIST_ITEMS,
  MAX_QUOTE_LINES,
  MAX_QUOTE_MARKERS_PER_LINE,
  MAX_TABLE_CELLS,
  describePathology,
  estimateHtmlNesting,
  findPathology,
  isPathological,
  type PathologyClass,
  type PathologyReason,
} from '@/lib/markdown/pathology';
import { isRawHtmlPost } from '@/lib/markdown/raw-html-post';
import { renderMarkdown } from '@/lib/markdown/render';

/** A single line of `count` blockquote markers. */
const quotes = (count: number) => '> '.repeat(count) + 'x';

/** The rule `body` breaks, or null: the shape the threshold tests speak in. */
const reasonOf = (body: string): PathologyReason | null => findPathology(body)?.reason ?? null;

/** The lowest of three runs: what one render costs at its best. */
function lowest(run: () => number): number {
  let best = Infinity;
  for (let attempt = 0; attempt < 3; attempt++) best = Math.min(best, run());
  return best;
}

/** A markdown table with `cells` columns: a header row and its delimiter row. */
const table = (cells: number) => `|${' a |'.repeat(cells)}\n|${' - |'.repeat(cells)}`;

/** The deepest element nesting the estimate reaches in an HTML fragment. */
const nestingOf = estimateHtmlNesting;

type Shape = readonly [label: string, body: string, reason: PathologyReason, kind: PathologyClass];

/** The three shapes the plan review measured: 22 s, 6.9 s and 28 s unguarded. */
const MEASURED_SHAPES: ReadonlyArray<Shape> = [
  ['<b> x 21800 (64 KiB)', '<b>'.repeat(21800), 'html-nesting', 'structure'],
  ['> x 32768 (64 KiB)', '> '.repeat(32768), 'quote-markers', 'structure'],
  [
    '50000 nested <div> in a raw-HTML post',
    `<html>${'<div>'.repeat(50000)}x${'</div>'.repeat(50000)}</html>`,
    'html-nesting',
    'structure',
  ],
];

/** A prefix does not take a line out of the scan: a heading, a list item and a quote are scanned like a paragraph. */
function prefixed(shapes: ReadonlyArray<Shape>): Shape[] {
  return shapes.flatMap(([label, body, reason, kind]) => [
    [`# ${label}`, `# ${body}`, reason, kind],
    [`- ${label}`, `- ${body}`, reason, kind],
    [`> ${label}`, `> ${body}`, reason, kind],
  ]);
}

/** Other shapes that make the pipeline super-linear: 0.7 s to 35 s unguarded. */
const STRUCTURE_SHAPES: ReadonlyArray<Shape> = [
  ['50000 nested <div>, no shell', '<div>'.repeat(50000) + 'x', 'html-nesting', 'structure'],
  ['<b/> x 21800: in HTML a self-closing tag opens an element', '<b/>'.repeat(21800), 'html-nesting', 'structure'],
  ['> x 65536, no spaces', '>'.repeat(65536), 'quote-markers', 'structure'],
  ['> - x 8192: quotes and lists interleaved', '> - '.repeat(8192), 'quote-markers', 'structure'],
  ['1. x 16384: lists nested on one line', '1. '.repeat(16384), 'container-markers', 'structure'],
  ['- x 16384: bullets nested on one line', '- '.repeat(16384), 'container-markers', 'structure'],
  ['a line indented by 64 KiB', ' '.repeat(65536) + '- x', 'indent-columns', 'structure'],
  ['] x 16000', ']'.repeat(16000), 'inline-resolve-work', 'structure'],
  ['a* x 8000 in one paragraph', 'a* '.repeat(8000), 'inline-resolve-work', 'structure'],
  ['[a](<b> x 8000', '[a](<b>'.repeat(8000), 'html-nesting', 'structure'],
  ['an emphasis run of 32000 markers', `x${'*'.repeat(32000)}y`, 'delimiter-run', 'structure'],
  ['two facing runs of 2000 markers', `${'*'.repeat(2000)}x${'*'.repeat(2000)}`, 'delimiter-run', 'structure'],
  // A heading was not scanned at all, and anything behind `<?` or `<!--`
  // made the guard itself quadratic (5.3 s and 2.8 s before the fix).
  ['# + <b> x 16383', `# ${'<b>'.repeat(16383)}`, 'html-nesting', 'structure'],
  ['# + ] x 16384', `# ${']'.repeat(16384)}`, 'inline-resolve-work', 'structure'],
  ['x<? x 32768 (64 KiB)', 'x<?'.repeat(32768), 'inline-tokens', 'budget'],
  ['x<!-- x 16384 (64 KiB)', 'x<!--'.repeat(16384), 'inline-tokens', 'budget'],
  // `~` closes on the character before it alone: 8.6 s and 7.2 s unguarded.
  ['~a~ x 16384', '~a~'.repeat(16384), 'inline-resolve-work', 'structure'],
  ['a~~ x 16383', 'a~~'.repeat(16383), 'inline-resolve-work', 'structure'],
  // An end tag inside a code span is text for the browser: 7.15 s unguarded.
  ['<b>`</b>` x 7281 (64 KiB)', '<b>`</b>'.repeat(7281), 'html-nesting', 'structure'],
  ['an end tag inside a raw-text element', `${'<b>'.repeat(300)}<script>${'</b>'.repeat(300)}</script><div>${'<div>'.repeat(300)}`, 'html-nesting', 'structure'],
  ['an end tag inside a link title', `${'<b>'.repeat(300)}[a](x '${'</b>'.repeat(300)}')${'<div>'.repeat(300)}`, 'html-nesting', 'structure'],
  ['a doctype does not run past its first >', `<div>\n<!doctype a "x>${'<div>'.repeat(300)}\n\nz`, 'html-nesting', 'structure'],
  ...prefixed([
    ['] x 16384', ']'.repeat(16384), 'inline-resolve-work', 'structure'],
    ['<b> x 16383', '<b>'.repeat(16383), 'html-nesting', 'structure'],
    ['a* x 8000', 'a* '.repeat(8000), 'inline-resolve-work', 'structure'],
  ]),
];

/** Honest content that is merely too long for this renderer: 1.2 s to 5.9 s unguarded. */
const BUDGET_SHAPES: ReadonlyArray<Shape> = [
  ['- a and a blank line x 13010', '- a\n\n'.repeat(13010), 'list-items', 'budget'],
  ['> a x 16383', '> a\n'.repeat(16383), 'quote-lines', 'budget'],
  ['a x 32768', 'a\n'.repeat(32768), 'lines', 'budget'],
  ['# a x 32768', '# a\n'.repeat(32768), 'lines', 'budget'],
  ['[ x 65536 (64 KiB): nothing closes at all', '['.repeat(65536), 'inline-tokens', 'budget'],
  ['a__ x 32768', 'a__'.repeat(32768), 'inline-tokens', 'budget'],
  ['a table of 1600 cells', table(800), 'table-cells', 'budget'],
];

let consoleError: MockInstance<typeof console.error>;

beforeEach(() => {
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleError.mockRestore();
});

describe('pathological input is refused, quickly', () => {
  const cases: ReadonlyArray<Shape> = [...MEASURED_SHAPES, ...STRUCTURE_SHAPES, ...BUDGET_SHAPES];

  it.each(cases)('%s', (_label, body, reason, kind) => {
    const pathology = findPathology(body);

    expect(isPathological(body)).toBe(true);
    expect(pathology).toEqual({ class: kind, reason });
    expect(describePathology(reason)).not.toBe('');

    // The guard reads little more of the body than the threshold requires.
    const elapsed = lowest(() => {
      const started = performance.now();
      const result = renderMarkdown(body);
      expect(result).toEqual({ html: '', noImageActive: false, file: null, isHtml: isRawHtmlPost(body), refused: pathology });
      return performance.now() - started;
    });
    expect(elapsed).toBeLessThan(150);
    expect(consoleError).toHaveBeenCalled();
    expect(consoleError.mock.calls[0].slice(0, 3)).toEqual([
      'renderMarkdown: refused to render pathological input',
      describePathology(reason),
      kind,
    ]);
  });

  it.each(BUDGET_SHAPES)('reports %s as a size, with the rule it broke', (_label, body, reason) => {
    expect(describePathology(reason)).toMatch(/more than \d+/);
  });
});

describe('ordinary content is not refused', () => {
  it('renders a flat 64 KiB body', () => {
    const sentence =
      'The quick brown fox jumps over the lazy dog while the sun sets behind the quiet hills and the river keeps flowing toward the sea. ';
    const body = Array.from({ length: Math.ceil(65536 / sentence.length) }, (_, i) =>
      i % 6 === 5
        ? `**Paragraph ${i}** has *some emphasis* and [a link](https://steemit.com/@a/b).`
        : `Paragraph ${i}. ${sentence}`,
    )
      .join('\n\n')
      .slice(0, 65536);

    expect(findPathology(body)).toBeNull();

    // Deliberately no assertion on the time: it is the pipeline's ordinary
    // cost for a full-size body and depends on the machine. It is recorded in
    // the name of the test, for whoever reads the report.
    const elapsed = lowest(() => {
      const started = performance.now();
      const result = renderMarkdown(body);
      const ms = performance.now() - started;
      expect(result.refused).toBeNull();
      expect(result.html.length).toBeGreaterThan(1000);
      expect(result.html).not.toMatch(/<\s*script/i);
      return ms;
    });
    // The time is not asserted: it only goes into the title of a check that
    // cannot fail, where the report shows it.
    expect(elapsed, `cold renders of a flat 64 KiB body: ${elapsed.toFixed(0)} ms at the best`).toBeGreaterThanOrEqual(0);
  });

  /** What a post that is merely long or merely dense looks like: none of it may be refused. */
  const HONEST: Record<string, string> = {
    '20 levels of quotation': Array.from({ length: 20 }, (_, i) => `${'> '.repeat(i + 1)}level ${i + 1}`).join('\n'),
    '10 levels of nested lists, ordered and not, with a task': Array.from(
      { length: 10 },
      (_, i) => `${'  '.repeat(i)}${i % 2 ? '1.' : '-'} ${i === 4 ? '[ ] ' : ''}item ${i}`,
    ).join('\n'),
    '300 unclosed <p> and <li> in a raw-HTML post': `<html><body>${'<p>text'.repeat(300)}<ul>${'<li>item'.repeat(300)}</ul></body></html>`,
    'a code block indented by 40 columns': `${' '.repeat(40)}code\n${Array.from({ length: 20 }, (_, i) => `${' '.repeat(40)}line ${i} { a: [b], c < d > e }`).join('\n')}`,
    'a table of 60 rows by 8 columns': `|${' h |'.repeat(8)}\n|${' - |'.repeat(8)}\n${`|${' 1 |'.repeat(8)}\n`.repeat(60)}`,
    'a table at the cell budget (382 columns)': table(382),
    'emphasis next to emphasis': '**bold** *italic* ~~strike~~ '.repeat(300),
    'a fenced code block full of tags': `**note**\n\n\`\`\`html\n${'<div>'.repeat(200)}\n${'</div>'.repeat(200)}\n\`\`\``,
    'a tutorial with tags in inline code': 'Close the `` `<div>` `` before the `<b>` **and** the `</div>` of the `<script>` tag. '.repeat(60),
    'HTML comments, <center> and a pull-right division': [
      `<!-- old layout ${'<div class="x"><p>draft<br>\n'.repeat(50)}-->`,
      '',
      '<center>**Live** text.</center>',
      '',
      '<div class="pull-right"><img src="https://steemitimages.com/x.png"></div>',
      '',
      'Text with a `code | span` and a [link](https://a.b/ "title").',
    ].join('\n'),
    'a paragraph, a link, then tags in code spans': 'See [the docs](https://a.b/) for `<td>`, `<tr>`, `<table>` and `</tbody>`.',
  };

  const long: string[] = [];
  for (let i = 0; i < 280; i++) {
    if (i % 5 === 4) long.push(`| a | b |\n| - | - |\n| ${i} | x |`);
    else if (i % 5 === 3) long.push('```\n' + '{"user_id": 12, "tags": ["x", "y"], "meta": {"active": [*args]}}\n'.repeat(9) + '```');
    else {
      long.push(
        `Paragraph ${i} about **something** with *emphasis*, a [link](https://steemit.com/@a/b) and \`code <tag>\` & more. ${'The quick brown fox jumps over the lazy dog while the sun sets behind the quiet hills and the river keeps flowing toward the sea. '.repeat(2)}`,
      );
    }
  }
  HONEST['a mixed long post of 20 KiB and more, under 1500 lines'] = long.join('\n\n');

  it.each(Object.entries(HONEST))('%s', (_label, body) => {
    expect(body.length).toBeGreaterThan(40);
    if (_label.startsWith('a mixed')) {
      expect(body.length).toBeGreaterThanOrEqual(20 * 1024);
      expect(body.split('\n').length).toBeLessThanOrEqual(1500);
    }

    expect(findPathology(body)).toBeNull();

    const result = renderMarkdown(body);
    expect(result.refused).toBeNull();
    expect(result.html.length).toBeGreaterThan(40);
    expect(consoleError).not.toHaveBeenCalled();
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
    const bullets = '- *bold* item\n'.repeat(700);
    const numbered = '1. *bold* item\n'.repeat(700);
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
    // Nothing ever closes: only the number of markers is over.
    ['inline-tokens', '['.repeat(MAX_INLINE_TOKENS), '['.repeat(MAX_INLINE_TOKENS + 1)],
    ['lines', 'a\n'.repeat(MAX_LINES), 'a\n'.repeat(MAX_LINES + 1)],
    ['list-items', '- a\n'.repeat(MAX_LIST_ITEMS), '- a\n'.repeat(MAX_LIST_ITEMS + 1)],
    ['quote-lines', '> a\n'.repeat(MAX_QUOTE_LINES), '> a\n'.repeat(MAX_QUOTE_LINES + 1)],
    // Two rows of n columns count 2n + 3: their pipes, and the rows themselves.
    ['table-cells', table(MAX_TABLE_CELLS / 2 - 2), table(MAX_TABLE_CELLS / 2)],
  ] as const)('%s', (reason, atLimit, over) => {
    expect(reasonOf(atLimit)).toBeNull();
    expect(findPathology(over)).toEqual({ class: reason === 'inline-tokens' || reason === 'table-cells' || reason === 'lines' || reason === 'list-items' || reason === 'quote-lines' ? 'budget' : 'structure', reason });
  });

  it('counts quotes and list markers together', () => {
    expect(findPathology(`${'> '.repeat(32)}${'- '.repeat(32)}x`)).toBeNull();
    expect(reasonOf(`${'> '.repeat(32)}${'- '.repeat(33)}x`)).toBe('container-markers');
  });

  it('counts quoted lines before lines, and list items at every level together', () => {
    expect(reasonOf('> a\n'.repeat(MAX_QUOTE_LINES + 1))).toBe('quote-lines');
    expect(reasonOf('- a\n'.repeat(400) + '  - a\n'.repeat(401))).toBe('list-items');
  });

  it('scans a heading like a paragraph', () => {
    expect(reasonOf(`# ${'<div>'.repeat(MAX_HTML_NESTING_DEPTH + 1)}`)).toBe('html-nesting');
    expect(reasonOf(`# ${']'.repeat(16000)}`)).toBe('inline-resolve-work');
    // A heading is over with its line: what follows is a new paragraph.
    expect(findPathology(`# ${'*'.repeat(40)}\n\n${'*'.repeat(40)}`)).toBeNull();
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
    // At most three of a kind stay on the parser's list, however many are
    // opened. The one that leaves the list is open all the same: the fourth
    // `<b>` has just recreated the three on the list, as elements inside the
    // current division. So the division holds four, one below the other.
    // Checked against parse5: it keeps 5 elements open (div, b, b, b, b).
    expect(nestingOf('<div><b>x</div>'.repeat(8) + '<span>y')).toBe(5);
    // While they are really open, all of them count.
    expect(nestingOf('<b><b><b><b>x')).toBe(4);
  });

  it('leaves a column group open for a template, and nests a table that has none around it', () => {
    // Both were found by the parity suite, where parse5 keeps one element
    // more open than the estimate did.
    expect(nestingOf('<colgroup><template/>')).toBe(2);
    // parse5 keeps 3 (tr, path, table): the `<a>` is foster-parented in the
    // tree, but on the stack it is open on top of the table all the same.
    expect(nestingOf('<tr/><path encoding="text/html"><table a="1" b=2 c><a\nhref="x">')).toBe(4);
    expect(nestingOf('<tr/><path encoding="text/html"><table a="1" b=2 c>')).toBe(3);
  });

  it('does not read the content of a raw-text element as markup', () => {
    expect(nestingOf('<script><div><div></script>')).toBe(1);
    expect(nestingOf('<b><textarea></b></b></textarea>')).toBe(2);
    // In foreign content there is no raw text: the same tags are elements.
    expect(nestingOf('<svg><title><div><div></title>')).toBe(4);
    // Nothing closes `plaintext`.
    expect(nestingOf('<plaintext><div><div>')).toBe(1);
  });
});

describe('the estimate as the pipeline uses it', () => {
  it('reads a paragraph by CommonMark rules: an invalid tag is text, not an element', () => {
    expect(findPathology('x <b:c>'.repeat(300))).toBeNull(); // no letter may follow the name directly
    expect(findPathology('x <b @c=x>'.repeat(300))).toBeNull();
    expect(findPathology('x </b x>'.repeat(300))).toBeNull();
    expect(findPathology('x \\<b>'.repeat(300))).toBeNull(); // escaped
    // The same tags in an HTML block are markup, and nest.
    expect(reasonOf(`<div>\n${'<b @c=x>'.repeat(300)}`)).toBe('html-nesting');
  });

  it('reads a multi-line tag only inside one paragraph', () => {
    // Complete, and open across the paragraphs that follow.
    expect(reasonOf('x <b\nc=y>'.repeat(300))).toBe('html-nesting');
    expect(reasonOf('x <b\nc=y>\n\n'.repeat(300))).toBe('html-nesting');
    // Cut off by a blank line, the tag is not a tag: it is text.
    expect(findPathology('x <b\nc=y\n\n'.repeat(300))).toBeNull();
  });

  it('does not read markup inside fenced code', () => {
    const divs = '<div>'.repeat(300);
    expect(findPathology(`\`\`\`html\n${divs}\n\`\`\``)).toBeNull();
    // A fence inside a blockquote is not closed by an unprefixed fence line,
    // and such a line is not inside it either: the parser sees an HTML block
    // there, which nests.
    expect(reasonOf(`> \`\`\`\n${divs}\n\`\`\``)).toBe('html-nesting');
  });
});

describe('what is text for the browser is not popped', () => {
  it('does not pop an end tag that lies in a code span', () => {
    // Every `</b>` sits in a code span and closes nothing, so every `<b>`
    // stays open for the browser. Measured on this pipeline: 5000 of these
    // take 2.1 s and then fail with a RangeError.
    expect(reasonOf("<b>".repeat(MAX_HTML_NESTING_DEPTH) + "`" + "</b>".repeat(MAX_HTML_NESTING_DEPTH) + "`")).toBeNull();
    expect(reasonOf("<b>".repeat(MAX_HTML_NESTING_DEPTH + 1) + "`" + "</b>".repeat(MAX_HTML_NESTING_DEPTH + 1) + "`")).toBe(
      'html-nesting',
    );
    // The end tags the parser really has still close their elements.
    expect(findPathology("<b>x</b>".repeat(MAX_HTML_NESTING_DEPTH + 1))).toBeNull();
  });

  it('trusts a code span only where every reading of the text has one', () => {
    // The backtick is in the title of a link for the parser, so it opens no
    // code span there and the divisions are real.
    expect(reasonOf("[a](x '`')" + '<div>'.repeat(MAX_HTML_NESTING_DEPTH + 1))).toBe('html-nesting');
    expect(reasonOf("[a](x '`')" + ']'.repeat(16000))).toBe('inline-resolve-work');
    // Where the readings agree, the tags of a code span are text.
    expect(findPathology('`<div>`'.repeat(300))).toBeNull();
    expect(findPathology('See [the docs](https://a.b/) for ' + '`<div>`'.repeat(300))).toBeNull();
  });
});
