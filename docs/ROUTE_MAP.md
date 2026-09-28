# Route Map

This document maps every legacy Condenser URL pattern to its handling in the
Next.js rewrite: the branch in `proxy.ts` (the route-rewrite proxy that
replaces `middleware.ts`), the App Router file that ultimately serves it, and
the migration status.

Sources of truth:

- Legacy routing: `condenser-legacy/src/app/ResolveRoute.js` (matching order)
- New routing: `proxy.ts` (rewrite branches, in matching order) + `app/`

`proxy.ts` intentionally follows the legacy `ResolveRoute.js` matching order.
References to `proxy.ts` below use its numbered branch comments (1.5, 2–7,
plus the invalid-pattern 404 guards) and named constants (`RESERVED_ROUTES`,
`PROFILE_SECTIONS`, `SORT_TYPES`, `INTERNAL_ROUTE_PREFIXES`,
`STATIC_ASSET_RE`) as anchors, so they do not drift when lines move.
`RESERVED_ROUTES`, `PROFILE_SECTIONS`, `SORT_TYPES` and
`INTERNAL_ROUTE_PREFIXES` are defined once in `lib/routes.ts` (the shared
route vocabulary) and imported by `proxy.ts`, the `[sort]` feed pages,
PrimaryNavigation, FeedSidebarWidgets and `lib/analytics/route-tags.ts`.

## Rewrite branches in `proxy.ts`

