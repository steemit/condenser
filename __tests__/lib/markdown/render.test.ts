// @vitest-environment node
/**
 * `renderMarkdown`: result shape, `isHtml`, the error contract.
 *
 * What is rendered is covered by the dialect, schema and comment suites. This
 * file is about the contract around the rendering: what comes back, what is
 * reported, and above all that nothing ever throws.
 */
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import { noImageText } from '@/lib/markdown/constants';
import { createSitePlugins, type SitePluginOptions } from '@/lib/markdown/config';
import { renderMarkdown } from '@/lib/markdown/render';

// Keep the real plugins, but watch how renderMarkdown builds them.
vi.mock('@/lib/markdown/config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/markdown/config')>();
  return { ...actual, createSitePlugins: vi.fn(actual.createSitePlugins) };
});

const createSitePluginsMock = vi.mocked(createSitePlugins);

// The legacy expressions from MarkdownViewer.tsx:71-77, as the reference.
const LEGACY_SHELL = /^<html>([\S\s]*)<\/html>$/;
const LEGACY_LEADING_P = /^<p>[\S\s]*<\/p>/;
const legacyIsHtml = (body: string) =>
  body.match(LEGACY_SHELL) !== null || LEGACY_LEADING_P.test(body);

/** A result without a render: `isHtml` and `refused` are added by the case. */
const REFUSED = { html: '', noImageActive: false, file: null } as const;

describe('renderMarkdown: result', () => {
  it('returns the rendered HTML, isHtml and the file it came from', () => {
    const result = renderMarkdown('**bold**');

    expect(result.html).toBe('<p><strong>bold</strong></p>');
    expect(result.isHtml).toBe(false);
    expect(result.noImageActive).toBe(false);
    expect(String(result.file)).toBe(result.html);
    expect(result.refused).toBeNull();
  });

  it('returns an empty string for empty input, having run the pipeline', () => {
    const result = renderMarkdown('');

    expect(result.html).toBe('');
    expect(result.isHtml).toBe(false);
    expect(result.noImageActive).toBe(false);
    // Empty is a rendered result, not a refused or failed one.
    expect(result.file).not.toBeNull();
    expect(result.refused).toBeNull();
  });

  it.each([
    '',
    '<html><body>x</body></html>',
    '<p>x</p>',
    '<p>x</p> and more',
    '<P>x</P>',
    '<html lang="en">x</html>',
    '<html>x</html>\n',
    'text <p>x</p>',
    '# heading\n\n<body>',
    '<html>',
    '</html>',
    '<html>a</html>b</html>',
  ])('reports isHtml for %j exactly like the legacy viewer', (body) => {
    expect(renderMarkdown(body).isHtml).toBe(legacyIsHtml(body));
  });

  it('reports isHtml even when it refuses the body', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const body = `<html>${'<div>'.repeat(50000)}x${'</div>'.repeat(50000)}</html>`;

    expect(renderMarkdown(body)).toEqual({ ...REFUSED, isHtml: true, refused: { class: 'structure', reason: 'html-nesting' } });
    expect(consoleError).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });

  it('reports a refusal with the rule and the class it broke', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const long = 'a\n'.repeat(4000);

    expect(renderMarkdown('# ' + ']'.repeat(16000))).toEqual({
      ...REFUSED,
      isHtml: false,
      refused: { class: 'structure', reason: 'inline-resolve-work' },
    });
    expect(renderMarkdown(long)).toEqual({
      ...REFUSED,
      isHtml: false,
      refused: { class: 'budget', reason: 'lines' },
    });

    expect(consoleError.mock.calls[0].slice(0, 3)).toEqual([
      'renderMarkdown: refused to render pathological input',
      'a paragraph with more emphasis or link delimiters than the parser handles in linear time',
      'structure',
    ]);
    expect(consoleError.mock.calls[1].slice(0, 3)).toEqual([
      'renderMarkdown: refused to render pathological input',
      'more than 2000 lines',
      'budget',
    ]);
    consoleError.mockRestore();
  });

  it('passes the options on to the plugins, as the same object', () => {
    const options: SitePluginOptions = { large: true, noImage: true };
    renderMarkdown('x', options);

    expect(createSitePluginsMock).toHaveBeenLastCalledWith(options);
    expect(createSitePluginsMock.mock.lastCall?.[0]).toBe(options);
  });

  it('defaults the options to an empty object', () => {
    renderMarkdown('x');
    expect(createSitePluginsMock).toHaveBeenLastCalledWith({});
  });
});

