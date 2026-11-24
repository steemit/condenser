/**
 * `renderMarkdown`: the reading-side entry point of the markdown pipeline.
 *
 * It runs exactly the processor bytemd's own Viewer runs, with the site's
 * plugins and schema, and adds what a viewer needs on top of it:
 *
 * - a pre-parse guard ({@link findPathology}) that refuses, before the parser
 *   sees it, input of a shape it knows to make the parser super-linear, or
 *   too long for it. A refused body is reported, not rendered: what becomes
 *   of it (on the reading side, the legacy renderer) is for the caller.
 *   The guard is a heuristic prefilter, not a security boundary: it refuses
 *   the shapes it recognises, and nothing more. Bodies that pass it and
 *   still take seconds, or make megabytes of HTML, are listed under "Known
 *   gaps" in pathology.ts;
 * - a `try/catch` that degrades every failure to an empty string: a post body
 *   is attacker-controlled content rendered in every visitor's browser tab,
 *   so a render must never throw into the page;
 * - the by-products the page needs (`isHtml`, `noImageActive`, the `VFile`).
 *
 * Not for any page yet. A body is rendered here on the thread that calls,
 * with no timeout and no cap on the output. Until rendering is isolated (a
 * Web Worker, a hard timeout, an output cap and a fallback) no page may
 * render through this function; the gate is recorded in
 * docs/BYTEMD_INTEGRATION_STATUS.md.
 */
import { getProcessor } from 'bytemd';
import type { Processor } from 'unified';
import type { VFile } from 'vfile';

import { createSitePlugins, siteSanitize, type SitePluginOptions } from '@/lib/markdown/config';
import { noImageText } from '@/lib/markdown/constants';
import { describePathology, findPathology, type Pathology } from '@/lib/markdown/pathology';
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
  /**
   * The rule of the pre-parse guard the body broke, when it broke one. `null`
   * when the body was rendered, and also when the pipeline failed on it: a
   * failure is not a refusal. `html` is empty whenever this is set.
   */
  refused: Pathology | null;
}

function empty(isHtml: boolean, refused: Pathology | null = null): RenderResult {
  return { html: '', isHtml, noImageActive: false, file: null, refused };
}

/**
 * Render a post or comment body to sanitized HTML.
 *
 * Never throws, whatever is passed in: a body that is not a string at all is
 * an empty one. Input the guard refuses and any error inside the processor
 * both yield an empty string (and an error on the console), so a refused post
 * costs one log line instead of a frozen tab or a crashed page. A post of a
 * shape the guard does not recognise is rendered in full, however long that
 * takes: the guard is a prefilter, not the line that keeps a hostile post
 * from freezing the page.
 *
 * Not cached: `getProcessor` builds a new processor on every call. No plugin
 * reads `options` yet; the plugins of the later feature points will, and then
 * a processor built for one set of options is not one for another.
 */
export function renderMarkdown(body: string, options: SitePluginOptions = {}): RenderResult {
  // Callers hand over whatever a post object carried. Anything that is not
  // text is no text, and is rendered as such rather than thrown on.
  const text = typeof body === 'string' ? body : '';

  try {
    const isHtml = isRawHtmlPost(text);
    // The guard is inside the `try` as well: this function never throws.
    const refused = findPathology(text);
    if (refused) {
      console.error(
        'renderMarkdown: refused to render pathological input',
        describePathology(refused.reason),
        refused.class,
      );
      return empty(isHtml, refused);
    }

    const processor = getProcessor({
      plugins: createSitePlugins(options),
      sanitize: siteSanitize,
    });
    const file = runProcessor(processor, text);
    const html = String(file);
    return { html, isHtml, noImageActive: html.includes(noImageText), file, refused: null };
  } catch (error) {
    console.error('renderMarkdown: failed to render markdown', error);
    return empty(isRawHtmlPost(text));
  }
}

/**
 * Run `processor` on `body` and return the resulting file.
 *
 * The callback form of `process` is kept on purpose. It is not for the file:
 * `processSync` returns the `VFile` too (unified 10.1.2 does so at run time
 * and in its types). It is for a transformer that turns out to be
 * asynchronous. `processSync` would throw as soon as the run fails to finish,
 * and so does this; but the run then goes on in the background, and when its
 * promise rejects, `processSync`'s inner callback throws from inside a
 * promise handler. Nothing catches that: it surfaces later as an
 * `unhandledRejection`, which can take the whole process down. With the
 * callback form the rejection is handed to the callback here instead, after
 * the render has long been reported as failed, and is simply dropped.
 *
 * The pipeline is synchronous, so the callback fires before `process`
 * returns. Should a plugin ever make it asynchronous, the render fails
 * loudly here (and degrades to an empty string) instead of silently
 * returning nothing.
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
