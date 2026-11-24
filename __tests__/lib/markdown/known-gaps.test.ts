// @vitest-environment node
/**
 * Known gaps of the pre-parse guard, written as tests.
 *
 * `findPathology` is a heuristic prefilter, not a security boundary. It
 * refuses, in bounded time, the pathological shapes it recognises. It does
 * not bound what it lets through: bodies exist that pass the guard and still
 * take the pipeline seconds, or make it produce megabytes of HTML. This file
 * holds the ones that reviews have shown so far, and it holds them the way a
 * test can:
 *
 * - The first group asserts what SHOULD hold and does not hold today. Each of
 *   its cases is marked `it.fails`: the case passes only while the body still
 *   slips through the guard. The day a guard refuses one of these bodies, its
 *   case starts to pass, and vitest reports that `it.fails` as a failure.
 *   That is the signal: remove `.fails` and keep the case.
 * - The second group asserts what holds today and must go on holding: bodies
 *   the guard refuses, several of which take the unguarded pipeline seconds.
 *   They are ordinary cases.
 *
 * A case of the first group also passes when the guard throws on the body
 * instead of answering, so one ordinary case checks that the guard answers
 * every gap body without throwing.
 *
 * Every verdict here was taken in vitest, which loads bytemd's ESM build (the
 * build production takes). A script run by tsx that imports a `.ts` file of
 * this repository loads the CommonJS build instead and measures something
 * else; see "Measurement caveat" in docs/BYTEMD_INTEGRATION_STATUS.md.
 *
 * The times and output sizes in the titles are order-of-magnitude references
 * from the reviews of 2026-11-25, each with its source:
 *
 * - "(external review, pure ESM)": the external review's own table, a cold
 *   render of a pure ESM bundle on the development machine;
 * - "(reviewer's harness)": that bundle and that harness
 *   (`scripts/.cache/external/e.mjs`), run once per body on the development
 *   machine under a load average of about 7.5;
 * - "(vitest)": one render in vitest on that machine under the same load.
 *   The external review measured the first five round-4 bodies at 3.0 s to
 *   7.6 s.
 * No case asserts a time: under load the times move by a factor of two. The
 * two render cases assert the output size only.
 *
 * The bodies are copied from the scripts of the reviews, not written again
 * from their descriptions. Where a review gave a body a name, the title keeps
 * that name. (One is corrected: the body the external review calls
 * `a__ x32768` repeats `a__` 21000 times.) Four families:
 *
 * - Round 4 (`r4-`). The guard reads the lines with a block model of its own,
 *   and wherever that model disagrees with CommonMark about where a block
 *   ends, the lines behind the block are not scanned at all. A paragraph of
 *   16383 emphasis markers sits there, uncounted, and takes seconds.
 *   `block-parity.test.ts` checks the model against the parser on the bodies
 *   it builds; these bodies lie outside that table.
 * - Delimiters nested under the token cap. The caps count markers; what the
 *   parser spends depends on how the markers nest.
 * - Containers under their line budgets, and one body of nothing but tabs.
 * - Output amplification. No rule of the guard looks at the size of the HTML.
 *
 * Two kinds of body of the reviews are NOT cases here:
 *
 * - `> ` + `a* ` x 1024 + a setext line + `a* ` x 1024. The guard splits the
 *   paragraph in two where the parser keeps it whole: a gap in precision, not
 *   in time (141 ms to 265 ms). It is listed in the status document only.
 * - Bodies the guard passes that render in 10 ms to 220 ms with a small
 *   output: `nest <div> x256` (at the nesting limit), `nest <a> x1024`
 *   (adoption), `misnest <b><p> x512 then </b> x512`, `nobr x1024`, and `a`
 *   + 60000 spaces + `b` (37 ms to 97 ms on the ESM path). The guard is right
 *   to pass them: a refusal would be a false one.
 */
import { describe, expect, it } from 'vitest';

import { findPathology, type PathologyClass } from '@/lib/markdown/pathology';
import { renderMarkdown, type RenderResult } from '@/lib/markdown/render';

/** `unit` repeated `count` times. */
const n = (unit: string, count: number): string => unit.repeat(count);

