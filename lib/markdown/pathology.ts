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
 *
 * This module decides from the raw text alone, and in linear time, whether a
 * body contains one of those shapes. It is an estimate, not a parser: it is
 * deliberately cheap, it errs towards refusing, and its blind spots are listed
 * under "Known blind spots" below. It runs before the parser sees a single
 * character, and is meant to run again on the submit side.
 *
 * Complexity: every rule is a single pass without backtracking. No line,
 * delimiter run or tag is visited more than a constant number of times, every
 * element is pushed and popped at most once, and no regular expression with a
 * nested quantifier is used anywhere.
 *
 * Known blind spots (all in the HTML nesting estimate):
 *
 * - Raw-text elements. `<script>`, `<style>`, `<textarea>`, `<title>`,
 *   `<iframe>` and `<xmp>` hold plain text for the browser; their content is
 *   scanned as markup here. A tag inside one is counted although it is not an
 *   element (over-estimating), and an end tag inside one pops although it is
 *   text (under-estimating).
 * - Code spans. A tag spelled inside backticks (`` `<div>` ``) is counted, and
 *   an end tag inside them pops, although both are text. Fenced code is not
 *   affected: it is recognised and skipped. Escapes outside code (`\<`) are
 *   handled.
 * - Link syntax. Inside a link destination or title (`[x](url '…')`) nothing
 *   is markup, but the scan does not know that.
 *
 * Each under-estimating case costs several bytes of disguise per hidden level
 * of nesting, which caps the damage well below the unguarded cost. The
 * numbers are in __tests__/lib/markdown/pathology.test.ts.
 */
import { isRawHtmlPost } from '@/lib/markdown/raw-html-post';

// ───────────────────────────── Thresholds ─────────────────────────────

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
 * Maximum number of cells in one table.
 *
 * The GFM table extension files each cell away by scanning the cells filed so
 * far, which is quadratic in the number of cells: 500 cells cost about
 * 100 ms, 1600 cells 0.37 s, and a 64 KiB body of cells minutes. A 500-cell
 * table (50 rows x 10 columns) is already a large table for a post.
 */
export const MAX_TABLE_CELLS = 512;

// ───────────────────────────── Public API ─────────────────────────────

export type PathologyReason =
  | 'quote-markers'
  | 'container-markers'
  | 'indent-columns'
  | 'html-nesting'
  | 'delimiter-run'
  | 'inline-resolve-work'
  | 'table-cells';

const REASON_TEXT: Record<PathologyReason, string> = {
  'quote-markers': `more than ${MAX_QUOTE_MARKERS_PER_LINE} blockquote markers on a line`,
  'container-markers': `more than ${MAX_CONTAINER_MARKERS_PER_LINE} nested list or quote markers on a line`,
  'indent-columns': `a line indented by more than ${MAX_INDENT_COLUMNS} columns`,
  'html-nesting': `HTML nested deeper than ${MAX_HTML_NESTING_DEPTH} elements`,
  'delimiter-run': `a run of more than ${MAX_DELIMITER_RUN_LENGTH} emphasis markers`,
  'inline-resolve-work':
    'a paragraph with more emphasis or link delimiters than the parser handles in linear time',
  'table-cells': `a table with more than ${MAX_TABLE_CELLS} cells`,
};

/** A sentence describing `reason`, for logs. */
export function describePathology(reason: PathologyReason): string {
  return REASON_TEXT[reason];
}

/** Whether `body` has a shape that makes the pipeline super-linear. */
export function isPathological(body: string): boolean {
  return findPathology(body) !== null;
}

/**
 * The first rule `body` breaks, or null when it breaks none.
 *
 * The scan stops at the first violation, so a hostile body is rejected after
 * little more of it has been read than the threshold itself requires.
 */
export function findPathology(body: string): PathologyReason | null {
  const shape = scanLines(body);
  if (shape.reason) return shape.reason;
  return scanContent(body, shape.lines);
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
  scanMarkup(html, 0, html.length, tracker, true);
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

function countChar(body: string, start: number, end: number, char: number): number {
  let count = 0;
  for (let i = start; i < end; i++) {
    if (body.charCodeAt(i) === char) count++;
  }
  return count;
}

// ──────────────────── Part 1: the shape of the text ────────────────────

type LineKind = 'blank' | 'fence' | 'html' | 'table' | 'para' | 'none';

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
  /** The line carries a blockquote marker. */
  quoted: boolean;
}