| Legacy URL pattern | Legacy page | proxy.ts branch | Next.js route | Status |
|---|---|---|---|---|
| `/` | `PostsIndex ['trending']` | none (no rewrite; matcher allows it) | `app/(main)/page.tsx` (server component: logged-in sessions redirect to `/trending/my` like legacy server.js, otherwise SSRs the trending `SortFeed` at `/`) | Implemented |
| `/category/@username/permlink` | `Post` | Rewrite → `/post/<category>/<username>/<permlink>` (branch 2, Post with category); **no reserved-word check** — the legacy Post regex `<tag>/<account>/<permlink>` has none, so `/about/@a/p`, `/welcome/@a/p`, `/hot/@a/p` and `/tags/@user/permlink` all render Post pages (legacy static checks are exact-path, and CategoryFilters matches at most two segments) | `app/(main)/post/[category]/[username]/[permlink]/page.tsx` | Implemented |
| `/@username/feed` | `PostsIndex ['home', user]` | Rewrite → `/user/<username>/feed` (branch 3, User feed) | `app/(main)/user/[username]/[section]/page.tsx` (fetches `bridge.get_account_posts` with sort `feed`, like legacy `PostsIndex ['home', user]`) | Implemented |
| `/@username/<section>` | `UserProfile` | Rewrite → `/user/<username>/<section>` (branch 4, User profile section); `section` must be in `PROFILE_SECTIONS` | `app/(main)/user/[username]/[section]/page.tsx` | Implemented |
| `/@username/<permlink>` | `PostNoCategory` | Rewrite → `/post-no-category/<username>/<permlink>` (branch 5, Post without category); only when second segment is not a section | `app/(main)/post-no-category/[username]/[permlink]/page.tsx` (fetches category, redirects to `/<category>/@user/permlink`) | Implemented |
| `/@username` | `UserProfile` (blog tab) | Rewrite → `/user/<username>` (branch 6, User profile root); reserved usernames rewrite to `/404` | `app/(main)/user/[username]/page.tsx` (client redirect to `/@<username>/blog`) | Implemented |
| `/<sort>/<tag>` | `PostsIndex [sort, tag]` | Pass-through when `sort` ∈ `SORT_TYPES` and `tag` doesn't start with `@` (branch 7, Category filters) | `app/(main)/[sort]/[tag]/page.tsx` | Implemented |
| `/<sort>` | `PostsIndex [sort]` | Pass-through when `sort` ∈ `SORT_TYPES` (the sort-only pass-through below branch 7); literal `/404` never reaches this branch — the static/API skip at the top of `proxy()` passes it through | `app/(main)/[sort]/page.tsx` (renders `NotFound` for invalid sorts) | Implemented |
| `/trending` | `PostsIndex ['trending']` | Pass-through (also matched by the `/<sort>` branch) | `app/(main)/[sort]/page.tsx` (no dedicated static page; the shared `SortFeed` component also backs the home page) | Implemented |
| `/roles/<tag>` (e.g. `/roles/hive-123456`) | `CommunityRoles` | Pass-through (branch 1.5, Community roles; two segments only — `/roles/@user/permlink` falls through to branch 2 and is a Post; the accepted tag charset is wider than legacy's `[\w.-]{1,32}`, see Known gaps) | `app/(main)/roles/[tag]/page.tsx` | Implemented |
| `/<a>/<b>/<c>` without `@` (e.g. `/bitcoin/alice/my-post`) | `NotFound` | Rewrite → `/404` (three-segment invalid-pattern guard), unless first segment is reserved or second starts with `@` | `app/(main)/404/page.tsx` | Implemented |
| `/<a>/<b>` without `@`, non-sort (e.g. `/alice/my-post`) | `NotFound` | Rewrite → `/404` (two-segment invalid-pattern guard) | `app/(main)/404/page.tsx` | Implemented |
| `/<segment>` without `@`, non-sort, non-reserved (e.g. `/alice`) | `NotFound` | Rewrite → `/404` (single-segment invalid-pattern guard) | `app/(main)/404/page.tsx` | Implemented |
| Direct access to internal rewrite targets: any path under `/post/…`, `/post-no-category/…` or `/user/…` that the earlier branches did not consume — with or without `@` segments (e.g. `/post/a/b/c`, `/user/alice`, four-segment `/post/<cat>/@u/pl`, `/user/@a/b/c`, two-segment `/user/@alice`) | `NotFound` (legacy ResolveRoute.js has no `/post`, `/post-no-category` or `/user` routes; its regexes match at most three segments with an @-prefixed account, and UserProfile/UserFeed require a first-segment `@account`) | Rewrite → `/404` (internal-target guard, after the `/<sort>` branch; prefixes derived from `INTERNAL_ROUTE_PREFIXES` in `lib/routes.ts`). Sole exemption: the exact trailing-slash Post form `/<prefix>/@user/<permlink>/` (exactly three segments, second one `@`-prefixed, optional trailing slash) passes through so the proxy-issued trailing-slash 308 (see the trailing-slash normalization note below) drops the slash and re-enters at branch 2 as a legacy Post URL. Slash-less three-segment `@` forms (`/post/@a/p`, `/user/@alice/blog`, `/user/@a/feed`) never reach the guard — branch 2 consumes them first (legacy Post regex parity: any `[\w.-]{1,32}` tag is a category, so legacy also served `/user/@alice/blog` as a Post page, never as UserProfile) | `app/(main)/404/page.tsx` | Implemented |
| `/%40username/...` | (same as `@` variants) | `%40` is decoded to `@` before matching (the `%40` decode step at the top of `proxy()`) | same as the corresponding `@` routes | Implemented |

`SORT_TYPES` (const in `lib/routes.ts`, imported by `proxy.ts`): `hot`,
`trending`, `promoted`, `payout`, `payout_comments`, `muted`, `created` —
identical to the legacy `<sort>` regex alternation.

`PROFILE_SECTIONS` (const in `lib/routes.ts`, imported by `proxy.ts`):
`blog`, `posts`, `comments`, `replies`, `payout`, `feed`, `followers`,
`followed`, `settings`, `notifications`, `communities` — identical to the
legacy `<account-tab>` alternation. The `[sort]` feed pages, the
navigation/sidebar components and analytics route tagging validate against
these same shared lists.

## GDPR-blocked accounts

`lib/gdpr-user-list.ts` ports legacy `src/app/utils/GDPRUserList.js`
verbatim. Mirroring legacy `ResolveRoute.js`, any route family that exposes
a GDPR-listed account returns `NotFound`: `/@user/feed` (UserFeed),
`/@user` + all sections (UserProfile), `/@user/permlink` (PostNoCategory),
and `/category/@user/permlink` (Post).

A single guard in `proxy.ts` (the GDPR guard) covers all four families —
the `@`-segment is always the first or second path segment — by rewriting
to `/404`. Usernames containing a dot (e.g. `mateja.klaric`) reach this
guard too: the static-asset skip only matches known file extensions, so
dotted GDPR usernames are also rewritten to `/404`.

## Anonymous page cache eligibility (Cache-Control overlay)

`proxy.ts` stamps `Cache-Control` on post-page GETs through the
`applyAnonymousPageCacheControl` overlay, aligned with the openresty
sidecar's cache-eligibility gate (steemit/openresty #21/#22,
`scripts/lua/condenser/{dev,production}/limit_req.lua`):

