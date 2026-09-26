/**
 * NSFW post detection and preference semantics.
 *
 * Ported from legacy src/app/utils/StateFunctions.js (hasNsfwTag +
 * parseJsonTags + normalizeTags): a post is NSFW when its category or any
 * json_metadata tag equals "nsfw" case-insensitively (exact match —
 * "nsfw-art" does not count).
 */

/** See hasNsfwTag — accepts the post-shape subset callers have. */
export function hasNsfwTag(post: {
  json_metadata?: { tags?: unknown } | null;
  category?: string | null;
}): boolean {
  const rawTags = post.json_metadata?.tags;
  // Copy before unshifting the category (legacy normalizeTags semantics)
  // so the post's own tags array is never mutated.
  const tags: unknown[] = Array.isArray(rawTags) ? [...rawTags] : [];
  if (post.category) tags.unshift(post.category);
  return tags.some((tag) => typeof tag === 'string' && /^nsfw$/i.test(tag));
}

/** nsfwPref values as defined by legacy Settings / AppReducer. */
export type NsfwPref = 'hide' | 'warn' | 'show';

/** Coerce the stored preference to a valid value (legacy default: warn). */
export function normalizeNsfwPref(value: unknown): NsfwPref {
  return value === 'hide' || value === 'show' ? value : 'warn';
}
