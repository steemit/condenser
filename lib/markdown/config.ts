/**
 * Single source of configuration for the markdown pipeline.
 *
 * The editor preview and the post page must render byte for byte the same
 * HTML. The way to get that is not to align two configurations but to have
 * one: both sides call {@link createSitePlugins} and pass {@link siteSanitize},
 * and bytemd's `getProcessor` runs them in the same fixed order.
 *
 * Plugin order (bytemd: remark hooks in list order, then remark-rehype,
 * rehype-raw, sanitize, then rehype hooks in list order):
 *
 *   1. raw-HTML post detection. It replaces the parsed tree wholesale, so it
 *      has to be first: a plugin that ran before it would work on a tree that
 *      is about to be thrown away.
 *   2. soft line breaks (`@bytemd/plugin-breaks`).
 *   3. the site's GFM subset.
 */
import breaks from '@bytemd/plugin-breaks';
import type { BytemdPlugin } from 'bytemd';

import { remarkSiteGfm } from '@/lib/markdown/gfm';
import { remarkRawHtmlPosts } from '@/lib/markdown/raw-html-post';

export { siteSanitize } from '@/lib/markdown/schema';

/**
 * Per-render options of the site plugins.
 *
 * They are reading-time context, not content, and they differ between the
 * editor preview and the post page only where the table below says so:
 *
 * - `large`: embeds are 640x360 instead of 480x270 (post bodies vs comments).
 * - `highQualityPost`: when false, external links carry `rel="nofollow"`.
 * - `noImage`: images are replaced by a low-ratings notice.
 * - `hideImages`: images are replaced by their URL as plain text.
 * - `isProxifyImages`: strip the legacy proxy shell without re-wrapping.
 */
export interface SitePluginOptions {
  large?: boolean;
  highQualityPost?: boolean;
  noImage?: boolean;
  hideImages?: boolean;
  isProxifyImages?: boolean;
}

/**
 * The site's plugins for one render. A new array on every call.
 *
 * Bytemd rebuilds its processor whenever the `plugins` reference changes, so
 * callers that render repeatedly should keep the array they got (module-level
 * constant or memo), not call this inside a render.
 */
export function createSitePlugins(options: SitePluginOptions = {}): BytemdPlugin[] {
  // The signature is final, but no plugin reads the options yet: link handling
  // and image hardening (which consume them) arrive with the next feature
  // points. Until then every option set yields the same plugins.
  void options;

  return [
    { remark: (processor) => processor.use(remarkRawHtmlPosts) },
    breaks(),
    { remark: (processor) => processor.use(remarkSiteGfm) },
  ];
}
