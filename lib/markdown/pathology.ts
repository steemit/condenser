/**
 * Pre-parse guard against pathological input.
 *
 * The remark/rehype pipeline is not linear in the size of its input. Some
 * shapes of text make it super-linear, or recurse until the call stack is
 * exhausted, and every one of them blows up before any plugin runs: inside
 * micromark's parser, or inside rehype-raw's HTML re-parse. A post body is
 * attacker-controlled and is rendered in every visitor's browser tab, so a
 * 64 KiB comment can freeze the page for half a minute. Measured on this
 * pipeline, unguarded:
 *
 *   `<b>` x 21800 (64 KiB)                   22 s, then RangeError
 *   `> ` x 32768 (64 KiB)                   6.9 s, then RangeError
 *   `<div>` x 50000, nested                  28 s, then RangeError
 *   `]` x 16000                              6.6 s
 *   `a* ` x 5000, all in one paragraph       0.66 s
 *   one table of 1600 cells                  0.37 s
 *   `- a` and a blank line, x 8000           5.4 s
 *
 * The last of those is honest content, merely long: the parser is
 * super-linear in the size of a block structure too. So the guard decides
 * two things from the raw text alone, in linear time, before the parser sees
 * a single character (and it is meant to run again on the submit side):
 *
 * - whether a body has a shape that makes the pipeline super-linear. These
 *   are the `structure` rules: a hostile or broken shape that no honestly
 *   written post has;
 * - whether a body is over a size that this renderer handles in bounded
 *   time. These are the `budget` rules: a long but honest post may well be.
 *   A budget that is per paragraph, or per table, has a total for the whole
 *   body as well: what one paragraph costs, a hundred paragraphs that are
 *   each just inside their budget cost a hundred times.
 *
 * A refused body is not rendered by this pipeline at all. What becomes of it
 * is for the caller: a body over a budget is still a good post, and the
 * reading side renders it another way.
 *
 * It is an estimate, not a parser, and it errs towards refusing. Nowhere may
 * it err the other way, towards seeing less nesting than the browser will
 * build, so the inline scan counts a start tag wherever one may be real and
 * never pops an end tag that may be text for the browser (see
 * {@link scanInlineUnit}). What that costs is listed under "Known
 * limitations".
 *
 * Complexity: every rule is a single pass without backtracking. The lines are
 * read once, then each inline unit once. No line, delimiter run or tag is
 * visited more than a constant number of times, every element is pushed and
 * popped at most once, and no regular expression with a nested quantifier is
 * used anywhere. Every forward search of an inline unit (for the `-->` of a
 * comment, the `"` of an attribute value, the `>` of a tag, the end tag of a
 * raw-text element) is bounded to the unit it starts in, and what it found
 * is remembered whether it found anything or not (see {@link Finder}): an
 * unterminated opener costs the rest of its unit once, not once per opener,
 * and one that is closed far away costs no more than one closed next to it.
 * Raw markup (an HTML block, a raw-HTML post) is read with a search over the
 * whole body, where a token may run past the end of a block, remembered the
 * same way.
 *
 * Known limitations: none of this is modelled, and each only makes the
 * guard refuse more, never less.
 *
 * - Links. The guard does not decide what is a link. It marks where the
 *   destination or the title of one may lie: from the `(` behind a `]` to the
 *   `)` a quick reading finds, or to the end of the unit when it finds none.
 *   The end tags in there pop nothing, whether or not the parser makes a link
 *   of it. So a paragraph with more than {@link MAX_HTML_NESTING_DEPTH} levels
 *   of elements that are closed only inside such a stretch is refused,
 *   although the browser closes them. End tags behind a well-formed link pop
 *   as usual. Three things follow from not deciding:
 *   - That reading has a budget of the length of the unit. Once the links of
 *     a unit have read that much, every link behind them runs to the end of
 *     the unit.
 *   - A link reference definition (`]:`) whose line carries a quote
 *     character has a title that may run over the lines behind it, so its
 *     stretch runs to the end of the unit.
 *   - Where only this reading makes the nesting go over the limit, the body
 *     is refused as over a budget (`html-nesting-uncertain`), not as a
 *     hostile structure: `[a](x y) <b>x</b> <i>y</i>` is no link, and 129
 *     paragraphs of it are refused, although they nest two deep.
 * - Code spans, where the readings of the text disagree. A backtick inside
 *   the destination or the title of a link, inside an autolink or inside a
 *   tag opens a code span for a reading that makes nothing of that construct,
 *   and none for one that does; a pipe outside a row of a table ends a code
 *   span for one reading only. The readings are kept side by side, and the
 *   tags of a code span are counted for as long as the readings are not all
 *   inside the same code span. Text is inside code for certain only when
 *   every reading has a span around it that a backtick string closes behind
 *   it, a string that is live for every reading. A string that lies in a
 *   link, an autolink, a comment or a tag closes nothing for certain, so a
 *   tag behind such a string may be counted although every reading has it in
 *   a code span. More readings than eight are not told apart: from there on
 *   nothing is inert for certain, and any two strings of one length in the
 *   unit may be a pair.
 * - HTML blocks. A block goes on only inside the containers it opened in,
 *   and what a token of it left open (a raw-text element without its end
 *   tag, a tag that never closes, a comment) is over where the block ends.
 *   The browser goes on reading it as swallowed where the block behind is a
 *   sibling of it inside one element, so such a body may be refused for
 *   nesting that the browser never builds.
 * - Indented code is read as a paragraph, fenced code is skipped: an
 *   indented code block inside a list item or a quote as well.
 * - Delimiters are counted inside code spans and tags as well: the resolve
 *   work of a paragraph is an upper bound.
 *
 * The numbers are in __tests__/lib/markdown/pathology.test.ts, the nesting
 * estimate is checked against parse5 itself in
 * __tests__/lib/markdown/nesting-parity.test.ts, and the block structure the
 * lines are read with is checked against the markdown parser itself in
 * __tests__/lib/markdown/block-parity.test.ts: wherever the two disagree
 * about where a block ends, a paragraph can hide behind the block.
 */
import { isRawHtmlPost } from '@/lib/markdown/raw-html-post';

// ───────────────────────────── Thresholds ─────────────────────────────

/**
 * Every rule belongs to one of two classes ({@link PathologyClass}).
 *
 * - A `structure` threshold names a shape that no honestly written post has:
 *   a line of 65 blockquote markers, 300 nested tags, a run of 65 asterisks.
 *   Content that breaks one is hostile or broken, and going over it is what
 *   makes the pipeline super-linear.
 * - A `budget` threshold caps a size that a long but honest post may well
 *   reach: its number of lines, of list items, of table cells. The pipeline
 *   is not linear in those sizes either (measured: 8000 list items take
 *   5.4 s), so a budget is not a judgement on what the author wrote. A post
 *   over a budget is merely too long for this renderer.
 *
 * The budgets are calibrated on one criterion, one dimension at a time: a
 * body that is at the limit of one of them renders in about 250 ms at most,
 * as a single cold render of the ESM build (the path vitest and production
 * take), in a body of up to 64 KiB. They are not calibrated against each
 * other. A long post that is near the limit of several at once is slower:
 * measured cold on the development machine, up to about 0.9 s. The numbers
 * quoted below are the minimum of three cold runs on that machine, which was
 * under a load average of about 4 at the time.
 */

/**
 * Maximum blockquote markers (`>`) at the start of one line.
 *
 * Each marker opens one nested blockquote, and the parser recurses once per
 * level. 64 levels of quotation is far beyond anything written by hand (an
 * e-mail forwarding chain reaches five or six), while several hundred levels
 * still render in well under 50 ms.
 */
export const MAX_QUOTE_MARKERS_PER_LINE = 64;

/**
 * Maximum container markers (blockquotes plus list-item markers) at the start
 * of one line.
 *
 * A line's container prefix fully determines that line's nesting depth, so
 * this rule is exact. It also catches nesting written without indentation,
 * which the quote rule misses on its own: `> - > - > -` and `1. 1. 1. 1.` nest
 * one level per marker, exactly like `> > > >`.
 */
export const MAX_CONTAINER_MARKERS_PER_LINE = 64;

/**
 * Maximum indentation of a line, in columns (a tab advances to the next
 * multiple of four).
 *
 * Indentation is the other way to nest: every list level costs two to four
 * columns, so a line's indentation bounds how deep in the document that line
 * can possibly sit. 256 columns allow 64 levels of four-space nesting; no
 * hand-written or tool-generated post gets near a quarter of that.
 */
export const MAX_INDENT_COLUMNS = 256;

/**
 * Maximum nesting depth of HTML elements.
 *
 * rehype-raw re-parses every tag the author wrote and then walks the result
 * recursively, and deep trees are slow to build well before they overflow.
 * Depth is counted with the end-tag rules a browser applies (see
 * {@link NestingTracker}), so ordinary sloppy HTML (`<li>` without `</li>`,
 * `<p>` without `</p>`) does not accumulate. Real posts top out around twenty
 * levels of layout tables and divisions; several hundred levels still render
 * in well under 50 ms.
 */
export const MAX_HTML_NESTING_DEPTH = 256;

/**
 * Maximum length of one run of emphasis markers (`*`, `_`, `~`).
 *
 * Two facing runs of the same marker nest one `em`/`strong` per character, so
 * `*****…*text*…*****` reaches a depth equal to the run length with just two
 * delimiters in the paragraph. Divider lines use three to six markers.
 */
export const MAX_DELIMITER_RUN_LENGTH = 64;

/**
 * Maximum number of emphasis markers, over a whole body, in the runs that
 * can close emphasis.
 *
 * The limit above bounds one run. What a run costs is what it closes: two
 * facing runs of 64 markers nest 64 elements in a paragraph, at about 2 ms a
 * paragraph. Measured cold: 80 such paragraphs (5120 closing markers) take
 * 195 ms, 100 of them (13 KiB) 238 ms, and 500 of them 818 ms. Markers that
 * close nothing are nearly free (500 paragraphs of a lone run of 64 markers:
 * 138 ms).
 *
 * An honestly written post stays far below it: a `**bold**` spends two.
 */
export const MAX_EMPHASIS_MARKERS_TOTAL = 5120;

/**
 * Budget for micromark's inline resolvers per paragraph: resolver triggers
 * times the number of inline tokens around them.
 *
 * Every emphasis sequence that can close, and every `]`, walks backwards
 * through the paragraph's events until it finds its partner, or the start of
 * the paragraph when there is none. The work is therefore proportional to
 * (closers + closing brackets) x tokens. The budget is calibrated from
 * measurement: its worst case, nothing ever matching, costs about 50 ms.
 *
 * An ordinary paragraph stays four to five orders of magnitude below it. The
 * same delimiters spread over a hundred paragraphs, a list or a table are
 * linear and harmless, which is why the budget is per paragraph.
 */
export const MAX_INLINE_RESOLVE_WORK = 2_000_000;

/**
 * The same budget, for a whole body: the resolver work of every paragraph
 * added up.
 *
 * Paragraphs add up. Eleven paragraphs of `a* ` x 1414, each just inside the
 * budget above (47 KiB), take 680 ms cold. Measured cold: two of them (4.0
 * million) take 152 ms, three (6.0 million) 210 ms and four (8.0 million)
 * 279 ms.
 *
 * The budget stops at two paragraphs on purpose. Past that, a body of such
 * paragraphs runs into {@link MAX_INLINE_TOKENS_TOTAL} first, unless its
 * markers are crowded into few paragraphs; this rule is what names the
 * reason there. Brackets are cheaper than their work says (two paragraphs of
 * `]` x 1400, 3.9 million: 77 ms), so emphasis sets the figure.
 */
export const MAX_INLINE_RESOLVE_WORK_TOTAL = 4_000_000;

/**
 * Maximum number of special characters in one paragraph, list item or table
 * row: `[`, `]`, `_`, `*`, `~`, `<`, backtick, `&`, `\`, `!`, with a run of
 * emphasis markers as one and every backtick character on its own.
 *
 * The resolver budget above counts what closes, and only closers walk back
 * through the paragraph. The tokens themselves are not free either: a
 * paragraph of 65536 `[` and nothing else has no closer at all and still
 * takes 5.9 s, and one of `a__` x 32768 takes 1.3 s. Measured cold, in one
 * paragraph: `[` x 3072 take 185 ms, `[` x 2048 124 ms and `[` x 4096
 * 298 ms; `a__` x 4096 take 146 ms. 3072 keeps the worst shape measured under
 * the 250 ms criterion.
 *
 * A paragraph has to be remarkably dense to get near it: 3072 tokens are a
 * thousand links, or fifteen hundred code spans, in one paragraph.
 */
export const MAX_INLINE_TOKENS = 3072;

/**
 * The same limit, for a whole body.
 *
 * The limit above is per paragraph, and the cost is not: an inline tag costs
 * the pipeline about 40 microseconds wherever it stands. Measured cold: two
 * paragraphs of `x<br>` x 1536 (3072 markers) take 188 ms, three paragraphs
 * of 1500 (4500 markers) 276 ms, and four (6000 markers) 319 ms.
 */
export const MAX_INLINE_TOKENS_TOTAL = 3072;

/**
 * Maximum number of lines in a body, blank lines included.
 *
 * Every line that carries a block of its own costs a block: a heading, a
 * paragraph, a list item, a row of a table. At 2000 lines that costs 236 ms
 * (`# a` x 2000, the most expensive line measured) and 195 ms (`a` and a
 * blank line, 1000 times). At 3000 headings it is 372 ms and at 4000, 420 ms.
 * The budget also bounds the number of paragraphs, at about half of it.
 */
export const MAX_LINES = 2000;

/**
 * Maximum number of list items in a body, at every nesting level together.
 *
 * List items cost more than any other block, and not linearly: `- a` and a
 * blank line, 800 times, take 233 ms cold and 800 tight items (`- a` per
 * line) 196 ms; at 1000 items the same lists take 319 ms, at 2000 620 ms,
 * at 4000 1.27 s and at 8000 5.4 s.
 */
export const MAX_LIST_ITEMS = 800;

/**
 * Maximum number of lines that carry a blockquote marker, at every nesting
 * level together.
 *
 * A quoted line costs 148 ms per thousand cold (`> a` x 1000), 207 ms at
 * 2000, 271 ms at 3000 and 362 ms at 4000. The budget equals the line budget:
 * a quoted line is not more expensive than a heading, so the line budget
 * already keeps it in reach of the criterion. It is kept as a rule of its
 * own so that quote lines have a ceiling even if the line budget is raised.
 */
export const MAX_QUOTE_LINES = 2000;

/**
 * Maximum number of cells in one table.
 *
 * The GFM table extension files each cell away by scanning the cells filed so
 * far, which is quadratic in the number of cells: 1600 cells take 0.37 s and
 * a 64 KiB body of cells minutes. 768 cells take 110 ms (384 columns by two
 * rows) and 140 ms (48 rows by 16 columns), cold. A table with more cells
 * than that is not a table in a post any more, but it is a size, not a
 * hostile shape, hence a budget.
 */
