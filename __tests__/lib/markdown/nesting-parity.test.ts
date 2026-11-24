// @vitest-environment node
/**
 * The nesting estimate against parse5 itself.
 *
 * `estimateHtmlNesting` is the part of the guard that decides whether a body
 * has more nested elements than rehype-raw can build in bounded time. It is
 * an estimate: it reads tags one by one and applies the tree-construction
 * rules by hand. This suite checks it against the parser it estimates.
 *
 * The reference is the greatest number of elements parse5 6.0.1 (the version
 * rehype-raw uses) has open at once while parsing `html` exactly as
 * rehype-raw feeds it to a post: a fragment whose context is a `<template>`
 * element, with the same private bootstrap hast-util-raw performs. The stack
 * is read after every token, never in the middle of one: a void element, and
 * the empty paragraph an unmatched `</p>` inserts, are opened and closed by
 * the same token and are leaves, not nesting. What the estimate must never do
 * is see less nesting than that.
 *
 * parse5 is CommonJS and ships without types, so it is loaded the way
 * hast-util-raw loads it, and typed by hand below.
 */
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

import { estimateHtmlNesting } from '@/lib/markdown/pathology';

const require = createRequire(import.meta.url);

/** The parts of parse5's `Parser` that the bootstrap below needs. */
interface Parse5Parser {
  tokenizer: { write(html: string, lastChunk: boolean): void };
  openElements: { stackTop: number };
  _bootstrap(document: object, fragmentContext: object): void;
  _pushTmplInsertionMode(mode: string): void;
  _initTokenizerForFragmentParsing(): void;
  _insertFakeRootElement(): void;
  _resetInsertionMode(): void;
  _findFormInFragmentContext(): void;
  _processInputToken(token: unknown): void;
  _runParsingLoop(scriptHandler: null): void;
}

const Parser = require('parse5/lib/parser/index.js') as new (options: {
  scriptingEnabled: boolean;
}) => Parse5Parser;

const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';

/** The nesting parse5 really builds in `html`, as described in the header. */
function realNesting(html: string): number {
  const parser = new Parser({ scriptingEnabled: false });
  const context = { nodeName: 'template', tagName: 'template', attrs: [], namespaceURI: HTML_NAMESPACE, childNodes: [] };
  const mock = { nodeName: 'documentmock', tagName: 'documentmock', attrs: [], namespaceURI: HTML_NAMESPACE, childNodes: [] };

  // The bootstrap of hast-util-raw's `fragment()`.
  parser._bootstrap(mock, context);
  parser._pushTmplInsertionMode('IN_TEMPLATE_MODE');
  parser._initTokenizerForFragmentParsing();
  parser._insertFakeRootElement();
  parser._resetInsertionMode();
  parser._findFormInFragmentContext();

  let peak = 0;
  const process = parser._processInputToken.bind(parser);
  parser._processInputToken = (token: unknown) => {
    process(token);
    peak = Math.max(peak, parser.openElements.stackTop + 1);
  };

  parser.tokenizer.write(html, true);
  parser._runParsingLoop(null);
  // The fake root element that receives the fragment is open throughout.
  return Math.max(peak - 1, 0);
}

/** `html`: what the estimate says, and what parse5 builds. */
function both(html: string): readonly [number, number] {
  return [estimateHtmlNesting(html), realNesting(html)];
}

describe('the nesting estimate against parse5', () => {
  it('reads the reference the way it is meant to be read', () => {
    // Sanity checks of the reference itself, on shapes with no rules to them.
    expect(realNesting('')).toBe(0);
    expect(realNesting('<br><hr>')).toBe(0); // void elements do not nest
    expect(realNesting('<div><b>x</b></div>')).toBe(2);
    expect(realNesting('<table><tr><td>')).toBe(4);
  });

  it('never sees less nesting than parse5 builds', () => {
    const samples = SAMPLES;
    const under: string[] = [];

    for (const html of samples) {
      const [estimate, real] = both(html);
      if (real > estimate) under.push(`${html}  (estimate ${estimate}, parse5 ${real})`);
    }

    expect(under).toEqual([]);
  });

  it('stays within a bounded ratio of parse5, as a weaker guarantee', () => {
    for (const html of SAMPLES) {
      const [estimate, real] = both(html);
      expect(real).toBeLessThanOrEqual(3 * estimate + 8);
    }
  });

  it('agrees with parse5 on the shapes it used to be wrong about', () => {
    // A formatting element that has to leave the parser's list stays open:
    // the fourth `<b>` recreates the three on the list before it is inserted,
    // and all of them are elements in the tree. parse5: 5 (div, b, b, b, b).
    expect(both('<div><b>x</div>'.repeat(8) + '<span>y')).toEqual([5, 5]);
  });
});