/** One paragraph of 16383 emphasis markers: what a hidden paragraph holds. */
const STARS = n('a* ', 16383);

/** The formatting tags of the reviewer's tag-soup body: inline elements of the old font style. */
const FORMAT_TAGS = ['b', 'big', 'code', 'em', 'font', 'i', 's', 'small', 'strike', 'strong', 'tt', 'u'];

/** An HTML block: `<div><p>`, the formatting tags eight times each with distinct attributes, then `<p>x` x `count`. */
const tagSoup = (count: number): string =>
  '<div><p>' +
  FORMAT_TAGS.map((tag) => Array.from({ length: 8 }, (_, i) => `<${tag} a${i}>`).join('')).join('') +
  n('<p>x', count);

/** One body and the label of its case. */
type Body = readonly [label: string, body: string];

/** Bodies that pass the guard although the pipeline takes seconds on them, or makes a great deal of HTML. */
const GAPS: ReadonlyArray<Body> = [
  // --- round 4: a paragraph hidden behind a block the parser has closed
  ['r4-1 indented code, -, <b>: new pipeline 11.9 s, 49 KB of HTML (vitest)', '    x\n-\n<b>\n' + STARS],
  ['r4-2 - g / > / ] / fence: new pipeline 10.6 s, 49 KB of HTML (vitest)', '- g\n  >\n]\n    ```' + STARS],
  ['r4-3 indented, <b>, fence: new pipeline 10.0 s, 49 KB of HTML (vitest)', '    x\n<b>\n```\n\n' + STARS],
  [
    'r4-3, the indented code replaced by a thematic break read as an item: new pipeline 4.4 s, 49 KB of HTML (vitest)',
    '- --\n<b>\n```\n\n' + STARS,
  ],
  ['r4-4 </pre>, fence: new pipeline 6.1 s, 49 KB of HTML (vitest)', '</pre>\n```\n\n' + STARS],
  ['r4-5a <div> CR CR: new pipeline 9.2 s, 49 KB of HTML (vitest)', '<div>\r\r' + STARS],
  ['r4-5b - a CR CR x8000: new pipeline 6.4 s, 160 KB of HTML (vitest)', n('- a\r\r', 8000)],
  ['r4-6 > ```, > TAB```, > payload: new pipeline 4.2 s, 49 KB of HTML (vitest)', '> ```\n> \t```\n> ' + STARS],
  ['r4-7a >x<div>: new pipeline 7.6 s, 49 KB of HTML (vitest)', '>x<div>\n> ' + STARS],
  ['r4-7b >x```: new pipeline 9.9 s, 49 KB of HTML (vitest)', '>x```\n> ' + STARS],
  // --- whitespace: no rule counts it
  [
    "a + 65000 tabs + b: new pipeline 270 ms, 65 KB of HTML (reviewer's harness)",
    'a' + n('\t', 65000) + 'b',
  ],
  // --- delimiters nested under the token cap
  [
    "emph nest 512 pairs (tok 1024): new pipeline 480 ms, 6.7 KB of HTML (reviewer's harness)",
    n('*a ', 512) + n('a* ', 512),
  ],
  [
    'emph nest 768 pairs (tok 1536): new pipeline 0.61 s, 10 KB of HTML (external review, pure ESM)',
    n('*a ', 768) + n('a* ', 768),
  ],
  [
    "strike nest 768 pairs (tok 1536): new pipeline 570 ms, 12 KB of HTML (reviewer's harness)",
    n('~~a ', 768) + n('a~~ ', 768),
  ],
  [
    'emph run nest 30x64 (tok 60): new pipeline 0.80 s, 16 KB of HTML (external review, pure ESM)',
    n(' ' + n('*', 64) + 'a', 30) + n('a' + n('*', 64) + ' ', 30),
  ],
  // --- containers under their line budgets
  [
    'bq 64 deep x 990 lines: new pipeline 0.73 s, 7.7 KB of HTML (external review, pure ESM)',
    n(n('>', 64) + 'a\n', 990),
  ],
  [
    'bq reopen 64 x 480 (blank between): new pipeline 1.8 s, 834 KB of HTML (external review, pure ESM)',
    n(n('>', 64) + 'a\n\n', 480),
  ],
  [
    "bq reopen 16 x 990 (blank between): new pipeline 1.4 s, 437 KB of HTML (reviewer's harness)",
    n(n('>', 16) + 'a\n\n', 990),
  ],
  [
    'indent ladder 128 lists + 1800 lazy: new pipeline 0.72 s, 14 KB of HTML (external review, pure ESM)',
    Array.from({ length: 128 }, (_, k) => n('  ', k) + '- a\n').join('') + n('b\n', 1800),
  ],
  // --- output amplification
  [
    'fmt 12 tags x8 + <p>x x2700: new pipeline 1.7 s, 1.66 MB of HTML (external review, pure ESM)',
    tagSoup(2700),
  ],
  [
    "fmt 12 tags x8 + <p>x x700: new pipeline 0.61 s, 431 KB of HTML (reviewer's harness)",
    tagSoup(700),
  ],
];