export const MAX_TABLE_CELLS = 768;

/**
 * Maximum number of cells in all the tables of a body together.
 *
 * The limit above is per table, and a body may have many. Measured cold: two
 * tables at that limit take 211 ms when they are wide (382 columns) and
 * 214 ms when they are tall (40 rows of 16), and three wide ones 314 ms.
 */
export const MAX_TABLE_CELLS_TOTAL = 1536;

/**
 * Maximum number of tags in the raw markup of a body: in HTML blocks and in
 * a raw-HTML post together.
 *
 * The nesting rule reads the tags of raw markup, and nothing else limited
 * them: `<div>` and then `<p>` x 21800 (64 KiB) nests two deep and renders in
 * 266 ms. What a tag costs depends on what surrounds it. In an HTML block,
 * `<p>` x 12000 render in 165 ms and x 20000 in 222 ms. In a raw-HTML post
 * the same tags cost more, and not linearly: `<p>x` x 4000 take 118 ms and
 * x 5000 276 ms, and `x<br>` x 5000 take 111 ms and x 6000 252 ms. The budget
 * keeps the worst shape measured under the criterion. A tag inside a
 * paragraph is not raw markup and has its own total,
 * {@link MAX_INLINE_TOKENS_TOTAL}.
 */
export const MAX_RAW_MARKUP_TAGS_TOTAL = 4096;

// ───────────────────────────── Public API ─────────────────────────────

/** Which of the two kinds of rule a body breaks; see the thresholds. */
export type PathologyClass = 'structure' | 'budget';

export type PathologyReason =
  | 'quote-markers'
  | 'container-markers'
  | 'indent-columns'
  | 'html-nesting'
  | 'delimiter-run'
  | 'inline-resolve-work'
  | 'inline-tokens'
  | 'lines'
  | 'list-items'
  | 'quote-lines'
  | 'table-cells'
  | 'inline-tokens-total'
  | 'inline-resolve-work-total'
  | 'emphasis-markers-total'
  | 'table-cells-total'
  | 'html-nesting-uncertain'
  | 'raw-tags-total';

/** The first rule a body breaks. */
export interface Pathology {
  class: PathologyClass;
  reason: PathologyReason;
}

const REASON_CLASS: Record<PathologyReason, PathologyClass> = {
  'quote-markers': 'structure',
  'container-markers': 'structure',
  'indent-columns': 'structure',
  'html-nesting': 'structure',
  'delimiter-run': 'structure',
  'inline-resolve-work': 'structure',
  'inline-tokens': 'budget',
  lines: 'budget',
  'list-items': 'budget',
  'quote-lines': 'budget',
  'table-cells': 'budget',
  'inline-tokens-total': 'budget',
  'inline-resolve-work-total': 'budget',
  'emphasis-markers-total': 'budget',
  'table-cells-total': 'budget',
  'html-nesting-uncertain': 'budget',
  'raw-tags-total': 'budget',
};

const REASON_TEXT: Record<PathologyReason, string> = {
  'quote-markers': `more than ${MAX_QUOTE_MARKERS_PER_LINE} blockquote markers on a line`,
  'container-markers': `more than ${MAX_CONTAINER_MARKERS_PER_LINE} nested list or quote markers on a line`,
  'indent-columns': `a line indented by more than ${MAX_INDENT_COLUMNS} columns`,
  'html-nesting': `HTML nested deeper than ${MAX_HTML_NESTING_DEPTH} elements`,
  'delimiter-run': `a run of more than ${MAX_DELIMITER_RUN_LENGTH} emphasis markers`,
  'inline-resolve-work':
    'a paragraph with more emphasis or link delimiters than the parser handles in linear time',
  'inline-tokens': `a paragraph with more than ${MAX_INLINE_TOKENS} emphasis, link, code or HTML markers`,
  lines: `more than ${MAX_LINES} lines`,
  'list-items': `more than ${MAX_LIST_ITEMS} list items`,
  'quote-lines': `more than ${MAX_QUOTE_LINES} quoted lines`,
  'table-cells': `a table with more than ${MAX_TABLE_CELLS} cells`,
  'inline-tokens-total': `more than ${MAX_INLINE_TOKENS_TOTAL} emphasis, link, code or HTML markers in the body`,
  'inline-resolve-work-total':
    'paragraphs with more emphasis or link delimiters together than the parser handles in linear time',
  'emphasis-markers-total': `more than ${MAX_EMPHASIS_MARKERS_TOTAL} emphasis markers that can close emphasis in the body`,
  'table-cells-total': `tables with more than ${MAX_TABLE_CELLS_TOTAL} cells together`,
  'html-nesting-uncertain': `more than ${MAX_HTML_NESTING_DEPTH} elements open unless the text that may be code, a link or a comment is not markup`,
  'raw-tags-total': `more than ${MAX_RAW_MARKUP_TAGS_TOTAL} tags in the raw markup of the body`,
};

/** A sentence describing `reason`, for logs. */
export function describePathology(reason: PathologyReason): string {
  return REASON_TEXT[reason];
}

/**
 * The first rule `body` breaks, or null when it breaks none.
 *
 * The scan stops at the first violation, so a hostile body is rejected after
 * little more of it has been read than the threshold itself requires.
 */
export function findPathology(body: string): Pathology | null {
  const shape = scanLines(body);
  const reason = shape.reason || scanContent(body, shape.lines);
  return reason ? { class: REASON_CLASS[reason], reason } : null;
}

/**
 * Depth of the deepest element nesting in an HTML fragment, as the nesting
 * rule of the guard estimates it.
 *
 * Exposed for tests: the element rules are the part of the guard that is
 * easiest to get subtly wrong, and a test needs the number, not only whether
 * it is over the limit.
 */
export function estimateHtmlNesting(html: string): number {
  const tracker = new NestingTracker(Infinity);
  const search = new Finder(html, 0, html.length);
  scanRawMarkup(
    html,
    0,
    html.length,
    html.length,
    search,
    new Finder(html.toLowerCase(), 0, html.length),
    true,
    () => tracker.foreign,
    (token) => tracker.take(token, html),
    null,
    () => false,
  );
  return tracker.maxDepth;
}

// ───────────────────────── Character classification ─────────────────────────

const TAB = 0x09;
const LF = 0x0a;
const CR = 0x0d;
const SPACE = 0x20;
const EXCLAMATION = 0x21;
const DOUBLE_QUOTE = 0x22;
const HASH = 0x23;
const AMPERSAND = 0x26;
const SINGLE_QUOTE = 0x27;
const LEFT_PAREN = 0x28;
const RIGHT_PAREN = 0x29;
const ASTERISK = 0x2a;
const PLUS = 0x2b;
const DASH = 0x2d;
const DOT = 0x2e;
const SLASH = 0x2f;
const COLON = 0x3a;
const LT = 0x3c;
const EQUALS = 0x3d;
const GT = 0x3e;
const QUESTION = 0x3f;
const PIPE = 0x7c;
const LBRACKET = 0x5b;
const BACKSLASH = 0x5c;
const RBRACKET = 0x5d;
const UNDERSCORE = 0x5f;
const BACKTICK = 0x60;
const TILDE = 0x7e;
const ONE = 0x31;

function isAsciiAlpha(code: number): boolean {
  return (code >= 0x41 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a);
}

function isAsciiDigit(code: number): boolean {
  return code >= 0x30 && code <= 0x39;
}

function isAsciiAlphanumeric(code: number): boolean {
  return isAsciiAlpha(code) || isAsciiDigit(code);
}

/** Whitespace between the parts of an inline HTML tag, as CommonMark sees it. */
function isTagWhitespace(code: number): boolean {
  return code === SPACE || code === TAB || code === LF || code === CR;
}

/** Whitespace inside a tag, as the HTML tokenizer sees it. */
function isHtmlWhitespace(code: number): boolean {
  return code === SPACE || code === TAB || code === LF || code === CR || code === 0x0c;
}

/**
 * Whitespace for the emphasis flank rules.
 *
 * Deliberately the narrow ASCII set. The parser also treats non-breaking and
 * other Unicode spaces as whitespace; a marker next to one of those counts as
 * a closer here although it is none, which only over-counts.
 */
function isFlankWhitespace(code: number): boolean {
  return code === SPACE || code === TAB || code === LF || code === CR;
}

function isBlankRange(body: string, start: number, end: number): boolean {
  for (let i = start; i < end; i++) {
    const code = body.charCodeAt(i);
    if (code !== SPACE && code !== TAB) return false;
  }
  return true;
}

// ──────────────────── Part 1: the shape of the text ────────────────────

type LineKind = 'blank' | 'fence' | 'html' | 'table' | 'para' | 'heading' | 'none';

interface LineInfo {
  /** Index of the first character. */
  start: number;
  /** Index one past the last character, the line ending excluded. */
  end: number;
  /** Index of the block content: past indentation and container markers. */
  content: number;
  kind: LineKind;
  /** Starts a new inline unit: see {@link scanContent}. */
  newUnit: boolean;
  /** CommonMark HTML block type, when `kind` is `html`. */
  htmlType: number;
  /**
   * For an `html` line: the HTML block ends behind it. What a token of the
   * block swallowed ends with it too, since the parser hands the block over
   * as one piece of markup (see `swallowed` in {@link scanContent}).
   */
  htmlLast: boolean;
  /** The line carries a blockquote marker. */
  quoted: boolean;
}

/**
 * An open container of the document: a block quote, or a list item.
 *
 * The containers a block lies in decide which lines behind it are still
 * inside it, so they are followed from line to line rather than read off
 * each line on its own. A line that opens a block inside a list item carries
 * no marker of the item, only its indentation, and neither do the lines that
 * go on inside it: read on its own, such a line lies in no container at all,
 * and every line behind it looks like part of the block.
 */
interface Container {
  /**
   * {@link QUOTE}, or the kind of the list item: {@link BULLET},
   * {@link ORDERED_DOT} or {@link ORDERED_PAREN}.
   */
  kind: number;
  /**
   * For a list item, the column its content starts at, counted from the
   * content of the container around it: behind the marker and the columns
   * that belong to the marker. A line continues the item when it is indented
   * at least that far, or when it is blank.
   */
  size: number;
  /** The item began with an empty line. */
  emptyFirst: boolean;
  /** A blank line came behind an item that began empty: no line continues it. */
  spent: boolean;
}

/** Kinds of container. */
const QUOTE = 0;
const ORDERED_DOT = 1;
const ORDERED_PAREN = 2;
const BULLET = 3;

/**
 * Where a line is being read. One instance is reused across lines.
 *
 * Index and column are kept apart for a tab that a container has consumed
 * only in part: what is left of it lies in front of whatever comes behind,
 * and is indentation although no character stands there.
 */
interface Cursor {
  /** Index of the next character. */
  at: number;
  /** The column that index is at, a tab having advanced to the next multiple of four. */
  column: number;
  /** Columns of indentation in front of the index that are left of a tab. */
  virtual: number;
}

/**
 * The block open in the innermost container, as the parser has it: a
 * paragraph, a table, a fenced code block or an HTML block.
 */
type Tip = 'none' | 'para' | 'table' | 'fence' | 'html';

interface Shape {
  lines: LineInfo[];
  reason: PathologyReason | null;
}

/**
 * Width of the list-item marker at `at`, or 0 when there is none.
 *
 * A marker is `-`, `+` or `*`, or one to nine digits and a dot or parenthesis,
 * each followed by a space, a tab or the end of the line.
 */
function listMarkerWidth(body: string, at: number, end: number): number {
  const code = body.charCodeAt(at);

  if (code === DASH || code === PLUS || code === ASTERISK) {
    const next = at + 1 === end ? LF : body.charCodeAt(at + 1);
    return next === SPACE || next === TAB || next === LF ? 1 : 0;
  }

  if (!isAsciiDigit(code)) return 0;
  let i = at;
  while (i < end && isAsciiDigit(body.charCodeAt(i))) i++;
  const digits = i - at;
  if (digits > 9) return 0;
  const delimiter = body.charCodeAt(i);
  if (delimiter !== DOT && delimiter !== RIGHT_PAREN) return 0;
  const next = i + 1 === end ? LF : body.charCodeAt(i + 1);
  return next === SPACE || next === TAB || next === LF ? digits + 1 : 0;
}

/** Columns of indentation in front of `cursor`, those left of a tab included. */
function indentColumns(body: string, cursor: Cursor, end: number): number {
  let at = cursor.at;
  let column = cursor.column;
  let columns = cursor.virtual;
  for (;;) {
    const code = at < end ? body.charCodeAt(at) : LF;
    if (code === SPACE) {
      columns++;
      column++;
    } else if (code === TAB) {
      const step = 4 - (column % 4);
      columns += step;
      column += step;
    } else {
      return columns;
    }
    at++;
  }
}

/**
 * Move `cursor` over `columns` columns of that indentation, which are all
 * there ({@link indentColumns} found at least as many). A tab is consumed
 * only in part where the columns end inside it.
 */
function takeIndent(body: string, cursor: Cursor, columns: number): void {
  if (columns <= cursor.virtual) {
    cursor.virtual -= columns;
    return;
  }
  columns -= cursor.virtual;
  cursor.virtual = 0;
  while (columns > 0) {
    const step = body.charCodeAt(cursor.at) === TAB ? 4 - (cursor.column % 4) : 1;
    cursor.at++;
    cursor.column += step;
    columns -= step;
  }
  cursor.virtual = -columns;
}

/** Run of backticks or tildes that opens a fence at `at`: its length, negative for tildes. */
function fenceOpener(body: string, at: number, end: number): number {
  const marker = body.charCodeAt(at);
  if (marker !== BACKTICK && marker !== TILDE) return 0;
  let run = 0;
  while (body.charCodeAt(at + run) === marker) run++;
  if (run < 3) return 0;
  // The info string of a backtick fence may not contain a backtick.
  if (marker === BACKTICK) {
    const info = body.indexOf('`', at + run);
    if (info >= 0 && info < end) return 0;
  }
  return marker === BACKTICK ? run : -run;
}

function isClosingFence(body: string, start: number, end: number, fence: number): boolean {
  let i = start;
  let columns = 0;
  while (i < end && body.charCodeAt(i) === SPACE) {
    i++;
    columns++;
  }
  if (columns > 3) return false;
  const marker = fence < 0 ? TILDE : BACKTICK;
  let run = 0;
  while (body.charCodeAt(i + run) === marker) run++;
  return run >= Math.abs(fence) && isBlankRange(body, i + run, end);
}

/** Tag names that start a type 6 HTML block. */
const HTML_BLOCK_TAGS = new Set(
  (
    'address article aside base basefont blockquote body caption center col colgroup dd details dialog ' +
    'dir div dl dt fieldset figcaption figure footer form frame frameset h1 h2 h3 h4 h5 h6 head header ' +
    'hr html iframe legend li link main menu menuitem nav noframes ol optgroup option p param search ' +
    'section summary table tbody td tfoot th thead title tr track ul'
  ).split(' '),
);

