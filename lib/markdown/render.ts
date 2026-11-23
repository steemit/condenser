/**
 * `renderMarkdown`: the reading-side entry point of the markdown pipeline.
 *
 * It runs exactly the processor bytemd's own Viewer runs, with the site's
 * plugins and schema, and adds what a viewer needs on top of it:
 *
 * - a linear pre-parse guard ({@link isPathological}) that refuses input
 *   known to make the parser super-linear, before the parser sees it;
 * - a `try/catch` that degrades every failure to an empty string: a post body
 *   is attacker-controlled content rendered in every visitor's browser tab,
 *   so a render must never throw into the page;
 * - the by-products the page needs (`isHtml`, `noImageActive`, the `VFile`).
 */
import { getProcessor } from 'bytemd';
import type { Processor } from 'unified';
import type { VFile } from 'vfile';

import { createSitePlugins, siteSanitize, type SitePluginOptions } from '@/lib/markdown/config';
import { noImageText } from '@/lib/markdown/constants';
import { isPathological } from '@/lib/markdown/pathology';
import { isRawHtmlPost } from '@/lib/markdown/raw-html-post';

export type { SitePluginOptions } from '@/lib/markdown/config';

export interface RenderResult {
  /** Sanitized HTML, ready for `dangerouslySetInnerHTML`. Empty when refused or failed. */
  html: string;
  /** The body is a raw-HTML post rather than markdown (legacy `isHtml`). */
  isHtml: boolean;
  /** The output contains the low-ratings image placeholder. */
  noImageActive: boolean;
  /**
   * The virtual file of the run, as bytemd hands it to `viewerEffect`.
   * `null` when nothing was rendered.
   */
  file: VFile | null;
}

function empty(isHtml: boolean): RenderResult {
  return { html: '', isHtml, noImageActive: false, file: null };
}

/**
 * Render a post or comment body to sanitized HTML.
 *
 * Never throws. Pathological input and any error inside the processor both
 * yield an empty string (and an error on the console), so a hostile post can
 * cost at most one log line instead of a frozen tab or a crashed page.
 *
 * Not cached: `getProcessor` builds a new processor on every call and the
 * plugins depend on `options`, so there is nothing here that could be reused
 * between renders with different options.
 */
export function renderMarkdown(body: string, options: SitePluginOptions = {}): RenderResult {
  const isHtml = isRawHtmlPost(body);

  if (isPathological(body)) {
    console.error('renderMarkdown: refused to render pathological input');
    return empty(isHtml);
  }

  try {
    const processor = getProcessor({
      plugins: createSitePlugins(options),
      sanitize: siteSanitize,
    });
    const file = runProcessor(processor, body);
    const html = String(file);
    return { html, isHtml, noImageActive: html.includes(noImageText), file };
  } catch (error) {
    console.error('renderMarkdown: failed to render markdown', error);
    return empty(isHtml);
  }
}

/**
 * Run `processor` on `body` and return the resulting file.
 *
 * The callback form of `process` is used to get hold of the `VFile`: the
 * declared return type of `processSync` is the compiler's output type, while
 * what callers of this module need (and what bytemd's viewerEffect receives)
 * is the file object, with the HTML in `file.value`.
 *
 * The pipeline is synchronous, so the callback fires before `process` returns.
 * Should a plugin ever make it asynchronous, the render fails loudly here
 * (and degrades to an empty string) instead of silently returning nothing.
 */
function runProcessor(processor: Processor, body: string): VFile {
  let file: VFile | null = null;
  let failure: unknown = null;

  processor.process(body, (error, result) => {
    if (error) {
      failure = error;
    } else if (result) {
      file = result;
    }
  });

  if (failure) throw failure;
  if (!file) {
    throw new Error('The markdown processor did not finish synchronously');
  }
  return file;
}