/**
 * The cap on the HTML of one body that the external review proposes for
 * isolated rendering: the larger of 256 KiB and eight times the body. The tag
 * soup is 11.5 KB, so the cap is the 256 KiB.
 */
const OUTPUT_CAP = 256 * 1024;

let soup: RenderResult | null = null;

/** The tag soup of 2700, rendered once: the render takes well over a second, and two cases read it. */
function renderSoup(): RenderResult {
  soup ??= renderMarkdown(tagSoup(2700));
  return soup;
}

describe('known gaps: bodies the guard should refuse and lets through', () => {
  it('answers every gap body without throwing (a throw would make an it.fails case pass)', () => {
    for (const [label, body] of GAPS) {
      expect(() => findPathology(body), label).not.toThrow();
    }
  });

  for (const [label, body] of GAPS) {
    it.fails(label, () => {
      expect(findPathology(body)).not.toBeNull();
    });
  }

  // The same body at the render level. Only the output is asserted: a time
  // assertion moves with the load of the machine.
  it.fails('fmt 12 tags x8 + <p>x x2700: renderMarkdown must refuse it (new pipeline 1.7 s, external review, pure ESM)', () => {
    expect(renderSoup().refused).not.toBeNull();
  });

  it.fails('fmt 12 tags x8 + <p>x x2700: the HTML must stay under 256 KiB (1.66 MB today, external review, pure ESM)', () => {
    expect(renderSoup().html.length).toBeLessThan(OUTPUT_CAP);
  });
});

/** One body, the class the guard refuses it as, and the label of its case. */
type Refused = readonly [label: string, body: string, kind: PathologyClass];