/**
 * CommonMark HTML block type starting at `at` (1 to 7), or 0.
 *
 * Type 7, any other complete tag on its own line, cannot interrupt a
 * paragraph, hence `allowType7`.
 */
function matchHtmlStart(
  body: string,
  at: number,
  end: number,
  allowType7: boolean,
  token: Token,
): number {
  if (body.charCodeAt(at) !== LT) return 0;
  const after = body.charCodeAt(at + 1);
  // `<?` on its own is the whole start condition of type 3.
  if (after === QUESTION) return 3;
  if (end - at < 3) return 0;

  if (after === EXCLAMATION) {
    const third = body.charCodeAt(at + 2);
    if (third === DASH) return body.charCodeAt(at + 3) === DASH ? 2 : 0;
    if (third === LBRACKET) return body.startsWith('<![CDATA[', at) ? 5 : 0;
    return isAsciiAlpha(third) ? 4 : 0;
  }
  if (after !== SLASH && !isAsciiAlpha(after)) return 0;

  let i = at + 1;
  if (after === SLASH) i++;
  const nameStart = i;
  while (isAsciiAlphanumeric(body.charCodeAt(i)) || body.charCodeAt(i) === DASH) i++;
  if (i === nameStart) return 0;

  // The name has to be followed by whitespace, `>` or `/>`.
  const next = body.charCodeAt(i);
  const followedCorrectly =
    next === GT || isTagWhitespace(next) || (next === SLASH && body.charCodeAt(i + 1) === GT);
  if (!followedCorrectly) return 0;

  const name = body.slice(nameStart, i).toLowerCase();
  if (name === 'script' || name === 'pre' || name === 'style' || name === 'textarea') return 1;
  if (HTML_BLOCK_TAGS.has(name)) return 6;
  if (!allowType7) return 0;

  // Type 7: a complete open or closing tag, alone on its line.
  // The tag has to be complete on its own line, so the search ends there too.
  if (!readInlineHtml(body, at, token, new Finder(body, at, end)) || !isBlankRange(body, token.end, end)) return 0;
  return 7;
}

/** Whether the line `[start, end)` ends an HTML block of type 1 to 5. */
function htmlBlockEnded(body: string, start: number, end: number, type: number): boolean {
  const line = body.slice(start, end).toLowerCase();
  switch (type) {
    case 1:
      return (
        line.includes('</script>') ||
        line.includes('</pre>') ||
        line.includes('</style>') ||
        line.includes('</textarea>')
      );
    case 2:
      return line.includes('-->');
    case 3:
      return line.includes('?>');
    case 4:
      return line.includes('>');
    default:
      return line.includes(']]>');
  }
}

function isAtxHeading(body: string, at: number, end: number): boolean {
  let i = at;
  while (i < end && body.charCodeAt(i) === HASH) i++;
  const level = i - at;
  if (level < 1 || level > 6) return false;
  return i === end || body.charCodeAt(i) === SPACE || body.charCodeAt(i) === TAB;
}

/** `---`, `***` or `___`, three or more, with nothing but whitespace between. */
function isThematicBreak(body: string, at: number, end: number): boolean {
  const marker = body.charCodeAt(at);
  if (marker !== DASH && marker !== ASTERISK && marker !== UNDERSCORE) return false;
  let count = 0;
  for (let i = at; i < end; i++) {
    const code = body.charCodeAt(i);
    if (code === marker) count++;
    else if (code !== SPACE && code !== TAB) return false;
  }
  return count >= 3;
}

/** A setext underline made of `=`. One made of `-` is also a thematic break. */
function isEqualsUnderline(body: string, at: number, end: number): boolean {
  let count = 0;
  for (let i = at; i < end; i++) {
    const code = body.charCodeAt(i);
    if (code === EQUALS) count++;
    else if (code !== SPACE && code !== TAB) return false;
  }
  return count >= 1;
}

/**
 * A GFM table delimiter row: cells of dashes with optional colons, separated
 * by pipes, with optional pipes at both ends.
 */
function isDelimiterRow(body: string, at: number, end: number): boolean {
  let i = at;
  if (body.charCodeAt(i) === PIPE) i++;

  for (;;) {
    while (body.charCodeAt(i) === SPACE || body.charCodeAt(i) === TAB) i++;
    if (body.charCodeAt(i) === COLON) i++;
    let dashes = 0;
    while (body.charCodeAt(i) === DASH) {
      i++;
      dashes++;
    }
    if (body.charCodeAt(i) === COLON) i++;
    // A row of dashes alone under a paragraph is a setext heading, not a table.
    if (dashes === 0) return false;
    while (body.charCodeAt(i) === SPACE || body.charCodeAt(i) === TAB) i++;
    if (i >= end) return true;
    if (body.charCodeAt(i) !== PIPE) return false;
    i++;
    if (i >= end) return true;
  }
}

/**
 * Classify every line of `body`, applying the rules that only look at the
 * shape of the text: indentation and container markers.
 *
 * The lines are read the way the parser reads them. On every line the open
 * containers are continued as far as the line goes: a quote wants its `>`,
 * a list item the indentation of its content or a blank line. A fenced code
 * block or an HTML block goes on only on a line that continues every
 * container it opened in. New containers may then open on the line, and a
 * block starts in the innermost one, or the text goes on in the paragraph
 * that is open there. Text that lies in no container on its own may still
 * be the lazy continuation of that paragraph. The classification is:
 *
 * - `fence`: a fenced code block: opener, content and closer;
 * - `html`: an HTML block;
 * - `table`: the delimiter row of a table and its body rows;
 * - `para`: text that is parsed for inline markup;
 * - `heading`: an ATX heading, which is parsed for inline markup on its own;
 * - `none`: a blank line, a thematic break or a heading underline.
 *
 * Wherever the model is unsure it says `para`, the kind that is scanned most
 * strictly, so a mistake can only make the guard stricter. The model is
 * checked against the parser itself, combination by combination, in
 * __tests__/lib/markdown/block-parity.test.ts.
 */
function scanLines(body: string): Shape {
  const lines: LineInfo[] = [];
  const length = body.length;
  const token = newToken();
  /** The open containers, outermost first. */
  const stack: Container[] = [];
  const cursor: Cursor = { at: 0, column: 0, virtual: 0 };
  /** The block open in the innermost container. */
  let tip: Tip = 'none';
  let fence = 0;
  let htmlType = 0;
  /** The last line of the HTML block so far, to mark it when the block ends. */
  let htmlTail: LineInfo | null = null;
  let listItems = 0;
  let quoteLines = 0;
  let position = 0;

  while (position < length) {
    const stop = lineStop(body, position);
    const end = stop > position && body.charCodeAt(stop - 1) === CR ? stop - 1 : stop;
    const line: LineInfo = {
      start: position,
      end,
      content: position,
      kind: 'blank',
      newUnit: false,
      htmlType: 0,
      htmlLast: false,
      quoted: false,
    };
    lines.push(line);
    position = stop + 1;
    const tooLong = lines.length > MAX_LINES;
    cursor.at = line.start;
    cursor.column = 0;
    cursor.virtual = 0;
    const indent = indentColumns(body, cursor, end);

    // 1. The open containers, as far as the line continues them.
    let depth = 0;
    let carriesQuote = false;
    while (depth < stack.length) {
      const container = stack[depth];
      const columns = indentColumns(body, cursor, end);

      if (container.kind === QUOTE) {
        // Up to three columns of indentation, the marker, and its own space.
        if (columns > 3 || cursor.at >= end || body.charCodeAt(cursor.at) !== GT) break;
        carriesQuote = true;
        takeIndent(body, cursor, columns);
        cursor.at++;
        cursor.column++;
        takeIndent(body, cursor, 1);
      } else if (isBlankRange(body, cursor.at, end)) {
        // A blank line continues a list item. Behind an item that began with
        // an empty line, it ends it.
        if (container.emptyFirst) container.spent = true;
        takeIndent(body, cursor, columns);
      } else if (container.spent || columns < container.size) {
        container.spent = false;
        container.emptyFirst = false;
        break;
      } else {
        container.spent = false;
        container.emptyFirst = false;
        takeIndent(body, cursor, container.size);
      }
      depth++;
    }

    // 2. A fenced code block or an HTML block that is open goes on only inside
    //    the containers it opened in: a line that does not continue them all
    //    ends it before itself. Neither has a lazy continuation. A blank line
    //    ends an HTML block of type 6 or 7, and none of the others.
    if (tip === 'fence' || tip === 'html') {
      const blank = isBlankRange(body, cursor.at, end);
      if (depth === stack.length && (tip === 'fence' || !blank || htmlType < 6)) {
        if (tip === 'fence') {
          line.kind = 'fence';
          if (isClosingFence(body, cursor.at, end, fence)) tip = 'none';
        } else if (!blank) {
          line.kind = 'html';
          line.htmlType = htmlType;
          line.content = cursor.at;
          htmlTail = line;
          // The line that carries the end of the block is its last.
          if (htmlType < 6 && htmlBlockEnded(body, cursor.at, end, htmlType)) {
            tip = 'none';
            line.htmlLast = true;
          }
        }
        if (tooLong) return { lines, reason: 'lines' };
        continue;
      }
      if (tip === 'html' && htmlTail !== null) htmlTail.htmlLast = true;
      tip = 'none';
    }

    // 3. A blank line ends the paragraph, and every container the line does not continue.
    if (isBlankRange(body, cursor.at, end)) {
      stack.length = depth;
      tip = 'none';
      if (tooLong) return { lines, reason: 'lines' };
      continue;
    }
    if (indent > MAX_INDENT_COLUMNS) return { lines, reason: 'indent-columns' };

    // 4. New containers open on the line. A list item interrupts what is open
    //    in the last container the line continues only as a bullet or as `1.`,
    //    and only with text behind its marker.
    const allMatched = depth === stack.length;
    const paragraphOpen = tip === 'para';
    const tableOpen = tip === 'table';
    const interrupt = allMatched && paragraphOpen;
    const opened: Container[] = [];
    let quotes = 0;
    let lists = 0;
    let indentedCode = false;

    for (;;) {
      const columns = indentColumns(body, cursor, end);
      // The column the content of the container around this one starts at.
      const base = cursor.column - cursor.virtual;
      // Four columns of indentation never hold a marker: they hold code.
      if (columns > 3) indentedCode = true;
      takeIndent(body, cursor, columns);
      if (indentedCode || cursor.at >= end) break;
      const code = body.charCodeAt(cursor.at);
      const quote = code === GT;
      const width = quote ? 1 : listMarkerWidth(body, cursor.at, end);
      if (width === 0) break;

      const emptyFirst = quote || isBlankRange(body, cursor.at + width, end);
      const ordered = !quote && isAsciiDigit(code);
      // In order to interrupt a paragraph, a list item must not be empty, and
      // an ordered one must start with 1.
      if (interrupt && (emptyFirst || (ordered && (width !== 2 || code !== ONE)))) break;

      const marker = cursor.at;
      cursor.at += width;
      cursor.column += width;
      takeIndent(body, cursor, 1);
      if (!quote) {
        // One to four columns behind the marker belong to it; a fifth starts
        // code inside the item.
        const behind = indentColumns(body, cursor, end);
        takeIndent(body, cursor, behind >= 5 ? 1 : behind);
        if (behind >= 5) indentedCode = true;
      }
      // Past the limits a marker is only counted, not opened.
      if (quotes + lists <= MAX_CONTAINER_MARKERS_PER_LINE) {
        const size = cursor.column - cursor.virtual - base;
        const kind = quote
          ? QUOTE
          : ordered
            ? body.charCodeAt(marker + width - 1) === RIGHT_PAREN
              ? ORDERED_PAREN
              : ORDERED_DOT
            : BULLET;
        opened.push(quote ? { kind, size: 0, emptyFirst: false, spent: false } : { kind, size, emptyFirst, spent: false });
      }
      if (quote) quotes++;
      else lists++;
    }

    if (quotes > MAX_QUOTE_MARKERS_PER_LINE) return { lines, reason: 'quote-markers' };
    if (quotes + lists > MAX_CONTAINER_MARKERS_PER_LINE) return { lines, reason: 'container-markers' };

    const at = cursor.at;
    line.quoted = carriesQuote || quotes > 0;
    listItems += lists;
    quoteLines += line.quoted ? 1 : 0;
    if (listItems > MAX_LIST_ITEMS) return { lines, reason: 'list-items' };
    if (quoteLines > MAX_QUOTE_LINES) return { lines, reason: 'quote-lines' };
    if (tooLong) return { lines, reason: 'lines' };

    // The line carried markers and nothing else: an empty item, an empty quote.
    if (at >= end) {
      stack.length = depth;
      for (const container of opened) stack.push(container);
      tip = 'none';
      continue;
    }

    // 5. A block starts in the innermost container, or the text goes on in
    //    the paragraph that is open there.
    const continuing = paragraphOpen && opened.length === 0;
    // The last line of that paragraph: the head row of a table that starts behind it.
    const head = continuing && lines.length > 1 ? lines[lines.length - 2] : undefined;

    let kind: LineKind = 'para';
    if (!indentedCode) {
      const run = fenceOpener(body, at, end);
      if (run !== 0) {
        kind = 'fence';
        fence = run;
      } else {
        // An HTML block of type 7 cannot interrupt a paragraph.
        const html = matchHtmlStart(body, at, end, !continuing, token);
        if (html !== 0) {
          kind = 'html';
          htmlType = html;
        } else if (isAtxHeading(body, at, end)) {
          kind = 'heading';
        } else if (isThematicBreak(body, at, end) || (continuing && isEqualsUnderline(body, at, end))) {
          kind = 'none';
        } else if (
          // Only a delimiter row of as many cells as the head row is a table.
          continuing &&
          allMatched &&
          head !== undefined &&
          head.kind === 'para' &&
          isDelimiterRow(body, at, end) &&
          rowCells(body, at, end) === rowCells(body, head.content, head.end)
        ) {
          kind = 'table';
        } else if (tableOpen && allMatched && opened.length === 0) {
          // A quote or a list item is a block of its own: it ends the table.
          kind = 'table';
        }
      }
    }

    line.kind = kind;
    line.content = at;

    // A lazy line goes on in the paragraph, and the containers with it. Any
    // other line closes the containers it did not continue.
    if (!(continuing && kind === 'para' && !allMatched)) {
      stack.length = depth;
      for (const container of opened) stack.push(container);
    }

    // An inline unit is a paragraph, a list item, or one row of a table: the
    // text one inline parser run sees. A paragraph is one unit, and so are
    // the lines that go on in it, lazily or not; it begins where a block
    // begins, in a container of its own or behind another block.
    switch (kind) {
      case 'para':
        line.newUnit = !continuing;
        tip = 'para';
        break;
      case 'heading':
        // A heading is over with its line: what follows is a new block.
        line.newUnit = true;
        tip = 'none';
        break;
      case 'table':
        // One row of a table is a unit.
        line.newUnit = true;
        tip = 'table';
        break;
      case 'html':
        // An HTML block is a unit of its own, even behind another one: the
        // scan of the content ends what its last token left open where the
        // block ends.
        line.newUnit = true;
        tip = 'html';
        htmlTail = line;
        if (htmlType < 6 && htmlBlockEnded(body, at, end, htmlType)) {
          tip = 'none';
          line.htmlLast = true;
        }
        break;
      case 'fence':
        tip = 'fence';
        break;
      default:
        tip = 'none';
    }
  }

  return { lines, reason: null };
}

