/**
 * Message and class constants shared by the two rendering pipelines.
 *
 * This module must stay free of imports: `lib/sanitize-config.ts` (the legacy
 * sanitize-html path, which is also the rollback path) and `lib/markdown/**`
 * (the bytemd pipeline) both read it, so pulling anything in here would couple
 * either pipeline to the other's dependencies. The messages are author-facing
 * only as title/placeholder text and are intentionally not translated, exactly
 * as in the legacy pipeline.
 */

/** `title` of a link that the phishing heuristic flagged. */
export const PHISHY_MESSAGE = '(Warning: link is a possible phishing attempt)';

/** `title` of a link that leaves steemit.com. */
export const EXTERNAL_LINK_MESSAGE = 'This link will take you away from Steemit';

/** `title` of a link to a CDN image; deliberately empty. */
export const INTERNAL_IMAGE_MESSAGE = '';

/** Placeholder shown instead of an image in a low-ratings post. */
export const noImageText = '(Image not shown due to low ratings)';

/**
 * The only `class` values an author may put on a `<div>`.
 *
 * Each entry is a layout primitive the site's stylesheet knows:
 * `pull-right` / `pull-left` float an image or a block, `text-*` set text
 * alignment or direction, `videoWrapper` carries the responsive 16:9 box
 * around an embed, and `phishy` marks a flagged link.
 */
export const SITE_DIV_CLASS_WHITELIST = [
  'pull-right',
  'pull-left',
  'text-justify',
  'text-rtl',
  'text-center',
  'text-right',
  'videoWrapper',
  'phishy',
] as const;