- **Anonymous (no `Cookie` header) GET on a gate-covered path** →
  `Cache-Control: public, max-age=300` (5 minutes, matching the edge's
  `proxy_cache_valid 200 5m`). nginx honors Cache-Control and refuses to
  cache Next.js's dynamic-render default
  (`private, no-cache, no-store, max-age=0, must-revalidate`), so without
  this header the edge cache hit rate stays at 0%.
- **Any `Cookie` header on the same paths** → explicit
  `private, no-store` (the edge gate bypasses these too — any cookie
  implies potential personalization).
- **RSC-family (flight) requests** → never overlaid, regardless of path
  (HTML-only semantics; see below).
- **Responses the proxy rewrites to `/404`** → never overlaid (GDPR guard,
  internal-target guard, unroutable forms; see below).
- **Everything else** → untouched; Next's dynamic-render default applies.

The eligibility regex mirrors the lua gate character-for-character,
including the lowercase-only tag segment —
`^/(?:[a-z0-9%.-]+/)?@[^/]+/.+` tested against the **decoded** pathname
(nginx `$uri` semantics; the source is frozen by a snapshot test in
`__tests__/proxy.test.ts`). It is deliberately narrower than rewrite branch
2's `[^/]+` category capture: a wider match would hand `public` to paths
the edge never caches (e.g. an uppercase-tag `/Tag/@user/permlink`),
leaving browsers caching pages nginx does not. The same regex also —
intentionally — covers two-segment **profile-section** paths
(`/@alice/blog`): `@[^/]+/.+` admits them and the lua gate caches them the
same way, so the overlay must not be narrower than the gate. Method is
GET-only (the gate itself only admits GET; HEAD bypasses to the uncached
upstream), and proxy-issued redirects (trailing-slash 308s, `.html`
aliases) are skipped because they are already 3xx at middleware time.