function lineStop(body: string, from: number): number {
  const stop = body.indexOf('\n', from);
  return stop < 0 ? body.length : stop;
}

// ─────────────────────────── Part 2: the content ───────────────────────────

type TokenKind = 'start' | 'end' | 'comment' | 'other';

/** One markup token, as read from the text. */
interface Token {
  kind: TokenKind;
  /** Index one past the token. */
  end: number;
  nameStart: number;
  nameEnd: number;
  selfClosing: boolean;
  /** A start tag carrying `encoding="text/html"` or `encoding="application/xhtml+xml"`. */
  encodingHtml: boolean;
}

function newToken(): Token {
  return { kind: 'other', end: 0, nameStart: 0, nameEnd: 0, selfClosing: false, encodingHtml: false };
}

/**
 * Needles of {@link Finder.find}. The ones from {@link NEEDLE_RAW_TEXT_END} on are
 * `</` and the name of a raw-text element, in the order of
 * {@link RAW_TEXT_NAMES}.
 */
const NEEDLE_COMMENT_END = 0;
const NEEDLE_CDATA_END = 1;
const NEEDLE_TAG_END = 2;
const NEEDLE_INSTRUCTION_END = 3;
const NEEDLE_DOUBLE_QUOTE_END = 4;
const NEEDLE_SINGLE_QUOTE_END = 5;
const NEEDLE_MARKUP_START = 6;
const NEEDLE_RAW_TEXT_END = 7;

const NEEDLES = [
  '-->',
  ']]>',
  '>',
  '?>',
  '"',
  "'",
  '<',
  '</script',
  '</style',
  '</textarea',
  '</title',
  '</xmp',
  '</iframe',
  '</noembed',
  '</noframes',
];
/** Not a needle: the slot of {@link Finder.commentEnd}, whose answer is its own. */
const BROWSER_COMMENT_END = NEEDLES.length;

/**
 * Forward searches inside one region of the body.
 *
 * Every search the guard makes goes through a `Finder`, and that is what
 * keeps the guard linear. A search never leaves the region: the look for the
 * `-->` that ends a comment stops at the end of the inline unit rather than
 * at the end of the body, so a paragraph full of unterminated comments costs
 * the paragraph once. What a search found out is remembered, either way:
 *
 * - nothing found: the needle is then known to be absent at and after the
 *   position the search started from, and a later search returns at once;
 * - found: a later search that starts no earlier and no further than the hit
 *   has the same answer. Without that, a paragraph full of openers that are
 *   all closed by the one `-->` far behind them would read up to that `-->`
 *   once per opener.
 *
 * No needle is read over any stretch of the region more than once.
 *
 * An inline unit gets a `Finder` of its own, and so does the scan of one
 * inline unit that needs the body in lower case (see `foldCase`). The raw
 * markup (HTML blocks and raw-HTML posts) shares one over the whole body,
 * where a token may well run past the end of a block.
 */
class Finder {
  /** The region, cut out the first time it is searched. */
  private text: string | null = null;
  /** Per needle: the lowest position known to have none at or after it. */
  private readonly absentFrom: number[] = [];
  /** Per needle: where the last search that found the needle started, and where it found it. */
  private hitFrom: number[] = [];
  private hitAt: number[] = [];

  constructor(
    private readonly body: string,
    private readonly from: number,
    /** Index one past the region: no search goes beyond it. */
    readonly to: number,
  ) {}

  private region(): string {
    if (this.text === null) {
      this.text = this.from === 0 && this.to === this.body.length ? this.body : this.body.slice(this.from, this.to);
    }
    return this.text;
  }

  /** Index of the first `needle` at or after `at`, or -1. */
  find(needle: number, at: number): number {
    if (at < this.from) at = this.from;
    const known = this.absentFrom[needle];
    if (known !== undefined && at >= known) return -1;
    // The first hit at or after a position is the first hit at or after any
    // position between that one and the hit itself.
    if (this.hitFrom[needle] <= at && at <= this.hitAt[needle]) return this.hitAt[needle];

    const text = this.region();
    const found = text.slice(at - this.from, known === undefined ? undefined : known - this.from).indexOf(NEEDLES[needle]);
    if (found < 0) {
      this.absentFrom[needle] = at;
      return -1;
    }
    this.hitFrom[needle] = at;
    this.hitAt[needle] = at + found;
    return at + found;
  }

  /** Where the browser ends the comment that opens at `at`, or -1. */
  commentEnd(at: number): number {
    const known = this.absentFrom[BROWSER_COMMENT_END];
    if (known !== undefined && at >= known) return -1;

    const text = this.region();
    const found = commentEndIn(text, at - this.from, known === undefined ? text.length : known - this.from);
    if (found < 0) {
      this.absentFrom[BROWSER_COMMENT_END] = at;
      return -1;
    }
    return found + this.from;
  }
}

/**
 * Whether an attribute is the one that makes `<annotation-xml>` an HTML
 * integration point: `encoding="text/html"`, or `encoding="application/xhtml+xml"`.
 */
function isHtmlEncoding(body: string, nameStart: number, nameEnd: number, valueStart: number, valueEnd: number): boolean {
  if (nameEnd - nameStart !== 8 || body.slice(nameStart, nameEnd).toLowerCase() !== 'encoding') return false;
  const length = valueEnd - valueStart;
  if (length !== 9 && length !== 21) return false;
  const value = body.slice(valueStart, valueEnd).toLowerCase();
  return value === 'text/html' || value === 'application/xhtml+xml';
}

/**
 * Read the raw-HTML inline token that starts at `at`, by CommonMark's rules.
 *
 * Returns false when the text at `at` is not such a token inside the region
 * of `search` and is plain text instead. That region is the inline unit: an
 * inline token cannot run past it, and an unfinished one is not a token at
 * all, so whatever follows it is markup again.
 */
function readInlineHtml(body: string, at: number, token: Token, search: Finder): boolean {
  const after = body.charCodeAt(at + 1);

  if (after === EXCLAMATION) {
    const third = body.charCodeAt(at + 2);

    if (third === DASH) {
      if (body.charCodeAt(at + 3) !== DASH) return false;
      token.kind = 'comment';
      // `<!-->` and `<!--->` are complete, empty comments.
      if (body.charCodeAt(at + 4) === GT) token.end = at + 5;
      else if (body.charCodeAt(at + 4) === DASH && body.charCodeAt(at + 5) === GT) token.end = at + 6;
      else {
        const close = search.find(NEEDLE_COMMENT_END, at + 2);
        if (close < 0) return false;
        token.end = close + 3;
      }
      return true;
    }

    token.kind = 'other';
    if (third === LBRACKET) {
      if (!body.startsWith('<![CDATA[', at)) return false;
      const close = search.find(NEEDLE_CDATA_END, at + 9);
      if (close < 0) return false;
      token.end = close + 3;
    } else {
      if (!isAsciiAlpha(third)) return false;
      const close = search.find(NEEDLE_TAG_END, at + 2);
      if (close < 0) return false;
      token.end = close + 1;
    }
    return true;
  }

  if (after === QUESTION) {
    const close = search.find(NEEDLE_INSTRUCTION_END, at + 2);
    if (close < 0) return false;
    token.kind = 'other';
    token.end = close + 2;
    return true;
  }

  if (after === SLASH) {
    let i = at + 2;
    if (!isAsciiAlpha(body.charCodeAt(i))) return false;
    token.kind = 'end';
    token.nameStart = i;
    while (isAsciiAlphanumeric(body.charCodeAt(i)) || body.charCodeAt(i) === DASH) i++;
    token.nameEnd = i;
    // Only whitespace may sit between the name and `>`.
    while (i < search.to && isTagWhitespace(body.charCodeAt(i))) i++;
    if (i >= search.to || body.charCodeAt(i) !== GT) return false;
    token.end = i + 1;
    return true;
  }

  if (!isAsciiAlpha(after)) return false;

  // An open tag.
  token.kind = 'start';
  token.selfClosing = false;
  token.encodingHtml = false;
  token.nameStart = at + 1;
  let i = at + 2;
  while (isAsciiAlphanumeric(body.charCodeAt(i)) || body.charCodeAt(i) === DASH) i++;
  token.nameEnd = i;

  // After the name come whitespace, `/` or `>` and nothing else: `<b:c>` is text.
  const afterName = body.charCodeAt(i);
  if (!isTagWhitespace(afterName) && afterName !== SLASH && afterName !== GT) return false;

  const limit = search.to;
  // A `/` right behind an unquoted value belongs to the value for a browser
  // (`<b c=y/>` is not self-closing), although the parser reads it as one.
  let afterUnquoted = false;

  for (;;) {
    if (i >= limit) return false;
    let code = body.charCodeAt(i);
    if (isTagWhitespace(code)) {
      i++;
      continue;
    }
    if (code === GT) {
      token.end = i + 1;
      return true;
    }
    if (code === SLASH) {
      if (body.charCodeAt(i + 1) !== GT || i + 2 > limit) return false;
      token.selfClosing = !afterUnquoted;
      token.end = i + 2;
      return true;
    }

    // An attribute. Its name starts with a letter, `:` or `_`.
    if (!isAsciiAlpha(code) && code !== COLON && code !== UNDERSCORE) return false;
    const attributeStart = i;
    i++;
    for (;;) {
      code = body.charCodeAt(i);
      if (!(isAsciiAlphanumeric(code) || code === DASH || code === DOT || code === COLON || code === UNDERSCORE)) {
        break;
      }
      i++;
    }
    const attributeEnd = i;
    // Only spaces and tabs may sit between the name and `=`.
    while (body.charCodeAt(i) === SPACE || body.charCodeAt(i) === TAB) i++;
    if (i >= limit) return false;
    if (body.charCodeAt(i) !== EQUALS) continue; // no value: the loop checks what follows
    i++;

    code = body.charCodeAt(i);
    while (isTagWhitespace(code)) {
      i++;
      code = body.charCodeAt(i);
    }
    if (i >= limit) return false;

    if (code === DOUBLE_QUOTE || code === SINGLE_QUOTE) {
      const close = search.find(code === DOUBLE_QUOTE ? NEEDLE_DOUBLE_QUOTE_END : NEEDLE_SINGLE_QUOTE_END, i + 1);
      if (close < 0) return false;
      if (isHtmlEncoding(body, attributeStart, attributeEnd, i + 1, close)) token.encodingHtml = true;
      i = close + 1;
      afterUnquoted = false;
      // A quoted value has to be followed by whitespace, `/` or `>`.
      code = body.charCodeAt(i);
      if (code !== SLASH && code !== GT && !isTagWhitespace(code)) return false;
      continue;
    }

    if (code === LT || code === EQUALS || code === GT || code === BACKTICK) return false;
    // An unquoted value: it ends at whitespace, `/` or `>`.
    afterUnquoted = false;
    const valueStart = i;
    i++;
    for (;;) {
      if (i >= limit) return false;
      code = body.charCodeAt(i);
      if (code === SLASH) {
        afterUnquoted = true;
        break;
      }
      if (code === GT || isTagWhitespace(code)) break;
      if (code === DOUBLE_QUOTE || code === SINGLE_QUOTE || code === LT || code === EQUALS || code === BACKTICK) {
        return false;
      }
      i++;
    }
    if (isHtmlEncoding(body, attributeStart, attributeEnd, valueStart, i)) token.encodingHtml = true;
  }
}

// States of the HTML comment tokenizer.
const COMMENT = 0;
const COMMENT_LT = 1;
const COMMENT_LT_BANG = 2;
const COMMENT_LT_BANG_DASH = 3;
const COMMENT_LT_BANG_DASH_DASH = 4;
const COMMENT_END_DASH = 5;
const COMMENT_END = 6;
const COMMENT_END_BANG = 7;

/**
 * End of the HTML comment that starts at `at` (`<!--`) in `text`, as a
 * browser tokenizes it, or -1 when it does not end before `stop`.
 *
 * The parser, which decides whether the text is raw markup, ends a comment at
 * the first `-->`. The browser re-parsing that markup follows the HTML
 * tokenizer instead, which also ends a comment at `--!>`.
 */
function commentEndIn(text: string, at: number, stop: number): number {
  let i = at + 4;
  let state = COMMENT;

  // Comment start, and comment start dash.
  if (i < stop) {
    const code = text.charCodeAt(i);
    if (code === GT) return i + 1;
    if (code === DASH) {
      i++;
      if (i >= stop) return -1;
      const next = text.charCodeAt(i);
      if (next === GT) return i + 1;
      state = next === DASH ? COMMENT_END : COMMENT;
      i++;
    }
  }

  for (; i < stop; i++) {
    const code = text.charCodeAt(i);
    let reconsume = true;

    // "Reconsume" transitions apply the new state to the same character.
    while (reconsume) {
      reconsume = false;
      if (code === GT && (state === COMMENT_END || state === COMMENT_END_BANG)) return i + 1;

      switch (state) {
        case COMMENT:
          if (code === LT) state = COMMENT_LT;
          else if (code === DASH) state = COMMENT_END_DASH;
          break;
        case COMMENT_LT:
          if (code === EXCLAMATION) state = COMMENT_LT_BANG;
          else if (code !== LT) {
            state = COMMENT;
            reconsume = true;
          }
          break;
        case COMMENT_LT_BANG:
          if (code === DASH) state = COMMENT_LT_BANG_DASH;
          else {
            state = COMMENT;
            reconsume = true;
          }
          break;
        case COMMENT_LT_BANG_DASH:
          if (code === DASH) state = COMMENT_LT_BANG_DASH_DASH;
          else {
            state = COMMENT_END_DASH;
            reconsume = true;
          }
          break;
        case COMMENT_LT_BANG_DASH_DASH:
          state = COMMENT_END;
          reconsume = true;
          break;
        case COMMENT_END_DASH:
          if (code === DASH) state = COMMENT_END;
          else {
            state = COMMENT;
            reconsume = true;
          }
          break;
        case COMMENT_END:
          if (code === EXCLAMATION) state = COMMENT_END_BANG;
          else if (code !== DASH) {
            state = COMMENT;
            reconsume = true;
          }
          break;
        default:
          if (code === DASH) state = COMMENT_END_DASH;
          else {
            state = COMMENT;
            reconsume = true;
          }
      }
    }
  }

  return -1;
}

