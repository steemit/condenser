/**
 * Site GFM dialect: strikethrough, tables and task lists, and nothing more.
 *
 * The stock `@bytemd/plugin-gfm` is deliberately not used. It bundles the
 * full `mdast-util-gfm`, which also turns on autolink literals (`example.com`,
 * `me@steemit.com` become links) and single-tilde strikethrough (`~5~`).
 * Neither is Steemit behaviour: the legacy pipeline (markdown-it with
 * `linkify: false`) leaves bare domains and addresses as plain text and only
 * linkifies `https?://` URLs, which FP3 ports on its own terms.
 *
 * Version family: the mdast/micromark extensions must be 1.x. bytemd 1.22.0
 * is built on unified 10; the 2.x releases of these packages belong to the
 * unified 11 family and make the first table render throw
 * `Cannot set properties of undefined (setting 'inTable')`.
 * __tests__/lib/markdown/version-guard.test.ts pins this.
 */
import { gfmStrikethroughFromMarkdown } from 'mdast-util-gfm-strikethrough';
import { gfmTableFromMarkdown } from 'mdast-util-gfm-table';
import { gfmTaskListItemFromMarkdown } from 'mdast-util-gfm-task-list-item';
import { gfmStrikethrough } from 'micromark-extension-gfm-strikethrough';
import { gfmTable } from 'micromark-extension-gfm-table';
import { gfmTaskListItem } from 'micromark-extension-gfm-task-list-item';
import type { Processor } from 'unified';

/**
 * Register the site's GFM subset on a remark processor.
 *
 * Two separate hooks are needed because micromark splits the work in two: the
 * tokenizer (`micromarkExtensions`) recognises the syntax and emits tokens,
 * the compiler (`fromMarkdownExtensions`) turns those tokens into mdast nodes.
 * Registering only one of them yields tokens that are parsed but silently
 * dropped from the tree.
 *
 * The three `fromMarkdown` values are extension *objects* and are registered
 * as such; calling them like factories is the other classic way to end up
 * with tables that never render.
 */
export function remarkSiteGfm(this: Processor): void {
  appendData(this, 'micromarkExtensions', [
    // `singleTilde: false`: `~~gone~~` is struck through, `~5~` stays literal,
    // matching GitHub and the site's expectations.
    gfmStrikethrough({ singleTilde: false }),
    gfmTable,
    gfmTaskListItem,
  ]);
  appendData(this, 'fromMarkdownExtensions', [
    gfmStrikethroughFromMarkdown,
    gfmTableFromMarkdown,
    gfmTaskListItemFromMarkdown,
  ]);
}

/** Append `values` to a processor data key, keeping whatever is already there. */
function appendData(processor: Processor, key: string, values: unknown[]): void {
  const existing = processor.data(key);
  processor.data(key, [...(Array.isArray(existing) ? existing : []), ...values]);
}