/**
 * Seeded pseudo-random tag sequences, 2500 of them: the same on every run,
 * so a failure can be replayed.
 *
 * The vocabulary is the tag soup the element rules have to tell apart:
 * block and phrasing elements, table structure, formatting elements, SVG and
 * MathML with their integration points, void and self-closing tags, tags
 * with broken attributes, comments, and text that looks like markup.
 */
/** A linear congruential generator: small, and the same in every engine. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const TAGS = [
  'p', 'p', 'li', 'li', 'ul', 'ol', 'div', 'div', 'td', 'td', 'th', 'tr', 'table', 'tbody', 'thead', 'tfoot',
  'caption', 'colgroup', 'col',
  'b', 'i', 'em', 'strong', 'span', 'a', 'a', 'nobr', 'font', 'option', 'option', 'optgroup', 'select', 'dd', 'dt', 'dl',
  'button', 'label', 'svg', 'path', 'foreignObject', 'circle', 'br', 'hr', 'img', 'input', 'html', 'body', 'head', 'center',
  'blockquote', 'section', 'pre', 'form', 'template', 'x-foo', 'mi', 'math', 'mtext', 'annotation-xml', 'desc', 'mo',
  'marquee', 'object', 'applet', 'details', 'summary', 'h1', 'ul', 'ol', 'big', 'code', 'small', 'u', 's',
];

const ATTRIBUTES = [
  '', ' ', ' x', ' x="y"', " x='y'", ' x=y', ' x=y/', ' x="y>z"', ' x="y"', ' x', ' a="1" b=2 c', ' title="<!--"', ' x=',
  ' x="', ' @x="y"', ' x=`y`', ' disabled', ' href="a"', ' type="checkbox"', ' x="y" ', ' /', 'x', ' color="red"',
  ' encoding="text/html"',
];

/** What is not a start or an end tag. */
const OTHERS = [
  '<!-- c -->', '<!-->', '<!--->', '<!-- a--->', '<!-- a--!>', '<!-- a', '<!X y>', '<?pi x?>', '<![CDATA[ x ]]>',
  '<!DOCTYPE html>', '<!DOCTYPE html PUBLIC "a>b">', '<!', '<3', '<>', '</>', '<b:c>', '<a\nhref="x">',
  '<a title="q\nx">', '<svg><title>', '<svg><desc>', '<math><annotation-xml encoding="text/html">', '<font color="red">',
  '<mglyph>', 'text', ' ', '"', "'", '>', '<', '\n', '&amp;', '\\', '-->', '--!>', '" -->', '> <b>',
  '<table><td>', '<table><tr><td>', '</table><td>', '<caption><td>', '<colgroup><td>', '<tbody><td>', '</svg>', '</math>',
  '</template>',
];

function generate(count: number): string[] {
  const random = seeded(20261124);
  const pick = <T,>(items: readonly T[]): T => items[Math.floor(random() * items.length)];

  const token = (): string => {
    const roll = random();
    const tag = pick(TAGS);
    if (roll < 0.34) return `<${tag}${pick(ATTRIBUTES)}>`;
    if (roll < 0.44) return `<${tag}${pick(ATTRIBUTES)}/>`;
    if (roll < 0.78) return `</${tag}${pick(['', ' ', ' x="y"'])}>`;
    return pick(OTHERS);
  };

  return Array.from({ length: count }, () => {
    const length = 2 + Math.floor(random() * 14);
    return Array.from({ length }, token).join('');
  });
}

/** Generated once: the sequences are the same on every run. */
const SAMPLES: string[] = generate(2500);