/** What {@link readRawToken} found at a `<`. */
const NOT_MARKUP = 0;
const TOKEN = 1;
/** A tag that never closes before `limit`. The browser drops it. */
const UNFINISHED_TAG = 2;

/**
 * Read the markup token that starts at `at`, by the HTML tokenizer's rules.
 *
 * This is the reading for text that is known to be raw markup, where the
 * token may span lines and may end anywhere up to `limit`. The searches are
 * `search`'s, so they stay linear (see {@link Finder}).
 */
function readRawToken(body: string, at: number, token: Token, search: Finder, limit: number): number {
  const after = body.charCodeAt(at + 1);

  // A bogus comment, and a doctype as well: parse5 ends both at the first
  // `>`, quotes included. (`<!DOCTYPE html PUBLIC "a>b">` is over at `a>`.)
  const toTagEnd = (): number => {
    const close = search.find(NEEDLE_TAG_END, at + 2);
    token.kind = 'other';
    token.end = close < 0 ? limit : close + 1;
    return TOKEN;
  };

  if (after === EXCLAMATION) {
    if (body.charCodeAt(at + 2) === DASH && body.charCodeAt(at + 3) === DASH) {
      const close = search.commentEnd(at);
      token.kind = 'comment';
      token.end = close < 0 ? limit : close;
      return TOKEN;
    }
    return toTagEnd();
  }
  if (after === QUESTION) return toTagEnd();

  if (after === SLASH) {
    const third = body.charCodeAt(at + 2);
    if (third === GT) {
      // An empty end tag is ignored.
      token.kind = 'other';
      token.end = at + 3;
      return TOKEN;
    }
    return isAsciiAlpha(third) ? readRawTag(body, at, token, limit) : toTagEnd();
  }

  return isAsciiAlpha(after) ? readRawTag(body, at, token, limit) : NOT_MARKUP;
}

/**
 * Read the start or end tag that starts at `at`, by the HTML tokenizer's tag
 * states, which is what decides where a tag ends and whether it is
 * self-closing.
 */
function readRawTag(body: string, at: number, token: Token, limit: number): number {
  let i = at + 1;
  const endTag = body.charCodeAt(i) === SLASH;
  if (endTag) i++;

  token.kind = endTag ? 'end' : 'start';
  token.selfClosing = false;
  token.encodingHtml = false;
  token.nameStart = i;
  for (;;) {
    const code = body.charCodeAt(i);
    if (i >= limit || isHtmlWhitespace(code) || code === SLASH || code === GT) break;
    i++;
  }
  token.nameEnd = i;

  let state = BEFORE_ATTR_NAME;
  // Where the attribute being read starts and ends, and its value with it.
  let attributeStart = 0;
  let attributeEnd = 0;
  let valueStart = 0;
  for (;;) {
    if (i >= limit) return UNFINISHED_TAG;
    const code = body.charCodeAt(i);

    switch (state) {
      case BEFORE_ATTR_NAME:
        if (isHtmlWhitespace(code)) {
          i++;
          break;
        }
        if (code === SLASH) {
          state = SELF_CLOSING;
          i++;
          break;
        }
        if (code === GT) {
          token.end = i + 1;
          return TOKEN;
        }
        // A stray `=` becomes the first character of an attribute name.
        state = ATTR_NAME;
        attributeStart = i;
        if (code === EQUALS) i++;
        break;
      case ATTR_NAME:
        if (isHtmlWhitespace(code) || code === SLASH || code === GT) {
          state = AFTER_ATTR_NAME;
          break;
        }
        if (code === EQUALS) {
          state = BEFORE_ATTR_VALUE;
          attributeEnd = i;
        }
        i++;
        break;
      case AFTER_ATTR_NAME:
        if (isHtmlWhitespace(code)) {
          i++;
          break;
        }
        if (code === SLASH) {
          state = SELF_CLOSING;
          i++;
          break;
        }
        if (code === EQUALS) {
          state = BEFORE_ATTR_VALUE;
          i++;
          break;
        }
        if (code === GT) {
          token.end = i + 1;
          return TOKEN;
        }
        state = ATTR_NAME;
        attributeStart = i;
        break;
      case BEFORE_ATTR_VALUE:
        if (isHtmlWhitespace(code)) {
          i++;
          break;
        }
        if (code === GT) {
          token.end = i + 1;
          return TOKEN;
        }
        if (code === DOUBLE_QUOTE) state = VALUE_DOUBLE;
        else if (code === SINGLE_QUOTE) state = VALUE_SINGLE;
        else state = VALUE_UNQUOTED;
        // A quoted value starts after its quote; a bare one starts here.
        valueStart = code === DOUBLE_QUOTE || code === SINGLE_QUOTE ? i + 1 : i;
        i++;
        break;
      case VALUE_DOUBLE:
      case VALUE_SINGLE:
        if (code === (state === VALUE_DOUBLE ? DOUBLE_QUOTE : SINGLE_QUOTE)) {
          state = AFTER_VALUE_QUOTED;
          if (isHtmlEncoding(body, attributeStart, attributeEnd, valueStart, i)) token.encodingHtml = true;
        }
        i++;
        break;
      case VALUE_UNQUOTED:
        if (isHtmlWhitespace(code)) state = BEFORE_ATTR_NAME;
        else if (code === GT) {
          if (isHtmlEncoding(body, attributeStart, attributeEnd, valueStart, i)) token.encodingHtml = true;
          token.end = i + 1;
          return TOKEN;
        } else {
          i++;
          break;
        }
        if (isHtmlEncoding(body, attributeStart, attributeEnd, valueStart, i)) token.encodingHtml = true;
        i++;
        break;
      case AFTER_VALUE_QUOTED:
        if (isHtmlWhitespace(code)) {
          state = BEFORE_ATTR_NAME;
          i++;
          break;
        }
        if (code === SLASH) {
          state = SELF_CLOSING;
          i++;
          break;
        }
        if (code === GT) {
          token.end = i + 1;
          return TOKEN;
        }
        state = BEFORE_ATTR_NAME;
        break;
      default:
        if (code === GT) {
          token.selfClosing = true;
          token.end = i + 1;
          return TOKEN;
        }
        state = BEFORE_ATTR_NAME;
    }
  }
}

// States inside a tag, for {@link readRawTag}.
const BEFORE_ATTR_NAME = 0;
const ATTR_NAME = 1;
const AFTER_ATTR_NAME = 2;
const BEFORE_ATTR_VALUE = 3;
const VALUE_DOUBLE = 4;
const VALUE_SINGLE = 5;
const VALUE_UNQUOTED = 6;
const AFTER_VALUE_QUOTED = 7;
const SELF_CLOSING = 8;

// ───────────────────────── Element rules ─────────────────────────

const setOf = (names: string) => new Set(names.split(' '));

/** Elements that never have content in HTML, and so never nest. */
const VOID_ELEMENTS = setOf('area base br col embed hr img input link meta param source track wbr');

/** Elements with a start tag that closes an open `<p>`. */
const CLOSES_PARAGRAPH = setOf(
  'address article aside blockquote center details dialog dir div dl dt dd fieldset figcaption figure footer header ' +
    'hgroup main menu nav ol ul li p section summary h1 h2 h3 h4 h5 h6 pre listing form plaintext table hr xmp',
);

/** The "special" elements: an end tag for a phrasing or unknown element does not cross these. */
const SPECIAL_ELEMENTS = setOf(
  'address applet area article aside base basefont bgsound blockquote body br button caption center col ' +
    'colgroup dd details dir div dl dt embed fieldset figcaption figure footer form frame frameset h1 h2 h3 h4 ' +
    'h5 h6 head header hgroup hr html iframe img input keygen li link listing main marquee menu meta nav ' +
    'noembed noframes noscript object ol p param plaintext pre script section select source style summary ' +
    'table tbody td template textarea tfoot th thead title tr track ul wbr xmp',
);

/** Elements a default-scope check stops at. */
const DEFAULT_SCOPE = setOf(
  'applet caption html table td th marquee object template mi mo mn ms mtext annotation-xml foreignobject desc title',
);
const BUTTON_SCOPE = new Set([...DEFAULT_SCOPE, 'button']);
const LIST_ITEM_SCOPE = new Set([...DEFAULT_SCOPE, 'ol', 'ul']);

/**
 * Elements the parser keeps on a list of its own, the active formatting
 * elements, and recreates when they have been closed by something else.
 */
const FORMATTING_ELEMENTS = setOf('a b big code em font i nobr s small strike strong tt u');
/** Elements that start a new section of that list: nothing opened inside them outlives them. */
const LIST_MARKERS = setOf('applet marquee object template table td th caption');

/** Block elements whose end tag closes everything implied up to them. */
const BLOCK_END = setOf(
  'address article aside blockquote center details dialog dir div dl fieldset figcaption figure footer header ' +
    'hgroup listing main menu nav ol pre section summary ul li dd dt button applet marquee object template',
);

/** The table structure: where one of these goes depends on which others are open. */
const TABLE_STRUCTURE = setOf('table caption colgroup col tbody thead tfoot tr td th');
const TABLE_SECTIONS = setOf('tbody thead tfoot');
/** Table elements that a table tag cannot live inside: they are closed first. */
const TABLE_LEFTOVERS = setOf('td th tr caption colgroup');

/** Namespaces of open elements. */
const HTML = 0;
const SVG = 1;
const MATHML = 2;

/** Elements in SVG whose content is HTML again. */
const SVG_INTEGRATION_POINTS = setOf('foreignobject desc title');
/** Elements in MathML whose content is HTML again. */
const MATHML_TEXT_INTEGRATION_POINTS = setOf('mi mo mn ms mtext');

/** Which table element an insertion would go into: the nearest one that is open, if any. */
interface Place {
  name: string;
  index: number;
}

/**
 * Counts how deeply elements are nested, the way a browser builds the tree.
 *
 * A plain stack of open tags would not do. Most real-world HTML leaves end
 * tags out (`<li>`, `<td>`, `<p>`), and a browser closes those elements by
 * itself at the right moment; a stack that waits for an end tag that never
 * comes counts every list item as one more level. So a start tag closes what
 * a browser would close before it, and an end tag closes what a browser would
 * close for it, and no more: the rules below only ever pop what the HTML
 * standard says is popped.
 *
 * The target is parse5, the parser rehype-raw uses, parsing a fragment (its
 * context is a `<template>`). The rules were checked against it on generated
 * tag sequences; see __tests__/lib/markdown/nesting-parity.test.ts.
 */
class NestingTracker {
  maxDepth = 0;
  /** The nesting went over the limit: stop feeding it. */
  over = false;

  private readonly limit: number;
  private names: string[] = [];
  /** Namespace of each open element. */
  private namespaces: number[] = [];
  /** Per open element: an `annotation-xml` whose encoding makes it an HTML integration point. */
  private htmlEncoded: boolean[] = [];
  /** Per open element: its attributes, which tell formatting elements apart. */
  private keys: string[] = [];
  /**
   * Per open element: it only stands in for an entry of the parser's list of
   * formatting elements (its own element was closed, and the parser will
   * recreate it), rather than being an element the author opened here.
   */
  private standIns: boolean[] = [];
  /**
   * Per open element: it is on the parser's list of active formatting
   * elements, and so will be recreated if something else closes it.
   */
  private listed: boolean[] = [];
  /**
   * The parser's context for table tags outside any table element.
   *
   * `template` until the first tag that is not a table tag turns it into
   * ordinary body `content`, where table tags are ignored; or into the table
   * context a leading table tag selects (`table`, `body`, `row`), which stays
   * in force until a table is closed.
   */
  private base: 'template' | 'content' | 'table' | 'body' | 'row' = 'template';

  constructor(limit: number = MAX_HTML_NESTING_DEPTH) {
    this.limit = limit;
  }

  /** The element now open holds SVG or MathML, where no element has raw text for content. */
  get foreign(): boolean {
    const top = this.names.length - 1;
    return top >= 0 && this.inForeignContent(top);
  }

  take(token: Token, body: string): void {
    if (token.kind !== 'start' && token.kind !== 'end') return;
    const name = body.slice(token.nameStart, token.nameEnd).toLowerCase();
    if (token.kind === 'end') {
      this.close(name);
      return;
    }
    // Formatting elements are told apart by their attributes as well: the
    // parser keeps three of every kind, not three in total.
    const key = FORMATTING_ELEMENTS.has(name)
      ? body.slice(token.nameEnd, token.end - (token.selfClosing ? 2 : 1))
      : '';
    this.open(name, token.selfClosing, token.encodingHtml, key);
  }

  // ── Start tags ──

  private open(name: string, selfClosing: boolean, encodingHtml: boolean, key: string): void {
    const top = this.names.length - 1;

    // Foreign content: everything nests, nothing is void or implied, and a
    // self-closing tag counts.
    if (top >= 0 && this.inForeignContent(top)) {
      if (selfClosing) return;
      this.push(name, this.namespaces[top], encodingHtml);
      return;
    }

    // A foreign root is the one self-closing element HTML honours.
    if (name === 'svg' || name === 'math') {
      if (!selfClosing) this.push(name, name === 'svg' ? SVG : MATHML);
      return;
    }
    // There is no place for these in a fragment: they are dropped.
    if (name === 'html' || name === 'head' || name === 'body') return;

    if (TABLE_STRUCTURE.has(name)) {
      this.openTableElement(name);
      return;
    }

    // Anything else is body content from here on, as far as table tags go.
    if (this.base === 'template' && this.nearest().name === '') this.base = 'content';

    // Anything but a `<col>` leaves a column group. A `<template>` is
    // handled before any insertion mode gets to say something, so it stays.
    if (this.names[top] === 'colgroup' && name !== 'template') this.pop();

    if (CLOSES_PARAGRAPH.has(name)) this.closeParagraph();
    if (VOID_ELEMENTS.has(name)) return;

    switch (name) {
      case 'a':
      case 'nobr':
        this.closeFormatting(name);
        break;
      case 'button':
        this.closeUpTo(name, DEFAULT_SCOPE);
        break;
      case 'li':
        this.closeListItem();
        break;
      case 'dd':
      case 'dt':
        this.closeDefinition();
        break;
      case 'option':
        this.popIf('option');
        break;
      // An `<optgroup>` nests inside an open one; an `<option>` does not.
      case 'optgroup':
        this.popIf('option');
        break;
    }

    this.push(name, HTML, false, key);
  }

