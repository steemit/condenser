/**
 * Single source of truth for the route vocabulary shared by the route
 * rewrites (`proxy.ts`, edge runtime), the sort feed pages
 * (`app/(main)/[sort]`), the navigation/sidebar components
 * (PrimaryNavigation, FeedSidebarWidgets) and analytics route tagging
 * (lib/analytics/route-tags.ts).
 *
 * These lists previously existed as six hand-maintained copies; missing an
 * edit in any one of them silently diverged routing, navigation
 * highlighting and analytics. Import from here instead of redefining them.
 *
 * Semantics (identical at every call site, mirroring proxy.ts):
 * - membership checks are case-insensitive: callers pass `.toLowerCase()`;
 * - `promoted` is a SORT_TYPES member but NOT a reserved route (see
 *   docs/ROUTE_MAP.md);
 * - lists match the legacy ResolveRoute.js regex alternations
 *   (`<sort>`, `<account-tab>`) and static-route vocabulary.
 */

// Reserved route words. These guard against reserved words being treated as
// usernames (proxy branches 3-6) and keep the invalid-pattern fallthrough
// from shadowing real app routes. They are intentionally NOT applied to post
// categories (proxy branch 2): the legacy Post regex is <tag>/<account>/<permlink>
// where <tag> is ([\w.-]{1,32}) with NO reserved-word exclusion — /about/@a/p,
// /welcome/@a/p, /hot/@a/p and even /tags/@user/permlink all render Post pages
// in legacy (its static checks are exact-path, e.g. path === '/tags', so they
// never match a three-segment path; CategoryFilters <sort>/<tag> matches at
// most two segments, so /hot and /hot/<tag> stay sort feeds). Do not
// re-introduce a reserved-word check in branch 2: reserved-word categories
// are real first tags of posts and must not 404.
export const RESERVED_ROUTES: readonly string[] = [
  'trending', 'hot', 'created', 'payout', 'payout_comments', 'muted',
  'login', 'search', 'submit', 'about', 'faq', 'privacy', 'support', 'tos',
  'communities', 'tags', 'rewards', 'roles', 'welcome', 'api', '_next',
];

// User profile sections: URL segments after /@username that are profile
// sections, not permlinks (proxy branches 3-4). Membership mirrors the
// legacy <account-tab> alternation; order differs (irrelevant — all
// consumers do membership checks).
export const PROFILE_SECTIONS: readonly string[] = [
  'blog', 'posts', 'comments', 'replies', 'payout', 'feed',
  'followers', 'followed', 'settings', 'notifications', 'communities',
];

// Sort types for category filters (from the legacy CategoryFilters <sort>
// alternation). Order follows legacy.
// Members are interpolated into regex alternations (PrimaryNavigation
// SORT_TAG_RE / FeedSidebarWidgets COMMUNITY_FEED_RE via join('|')) — they
// must stay regex-safe word characters (no metacharacters); add an
// assertion if this ever changes.
export const SORT_TYPES: readonly string[] = [
  'hot', 'trending', 'promoted', 'payout', 'payout_comments', 'muted', 'created',
];

/**
 * True for post detail URLs in their public (browser) form:
 * /<category>/@user/<permlink> or /@user/<permlink> (where the second
 * segment is NOT a profile section — /@user/blog is a profile page).
 *
 * Shared by PrimaryNavigation (post-page nav context) and
 * FeedSidebarWidgets (post-scoped rail ads), which previously kept two
 * hand-rolled regex copies: the sidebar's was unanchored and matched
 * profile-section URLs like /@user/feed, and both carried a defensive
 * branch for internal rewrite targets (/post/..., /post-no-category/...)
 * that can no longer appear in a browser URL — proxy.ts 404s direct
 * access to those, and usePathname() always reports the pre-rewrite URL.
 */
export function isPostPathname(pathname: string): boolean {
  // /category/@user/permlink (exactly three segments, optional slash)
  if (/^\/[^/]+\/@[^/]+\/[^/]+\/?$/.test(pathname)) return true;
  // /@user/permlink — anything that is not a profile section
  const m = pathname.match(/^\/@[^/]+\/([^/]+)\/?$/);
  return Boolean(m && !PROFILE_SECTIONS.includes(m[1].toLowerCase()));
}
