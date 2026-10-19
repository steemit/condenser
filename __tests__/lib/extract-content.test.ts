import { describe, expect, it } from 'vitest';

import { extractBodySummary } from '@/lib/extract-content';

/**
 * Characterization tests: these expectations were captured from the
 * pre-fix implementation (the legacy quote-strip regex in
 * extractBodySummary). They lock in behavior parity for the linear-time
 * rewrite (audit CD-01) and must not change.
 *
 * Quote-strip semantics under test:
 * - If the first non-whitespace character is `>`, exactly ONE line is
 *   stripped: leading whitespace + `>` + rest of that line + all whitespace
 *   that follows it.
 * - A quote anywhere else in the body is never stripped.
 * - With no leading quote the body passes through unchanged.
 */
describe('extractBodySummary quote stripping (characterization)', () => {
  it('strips a leading quote line from replies (stripQuotes=true)', () => {
    expect(
      extractBodySummary('> quoted reply text\n\nactual reply body', true)
    ).toBe('actual reply body');
  });

  it('keeps the quote with stripQuotes=false (top-level post cards)', () => {
    expect(
      extractBodySummary('> quoted reply text\n\nactual reply body', false)
    ).toBe('quoted reply text    actual reply body');
  });

  it('strips leading whitespace/newlines before the quote marker', () => {
    expect(extractBodySummary('\n\n  > quoted\n\nactual body', true)).toBe(
      'actual body'
    );
    expect(
      extractBodySummary(' \n\t > spaced quote\n  \n\nreal reply body', true)
    ).toBe('real reply body');
  });

  it('strips only the first line of a multi-line blockquote', () => {
    // The second quote line survives the strip and leads the summary.
    expect(
      extractBodySummary(
        '> first line\n> second quote line\nreal content',
        true
      )
    ).toBe('second quote line  real content');
  });

  it('never strips quotes that are not at the very start', () => {
    expect(
      extractBodySummary('text before\n\n> quote later\nafter', true)
    ).toBe('text before    quote later  after');
    expect(
      extractBodySummary('no quote\n> quote later\nmore', true)
    ).toBe('no quote    quote later  more');
  });

  it('returns empty summary for a body that is only a quote marker/line', () => {
    expect(extractBodySummary('>', true)).toBe('');
    expect(extractBodySummary('> quoted line', true)).toBe('');
  });

  it('handles CRLF line endings after the quote line', () => {
    expect(extractBodySummary('> a\r\n\r\nwindows reply body', true)).toBe(
      'windows reply body'
    );
  });

  it('strips the quote before URL removal, leaving inner spaces', () => {
    expect(
      extractBodySummary(
        '> https://quoted.example/link\n\nreply body with https://example.com url',
        true
      )
    ).toBe('reply body with  url');
  });

  it('keeps unicode content after stripping the quote line', () => {
    expect(
      extractBodySummary('>unicode 你好世界 reply\n\n回复正文', true)
    ).toBe('回复正文');
  });
});

describe('extractBodySummary general behavior (characterization)', () => {
  it('returns empty string for an empty body', () => {
    expect(extractBodySummary('', true)).toBe('');
    expect(extractBodySummary('', false)).toBe('');
  });

  it('leaves quote-free bodies untouched by the strip step', () => {
    expect(extractBodySummary('no quotes here just text', true)).toBe(
      'no quotes here just text'
    );
  });

  it('renders markdown to plain text (bold/html dropped)', () => {
    expect(extractBodySummary('**bold** and <b>html</b> first line', false)).toBe(
      'bold   and html first line'
    );
  });

  it('truncates long first lines with an ellipsis', () => {
    expect(
      extractBodySummary(
        'a normal top-level post body first line stays intact even when long enough to hit the truncation limit of one hundred forty characters plus more words here to force truncation behavior to kick in',
        false
      )
    ).toBe(
      'a normal top-level post body first line stays intact even when long enough to hit the truncation limit of one hundred…'
    );
  });
});

/**
 * Adversarial prefixes: the pre-fix regex backtracked exponentially on
 * leading whitespace runs that never reach `>` (audit CD-01 measured
 * ~0.9 s at 26 newlines, growing ~3x per extra newline — 10k newlines
 * would never finish). The linear scan must stay well under 100 ms.
 */
describe('extractBodySummary performance (CD-01 regression)', () => {
  it.each([
    ['newlines', '\n'.repeat(10_000)],
    ['spaces', ' '.repeat(10_000)],
    ['mixed whitespace', '\n \t\r'.repeat(2_500)],
  ])(
    'handles 10,000 chars of leading %s in well under 100 ms',
    (_name, prefix) => {
      const body = `${prefix}real reply body`;
      const start = performance.now();
      const summary = extractBodySummary(body, true);
      const elapsed = performance.now() - start;
      expect(summary).toBe('real reply body');
      expect(elapsed).toBeLessThan(100);
    }
  );

  it('handles a quote-marker search after 60 leading newlines instantly', () => {
    const body = `${'\n'.repeat(60)}no quote here`;
    const start = performance.now();
    const summary = extractBodySummary(body, true);
    const elapsed = performance.now() - start;
    expect(summary).toBe('no quote here');
    expect(elapsed).toBeLessThan(100);
  });

  it('stays fast when the quote marker does match after 10k newlines', () => {
    const body = `${'\n'.repeat(10_000)}> quoted line\n\nreal body`;
    const start = performance.now();
    const summary = extractBodySummary(body, true);
    const elapsed = performance.now() - start;
    expect(summary).toBe('real body');
    expect(elapsed).toBeLessThan(100);
  });
});