describe('renderMarkdown: noImageActive', () => {
  it('is false for ordinary content', () => {
    expect(renderMarkdown('![alt](https://a.b/x.png)').noImageActive).toBe(false);
  });

  it('is true when the output contains the low-ratings placeholder', () => {
    // Same rule as the legacy viewer: the flag is read off the output, so it
    // is also raised by an author who writes the placeholder text verbatim.
    expect(renderMarkdown(`a ${noImageText} b`).noImageActive).toBe(true);
  });

  it('does not act on the noImage option yet', () => {
    // Image handling is added with the hardening step; until then every
    // option is accepted and ignored.
    const result = renderMarkdown('![alt](https://a.b/x.png)', { noImage: true });
    expect(result.noImageActive).toBe(false);
    expect(result.html).toContain('<img src="https://a.b/x.png" alt="alt">');
  });
});

describe('renderMarkdown: never throws', () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('degrades a throwing plugin to an empty string and reports it', () => {
    createSitePluginsMock.mockReturnValueOnce([
      {
        remark: (processor) =>
          processor.use(() => () => {
            throw new Error('boom');
          }),
      },
    ]);

    expect(renderMarkdown('<p>x</p>')).toEqual({ ...REFUSED, isHtml: true, refused: null });

    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith(
      'renderMarkdown: failed to render markdown',
      expect.objectContaining({ message: 'boom' }),
    );
  });

  it('refuses to report a result for an asynchronous plugin', () => {
    createSitePluginsMock.mockReturnValueOnce([
      {
        remark: (processor) => processor.use(() => () => Promise.resolve()),
      },
    ]);

    expect(renderMarkdown('x')).toEqual({ ...REFUSED, isHtml: false, refused: null });

    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(String(consoleError.mock.calls[0][1])).toContain('did not finish synchronously');
  });

  it('leaves no unhandled rejection behind a transformer that rejects late', async () => {
    // The failure is reported before the transformer's promise rejects: by
    // then the render is over. The rejection must still be caught, which is
    // what the callback form of `process` is for (see `runProcessor`).
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);

    try {
      createSitePluginsMock.mockReturnValueOnce([
        {
          remark: (processor) =>
            processor.use(() => async () => {
              await Promise.resolve();
              throw new Error('late');
            }),
        },
      ]);

      expect(renderMarkdown('x')).toEqual({ ...REFUSED, isHtml: false, refused: null });
      expect(String(consoleError.mock.calls[0][1])).toContain('did not finish synchronously');

      // Let every pending job, the rejection and the event it would raise run.
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
      expect(unhandled).not.toHaveBeenCalled();
    } finally {
      process.off('unhandledRejection', unhandled);
    }
  });

  it.each([null, undefined, 42, {}])('treats %j as an empty body instead of throwing', (body) => {
    // Callers hand over whatever a post object carried; the signature says string.
    const result = renderMarkdown(body as string);
    expect(result).toMatchObject({ html: '', isHtml: false, noImageActive: false, refused: null });
    // Like an empty body, it is rendered, not refused.
    expect(result.file).not.toBeNull();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('renders an SVG template instead of losing the whole body', () => {
    // hast-util-from-parse5 7.1.2 reads `content` off an SVG `<template>`,
    // which parse5 creates without one, and threw on it. The patch in
    // patches/ makes the package leave a `template` without `content` alone,
    // so the ESM path (the one vitest and production take) no longer throws
    // on a `template` in the SVG or MathML namespace.
    const result = renderMarkdown('a <svg><template>x</template></svg> b');

    expect(result.refused).toBeNull();
    expect(result.html).toBe('<p>a  b</p>');
    expect(consoleError).not.toHaveBeenCalled();
  });
});