/** Bodies the guard refuses today. The reason behind each is the one measured on 2026-11-25, for information. */
const REFUSED: ReadonlyArray<Refused> = [
  // --- reference points of the reviews, at the cap of the paragraph rule
  ['a* x3072 (orch: 157ms)', n('a* ', 3072), 'structure'], // inline-resolve-work
  ['] x3072 (orch: 170ms)', n(']', 3072), 'structure'], // inline-resolve-work
  // --- delimiters nested at the token cap
  [
    'emph nest 1536 pairs (tok 3072), unguarded 2.1 s (external review, pure ESM)',
    n('*a ', 1536) + n('a* ', 1536),
    'structure', // inline-resolve-work
  ],
  [
    'image nest 1000 levels (tok 3000), unguarded 2.6 s (external review, pure ESM)',
    n('![', 1000) + 'a' + n('](x)', 1000),
    'structure', // inline-resolve-work
  ],
  ['link nest 1500 levels (tok 3000)', n('[', 1500) + 'a' + n('](x)', 1500), 'structure'], // inline-resolve-work
  [
    'emph run nest 100x64 (tok 200), unguarded 5.4 s then a stack overflow (external review, pure ESM)',
    n(' ' + n('*', 64) + 'a', 100) + n('a' + n('*', 64) + ' ', 100),
    'budget', // emphasis-markers-total
  ],
  // --- containers over their budgets
  ['list markers 8/line x 800 lines', n(n('- ', 8) + 'a\n', 800), 'budget'], // list-items
  [
    'list markers 32/line x 800 lines, unguarded 9.9 s (external review, pure ESM)',
    n(n('- ', 32) + 'a\n', 800),
    'budget', // list-items
  ],
  ['bq+list alternate 62/line x 500', n(n('> - ', 31) + 'a\n\n', 500), 'budget'], // list-items
  // --- tables
  ['table 0 pipes a/-/x x1990', 'a\n-\n' + n('x\n', 1990), 'budget'], // table-cells
  ['table 2 cols, 1990 pipe-less rows', 'a|b\n-|-\n' + n('x\n', 1990), 'budget'], // table-cells
  [
    'table 30 cols, 1990 pipe-less rows',
    '|' + n('h|', 30) + '\n|' + n('-|', 30) + '\n' + n('x\n', 1990),
    'budget', // table-cells
  ],
  [
    'table 700 cols, 1200 pipe-less rows, unguarded 16.8 s and 8.4 MB (external review, pure ESM)',
    '|' + n('h|', 700) + '\n|' + n('-|', 700) + '\n' + n('x\n', 1200),
    'budget', // table-cells
  ],
  // --- element nesting
  ['nest <div> x1024', n('<div>', 1024) + 'x', 'structure'], // html-nesting
  ['nest <div> x3072', n('<div>', 3072) + 'x', 'structure'], // html-nesting
  ['nest <b> x1024', n('<b>', 1024) + 'x', 'structure'], // html-nesting
  ['nest <b> x3072', n('<b>', 3072) + 'x', 'structure'], // html-nesting
  ['nest inline q <b> x1024', 'q ' + n('<b>', 1024) + 'x', 'structure'], // html-nesting
  ['nest <table><tr><td> x340', n('<table><tr><td>', 340) + 'x', 'structure'], // html-nesting
  ['nest <ul><li> x512', n('<ul><li>', 512) + 'x', 'structure'], // html-nesting
  ['misnest <b>x512 <div> </b>x512 x2', n('<b>', 300) + n('<div>', 100) + n('</b>', 600), 'structure'], // html-nesting
  ['raw html post <p> + <b> x1000', '<p>a</p>' + n('<b>', 1000), 'structure'], // html-nesting
  // --- the first list of the external review. Earlier reviews had measured
  // these unguarded; their times are in the comments of
  // lib/markdown/pathology.ts and in pathology.test.ts.
  ['plain 64K', n('lorem ipsum dolor sit amet\n', 2400), 'budget'], // lines
  ['<b> x21800', n('<b>', 21800), 'structure'], // html-nesting
  ['> x32768', n('> ', 32768), 'structure'], // quote-markers
  ['<div> x10000 nested', n('<div>', 10000), 'structure'], // html-nesting
  ['] x16000', n(']', 16000), 'structure'], // inline-resolve-work
  ['[ x65536', n('[', 65536), 'budget'], // inline-tokens
  ['a* x16383', n('a* ', 16383), 'structure'], // inline-resolve-work
  ['a__ x21000', n('a__', 21000), 'budget'], // inline-tokens
  ['- a blank x8000', n('- a\n\n', 8000), 'budget'], // list-items
  ['- a x13010', n('- a\n', 13010), 'budget'], // list-items
  ['> a x16383', n('> a\n', 16383), 'budget'], // quote-lines
  ['a\\n x30000', n('a\n', 30000), 'budget'], // lines
  ['# a x12000', n('# a\n', 12000), 'budget'], // lines
  ['1. x16384 one line', n('1. ', 16384), 'structure'], // container-markers
  ['> x65536 one line', n('>', 65536), 'structure'], // quote-markers
  ['table 2 cols x 8000 rows', '|a|b|\n|-|-|\n' + n('|x|y|\n', 8000), 'budget'], // lines
  ['x<? x16000', n('x<?', 16000), 'budget'], // inline-tokens
  ['x<br> x12000', n('x<br>', 12000), 'budget'], // inline-tokens
  ['`<b>`</b>` x7281', n('`<b>`</b>', 7281), 'budget'], // inline-tokens
  ['~a~ x16384', n('~a~', 16384), 'structure'], // inline-resolve-work
];

describe('refused today, and must stay refused', () => {
  for (const [label, body, kind] of REFUSED) {
    it(label, () => {
      const verdict = findPathology(body);
      expect(verdict, label).not.toBeNull();
      expect(verdict?.class, label).toBe(kind);
    });
  }
});
