// @vitest-environment node
/**
 * The block model of the guard against the parser itself.
 *
 * `findPathology` decides from the raw text alone which lines are parsed for
 * inline markup and which are raw text (an HTML block, fenced code), and it
 * counts the inline budgets on the former only. That model of the block
 * structure is written by hand, and three reviews in a row found the same
 * kind of bypass in it: wherever the model disagreed with CommonMark about
 * where a block ends, a hostile paragraph could be hidden behind an HTML
 * block or a fence that the parser had closed lines before.
 *
 * This suite gives the last word to the parser. A table of shapes is built
 * from three lists, with the payload in three places, and for every body of
 * it two things are asserted:
 *
 * - the parser reads the payload as inline markup: the guard must have seen
 *   it, so `findPathology` returns something;
 * - the parser reads the payload as raw text: the guard must not call it a
 *   hostile structure. A budget is allowed there: scanning raw text is the
 *   conservative mistake, and it is made on purpose in places.
 *
 * The lists:
 *
 * - `PREFIXES` is what comes in front of the opener: the containers the
 *   block opens in. A quote, a list item, a list item whose first line is
 *   empty, a list item with text on its marker line and the opener on an
 *   indented line behind it, and the same inside a quote.
 * - `OPENERS` is the first line of a block: HTML blocks of type 1 to 7,
 *   three kinds of fence, and a comment that is closed on its own line, which
 *   is a block of one line.
 * - `SEPS` is what comes between the opener and the payload: nothing but the
 *   line ending, a blank line, an indented blank line, a line with a quote
 *   marker alone, and two blank lines.
 *
 * For every combination of the first two lists (`PREFIXES` by `OPENERS`) the
 * payload stands once on a line of its own, and twice more on a line that is
 * indented or quoted so as to stay inside the container (`CONTINUED`): the
 * first is to find a paragraph that slips past the guard, the others to find
 * raw text that the guard calls hostile. The separator turns with the pair
 * and the placement (`separators`): the three lists in full are 4080 bodies,
 * which cost the suite ten seconds, and no separator, prefix or opener is
 * left out by turning them against each other.
 *
 * The parser is asked only where the guard's own answer does not settle the
 * question. A budget breaks neither assertion whatever the parser says, so
 * only a `null` and a `structure` are checked against the tree. The two are
 * equivalent: the assertions forbid exactly those two pairs of answers.
 */
import { getProcessor } from 'bytemd';
import { describe, expect, it } from 'vitest';

import { createSitePlugins } from '@/lib/markdown/config';
import { findPathology } from '@/lib/markdown/pathology';

/**
 * One line of text with 3100 inline markers: more than {@link
 * MAX_INLINE_TOKENS}, and more than the whole body may hold. `!` opens
 * nothing that the parser has to resolve, so parsing the line is linear.
 * Scanned as a paragraph, the line is always refused; hidden behind a block
 * the guard takes for raw, it leaves `null`.
 */
const PAYLOAD = 'a! '.repeat(3100);

/** The containers the opener lies in. */
const PREFIXES = [
  '',
  '> ',
  '> > ',
  '- ',
  '* ',
  '1. ',
  '-\n  ',
  '1.\n   ',
  '> -\n>   ',
  '> 1.\n>    ',
  '- a\n\n  ',
  '- a\n  ',
  '> a\n> ',
  '  - ',
  '- -\n    ',
  '> > -\n> >   ',
] as const;

/** The first line of the block. */
const OPENERS = [
  // HTML blocks of type 1 to 5, in order.
  '<pre>',
  '<script>',
  '<style>',
  '<textarea>',
  '<!--',
  '<?',
  '<!DOCTYPE x>',
  '<![CDATA[',
  // Type 7, and type 6 from the shortest name to a few others.
  '<x-custom>',
  '<div>',
  '<p>',
  '<table>',
  '<b>',
  '```',
  '~~~',
  '```js',
  '<!-- x -->',
] as const;

/** What comes between the opener and the payload. */
const SEPS = ['\n', '\n\n', '\n  \n', '\n>\n', '\n\n\n'] as const;

/**
 * For each prefix, two prefixes for the payload line itself: the indentation
 * or quote marker that keeps the line inside the innermost container, and one
 * column more. Behind no container, two columns and four, the latter being
 * an indented code block.
 */
