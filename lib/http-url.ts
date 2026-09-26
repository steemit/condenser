/**
 * Shared URL helpers. Extracted so the http(s) absolute-URL predicate has a
 * single definition instead of drifting copies across validation modules
 * (#4044 leftover: the same regex was declared in lib/profile-metadata.ts and
 * lib/seo.ts).
 */

/** Only absolute http(s) URLs (case-insensitive scheme) match. */
export const ABSOLUTE_HTTP_URL = /^https?:\/\//i;
