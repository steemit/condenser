import { vi } from 'vitest';

import { renderMarkdown } from '@/lib/markdown/render';
import type { SitePluginOptions } from '@/lib/markdown/config';

/**
 * Render `body` and return the HTML, failing the test if the pipeline
 * reported an error.
 *
 * `renderMarkdown` never throws: any failure inside the processor degrades to
 * an empty string plus `console.error`. That fallback would silently turn a
 * broken assertion such as `toContain('<table>')` into an honest-looking
 * failure, and a lax one (`not.toContain`) into a false pass. Rendering
 * through this helper makes the degraded path itself the failure.
 */
export function renderClean(body: string, options: SitePluginOptions = {}): string {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    const result = renderMarkdown(body, options);
    if (error.mock.calls.length > 0) {
      throw new Error(
        `renderMarkdown reported an error for ${JSON.stringify(body.slice(0, 60))}:\n` +
          error.mock.calls.map((call) => String(call[0])).join('\n')
      );
    }
    return result.html;
  } finally {
    error.mockRestore();
  }
}

/**
 * Decode the character references hast-util-to-html emits, so tests can
 * assert on the text an author wrote rather than on the serializer's escaping
 * (`<` is written as `&#x3C;`, `&` as `&#x26;`).
 */
export function decodeEntities(html: string): string {
  return html
    .replace(/&#x3C;|&#60;|&lt;/gi, '<')
    .replace(/&#x26;|&#38;|&amp;/gi, '&')
    .replace(/&#x3E;|&#62;|&gt;/gi, '>')
    .replace(/&#x22;|&#34;|&quot;/gi, '"')
    .replace(/&#x27;|&#39;|&apos;/g, "'");
}

/** Strip every tag: what remains is the text content of the fragment. */
export function textContent(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, ''));
}
