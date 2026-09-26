/**
 * Read-side validation for on-chain user profile metadata
 * (json_metadata.profile: cover_image, website, ...).
 *
 * These fields are attacker-controlled: any Steem client can set them via
 * account_update2, bypassing this site's UserSettings write-side checks.
 * UserProfileHeader splices them into DOM sinks (a style attribute value,
 * an anchor href), so they must be validated before rendering
 * (audit N-06: cover_image CSS injection; N-16: website link hardening).
 */

import { ABSOLUTE_HTTP_URL } from '@/lib/http-url';
import { looksPhishy } from '@/lib/phishing';

/**
 * Characters that must never appear in a URL that is spliced into a `url(...)`
 * token of a style value. `;` terminates the current declaration, `)` closes
 * the url() token early, quotes/braces/angle brackets enable further parser
 * confusion, and backslash enables CSS escapes. Control characters (including
 * raw spaces, invalid in URLs anyway) are rejected as well.
 *
 * React does NOT escape `;` or `)` inside style values, so without this check
 * a cover_image like `https://evil.com/a.jpg);position:fixed;...` injects
 * arbitrary CSS declarations into the server-rendered style attribute.
 */
const CSS_METACHARACTERS = /[;(){}<>"'\\\u0000-\u0020\u007f]/;

/**
 * Validate an on-chain profile cover_image before it is proxied and spliced
 * into a `backgroundImage: url(...)` style value (audit N-06).
 *
 * Validation runs on the RAW url, before proxifyImageUrl(): first-party URLs
 * are base58-encoded by the proxy (inherently safe), while third-party URLs
 * pass through verbatim, so checking the raw value is what seals the vector.
 *
 * Returns the trimmed safe URL, or null to degrade to no cover background.
 */
export function safeCoverImageUrl(
  raw: string | null | undefined
): string | null {
  if (typeof raw !== 'string') return null;
  const url = raw.trim();
  if (!ABSOLUTE_HTTP_URL.test(url)) return null;
  if (CSS_METACHARACTERS.test(url)) return null;
  try {
    // Require a parseable URL with a hostname (rejects e.g. "https://").
    if (!new URL(url).hostname) return null;
  } catch {
    return null;
  }
  return url;
}

export interface ProfileWebsite {
  /** Safe href for <a>, or null when the value must not link. */
  href: string | null;
  /** Display text (stripped URL, or the raw value when not a valid link). */
  label: string;
}

/** Display form of a website URL: strip scheme (+ www.) and trailing slash. */
function websiteDisplayLabel(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
}

/**
 * Validate an on-chain profile website value before rendering it as a link
 * (audit N-16). Mirrors the UserSettings write-side rule (http/https only)
 * and reuses the legacy phishing blacklist (lib/phishing.ts looksPhishy):
 *
 *  - non-http(s) values (e.g. `javascript:alert(1)`, `data:text/html,...`)
 *    degrade to plain text — React 19 already blocks javascript: URLs in
 *    href, but plain-text degradation also keeps data: and unknown schemes
 *    from ever becoming clickable;
 *  - hostnames on the phishing blacklist degrade to plain text instead of
 *    the legacy SanitizedLink "click to reveal" interaction (deliberate
 *    simplification: a profile website is cosmetic, so failing closed is
 *    both safer and simpler — see the PR description for the trade-off);
 *  - the display label is only stripped of its scheme when the value IS a
 *    valid http(s) URL, so non-link text is shown verbatim.
 *
 * Returns null when there is nothing to render (empty/missing value).
 */
export function safeProfileWebsite(
  raw: string | null | undefined
): ProfileWebsite | null {
  if (typeof raw !== 'string') return null;
  const value = raw.trim();
  if (!value) return null;

  if (!ABSOLUTE_HTTP_URL.test(value)) {
    // Not a linkable scheme: show as plain text, never as an anchor.
    return { href: null, label: value };
  }

  let hostname = '';
  try {
    hostname = new URL(value).hostname;
  } catch {
    // Malformed http(s)-prefixed value: treat as non-linkable.
    return { href: null, label: value };
  }

  if (!hostname || looksPhishy(hostname)) {
    return { href: null, label: websiteDisplayLabel(value) };
  }

  return { href: value, label: websiteDisplayLabel(value) };
}