  /**
   * Insert a table element where the parser puts it.
   *
   * A fragment is parsed with a `<template>` as its context, and a template
   * starts out accepting table tags: `<td>` opens a cell at top level. The
   * parser then remembers which table context it entered (`{@link base}`),
   * so `<caption><td>` closes the caption and still supplies a whole
   * tbody > tr for the cell. Inside a real table it supplies what is missing
   * too (`<table><td>` becomes table > tbody > tr > td, every level a real
   * element), and a tag that cannot live where it is closes the elements in
   * its way first. In ordinary body content table tags are ignored.
   */
  private openTableElement(name: string): void {
    // In body content every table tag but a table itself is ignored.
    if (name !== 'table' && this.where() === 'content') return;

    switch (name) {
      case 'td':
      case 'th':
        this.leaveLeftovers();
        this.supplyRow();
        break;
      case 'tr':
        this.leaveLeftovers();
        this.supplySection();
        break;
      case 'col':
        // Void, but it brings a column group with it.
        this.leaveLeftovers('colgroup');
        this.supplySection();
        if (this.where() === 'table' && this.top() !== 'colgroup') this.push('colgroup', HTML);
        return;
      case 'tbody':
      case 'thead':
      case 'tfoot':
        this.leaveLeftovers();
        // A new section replaces the open one.
        if (TABLE_SECTIONS.has(this.top())) this.pop();
        break;
      case 'caption':
      case 'colgroup':
        this.leaveLeftovers();
        break;
      default:
        // A table inside a cell or a caption nests. Anywhere else it closes
        // the table around it first, when there is one: a row or a section
        // the parser supplied for a stray `<tr>` has no table around it, and
        // a `<table>` in there nests like any other element.
        if (this.where() === 'cell' || this.where() === 'caption') break;
        if (this.hasInScope('table')) {
          this.leaveLeftovers();
          this.closeTableElement(new Set(['table']));
        }
        this.closeParagraph();
    }

    if (this.where() === 'template') this.base = name === 'tr' ? 'body' : name === 'td' || name === 'th' ? 'row' : 'table';
    this.push(name, HTML);
  }

  /** Supply the table section a row or cell needs, if the parser would. */
  private supplySection(): void {
    if (this.where() === 'table') this.push('tbody', HTML);
    else if (this.where() === 'template') this.base = 'body';
  }

  /** Supply the row a cell needs, on top of its section. */
  private supplyRow(): void {
    if (this.where() === 'template') {
      this.base = 'row';
      return;
    }
    this.supplySection();
    const here = this.where();
    if (here === 'section' || here === 'body') this.push('tr', HTML);
  }

  // ── End tags ──

  private close(name: string): void {
    const top = this.names.length - 1;

    // In foreign content an end tag closes the nearest element of that name.
    if (top >= 0 && this.inForeignContent(top)) {
      for (let k = top; k >= 0; k--) {
        if (this.names[k] === name) {
          this.closeTo(k);
          return;
        }
        if (this.namespaces[k] === HTML) return;
      }
      return;
    }

    // `</br>` is a `<br>`, and an unmatched `</p>` adds an empty paragraph.
    if (name === 'html' || name === 'head' || name === 'body' || name === 'br') return;

    if (name === 'p') this.closeParagraph();
    // A cell end tag closes a cell of its own name only: `</th>` does not close a `<td>`.
    else if (TABLE_STRUCTURE.has(name)) this.closeTableElement(new Set([name]));
    else if (name === 'li') this.closeUpTo(name, LIST_ITEM_SCOPE);
    else if (BLOCK_END.has(name)) this.closeUpTo(name, DEFAULT_SCOPE);
    else this.closePhrasing(name);
  }

  /** Close the nearest table element of `targets`, if one is open before the table or template around here. */
  private closeTableElement(targets: Set<string>): void {
    for (let k = this.names.length - 1; k >= 0; k--) {
      // A foreign element of the same name is something else entirely.
      if (this.namespaces[k] !== HTML) return;
      const name = this.names[k];
      if (targets.has(name)) {
        this.closeTo(k);
        // Closing the table leaves the parser's remembered table context.
        if (name === 'table') this.base = 'content';
        return;
      }
      if (name === 'table' || name === 'template') return;
    }
  }

  /** Whether an element named `name` is open before the table or template around here. */
  private hasInScope(name: string): boolean {
    for (let k = this.names.length - 1; k >= 0; k--) {
      if (this.names[k] === name) return true;
      if (this.names[k] === 'table' || this.names[k] === 'template' || this.namespaces[k] !== HTML) return false;
    }
    return false;
  }

  /** `<p>` in button scope is closed by a block-level start tag (`<div>`, `<hr>`, …). */
  private closeParagraph(): void {
    this.closeUpTo('p', BUTTON_SCOPE);
  }

  /** Close an open element together with everything opened inside it, provided it is in scope. */
  private closeUpTo(target: string, boundary: Set<string>): void {
    for (let k = this.names.length - 1; k >= 0; k--) {
      const name = this.names[k];
      if (name === target) {
        this.closeTo(k);
        return;
      }
      // A foreign element is a boundary whatever its name.
      if (boundary.has(name) || this.namespaces[k] !== HTML) return;
    }
  }

  /** Close an open `<li>`, unless a block element other than `div` lies above it. */
  private closeListItem(): void {
    this.closeListItemLike('li');
  }

  /** Close an open `<dd>` or `<dt>` on the same terms as a list item. */
  private closeDefinition(): void {
    if (this.top() === 'dt' || this.top() === 'dd') {
      this.pop();
    } else {
      this.closeListItemLike('');
    }
  }

  private closeListItemLike(target: string): void {
    for (let k = this.names.length - 1; k >= 0; k--) {
      const name = this.names[k];
      if (name === target || (target === '' && (name === 'dd' || name === 'dt'))) {
        this.closeTo(k);
        return;
      }
      if (name !== 'address' && name !== 'div' && name !== 'p') {
        if (SPECIAL_ELEMENTS.has(name) || this.namespaces[k] !== HTML) return;
      }
    }
  }

  /**
   * A second `<a>` (or `<nobr>`) closes the first, unless a block element was
   * opened in between: then the parser keeps the first one open and merely
   * moves it in the tree, and the new one nests inside that block.
   */
  private closeFormatting(target: string): void {
    for (let k = this.names.length - 1; k >= 0; k--) {
      const name = this.names[k];
      if (name === target) {
        this.closeTo(k);
        return;
      }
      if (LIST_MARKERS.has(name) || SPECIAL_ELEMENTS.has(name) || this.namespaces[k] !== HTML) return;
    }
  }

  /**
   * Close an open phrasing or unknown element. Unlike a block element it is
   * not closed across another block: `</b>` inside a `<div>` that sits above
   * the `<b>` does nothing.
   */
  private closePhrasing(target: string): void {
    for (let k = this.names.length - 1; k >= 0; k--) {
      const name = this.names[k];
      if (name === target) {
        this.closeTo(k);
        return;
      }
      if (SPECIAL_ELEMENTS.has(name) || this.namespaces[k] !== HTML) return;
    }
  }

  // ── The stack ──

  /**
   * Close the open cell, row, caption and column group, with whatever was
   * opened inside them, up to and including the outermost one.
   */
  private leaveLeftovers(keep?: string): void {
    for (let place = this.nearest(); TABLE_LEFTOVERS.has(place.name) && place.name !== keep; place = this.nearest()) {
      this.closeTo(place.index);
    }
  }

  /**
   * The nearest open table element, if any: the one a table tag would go
   * into. Only HTML elements count: a `<td>` inside SVG is a foreign element
   * with the same name, not a cell.
   */
  private nearest(): Place {
    for (let k = this.names.length - 1; k >= 0; k--) {
      if (this.namespaces[k] !== HTML || this.names[k] === 'template') break;
      const name = this.names[k];
      if (TABLE_STRUCTURE.has(name)) return { name, index: k };
    }
    return { name: '', index: -1 };
  }

  /**
   * Where a table tag is being handled: inside the nearest open table
   * element; or, with no table open, in the context the parser is in there.
   *
   * Inside a `<template>` the context starts over. Inside an HTML island in
   * SVG or MathML table tags are ignored, as in body content. At top level it
   * is the context the parser remembers for the fragment ({@link base}).
   */
  private where(): string {
    const place = this.nearest();
    switch (place.name) {
      case '':
        break;
      case 'td':
      case 'th':
        return 'cell';
      case 'tr':
        return 'row';
      case 'caption':
        return 'caption';
      case 'colgroup':
        return 'colgroup';
      case 'table':
        return 'table';
      default:
        return 'section';
    }

    for (let k = this.names.length - 1; k >= 0; k--) {
      if (this.namespaces[k] !== HTML) return 'content';
      if (this.names[k] === 'template') return 'template';
    }
    return this.base;
  }

  /** Whether the content of the open element at `k` is SVG or MathML rather than HTML. */
  private inForeignContent(k: number): boolean {
    const name = this.names[k];
    if (this.namespaces[k] === SVG) return !SVG_INTEGRATION_POINTS.has(name);
    // `annotation-xml` is an integration point only with an HTML encoding.
    if (this.namespaces[k] === MATHML) {
      if (name === 'annotation-xml') return !this.htmlEncoded[k];
      return !MATHML_TEXT_INTEGRATION_POINTS.has(name);
    }
    return false;
  }

  private top(): string {
    return this.names[this.names.length - 1] ?? '';
  }

  private pop(): void {
    this.truncate(this.names.length - 1);
  }

  private popIf(name: string): void {
    if (this.top() === name) this.pop();
  }

  private push(name: string, namespace: number, encodingHtml = false, key = ''): void {
    const listed = namespace === HTML && FORMATTING_ELEMENTS.has(name);
    if (listed) this.evictFourth(name, key);
    this.names.push(name);
    this.namespaces.push(namespace);
    this.htmlEncoded.push(encodingHtml);
    this.keys.push(key);
    this.listed.push(listed);
    this.standIns.push(false);
    if (this.names.length > this.maxDepth) this.maxDepth = this.names.length;
    if (this.maxDepth > this.limit) this.over = true;
  }

  /**
   * The parser keeps at most three formatting elements with the same tag and
   * attributes on its list; a fourth makes the oldest of them leave the list.
   *
   * Leaving the list closes nothing. The element is open when it happens,
   * and it merely will not be recreated any more after it has been closed.
   */
  private evictFourth(name: string, key: string): void {
    let same = 0;
    for (let k = this.names.length - 1; k >= 0; k--) {
      if (this.namespaces[k] === HTML && LIST_MARKERS.has(this.names[k])) return;
      if (this.listed[k] && this.names[k] === name && this.keys[k] === key && ++same === 3) {
        // An element that is really open stays open; one that only stood in
        // for its list entry is gone with the entry.
        if (!this.standIns[k]) {
          // Really open where it is: it only leaves the list.
          this.listed[k] = false;
          return;
        }
        // A stand-in for an entry that is not on the list any more. The
        // parser has just recreated that entry, inside the element now open:
        // from here on it is an element like any other, and it closes with
        // what now contains it. So it leaves the bottom of the stack, where
        // the stand-ins sit, for the top.
        this.removeAt(k);
        this.names.push(name);
        this.namespaces.push(HTML);
        this.htmlEncoded.push(false);
        this.keys.push('');
        this.listed.push(false);
        this.standIns.push(false);
        return;
      }
    }
  }

  /**
   * Close the element at `keep` and everything opened inside it.
   *
   * A formatting element is not simply dropped. The parser keeps it on a
   * list of its own and recreates it before the next start tag, so it is kept
   * open here, on top of what remains. Only a marker element throws the list
   * away, and only what was opened inside the marker.
   */
  private closeTo(keep: number): void {
    let marker = -1;
    for (let k = this.names.length - 1; k >= keep; k--) {
      if (this.namespaces[k] === HTML && LIST_MARKERS.has(this.names[k])) {
        marker = k;
        break;
      }
    }

    let write = keep;
    const until = marker < 0 ? this.names.length : marker;
    for (let k = keep + 1; k < until; k++) {
      if (!this.listed[k]) continue;
      this.copyEntry(k, write);
      this.standIns[write] = true;
      write++;
    }
    this.truncate(write);
  }

  private removeAt(index: number): void {
    for (let k = index + 1; k < this.names.length; k++) this.copyEntry(k, k - 1);
    this.truncate(this.names.length - 1);
  }

  private copyEntry(from: number, to: number): void {
    this.names[to] = this.names[from];
    this.namespaces[to] = this.namespaces[from];
    this.htmlEncoded[to] = this.htmlEncoded[from];
    this.keys[to] = this.keys[from];
    this.listed[to] = this.listed[from];
    this.standIns[to] = this.standIns[from];
  }

  private truncate(keep: number): void {
    this.names.length = keep;
    this.namespaces.length = keep;
    this.htmlEncoded.length = keep;
    this.keys.length = keep;
    this.listed.length = keep;
    this.standIns.length = keep;
  }
}

// ───────────────────────── The scans over the content ─────────────────────────

/**
 * Elements whose content is text for the browser: no tag inside one is an
 * element. `plaintext` is the one without an end tag.
 */
const RAW_TEXT_PLAINTEXT = 'plaintext';
/** The others, in the order of their needles (see {@link NEEDLES}). */
const RAW_TEXT_NAMES = ['script', 'style', 'textarea', 'title', 'xmp', 'iframe', 'noembed', 'noframes'];

/** A stretch of text, `[from, to)`. */
interface Stretch {
  from: number;
  to: number;
}

/** A tag as the first pass of {@link scanInlineUnit} read it. */
interface TagEvent {
  at: number;
  token: Token;
  /** It lies inside a code span for certain: text for the browser as well. */
  inCode: boolean;
  /**
   * The parser does not take it for a tag, but the browser re-parses it as
   * markup: it lies in the part of a comment that the browser ends early.
   */
  browserOnly: boolean;
  /** For the start tag of a raw-text element: where its content ends. */
  rawTextTo: number;
  /** For that start tag: it is a tag for certain, so the browser reads raw text after it. */
  certain: boolean;
  /**
   * Every reading of the text was inside code when the tag was read, by the
   * length of the code span. The tag is inside code for certain only when
   * each of those spans closes behind it, which the end of the first pass
   * knows and `inCode` then says.
   */
  pending: number[] | null;
  /** A reading has the tag inside a link, an autolink or a comment. */
  opaque: boolean;
}
/** Where the end tag of the raw-text element `index` starts, at or after `from`, or -1. */
function rawTextEnd(body: string, from: number, index: number, folded: Finder): number {
  for (;;) {
    const at = folded.find(NEEDLE_RAW_TEXT_END + index, from);
    if (at < 0) return -1;
    // An end tag only counts when its name ends here.
    const after = body.charCodeAt(at + RAW_TEXT_NAMES[index].length + 2);
    if (isHtmlWhitespace(after) || after === SLASH || after === GT) return at;
    from = at + 1;
  }
}

/**
 * Read the raw markup in `[from, to)` and hand every tag to `sink`, in order.
 *
 * This is the reading for text that is known to be markup: HTML blocks and
 * raw-HTML posts, which the browser re-parses with the HTML tokenizer, and
 * the part of a comment that the browser closes before the parser does. A
 * token may run past `to`, because it is markup there too, but never past
 * `limit`.
 *
 * The content of a raw-text element is not markup, so it is skipped up to
 * its end tag. Where the HTML tokenizer's rules apply without a doubt
 * (`trusted`), that is exactly what the browser does, and the scan goes on
 * behind the end tag. Elsewhere the start tag may turn out to be text for the
 * browser, so the stretch is only reported through `region`, for the caller to
 * treat as possibly inert, and the scan goes on reading inside it.
 *
 * Returns the position up to which the markup swallowed the text, or -1: a
 * raw-text element, a `plaintext` element or a tag that never closes takes
 * everything with it up to `limit`, and a token that runs past `to` takes
 * what lies of the text up to where it ends.
 */