**HTML-only: RSC-family exclusion.** Requests carrying any flight marker
(`RSC`, `next-router-state-tree`, `next-router-prefetch`,
`next-router-segment-prefetch`, `next-hmr-refresh`, or the `_rsc`
cache-buster query — frozen against Next's `FLIGHT_HEADERS`) never receive
the overlay: they keep Next's default no-store, which nginx refuses to
cache. Reason: a flight request *without* a valid `?_rsc=` hash is turned
into a **307 empty-body redirect** by Next's render-time hash validation
(`experimental.validateRSCRequestHeaders`, default-on in Next 16). At
middleware time that response is still a 200 rewrite (the status guard
cannot fire), so stamping `public` on it sends a `public, max-age=300` 307
into the edge cache under the exact key the anonymous HTML copy uses — the
nginx key contains neither the RSC header nor any working Vary dimension
(nginx does not vary its cache key on request headers) — and the next
anonymous HTML GET of that URL is served the cached 307 empty body instead
of the page. Reproduced end-to-end on a production build.

**Next 16 runtime caveat (measured, PR #4061 follow-up):** in production
the Node middleware adapter strips the flight markers *before* the proxy
sees the request — `next/dist/server/web/adapter.js` ("Headers should only
be stripped for middleware") deletes every `FLIGHT_HEADERS` entry and the
`_rsc` search parameter from the middleware-visible request and re-applies
them to the render request afterwards. A request carrying `RSC: 1` that
the render-time validation 307s shows `request.headers.get('rsc') ===
null` inside `proxy()`. The exclusion guard is therefore inert for the
307-poison vector on Next 16.3.x — it remains the correct portable guard
(live in the unit layer and on any runtime where the markers reach the
middleware), but the load-bearing fix is at the edge, where nginx CAN see
the `RSC` header: the openresty gate must bypass RSC-carrying requests
and/or `proxy_ignore_headers Cache-Control` must keep non-200 responses
out of the cache. **Dependency: openresty repository** (tracked with the
same-side change that fixes the `/404` case below).

**`/404` rewrites are never overlaid.** When `resolveRoute` rewrites to
`/404` (GDPR guard, internal-target guard, unroutable forms) and the gate
regex matches (the GDPR post shapes `/@gdpr-user/permlink` and
`/<tag>/@gdpr-user/permlink`), the overlay detects the rewrite target via
the same `x-middleware-rewrite` response header Next's own adapter parses
and skips, leaving Next's no-store default. Reason: nginx honors an
explicit upstream `Cache-Control` for **non-200 statuses too** — a
`proxy_cache_valid 200 5m` directive alone does not stop a
`public, max-age=300` 404 from being stored — so a public 404 would enter
the edge cache and browsers would hold the not-found view for the
5-minute window. Only the openresty-side `proxy_ignore_headers
Cache-Control` change makes non-200s uncacheable in general; until that
deploys, `404/307/500 + public` shapes can still enter the cache from
sources this app does not control, and the app-side skips above remove
the largest sources we do control.

How the header survives rendering: middleware response headers are merged
into the final response before the page renders, and the render path only
stamps its default `Cache-Control` when the response does not already
carry one (`next/dist/server/send-payload.js`) — the same mechanism the
per-request CSP nonce uses. Verified against a production build
(`next start`): anonymous post-page GETs serve `public, max-age=300`,
cookie-carrying GETs `private, no-store`, and `/trending` keeps Next's
default. (Next's dev server unconditionally overrides Cache-Control with
`no-cache, must-revalidate`, a dev-only branch in base-server.js — so the
overlay is invisible under `next dev` and only observable on production
builds.) The "already set is not overridden" behavior is a send-payload
implementation detail, not a documented contract: every Next **major**
upgrade must re-verify the middleware-header override mechanism
empirically before trusting the overlay again.

Nonce tradeoff: within the 5-minute TTL every visitor served from the
shared edge copy sees the same CSP nonce (header and rendered scripts come
from one coherent response). This weakens the nonce defense-in-depth
layer only — the primary XSS defense is the render pipeline
(markdown-it → HtmlReady → sanitize-html, covered by the 66-case XSS
suite) — and matches what legacy accepted in #4032 when it made anonymous
post pages cacheable.

Deployment expectations (what a "good" hit rate looks like): the app's
session hydration (`withSession` behind `/api/auth/session` and
`/api/auth/challenge`) **mints a session cookie for cookie-less visitors**,
so any client that runs the app's JavaScript carries a `steem-session`
cookie from its **second** page view onwards and the edge gate bypasses it
(BYPASS, uncached upstream). The cache benefit therefore lands on crawlers
and first-HTML requests — which is exactly the traffic composition of the
9-20 incident (96% of it) — and "human return visitors never hit the
cache" is the expected shape, not a deployment failure. Known divergence
with the lua gate, accepted: double-slash forms like `/tag//@user/permlink`
pass the edge gate (nginx `merge_slashes` merges `$uri` to `/tag/@user/p`
before the gate runs) but not the app's regex (a `//` cannot match
`[a-z0-9%.-]+/`), so such URLs are permanent MISSes and briefly hold the
cache lock (a serialization window) — wasted capacity, never a wrong
copy, because the response is generated fresh.

Verification: behind the openresty sidecar, repeated cookie-less GETs of
the same post URL should flip the `X-Cache` response header from `MISS`
to `HIT` (the `/upstream_cached` location exports
`$upstream_cache_status`), and the `cachestat` access-log line quantifies
the hit rate (`hit_rate = HIT/(HIT+MISS+EXPIRED)` on gated traffic;
cookie-carrying traffic shows an empty `$upstream_cache_status` via
`/upstream`). Two deployment observations: the cache key's `$lang`
dimension is a harmless dead dimension on this stack (SSR is always
English; locale is a client-side concern), and with ALB stickiness off,
the per-instance per-IP rate limit is diluted across instances — watch
the `[rate_limit]` 429 logs after rollout (shared Redis limiting is the
follow-up lever).

## Static and reserved routes

`RESERVED_ROUTES` (const in `lib/routes.ts`, imported by `proxy.ts`) guards
against reserved words being treated as **usernames** (the `@username`
branches) and keeps the
invalid-pattern fallthrough from shadowing real app routes. It is
deliberately **not** applied to post categories: the legacy Post regex has
no reserved-word check, so posts whose first tag is a reserved word
(`/about/@a/p`, `/welcome/@a/p`, `/hot/@a/p`, `/tags/@a/p`, …) must render
the Post page, exactly as in legacy (see the first table). Whether a page
actually exists for the reserved words themselves:

| Path | proxy.ts handling | Next.js route | Status |
|---|---|---|---|
| `/login` | Pass-through | `app/login/page.tsx` (outside the `(main)` shell) | Implemented (legacy used `/login.html`) |
| `/submit` | Pass-through | `app/(main)/submit/page.tsx` | Implemented (legacy used `/submit.html`) |
| `/search` | Pass-through | `app/(main)/search/page.tsx` | Implemented |
| `/communities` | Pass-through | `app/(main)/communities/page.tsx` | Implemented |
| `/trending`, `/hot`, `/created`, `/payout`, `/payout_comments`, `/muted` | Pass-through (`/<sort>` branch) | `app/(main)/[sort]/page.tsx` | Implemented |
| `/promoted` | Pass-through (`/<sort>` branch; note: in `SORT_TYPES` but **not** in `RESERVED_ROUTES`) | `app/(main)/[sort]/page.tsx` | Implemented |
| `/404` | Explicitly skipped (the static/API skip at the top of `proxy()`) | `app/(main)/404/page.tsx` | Implemented (proxy 404 target) |
| `/api/*`, `/_next/*`, `/static/*`, any path ending in a known static extension | Skipped by the static/API skip in `proxy()`: `STATIC_ASSET_RE` is a known-extension whitelist (`.ico`, `.png`, `.css`, `.html`, …), **not** a dot check — dotted usernames/permlinks such as `/@ety001.test01` or `/@alice/post-v1.2` are NOT skipped (see "GDPR-blocked accounts" above). `api` and `_next` are additionally excluded by the `config.matcher` | `app/api/**`, `app/.well-known/**`, `public/**` | Implemented |
| `/tags` | Pass-through (reserved) | — | **Not migrated** (legacy `TagsIndex`); falls through to `not-found.tsx` |
| `/rewards` | Pass-through (reserved) | — | **Not migrated** (legacy `Rewards`); falls through to `not-found.tsx` |
| `/welcome` | Pass-through (reserved) | `app/(main)/welcome/page.tsx` | Implemented (legacy parity; MAIN-25) |
| `/faq`, `/privacy`, `/tos` (legacy `/faq.html` etc., redirected) | Pass-through (reserved) | `app/(main)/faq|privacy|tos/page.tsx` | Implemented (legacy parity; MAIN-25) |
| `/about`, `/support` | Pass-through (reserved) | — | **Not migrated** (marketing pages; legacy `/about.html`, `/support.html`) |

## Intentionally absent legacy routes

Verified against `condenser-legacy/src/app/ResolveRoute.js` and
`condenser-legacy/src/app/components/pages/`:

| Legacy route | Legacy page | Status in new app |
|---|---|---|
| `/welcome` | `Welcome` | Implemented at `/welcome` (`app/(main)/welcome/page.tsx`) |
| `/faq.html`, `/privacy.html`, `/tos.html` | `Faq` / `Privacy` / `Tos` | Implemented at `/faq` / `/privacy` / `/tos`; `.html` URLs 308-redirect (proxy.ts `LEGACY_HTML_ALIASES`, so security headers ride along) |
| `/about.html`, `/support.html` | `About` / `Support` | Not migrated. The proxy skips them (`.html` is a known static extension), but that only bypasses the proxy's rewrite chain — the App Router's dynamic `[sort]` route still matches the segment, so they serve **HTTP 200 with the in-shell not-found view** (SortFeed renders `NotFound` for an unknown sort), not a 404 status (pre-existing on base and this branch; live-verified 2026-09) |
| `/login.html`, `/submit.html` | `Login` / `SubmitPost` | Replaced by `/login` and `/submit`; `/login.html` 308-redirects to `/login` (proxy.ts `LEGACY_HTML_ALIASES`, evaluated before the `.html` static-asset skip). `/submit.html` is not aliased: the proxy skips it (`.html` static extension) and the `[sort]` route serves it as HTTP 200 with the in-shell not-found view — same pre-existing behavior as `/about.html` above, not a 404 status |
| `/tags` | `TagsIndex` | Not migrated — 404 |
| `/rewards` | `Rewards` | Not migrated — 404 |
| `/<tag>/@user/permlink.json` | `PostJson` | Not migrated — ends in the known `.json` static extension, proxy skips → 404 |
| `/@user.json` | `UserJson` | Not migrated — ends in the known `.json` static extension, proxy skips → 404 |
| `/xss/test` (dev only) | `XSSTest` | Not migrated |
| `/benchmark` (offline SSR test) | `Benchmark` | Not migrated |

## Known gaps and behavioral differences

- **`/@<reserved>/<section>`** (e.g. `/@trending/blog`): both the section and
  post-no-category branches skip reserved usernames, and the 404 guards only
  fire for non-`@` paths, so the proxy passes it through and it 404s at
  render time via `app/not-found.tsx`. Acceptable, but different from legacy
  (which would attempt a `UserProfile` render).
- **Case handling**: proxy checks are case-insensitive
  (`toLowerCase()`), but rewrites preserve the original casing of
  `username`/`section`/`permlink` segments. This diverges from legacy,
  whose `<sort>` and `<account-tab>` regex alternations were
  lowercase-only: `/Trending` renders the trending feed here (the
  `[sort]` page lowercases before validating) but was `NotFound` in
  legacy. For `/@alice/BLOG`, resolveRoute alone would fall through to
  `PostNoCategory` (uppercase `BLOG` fails the `<account-tab>`
  alternation), but legacy's production stack ran a
  lowercase-normalization middleware before route resolution
  (`condenser-legacy/src/server/server.js`, "normalize user name url
  from cased params"): the `PostNoCategory` regex — whose `<permlink>`
  charset `[\w\d-]+` admits uppercase — matched the cased URL and
  301-redirected to `/@alice/blog`, which then rendered the
  `UserProfile` blog page. Both stacks therefore end on the user
  profile section route, not a permlink post: the new code routes
  `/@alice/BLOG` as a section directly at the original-cased URL (no
  redirect), while legacy adds one 301 hop that also normalizes the
  URL to lowercase. Rendering parity is preserved by normalizing the
  section case in the page itself:
  `UserSectionClient.tsx` lowercases `params.section` on entry (the
  server-shell `generateMetadata` already matched private sections
  case-insensitively), so `/@alice/BLOG` renders the same blog list as
  `/@alice/blog`; the `[sort]/[tag]` page likewise passes a lowercased
  order to `PostsList`. URL-derived navigation UI is normalized the same
  way: `PrimaryNavigation` lowercases the pathname before its
  profile-tab and my-subscriptions comparisons, and
  `FeedSidebarWidgets` before its community-feed matcher, so
  `/@alice/BLOG` keeps the Blog tab highlighted while `/Payout/my` and
  `/Payout/hive-x` still light up My Subscriptions and the community
  pane (legacy served these UIs from the 301-normalized lowercase URL).
- **Trailing slashes**: rewrites are built on `request.nextUrl.clone()`,
  whose `NextURL` keeps the original trailing-slash state — so
  `/@alice/feed/` rewrites to `/user/alice/feed/` (with slash). Harmless:
  both resolve to the same route.
- **Post segment character sets**: branch 2 captures `category`,
  `username` and `permlink` with `[^/]+`, which is wider than legacy's
  `<tag>` `[\w.-]{1,32}` and `<permlink>` `[A-Za-z\d-]+`. Notably, a dotted
  permlink (e.g. `/tags/@alice/v1.2`) 404s in legacy but renders here. This
  deviation predates the reserved-category fix (it applies to every
  category) and now extends to reserved-word categories; tightening the
  regex is deferred to a follow-up PR.
- **Trailing slash normalization**: any document path that survives route
  matching with a trailing slash (e.g. `/about/@alice/my-post/`, which does
  not match branch 2 — `[^/]+` cannot span the slash — or `/trending/`) gets
  a 308 redirect to the slash-less form **issued by the proxy itself** at the
  end of `resolveRoute`, so the security headers and per-request CSP ride
  along (Next's own implicit 308 short-circuits before the next.config
  `headers()` table applies). Branches that handle a trailing slash directly
  (e.g. branch 3's `/@user/feed/`) still rewrite without the extra hop.
- **Static-extension URLs that legacy routed**: paths ending in a known
  static extension (`STATIC_ASSET_RE`) are skipped before any route
  matching, but legacy had no such check — and the skip only bypasses the
  proxy, not the App Router's own dynamic routes. `/@user.md` matched
  legacy's `<account>` regex (`@[\w.\d-]+` admits dots) and rendered the
  profile; here it falls through to the `[sort]` route, which renders the
  in-shell not-found view (HTTP 200 — no profile). Tag feeds, however,
  still work exactly like legacy: `/trending/foo.md` falls through to the
  `[sort]/[tag]` route and renders the `foo.md` tag feed (200). Both are
  pre-existing behaviors (live-verified 2026-09). (The `.json` variants are
  a separate, intentional gap — legacy served PostJson/UserJson API stubs,
  see "Intentionally absent legacy routes".)
- **`/roles/<tag>` tag charset**: branch 1.5 accepts any non-slash segment
  (`[^/]+`), so `/roles/@foo` passes through to the roles page (which
  renders its community-management shell with empty lists); legacy's
  CommunityRoles regex used the `<tag>` charset `[\w.-]{1,32}`, which
  excludes `@`, so `/roles/@foo` was `NotFound`.

## Keeping this in sync

`lib/routes.ts`, `proxy.ts`, this document, and `scripts/test-proxy-routes.ts`
form a set:

- **The route vocabulary lives in a single source, `lib/routes.ts`
  (`RESERVED_ROUTES`, `PROFILE_SECTIONS`, `SORT_TYPES`,
  `INTERNAL_ROUTE_PREFIXES`); `proxy.ts`, the `[sort]` feed pages,
  PrimaryNavigation, FeedSidebarWidgets and `lib/analytics/route-tags.ts`
  all import it — never redefine these lists locally.**
- **Any change to `lib/routes.ts` or to a rewrite branch in `proxy.ts` must
  update both this document and `scripts/test-proxy-routes.ts`.**
- The cache-eligibility regex (`ANON_POST_PAGE_GATE_RE` in `proxy.ts`) is
  paired with the openresty gate in
  `scripts/lua/condenser/{dev,production}/limit_req.lua`; if either regex
  changes, change both and update the
  "Anonymous page cache eligibility" section above. The regex source and
  the RSC-family marker list are frozen by snapshot tests in
  `__tests__/proxy.test.ts` (the marker list is asserted equal to the
  installed Next's `FLIGHT_HEADERS`) — a Next upgrade that changes either
  must fail those tests and be re-reviewed, not silently absorbed.
- **Every Next major upgrade must re-verify the middleware-header override
  mechanism empirically** (send-payload's "already set is not overridden"
  behavior that lets the overlay's Cache-Control survive rendering), and
  re-check whether the middleware adapter still strips `FLIGHT_HEADERS` /
  `_rsc` from the middleware-visible request (the "Next 16 runtime caveat"
  above) — if a future Next stops stripping them, the app-side RSC-family
  guard becomes live in production.
- **Any additional cache layer (Cloudflare in front of the edge, a CDN, a
  service worker cache, …) must encode "RSC-family headers present → do
  not cache" into its key or bypass rules before it is enabled.** `Vary`
  does not substitute for this: nginx ignores Vary for cache-key purposes
  and Cloudflare honors only a narrow header set, so the RSC/flight
  distinction must be an explicit bypass/key rule in every layer that can
  store HTML-keyed responses.
- `scripts/test-proxy-routes.ts` runs standalone (`pnpm test:proxy`); it
  imports `proxy()` directly with mocked `NextRequest` objects and asserts
  the rewrite/pass-through/404 outcome of each branch — no dev server needed.
- When a new App Router page is added under `app/`, check whether
  `lib/routes.ts` needs the route in `RESERVED_ROUTES` and update the
  tables above.
- **Invariant (storage authority)**: the overlay is the sole arbiter of edge
  storage eligibility. With `proxy_ignore_headers Cache-Control` on the edge
  there is no nginx-side `no-store` safety net anymore — a gated anonymous
  200 must NEVER be personalized; any future server component that varies
  by visitor on a gate-matched path silently freezes at the edge for 5 min.
- **Known tradeoff — render-time `notFound()`**: a post URL that does not
  exist server-side renders Next's 404 with `public, max-age=300` (the
  `/404` skip only covers proxy-issued GDPR rewrites). The edge refuses to
  store non-200s, but the requesting anonymous browser keeps the 404 for
  up to 5 minutes (a just-published post may read as missing to a visitor
  who previously hit the dead URL). Accepted; revisit only if reported.