const CONTINUED: Record<string, readonly [string, string]> = {
  '': ['  ', '    '],
  '> ': ['> ', '> > '],
  '> > ': ['> > ', '> > > '],
  '- ': ['  ', '   '],
  '* ': ['  ', '   '],
  '1. ': ['   ', '    '],
  '-\n  ': ['  ', '   '],
  '1.\n   ': ['   ', '    '],
  '> -\n>   ': ['>   ', '>    '],
  '> 1.\n>    ': ['>    ', '>     '],
  '- a\n\n  ': ['  ', '   '],
  '- a\n  ': ['  ', '   '],
  '> a\n> ': ['> ', '> > '],
  '  - ': ['    ', '     '],
  '- -\n    ': ['    ', '     '],
  '> > -\n> >   ': ['> >   ', '> >    '],
};

/**
 * Where the payload line stands: on its own, or kept inside the container.
 * Each gives the prefix of the payload line itself, from the prefix of the body.
 */
const PLACEMENTS = [
  { name: 'on a line of its own', front: () => '' },
  { name: 'indented into the container', front: (prefix: string) => CONTINUED[prefix][0] },
  { name: 'indented one column further', front: (prefix: string) => CONTINUED[prefix][1] },
] as const;

/** The three separators one pair of prefix and opener meets, one for each placement. */
const separators = (prefix: number, opener: number): readonly [string, string, string] => {
  const first = (prefix * 2 + opener) % SEPS.length;
  return [SEPS[first], SEPS[(first + 1) % SEPS.length], SEPS[(first + 2) % SEPS.length]];
};

/** The part of mdast this suite reads. */
interface Node {
  type: string;
  position?: { start: { offset: number | undefined }; end: { offset: number | undefined } };
  children?: Node[];
}

/** The site's processor, for parsing only: no plugin is run on the tree. */
const processor = getProcessor({ plugins: createSitePlugins() });

/** The type of the leaf of the tree that holds the payload: what the parser makes of that line. */
function leafOf(body: string): string {
  const tree = processor.parse(body) as Node;
  const start = body.indexOf(PAYLOAD);
  const end = start + PAYLOAD.length;
  let node = tree;
  // Down the tree, for as long as a child holds the whole payload.
  for (let inner = inside(node); inner !== undefined; inner = inside(node)) node = inner;
  return node.type;

  function inside(parent: Node): Node | undefined {
    return (parent.children ?? []).find(
      (child) =>
        child.position !== undefined &&
        child.position.start.offset !== undefined &&
        child.position.start.offset <= start &&
        child.position.end.offset !== undefined &&
        child.position.end.offset >= end,
    );
  }
}

/** Node types the parser reads as inline markup, and as raw text. */
const INLINE = new Set(['paragraph', 'heading', 'tableCell']);
const RAW = new Set(['code', 'html']);

/**
 * Every combination of the table at one placement where the guard and the
 * parser contradict each other, each as one line.
 */
function contradictions(placement: number): string[] {
  const found: string[] = [];
  for (const [p, prefix] of PREFIXES.entries()) {
    for (const [o, opener] of OPENERS.entries()) {
      const sep = separators(p, o)[placement];
      const front = PLACEMENTS[placement].front(prefix);
      const body = `${prefix}${opener}${sep}${front}${PAYLOAD}`;
      const shape = `${[prefix, opener, sep, front].map((part) => JSON.stringify(part)).join(' ')}`;
      const verdict = findPathology(body);

      if (verdict === null) {
        const leaf = leafOf(body);
        if (INLINE.has(leaf)) found.push(`the parser reads the payload as ${leaf}, the guard returns null: ${shape}`);
        else if (!RAW.has(leaf)) found.push(`neither inline markup nor raw text but ${leaf}: ${shape}`);
      } else if (verdict.class === 'structure') {
        const leaf = leafOf(body);
        if (RAW.has(leaf)) found.push(`the parser reads the payload as ${leaf}, the guard calls it ${verdict.reason}: ${shape}`);
        else if (!INLINE.has(leaf)) found.push(`neither inline markup nor raw text but ${leaf}: ${shape}`);
      }
    }
  }
  return found;
}

describe('the block model of the guard against the parser', () => {
  it('finds the payload in the tree', () => {
    // The reference is sound: the same payload is inline markup behind a
    // closed block and raw text inside an open one.
    expect(leafOf(`<!-- x -->\n${PAYLOAD}`)).toBe('paragraph');
    expect(leafOf(`<div>\n${PAYLOAD}`)).toBe('html');
    expect(leafOf(`-\n  \`\`\`\n${PAYLOAD}`)).toBe('paragraph');
  });

  it.each(PLACEMENTS.map((placement, index) => ({ index, name: placement.name })))(
    'agrees with the parser, payload $name',
    ({ index }) => {
      expect(contradictions(index)).toEqual([]);
    },
  );
});