function scanRawMarkup(
  body: string,
  from: number,
  to: number,
  limit: number,
  search: Finder,
  folded: Finder,
  trusted: boolean,
  foreign: () => boolean,
  sink: (token: Token, at: number) => void,
  region: ((stretch: Stretch) => void) | null,
  done: () => boolean,
): number {
  const token = newToken();
  const endTag = newToken();
  let i = from;

  while (i < to && !done()) {
    i = search.find(NEEDLE_MARKUP_START, i);
    if (i < 0 || i >= to) break;

    const found = readRawToken(body, i, token, search, limit);
    // A tag that never closes takes everything after it with it.
    if (found === UNFINISHED_TAG) return limit;
    if (found === NOT_MARKUP) {
      i++;
      continue;
    }

    const at = i;
    const html = token.kind === 'start' && !foreign();
    sink(token, at);
    i = Math.max(token.end, at + 1);
    const name = html ? body.slice(token.nameStart, token.nameEnd).toLowerCase() : '';

    if (name === RAW_TEXT_PLAINTEXT) {
      // Nothing closes it: the rest is text.
      region?.({ from: at, to: body.length });
      if (trusted) return limit;
      continue;
    }

    const index = RAW_TEXT_NAMES.indexOf(name);
    if (index < 0) continue;

    const close = rawTextEnd(body, i, index, folded);
    region?.({ from: at, to: close < 0 ? body.length : close });
    if (!trusted) continue; // the tags inside may be real after all
    if (close < 0) return limit;

    // The end tag closes the element like any other.
    readRawToken(body, close, endTag, search, limit);
    sink(endTag, close);
    i = Math.max(endTag.end, close + 1);
  }

  // The last token ran past the end of the region: so does what it swallowed.
  return i > to ? i : -1;
}

/**
 * Where the link that opens with the `(` at `at` ends, as far as a quick
 * reading can tell, or `to` when it cannot tell.
 *
 * Neither the destination nor the title of a link is markup, so an end tag
 * inside one pops nothing for the browser. The reading follows the parser's
 * grammar (a destination in `<>` or bare, then an optional quoted title),
 * but is deliberately the generous side of it: whenever it does not end with
 * a `)` where the grammar wants one, the answer is the end of the unit,
 * which is never too early.
 */
function linkEnd(body: string, at: number, to: number): number {
  let i = at + 1;
  while (isTagWhitespace(body.charCodeAt(i))) i++;

  if (body.charCodeAt(i) === LT) {
    while (i < to && body.charCodeAt(i) !== GT && body.charCodeAt(i) !== LF) i++;
    if (body.charCodeAt(i) !== GT) return to;
    i++;
  } else {
    // A bare destination: no whitespace, and no `)` that no `(` opened.
    let depth = 0;
    while (i < to) {
      const code = body.charCodeAt(i);
      if (code === BACKSLASH) {
        i += 2;
        continue;
      }
      if (isTagWhitespace(code)) break;
      if (code === LEFT_PAREN) depth++;
      else if (code === RIGHT_PAREN) {
        if (depth === 0) break;
        depth--;
      }
      i++;
    }
  }

  while (isTagWhitespace(body.charCodeAt(i))) i++;

  const quote = body.charCodeAt(i);
  if (quote === DOUBLE_QUOTE || quote === SINGLE_QUOTE || quote === LEFT_PAREN) {
    const closer = quote === LEFT_PAREN ? RIGHT_PAREN : quote;
    for (i++; i < to; i++) {
      const code = body.charCodeAt(i);
      if (code === BACKSLASH) i++;
      else if (code === closer) break;
    }
    if (i >= to) return to;
    i++;
    while (isTagWhitespace(body.charCodeAt(i))) i++;
  }

  return body.charCodeAt(i) === RIGHT_PAREN ? i + 1 : to;
}

/** Whether any backtick lies in `[from, to)`. */
function hasBacktick(body: string, from: number, to: number): boolean {
  for (let i = from; i < to; i++) {
    if (body.charCodeAt(i) === BACKTICK) return true;
  }
  return false;
}

/** Sort by start, and merge what overlaps into single stretches. */
function merge(stretches: Stretch[]): Stretch[] {
  stretches.sort((a, b) => a.from - b.from);
  const merged: Stretch[] = [];
  for (const stretch of stretches) {
    const last = merged[merged.length - 1];
    if (last && stretch.from <= last.to) last.to = Math.max(last.to, stretch.to);
    else merged.push({ ...stretch });
  }
  return merged;
}

/**
 * Scan one inline unit (a paragraph, a heading, a list item, a row of a
 * table) for tags, and feed them to `strict` as the browser would see them,
 * and to `trusting` as it would see them if no end tag were text.
 *
 * The unit is read in two passes. The first reads everything and notes where
 * the text may be something else than markup: a code span, the destination or
 * the title of a link, an autolink, a comment, the content of a raw-text
 * element. The second feeds the tags to the trackers:
 *
 * - An end tag inside possibly inert text never pops the strict estimate.
 *   Popping an end tag the browser does not see is the one way to
 *   under-estimate nesting. The trusting estimate pops it all the same, so it
 *   is the least nesting the browser can build. Where the strict estimate
 *   goes over the limit and the trusting one does not, the body is refused
 *   as over a budget (`html-nesting-uncertain`), not as a hostile structure.
 * - A start tag is skipped only inside text that is inert for certain:
 *   `inCode`, a code span that every reading of the text has around it and
 *   that closes behind it, and the content of a raw-text element whose start
 *   tag is such a tag for certain. Skipping a start tag the browser does see
 *   would under-estimate as well, so everywhere else it is counted, inert or
 *   not.
 *
 * What a reading is: the guard does not decide what is a link. It knows where
 * one may be (`[x](…)`), and a backtick in there opens a code span for a
 * reading that makes no link of it, and none for one that does. `open` keeps
 * the code spans of all those readings side by side, by the length of their
 * opening backtick string, and text is possibly inside code when any reading
 * has it there. The same goes for a pipe, which may end a code span by
 * splitting a row of a table into cells.
 *
 * A code span is a backtick string and the next one of the same length. A
 * backtick string that nothing of its length closes opens nothing, wherever
 * the readings are when it comes: a lone backtick is an ordinary character.
 * So text is possibly inside code only between two strings that are a pair
 * for some reading, and inside code for certain only when every reading has
 * a span around it that is closed by a string that is live for every reading.
 *
 * Every search of the first pass stays inside the unit (see {@link Finder}),
 * and nothing is looked up again behind the position it is needed at: a
 * comment that does not end here runs to the end of the unit, the end tag of
 * a raw-text element is looked for in the unit alone, and one number says up
 * to where a reading is inside a link, an autolink or a comment.
 *
 * `swallowed` is the position up to which raw markup before this unit has
 * swallowed the text (an unterminated `<script>` in an HTML block): what lies
 * before it is text for the browser.
 */
function scanInlineUnit(
  body: string,
  from: number,
  to: number,
  cells: boolean,
  swallowed: number,
  strict: NestingTracker,
  trusting: NestingTracker,
  folded: () => string,
): PathologyReason | null {
  const search = new Finder(body, from, to);
  const token = newToken();
  const events: TagEvent[] = [];
  /** Possibly inert text: an end tag inside is never popped. */
  const inert: Stretch[] = [];
  /** Every backtick string, in order: where it starts, how long it is, and whether a reading makes nothing of it. */
  const runs: number[] = [];
  /**
   * Where inert text that reaches past the end of the unit begins, or -1: a
   * stretch of that kind which starts behind it lies inside it.
   */
  let inertFromEnd = -1;
  /**
   * The lengths of the code spans the readings are inside; 0 is outside code.
   * `openers` holds, at the same index, where the earliest of their openings
   * is.
   */
  let open: number[] = [0];
  let openers: number[] = [from];
  /** What the readings were written into last time: filled again next time, so that nothing is allocated per string. */
  let spare: number[] = [];
  let spareOpeners: number[] = [];
  /** Up to where a reading may be inside a link, an autolink or a comment: the furthest such stretch ends there. */
  let opaqueUntil = -1;
  /** More readings than this are not told apart any more: nothing is for certain after it. */
  const READINGS = 8;
  let lost = false;
  /** How much the readings of links may still read: past that, a link runs to the end of the unit. */
  let budget = to - from;
  /** The unit in lower case, as a `Finder`: cut out when a raw-text element is met. */
  let lower: Finder | null = null;
  const inLower = (): Finder => {
    if (lower === null) lower = new Finder(folded(), from, to);
    return lower;
  };
  let i = from;

  const noteRun = (at: number, size: number, escaped: boolean, dead: boolean): void => {
    runs.push(at, size, dead ? 1 : 0);

    // One reading and nothing to keep for another: it moves, and nothing is allocated.
    if (!dead && open.length === 1) {
      const state = open[0];
      if (state === size && state !== 0) noteInert(openers[0] + state, at);
      open[0] = state === 0 ? (escaped ? 0 : size) : state === size ? 0 : state;
      if (open[0] !== 0 && state === 0) openers[0] = at;
      return;
    }

    // The readings after this string, written into the arrays the last string left behind.
    const states = spare;
    const starts = spareOpeners;
    states.length = 0;
    starts.length = 0;
    for (let k = 0; k < open.length; k++) {
      const state = open[k];
      if (state === size && state !== 0) noteInert(openers[k] + state, at);
      addReading(states, starts, state === 0 ? (escaped ? 0 : size) : state === size ? 0 : state, state === 0 && !escaped ? at : openers[k]);
      // A reading for which the string is inert stays where it is.
      if (dead) addReading(states, starts, state, openers[k]);
    }
    if (states.length > READINGS) lost = true;
    spare = open;
    spareOpeners = openers;
    open = states;
    openers = starts;
  };

  /**
   * Note possibly inert text. A stretch that reaches past the end of the
   * unit lies inside one noted before it that does the same, and is skipped:
   * a hundred unterminated comments in a paragraph are one stretch.
   */
  const noteInert = (from: number, end: number): void => {
    if (end >= to) {
      if (inertFromEnd >= 0 && inertFromEnd <= from) return;
      inertFromEnd = from;
    }
    // A flood of openers notes one stretch after the other, each behind the
    // last: it lies inside it, or extends it.
    const last = inert[inert.length - 1];
    if (last !== undefined && last.from <= from) {
      if (end <= last.to) return;
      if (last.from === from) {
        last.to = end;
        return;
      }
    }
    inert.push({ from, to: end });
  };

  const record = (found: Token, at: number, browserOnly: boolean): TagEvent => {
    const event: TagEvent = {
      at,
      token: { ...found },
      inCode: false,
      browserOnly,
      rawTextTo: -1,
      certain: false,
      pending: null,
      opaque: false,
    };
    events.push(event);
    return event;
  };

  while (i < to) {
    const code = body.charCodeAt(i);

    // A backslash escapes the next character, wherever that means anything.
    if (code === BACKSLASH) {
      if (body.charCodeAt(i + 1) === BACKTICK) {
        let size = 1;
        while (body.charCodeAt(i + 2 + size) === BACKTICK) size++;
        noteRun(i + 1, size, true, false);
        i += 1 + size;
      } else {
        i += 2;
      }
      continue;
    }

    if (code === BACKTICK) {
      let size = 1;
      while (body.charCodeAt(i + size) === BACKTICK) size++;
      noteRun(i, size, false, opaqueUntil > i);
      i += size;
      continue;
    }

    if (code === LT) {
      if (!readInlineHtml(body, i, token, search)) {
        // Not a tag. An autolink is not markup either, and neither is a
        // comment that ends past this unit.
        let end = i + 1;
        while (end < to && !isTagWhitespace(body.charCodeAt(end)) && body.charCodeAt(end) !== LT && body.charCodeAt(end) !== GT) {
          end++;
        }
        if (body.charCodeAt(end) === GT) opaqueUntil = Math.max(opaqueUntil, end);
        if (body.startsWith('<!--', i)) {
          // Not closed in this unit, so not a comment for the parser. The
          // browser may still end one here that started behind the unit: what
          // follows is possibly inert up to the end of the unit.
          const close = search.find(NEEDLE_COMMENT_END, i + 2);
          const until = close < 0 ? to : close + 3;
          noteInert(i, until);
          opaqueUntil = Math.max(opaqueUntil, until);
          i += 4;
          continue;
        }
        i++;
        continue;
      }

      const at = i;
      i = token.end;
      // A tag is one piece for the parser, but a backtick inside it may
      // open a code span for a reading that does not see a tag there.
      for (let j = at; j < i; ) {
        if (body.charCodeAt(j) !== BACKTICK) {
          j++;
          continue;
        }
        let size = 1;
        while (body.charCodeAt(j + size) === BACKTICK) size++;
        noteRun(j, size, false, true);
        j += size;
      }
      if (hasBacktick(body, at, i)) noteInert(at, i);

      const event = record(token, at, false);
      // Inside code for every reading so far. Whether that holds is known
      // only when the pass is over: each of these spans has to close behind
      // the tag.
      event.pending = !lost && !open.includes(0) ? [...open] : null;
      event.opaque = opaqueUntil > at;

      if (token.kind === 'comment') {
        // The parser reads the comment through `token.end`. The browser ends
        // it no later, and what lies between the two is raw markup.
        const browserEnd = search.commentEnd(at);
        if (browserEnd >= 0 && browserEnd < token.end) {
          scanRawMarkup(
            body,
            browserEnd,
            token.end,
            to,
            search,
            inLower(),
            false,
            never,
            (found, at2) => {
              record(found, at2, true).pending = event.pending;
            },
            (stretch) => noteInert(stretch.from, stretch.to),
            never,
          );
        }
      } else if (token.kind === 'start') {
        const name = body.slice(token.nameStart, token.nameEnd).toLowerCase();
        const index = RAW_TEXT_NAMES.indexOf(name);
        if (index >= 0 || name === RAW_TEXT_PLAINTEXT) {
          // The end tag is looked for in this unit alone: is there none, the
          // browser may read raw text up to the end of the body.
          const close = index < 0 ? -1 : rawTextEnd(body, i, index, inLower());
          event.rawTextTo = close < 0 ? body.length : close;
          noteInert(at, event.rawTextTo);
        }
      }
      continue;
    }

    if (code === RBRACKET) {
      if (opaqueUntil <= i) {
        if (body.charCodeAt(i + 1) === COLON) {
          // A link reference definition. Its title may run over more lines.
          let end = i + 2;
          while (end < to && body.charCodeAt(end) !== LF) end++;
          const until = hasQuote(body, i + 2, end) ? to : end;
          noteInert(i + 1, until);
          opaqueUntil = Math.max(opaqueUntil, until);
        } else {
          let at = i + 1;
          while (isTagWhitespace(body.charCodeAt(at))) at++;
          if (body.charCodeAt(at) === LEFT_PAREN) {
            let end = to;
            if (budget >= 0) {
              end = linkEnd(body, at, to);
              budget -= end - at;
            }
            noteInert(at, end);
            opaqueUntil = Math.max(opaqueUntil, end);
          }
        }
      }
      i++;
      continue;
    }

    // A pipe may split the line into cells, and a cell is parsed for inline
    // markup on its own. In a row of a table it certainly does.
    if (code === PIPE) {
      if (cells) {
        open = [0];
        openers = [i];
      } else if (!open.includes(0)) {
        open.push(0);
        openers.push(i);
      }
      if (open.length > READINGS) lost = true;
    }
    i++;
  }

  // Once the readings are no longer told apart, any two backtick strings of
  // a length may be a pair.
  if (lost) {
    // The strings are in order: the first of a length is the first met.
    const first = new Map<number, [number, number]>();
    for (let k = 0; k < runs.length; k += 3) {
      const pair = first.get(runs[k + 1]);
      if (pair === undefined) first.set(runs[k + 1], [runs[k], runs[k]]);
      else pair[1] = runs[k];
    }
    for (const [at, last] of first.values()) {
      if (last > at) noteInert(at, last);
    }
  }
  const possibly = merge(inert);

  // The backtick strings that are live for every reading, by length. A
  // reading inside code is out of it for certain only at the next one of its
  // length.
  const live = new Map<number, number[]>();
  for (let k = 0; k < runs.length; k += 3) {
    if (runs[k + 2] !== 0) continue;
    const positions = live.get(runs[k + 1]);
    if (positions === undefined) live.set(runs[k + 1], [runs[k]]);
    else positions.push(runs[k]);
  }
  for (const event of events) {
    if (event.pending !== null) event.inCode = event.pending.every((size) => closesBehind(live.get(size), event.at));
    event.certain = !event.inCode && !event.opaque;
  }

  let stretch = 0;
  let rawTextTo = -1;

  for (const event of events) {
    const at = event.at;
    while (stretch < possibly.length && possibly[stretch].to <= at) stretch++;
    // Raw markup before this unit may have swallowed the text up to here.
    if (at < swallowed) continue;
    if (event.inCode) continue;

    if (event.token.kind === 'start') {
      if (at < rawTextTo) continue;
      const foreign = strict.foreign;
      strict.take(event.token, body);
      trusting.take(event.token, body);
      // After a start tag that is one for certain, the browser reads raw
      // text for certain as well.
      if (event.certain && !foreign && event.rawTextTo > at) rawTextTo = event.rawTextTo;
    } else if (event.token.kind === 'end') {
      if (stretch >= possibly.length || at < possibly[stretch].from) strict.take(event.token, body);
      trusting.take(event.token, body);
    }
    if (strict.over || trusting.over) return trusting.over ? 'html-nesting' : 'html-nesting-uncertain';
  }

  return null;
}

