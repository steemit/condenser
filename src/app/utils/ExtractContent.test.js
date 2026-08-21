/* global describe, it, expect */
import {
    highlightSegments,
    extractBodySummary,
    extractImageLink,
} from './ExtractContent';
import { htmlDecode } from './Html';

describe('highlightSegments', () => {
    it('returns an empty list for empty input', () => {
        expect(highlightSegments('', 'x')).toEqual([]);
        expect(highlightSegments(null, 'x')).toEqual([]);
    });

    it('returns the text as a single inert string when no keyword is given', () => {
        expect(highlightSegments('hello world', null)).toEqual(['hello world']);
        expect(highlightSegments('hello world', undefined)).toEqual([
            'hello world',
        ]);
    });

    it('does not split on the literal string "null" when keyword is null', () => {
        expect(highlightSegments('a null b', null)).toEqual(['a null b']);
    });

    it('splits text around keyword matches and marks them as objects', () => {
        expect(highlightSegments('one two one', 'one')).toEqual([
            { match: 'one' },
            ' two ',
            { match: 'one' },
        ]);
    });

    it('returns a single string when the keyword is absent', () => {
        expect(highlightSegments('abc', 'xyz')).toEqual(['abc']);
    });

    it('keeps markup-looking input as plain strings (never returns HTML)', () => {
        const payloads = [
            `<iframe srcdoc='<script src=data:text/javascript,alert(1)></script>'></iframe>`,
            '<img src=x onerror=alert(1)>',
            'a<b>bold</b>c',
        ];
        payloads.forEach(payload => {
            const segments = highlightSegments(payload, null);
            expect(segments.every(s => typeof s === 'string')).toBe(true);
            expect(segments.join('')).toEqual(payload);
        });
    });

    it('keeps a markup-looking keyword inert as a match object', () => {
        const segments = highlightSegments(
            'hello <img src=x onerror=alert(1)> world',
            '<img src=x onerror=alert(1)>'
        );
        expect(segments).toEqual([
            'hello ',
            { match: '<img src=x onerror=alert(1)>' },
            ' world',
        ]);
    });
});

describe('extractImageLink', () => {
    it('finds images in markdown bodies (unwrapped multi-root html)', () => {
        expect(
            extractImageLink({}, 'words ![alt](https://example.com/x.png) end')
        ).toBe('https://example.com/x.png');
    });

    it('reads the first json_metadata image when present', () => {
        expect(
            extractImageLink(
                { image: ['https://example.com/a.jpg', 'https://e.com/b.jpg'] },
                'no images here'
            )
        ).toBe('https://example.com/a.jpg');
    });
});

describe('extractBodySummary', () => {
    it('returns plain text with no markup or angle-bracket entities', () => {
        const summary = extractBodySummary(
            'start <b>bold</b> <script>alert(1)</script> end'
        );
        expect(summary).not.toMatch(/[<>]/);
        expect(summary).not.toMatch(/&lt;|&gt;|&amp;/);
        expect(summary).toContain('start');
        expect(summary).toContain('end');
    });

    it('decodes entities so summaries render correctly as React text', () => {
        expect(extractBodySummary('fish &amp; chips')).toMatch('fish & chips');
    });

    it('strips raw urls', () => {
        expect(
            extractBodySummary('see https://example.com/page for more')
        ).not.toMatch(/https?:\/\//);
    });

    it('truncates long bodies', () => {
        const summary = extractBodySummary('word '.repeat(60));
        expect(summary.length).toBeLessThanOrEqual(141);
        expect(summary).toMatch(/…$/);
    });
});

describe('htmlDecode', () => {
    it('decodes angle brackets and ampersands', () => {
        expect(htmlDecode('&lt;b&gt; &amp; &quot;q&quot;')).toEqual(
            '<b> & "q"'
        );
    });

    it('decodes numeric entities (decimal and hex)', () => {
        expect(htmlDecode('&#65;&#x42;C')).toEqual('ABC');
    });

    it('leaves unknown entities untouched', () => {
        expect(htmlDecode('&nope;')).toEqual('&nope;');
    });

    it('does not double-decode', () => {
        expect(htmlDecode('&amp;lt;')).toEqual('&lt;');
    });
});