/** The container prefix of a line. One instance is reused across lines. */
interface Prefix {
  content: number;
  quotes: number;
  lists: number;
  indent: number;
  /** The content is indented too far to start a block: it is code. */
  indentedCode: boolean;
  /** The line carries a blockquote or list marker. */
  hasMarker: boolean;
  /** The line's list markers may interrupt a paragraph: bullets, or `1.`. */
  interrupting: boolean;
}

type BlockState = 'none' | 'para' | 'table' | 'fence' | 'html';

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

/**
 * Walk the container prefix of a line: its indentation and any `>` and
 * list-item markers. Leaves the result in `prefix` and returns the first rule
 * the line breaks, if any.
 */
function scanPrefix(body: string, start: number, end: number, prefix: Prefix): PathologyReason | null {
  let i = start;
  let column = 0;
  let quotes = 0;
  let lists = 0;
  let interrupting = true;
  let indentedCode = false;

  for (let round = 0; ; round++) {
    let columns = 0;
    while (i < end) {
      const code = body.charCodeAt(i);
      if (code === SPACE) columns++;
      else if (code === TAB) columns += 4 - ((column + columns) % 4);
      else break;
      i++;
    }
    column += columns;

    if (round === 0) {
      if (column > MAX_INDENT_COLUMNS) return 'indent-columns';
      prefix.indent = column;
    }
    if (i >= end) break;

    // Four columns of indentation never hold a marker: that is code.
    if (columns > 3) {
      indentedCode = true;
      break;
    }

    const code = body.charCodeAt(i);
    if (code === GT) {
      quotes++;
      i++;
      column++;
      // The marker's own optional space.
      if (i < end && body.charCodeAt(i) === SPACE) {
        i++;
        column++;
      }
      continue;
    }

    const width = listMarkerWidth(body, i, end);
    if (width === 0) break;

    // A bullet interrupts a paragraph; an ordered marker does so only as `1.`
    // (or `1)`). `text` followed by `2. more` is one paragraph, not a list.
    if (isAsciiDigit(body.charCodeAt(i))) {
      interrupting = interrupting && width === 2 && body.charCodeAt(i) === ONE;
    }
    lists++;
    i += width;
    column += width;

    // One to four spaces belong to the marker; a fifth starts code inside the item.
    let spaces = 0;
    while (i < end && spaces < 5 && body.charCodeAt(i) === SPACE) {
      i++;
      spaces++;
    }
    column += spaces;
    if (spaces === 5) {
      indentedCode = true;
      break;
    }
  }

  prefix.content = i;
  prefix.quotes = quotes;
  prefix.lists = lists;
  prefix.indentedCode = indentedCode;
  prefix.hasMarker = quotes + lists > 0;
  prefix.interrupting = interrupting;

  if (quotes > MAX_QUOTE_MARKERS_PER_LINE) return 'quote-markers';
  if (quotes + lists > MAX_CONTAINER_MARKERS_PER_LINE) return 'container-markers';
  return null;
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
  if (end - at < 3 || body.charCodeAt(at) !== LT) return 0;
  const after = body.charCodeAt(at + 1);

  if (after === EXCLAMATION) {
    const third = body.charCodeAt(at + 2);
    if (third === DASH) return body.charCodeAt(at + 3) === DASH ? 2 : 0;
    if (third === LBRACKET) return body.startsWith('<![CDATA[', at) ? 5 : 0;
    return isAsciiAlpha(third) ? 4 : 0;
  }
  if (after === QUESTION) return 3;
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
  if (!readInlineHtml(body, at, end, token) || !isBlankRange(body, token.end, end)) return 0;
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
 * The classification follows the block structure as CommonMark sees it, well
 * enough for the content scan to know where code and raw HTML are:
 *
 * - `fence`: a fenced code block: opener, content and closer;
 * - `html`: an HTML block;
 * - `table`: the delimiter row of a table and its body rows;
 * - `para`: text that is parsed for inline markup (an ATX heading counts as
 *   one line of it);
 * - `none`: a blank line, a thematic break or a heading underline.
 *
 * Wherever the model is unsure it says `para`, the kind that is scanned most
 * strictly, so a mistake can only make the guard stricter.
 */
function scanLines(body: string): Shape {
  const lines: LineInfo[] = [];
  const length = body.length;
  const prefix: Prefix = {
    content: 0,
    quotes: 0,
    lists: 0,
    indent: 0,
    indentedCode: false,
    hasMarker: false,
    interrupting: true,
  };
  const token = newToken();
  let block: BlockState = 'none';
  let fence = 0;
  let htmlType = 0;
  let previousQuoted = false;
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
      quoted: false,
    };
    lines.push(line);
    position = stop + 1;

    if (block === 'fence') {
      line.kind = 'fence';
      if (isClosingFence(body, line.start, end, fence)) block = 'none';
      continue;
    }

    if (block === 'html') {
      // Types 6 and 7 end at a blank line, and the blank line is not theirs.
      if (htmlType < 6 || !isBlankRange(body, line.start, end)) {
        line.kind = 'html';
        line.htmlType = htmlType;
        if (htmlType < 6 && htmlBlockEnded(body, line.start, end, htmlType)) block = 'none';
        continue;
      }
      block = 'none';
      previousQuoted = false;
      continue;
    }

    if (isBlankRange(body, line.start, end)) {
      block = 'none';
      previousQuoted = false;
      continue;
    }

    const previous = block;
    const reason = scanPrefix(body, line.start, end, prefix);
    if (reason) return { lines, reason };

    line.content = prefix.content;
    line.quoted = prefix.quotes > 0;

    // Where a block may start: at the beginning of a block, or after a marker
    // that interrupts a paragraph. A lazy continuation line is neither.
    const atBlockStart = previous !== 'para' || (prefix.hasMarker && prefix.interrupting);
    // Only a fence at the very start of a line is tracked. A fence inside a
    // blockquote or a list item is closed only by an equally prefixed line,
    // which this scan does not follow; such a fence counts as paragraph text.
    const at = prefix.content;

    let kind: LineKind = 'para';
    if (at < end && !prefix.indentedCode) {
      const run = prefix.hasMarker ? 0 : fenceOpener(body, at, end);
      if (run !== 0) {
        kind = 'fence';
        fence = run;
      } else {
        const html = matchHtmlStart(body, at, end, atBlockStart, token);
        if (html !== 0) {
          kind = 'html';
          htmlType = html;
        } else if (
          isAtxHeading(body, at, end) ||
          isThematicBreak(body, at, end) ||
          (previous === 'para' && !prefix.hasMarker && isEqualsUnderline(body, at, end))
        ) {
          kind = 'none';
        } else if (
          previous === 'table' ||
          (previous === 'para' && !prefix.hasMarker && isDelimiterRow(body, at, end))
        ) {
          kind = 'table';
        }
      }
    }

    line.kind = kind;
    block = kind as BlockState;
    if (kind === 'html' && htmlType < 6 && htmlBlockEnded(body, at, end, htmlType)) block = 'none';

    // An inline unit is a paragraph, a list item, or one row of a table: the
    // text one inline parser run sees. A list item that interrupts starts
    // one, and so does the first line of a blockquote: `a` and `> b` are two
    // paragraphs, whereas `> a` and `> b` are one.
    line.newUnit =
      (kind === 'para' || kind === 'table') &&
      (kind === 'table' ||
        previous !== kind ||
        (prefix.hasMarker && prefix.interrupting) ||
        (line.quoted && !previousQuoted));
    previousQuoted = line.quoted;
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
 * Returns false when the text at `at` is not such a token inside `[at, limit)`
 * and is plain text instead. `limit` is the end of the inline unit: an inline
 * token cannot run past it, and an unfinished one is not a token at all, so
 * whatever follows it is markup again.
 */
function readInlineHtml(body: string, at: number, limit: number, token: Token): boolean {
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
        const close = body.indexOf('-->', at + 2);
        if (close < 0) return false;
        token.end = close + 3;
      }
      return token.end <= limit;
    }

    token.kind = 'other';
    if (third === LBRACKET) {
      if (!body.startsWith('<![CDATA[', at)) return false;
      const close = body.indexOf(']]>', at + 9);
      if (close < 0) return false;
      token.end = close + 3;
    } else {
      if (!isAsciiAlpha(third)) return false;
      const close = body.indexOf('>', at + 2);
      if (close < 0) return false;
      token.end = close + 1;
    }
    return token.end <= limit;
  }

  if (after === QUESTION) {
    const close = body.indexOf('?>', at + 2);
    if (close < 0) return false;
    token.kind = 'other';
    token.end = close + 2;
    return token.end <= limit;
  }

  if (after === SLASH) {
    let i = at + 2;
    if (!isAsciiAlpha(body.charCodeAt(i))) return false;
    token.kind = 'end';
    token.nameStart = i;
    while (isAsciiAlphanumeric(body.charCodeAt(i)) || body.charCodeAt(i) === DASH) i++;
    token.nameEnd = i;
    // Only whitespace may sit between the name and `>`.
    while (i < limit && isTagWhitespace(body.charCodeAt(i))) i++;
    if (i >= limit || body.charCodeAt(i) !== GT) return false;
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
      const close = body.indexOf(code === DOUBLE_QUOTE ? '"' : "'", i + 1);
      if (close < 0 || close + 1 > limit) return false;
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
 * End of the HTML comment that starts at `at` (`<!--`), as a browser
 * tokenizes it, or -1 when it never ends.
 *
 * The parser, which decides whether the text is raw markup, ends a comment at
 * the first `-->`. The browser re-parsing that markup follows the HTML
 * tokenizer instead, which also ends a comment at `--!>`.
 */
function commentEnd(body: string, at: number): number {
  const length = body.length;
  let i = at + 4;
  let state = COMMENT;

  // Comment start, and comment start dash.
  if (i < length) {
    const code = body.charCodeAt(i);
    if (code === GT) return i + 1;
    if (code === DASH) {
      i++;
      if (i >= length) return -1;
      const next = body.charCodeAt(i);
      if (next === GT) return i + 1;
      state = next === DASH ? COMMENT_END : COMMENT;
      i++;
    }
  }

  for (; i < length; i++) {
    const code = body.charCodeAt(i);
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

/** End of a doctype: the first `>` that is not inside a quoted identifier. */
function doctypeEnd(body: string, at: number): number {
  let quote = 0;
  for (let i = at + 2; i < body.length; i++) {
    const code = body.charCodeAt(i);
    if (quote !== 0) {
      if (code === quote) quote = 0;
    } else if (code === DOUBLE_QUOTE || code === SINGLE_QUOTE) quote = code;
    else if (code === GT) return i + 1;
  }
  return -1;
}

/** What {@link readRawToken} found at a `<`. */
const NOT_MARKUP = 0;
const TOKEN = 1;
/** A tag that never closes before the end of the text. The browser drops it. */
const UNFINISHED_TAG = 2;

/**
 * Read the markup token that starts at `at`, by the HTML tokenizer's rules.
 *
 * This is the reading for text that is known to be raw markup, where the
 * token may span lines and may end anywhere up to the end of the text.
 */
function readRawToken(body: string, at: number, token: Token): number {
  const length = body.length;
  const after = body.charCodeAt(at + 1);

  const bogusComment = () => {
    const close = body.indexOf('>', at + 2);
    token.kind = 'other';
    token.end = close < 0 ? length : close + 1;
    return TOKEN;
  };

  if (after === EXCLAMATION) {
    if (body.charCodeAt(at + 2) === DASH && body.charCodeAt(at + 3) === DASH) {
      const close = commentEnd(body, at);
      token.kind = 'comment';
      token.end = close < 0 ? length : close;
      return TOKEN;
    }
    if (body.slice(at, at + 9).toLowerCase() === '<!doctype') {
      const close = doctypeEnd(body, at);
      token.kind = 'other';
      token.end = close < 0 ? length : close;
      return TOKEN;
    }
    return bogusComment();
  }
  if (after === QUESTION) return bogusComment();

  if (after === SLASH) {
    const third = body.charCodeAt(at + 2);
    if (third === GT) {
      // An empty end tag is ignored.
      token.kind = 'other';
      token.end = at + 3;
      return TOKEN;
    }
    return isAsciiAlpha(third) ? readRawTag(body, at, token) : bogusComment();
  }

  return isAsciiAlpha(after) ? readRawTag(body, at, token) : NOT_MARKUP;
}

/**
 * Read the start or end tag that starts at `at`, by the HTML tokenizer's tag
 * states, which is what decides where a tag ends and whether it is
 * self-closing.
 */
function readRawTag(body: string, at: number, token: Token): number {
  const length = body.length;
  let i = at + 1;
  const endTag = body.charCodeAt(i) === SLASH;
  if (endTag) i++;

  token.kind = endTag ? 'end' : 'start';
  token.selfClosing = false;
  token.encodingHtml = false;
  token.nameStart = i;
  for (;;) {
    const code = body.charCodeAt(i);
    if (i >= length || isHtmlWhitespace(code) || code === SLASH || code === GT) break;
    i++;
  }
  token.nameEnd = i;

  let state = BEFORE_ATTR_NAME;
  // Where the attribute being read starts and ends, and its value with it.
  let attributeStart = 0;
  let attributeEnd = 0;
  let valueStart = 0;
  for (;;) {
    if (i >= length) return UNFINISHED_TAG;
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
 * tag sequences; see __tests__/lib/markdown/pathology.test.ts.
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
   * Per open element: it is on the parser's list of active formatting
   * elements, and so will be recreated if something else closes it.
   */
  private listed: boolean[] = [];
  /**
   * Per open element: it is no longer really open. It is only kept because
   * the parser still has it on its list and will recreate it.
   */
  private recreated: boolean[] = [];
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

    // Anything but a `<col>` leaves a column group.
    if (this.names[top] === 'colgroup') this.pop();

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
        // A table inside a cell or a caption nests. Anywhere else inside a
        // table it closes the table around it first.
        if (this.where() === 'cell' || this.where() === 'caption') break;
        this.leaveLeftovers();
        this.closeTableElement(new Set(['table']));
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
    this.recreated.push(false);
    if (this.names.length > this.maxDepth) this.maxDepth = this.names.length;
    if (this.maxDepth > this.limit) this.over = true;
  }

  /**
   * The parser keeps at most three formatting elements with the same tag and
   * attributes; a fourth makes the oldest of them leave its list. The element
   * stays open, it just will not be recreated any more.
   */
  private evictFourth(name: string, key: string): void {
    let same = 0;
    for (let k = this.names.length - 1; k >= 0; k--) {
      if (this.namespaces[k] === HTML && LIST_MARKERS.has(this.names[k])) return;
      if (this.listed[k] && this.names[k] === name && this.keys[k] === key && ++same === 3) {
        // An element that is really open stays open; one that only stood in
        // for its list entry is gone with the entry.
        if (this.recreated[k]) this.removeAt(k);
        else this.listed[k] = false;
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
      this.recreated[write] = true;
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
    this.recreated[to] = this.recreated[from];
  }

  private truncate(keep: number): void {
    this.names.length = keep;
    this.namespaces.length = keep;
    this.htmlEncoded.length = keep;
    this.keys.length = keep;
    this.listed.length = keep;
    this.recreated.length = keep;
  }
}

// ───────────────────────── The scans over the content ─────────────────────────

/** Whether the `<` at `at` is escaped by a backslash: text, not markup. */
function isEscaped(body: string, at: number, from: number): boolean {
  let backslashes = 0;
  for (let i = at - 1; i >= from && body.charCodeAt(i) === BACKSLASH; i--) backslashes++;
  return backslashes % 2 === 1;
}

/**
 * Scan `[from, to)` for markup and feed every tag to `tracker`.
 *
 * In raw mode (`raw`) the text is known to be markup and is read by the HTML
 * tokenizer's rules; a token may then run past `to`, because it is markup
 * there too. Otherwise the text is a paragraph and is read by CommonMark's
 * inline rules, which is what makes the difference between `<b>` and `<b @a>`:
 * the first is an element, the second is text.
 *
 * Stops as soon as the tracker reports that the nesting is over its limit.
 */
function scanMarkup(body: string, from: number, to: number, tracker: NestingTracker, raw: boolean): void {
  const token = newToken();
  let i = from;

  while (i < to && !tracker.over) {
    i = body.indexOf('<', i);
    if (i < 0 || i >= to) break;

    if (raw) {
      const found = readRawToken(body, i, token);
      // A tag that never closes takes everything after it with it.
      if (found === UNFINISHED_TAG) break;
      if (found === NOT_MARKUP) {
        i++;
        continue;
      }
    } else {
      if (isEscaped(body, i, from)) {
        i++;
        continue;
      }
      if (!readInlineHtml(body, i, to, token)) {
        i++;
        continue;
      }
      if (token.kind === 'comment') {
        // The parser reads the comment through `token.end`. The browser ends
        // it no later, and what lies between the two is raw markup.
        const browserEnd = commentEnd(body, i);
        if (browserEnd >= 0 && browserEnd < token.end) {
          scanMarkup(body, browserEnd, token.end, tracker, true);
        }
        i = token.end;
        continue;
      }
    }

    tracker.take(token, body);
    i = Math.max(token.end, i + 1);
  }
}

/**
 * Whether an emphasis run can close emphasis, as the parser sees it.
 *
 * A run closes when something other than whitespace precedes it (or another
 * marker). For `_` and `~` a letter or digit right after it makes it part of a
 * word instead, as in `snake_case`.
 */
function isCloser(marker: number, previous: number, next: number): boolean {
  if (marker !== ASTERISK && isAsciiAlphanumeric(next)) return false;
  return !isFlankWhitespace(previous);
}

/**
 * Micromark's inline resolver work for one inline unit, against its budget.
 *
 * Counts the triggers (emphasis runs that can close, and `]`) and the tokens
 * they walk back over (emphasis runs, brackets, backticks, `<`, `&`, `\`).
 * Also applies the run-length rule, which needs the same walk.
 */
function countInlineWork(body: string, start: number, end: number): PathologyReason | null {
  let tokens = 0;
  let resolvers = 0;

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
      if (isCloser(code, previous, next)) resolvers++;
      i += run;
    } else {
      if (code === RBRACKET) {
        tokens++;
        resolvers++;
      } else if (
        code === LBRACKET ||
        code === BACKTICK ||
        code === LT ||
        code === AMPERSAND ||
        code === BACKSLASH
      ) {
        tokens++;
      }
      i++;
    }

    if (resolvers * tokens > MAX_INLINE_RESOLVE_WORK) return 'inline-resolve-work';
  }

  return null;
}

/**
 * Apply the rules that need the content: HTML nesting, inline resolver work
 * and table size.
 *
 * The text is cut into inline units, each the text one inline parser run
 * sees: a paragraph, a list item, one row of a table. Delimiters only ever
 * interact inside a unit, so the budgets are per unit. An HTML block is a
 * unit of raw markup instead. Fenced code is not scanned at all.
 */
function scanContent(body: string, lines: LineInfo[]): PathologyReason | null {
  const tracker = new NestingTracker();
  // A raw-HTML post is markup throughout. Its lines still matter below: the
  // markdown parser reads the body before the first plugin runs.
  const rawPost = isRawHtmlPost(body);
  if (rawPost) {
    scanMarkup(body, 0, body.length, tracker, true);
    if (tracker.over) return 'html-nesting';
  }

  let unitStart = -1;
  let unitEnd = -1;
  let unitKind: LineKind = 'para';
  let headerPipes = 0;
  let tableCells = 0;
  let inTable = false;

  const flush = (): PathologyReason | null => {
    if (unitStart < 0) return null;
    if (unitKind !== 'html') {
      const reason = countInlineWork(body, unitStart, unitEnd);
      if (reason) return reason;
    }
    if (rawPost || !tracker.over) scanMarkup(body, unitStart, unitEnd, tracker, unitKind === 'html');
    return tracker.over ? 'html-nesting' : null;
  };

  for (const line of lines) {
    if (line.kind === 'table') {
      const pipes = countChar(body, line.start, line.end, PIPE);
      tableCells = inTable ? tableCells + pipes + 1 : headerPipes + pipes + 1;
      inTable = true;
      if (tableCells > MAX_TABLE_CELLS) return 'table-cells';
    } else {
      inTable = false;
      // The line before a delimiter row is the header of that table.
      headerPipes = line.kind === 'para' ? countChar(body, line.start, line.end, PIPE) : 0;
    }

    const raw = line.kind === 'html';
    if (!(raw || line.kind === 'para' || line.kind === 'table')) {
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
  }

  return flush();
}