/**
 * Note a reading of the code spans. Readings inside a span of one length
 * are kept as one, by the earliest opening among them: that is the stretch
 * any of them may have inside code.
 */
function addReading(states: number[], openers: number[], state: number, opener: number): void {
  const known = states.indexOf(state);
  if (known < 0) {
    states.push(state);
    openers.push(opener);
  } else if (opener < openers[known]) {
    openers[known] = opener;
  }
}

/** Whether the sorted `positions` have one behind `at`. */
function closesBehind(positions: number[] | undefined, at: number): boolean {
  if (positions === undefined) return false;
  let low = 0;
  let high = positions.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (positions[middle] <= at) low = middle + 1;
    else high = middle;
  }
  return low < positions.length;
}
/** Whether a quote character lies in `[from, to)`. */
function hasQuote(body: string, from: number, to: number): boolean {
  for (let i = from; i < to; i++) {
    const code = body.charCodeAt(i);
    if (code === DOUBLE_QUOTE || code === SINGLE_QUOTE || code === LEFT_PAREN) return true;
  }
  return false;
}

function never(): boolean {
  return false;
}

/**
 * Whether an emphasis run can close emphasis, as the parser sees it.
 *
 * A run closes when something other than whitespace precedes it (or another
 * marker). For `_` a letter or digit right after it makes it part of a word
 * instead, as in `snake_case`. `~` is not bound to a word: the strikethrough
 * extension decides from the character before the run alone.
 */
function isCloser(marker: number, previous: number, next: number): boolean {
  if (marker === UNDERSCORE && isAsciiAlphanumeric(next)) return false;
  return !isFlankWhitespace(previous);
}

/** What the inline units of a body have used, so far, of the budgets that are per body. */
interface InlineTotals {
  tokens: number;
  work: number;
  markers: number;
}

/**
 * Micromark's inline resolver work for one inline unit, against its budget,
 * and the number of special characters and of closing emphasis markers
 * against theirs; then the same three for the body so far, in `totals`.
 *
 * Counts the triggers (emphasis runs that can close, and `]`) and the tokens
 * they walk back over (emphasis runs, brackets, backticks, `<`, `&`, `\`).
 * Also applies the run-length rule, which needs the same walk. It counts
 * what the text is made of, not what the parser makes of it: a delimiter in
 * a code span or inside a tag is counted as well, which only over-counts.
 *
 * Every count grows while the unit is read, so a budget can be checked
 * against the running figure and the unit is cut short when it is over.
 */
function countInlineWork(body: string, start: number, end: number, totals: InlineTotals): PathologyReason | null {
  let tokens = 0;
  let resolvers = 0;
  /** Emphasis markers in the runs that can close emphasis. */
  let markers = 0;

  for (let i = start; i < end; ) {
    const code = body.charCodeAt(i);

    if (code === ASTERISK || code === UNDERSCORE || code === TILDE) {
      if (i > start && body.charCodeAt(i - 1) === code) {
        i++; // inside the run counted at its start
        continue;
      }
      let run = 1;
      while (body.charCodeAt(i + run) === code) run++;
      if (run > MAX_DELIMITER_RUN_LENGTH) return 'delimiter-run';
      tokens++;
      const previous = i > start ? body.charCodeAt(i - 1) : LF;
      const next = i + run < end ? body.charCodeAt(i + run) : LF;
      if (isCloser(code, previous, next)) {
        resolvers++;
        markers += run;
      }
      i += run;
    } else {
      if (code === RBRACKET) {
        tokens++;
        resolvers++;
      } else if (
        code === LBRACKET ||
        code === EXCLAMATION ||
        code === BACKTICK ||
        code === LT ||
        code === AMPERSAND ||
        code === BACKSLASH
      ) {
        tokens++;
      }
      i++;
    }

    // What this unit uses, then what the body has left.
    const work = resolvers * tokens;
    if (tokens > MAX_INLINE_TOKENS) return 'inline-tokens';
    if (work > MAX_INLINE_RESOLVE_WORK) return 'inline-resolve-work';
    if (totals.tokens + tokens > MAX_INLINE_TOKENS_TOTAL) return 'inline-tokens-total';
    if (totals.work + work > MAX_INLINE_RESOLVE_WORK_TOTAL) return 'inline-resolve-work-total';
    if (totals.markers + markers > MAX_EMPHASIS_MARKERS_TOTAL) return 'emphasis-markers-total';
  }

  totals.tokens += tokens;
  totals.work += resolvers * tokens;
  totals.markers += markers;
  return null;
}

/**
 * `text` with its ASCII capital letters turned into small ones.
 *
 * Not `toLowerCase()`: that makes two characters of one, for the likes of
 * `İ`. The indices of the copy have to be those of `text`, since what is
 * found in the one is read from the other.
 */
function foldCase(text: string): string {
  let folded = '';
  let copied = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 0x41 || code > 0x5a) continue;
    folded += text.slice(copied, i) + String.fromCharCode(code + 32);
    copied = i + 1;
  }
  return copied === 0 ? text : folded + text.slice(copied);
}

/**
 * The number of cells in the table row `[from, to)`: its separators, the
 * pipes that are not escaped, and one more for what is left of the row.
 *
 * A pipe at the start of the row separates nothing, and neither does the last
 * one when only whitespace is left behind it: `| a | b |` and `a | b` are the
 * same two cells, `a | b |` has three. A pipe inside a code span separates
 * nothing for the parser and is counted here all the same.
 */
function rowCells(body: string, from: number, to: number): number {
  let i = from;
  while (i < to && (body.charCodeAt(i) === SPACE || body.charCodeAt(i) === TAB)) i++;
  const leading = i < to && body.charCodeAt(i) === PIPE;
  let pipes = 0;
  /** Whether nothing but whitespace is left behind the last separator. */
  let bare = true;

  for (; i < to; i++) {
    const code = body.charCodeAt(i);
    if (code === PIPE) {
      // `\|` is a pipe inside a cell; `\\|` is a separator.
      let backslashes = 0;
      while (backslashes < i - from && body.charCodeAt(i - 1 - backslashes) === BACKSLASH) backslashes++;
      if (backslashes % 2 === 0) {
        pipes++;
        bare = true;
      } else {
        bare = false;
      }
    } else if (code !== SPACE && code !== TAB) {
      bare = false;
    }
  }

  // A row of nothing, or of one pipe, is one empty cell.
  return Math.max(1, pipes + 1 - (leading ? 1 : 0) - (leading && bare ? 1 : 0));
}

/**
 * Apply the rules that need the content: HTML nesting, inline resolver work,
 * the number of special characters, table size and the size of the raw markup.
 *
 * The text is cut into inline units, each the text one inline parser run
 * sees: a paragraph, a heading, a list item, one row of a table. Delimiters
 * only ever interact inside a unit, so the budgets are per unit. An HTML
 * block is a unit of raw markup instead. Fenced code is not scanned at all.
 *
 * The nesting of an inline unit is read before its delimiters are counted:
 * a flood of tags is a hostile structure, not a long paragraph. The same
 * goes for the raw markup: its tags are counted for their nesting first, and
 * for their number only when the nesting is within the limit.
 */
function scanContent(body: string, lines: LineInfo[]): PathologyReason | null {
  const length = body.length;
  const tracker = new NestingTracker();
  /**
   * The same estimate, popping every end tag: the least nesting the browser
   * can build. It goes over the limit where the nesting is real, whatever
   * the readings of the text; where only `tracker` does, the text that may
   * be inert is what makes the difference.
   */
  const trusting = new NestingTracker();
  const search = new Finder(body, 0, length);
  /** Tags read in the raw markup of the body so far. */
  let rawTags = 0;
  const take = (token: Token): void => {
    tracker.take(token, body);
    trusting.take(token, body);
    rawTags++;
  };
  const done = (): boolean => tracker.over || trusting.over || rawTags > MAX_RAW_MARKUP_TAGS_TOTAL;
  /** The rule the raw markup broke, if any: its nesting before its size. */
  const over = (): PathologyReason | null => {
    if (trusting.over) return 'html-nesting';
    if (tracker.over) return 'html-nesting-uncertain';
    return rawTags > MAX_RAW_MARKUP_TAGS_TOTAL ? 'raw-tags-total' : null;
  };
  let foldedBody: string | null = null;
  const folded = (): string => {
    if (foldedBody === null) foldedBody = foldCase(body);
    return foldedBody;
  };
  let lower: Finder | null = null;
  /** The body in lower case, as a `Finder` over the whole of it: cut out when a raw-text element is met. */
  const lowerBody = (): Finder => {
    if (lower === null) lower = new Finder(folded(), 0, length);
    return lower;
  };
  // A raw-HTML post is markup throughout. Its lines still matter below: the
  // markdown parser reads the body before the first plugin runs.
  const rawPost = isRawHtmlPost(body);
  let swallowed = -1;

  if (rawPost) {
    swallowed = scanRawMarkup(
      body,
      0,
      length,
      length,
      search,
      lowerBody(),
      true,
      () => tracker.foreign,
      take,
      null,
      done,
    );
    const reason = over();
    if (reason) return reason;
    // The whole body was markup, and was read once: the units below count
    // their delimiters, and read no tag again.
    swallowed = length;
  }

  let unitStart = -1;
  let unitEnd = -1;
  /** The last line of the unit: whether the HTML block it belongs to ends there. */
  let unitLast: LineInfo | null = null;
  let unitKind: LineKind = 'para';
  // The budgets that are per body, for the inline units and for the tables.
  const totals: InlineTotals = { tokens: 0, work: 0, markers: 0 };
  let headerCells = 0;
  let tableCells = 0;
  let cellsTotal = 0;
  let inTable = false;

  const flush = (): PathologyReason | null => {
    if (unitStart < 0) return null;

    if (unitKind === 'html') {
      // Raw markup. What an unfinished token swallowed stays swallowed.
      const from = Math.max(unitStart, swallowed);
      if (from < unitEnd) {
        swallowed = scanRawMarkup(
          body,
          from,
          unitEnd,
          length,
          search,
          lowerBody(),
          true,
          () => tracker.foreign,
          take,
          null,
          done,
        );
      }
      // The block ends here, and the parser hands it over as one piece of
      // markup: whatever a token of it left open is over with it. Behind a
      // blank line the block goes on, and so does what the token swallowed.
      // A raw-HTML post is one piece throughout.
      if (rawPost || unitLast === null || !unitLast.htmlLast) return over();
      swallowed = -1;
      return over();
    }

    const reason = scanInlineUnit(
      body,
      unitStart,
      unitEnd,
      unitKind === 'table',
      swallowed,
      tracker,
      trusting,
      folded,
    );
    if (reason) return reason;
    return countInlineWork(body, unitStart, unitEnd, totals);
  };

  for (const line of lines) {
    if (line.kind === 'table') {
      const cells = rowCells(body, line.content, line.end);
      tableCells = inTable ? tableCells + cells : headerCells + cells;
      inTable = true;
      if (tableCells > MAX_TABLE_CELLS) return 'table-cells';
    } else {
      if (inTable && (cellsTotal += tableCells) > MAX_TABLE_CELLS_TOTAL) return 'table-cells-total';
      inTable = false;
      // The line before a delimiter row is the header of that table.
      headerCells = line.kind === 'para' ? rowCells(body, line.content, line.end) : 0;
    }

    const raw = line.kind === 'html';
    if (!(raw || line.kind === 'para' || line.kind === 'heading' || line.kind === 'table')) {
      const reason = flush();
      if (reason) return reason;
      unitStart = -1;
      continue;
    }
    if (unitStart >= 0 && (raw !== (unitKind === 'html') || line.newUnit)) {
      const reason = flush();
      if (reason) return reason;
      unitStart = -1;
    }
    if (unitStart < 0) {
      unitStart = line.start;
      unitKind = line.kind;
    }
    unitEnd = line.end;
    unitLast = line;
  }

  // A body may end inside its last table.
  if (inTable && cellsTotal + tableCells > MAX_TABLE_CELLS_TOTAL) return 'table-cells-total';

  return flush();
}
