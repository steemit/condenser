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
`SECTIONS`, `SORT_TYPES`, `STATIC_ASSET_RE`) as anchors, so they do not drift
when lines move.

## Rewrite branches in `proxy.ts`

| Legacy URL pattern | Legacy page | proxy.ts branch | Next.js route | Status |
|---|---|---|---|---|
| `/` | `PostsIndex ['trending']` | none (no rewrite; matcher allows it) | `app/page.tsx` (client redirect to `/trending`) | Implemented |
| `/category/@username/permlink` | `Post` | Rewrite → `/post/<category>/<username>/<permlink>` (branch 2, Post with category); **no reserved-word check** — the legacy Post regex `<tag>/<account>/<permlink>` has none, so `/about/@a/p`, `/welcome/@a/p`, `/hot/@a/p` and `/tags/@user/permlink` all render Post pages (legacy static checks are exact-path, and CategoryFilters matches at most two segments) | `app/(main)/post/[category]/[username]/[permlink]/page.tsx` | Implemented |
| `/@username/feed` | `PostsIndex ['home', user]` | Rewrite → `/user/<username>/feed` (branch 3, User feed) | `app/(main)/user/[username]/[section]/page.tsx` (fetches `bridge.get_account_posts` with sort `feed`, like legacy `PostsIndex ['home', user]`) | Implemented |
| `/@username/<section>` | `UserProfile` | Rewrite → `/user/<username>/<section>` (branch 4, User profile section); `section` must be in `SECTIONS` | `app/(main)/user/[username]/[section]/page.tsx` | Implemented |
| `/@username/<permlink>` | `PostNoCategory` | Rewrite → `/post-no-category/<username>/<permlink>` (branch 5, Post without category); only when second segment is not a section | `app/(main)/post-no-category/[username]/[permlink]/page.tsx` (fetches category, redirects to `/<category>/@user/permlink`) | Implemented |
| `/@username` | `UserProfile` (blog tab) | Rewrite → `/user/<username>` (branch 6, User profile root); reserved usernames rewrite to `/404` | `app/(main)/user/[username]/page.tsx` (client redirect to `/@<username>/blog`) | Implemented |
| `/<sort>/<tag>` | `PostsIndex [sort, tag]` | Pass-through when `sort` ∈ `SORT_TYPES` and `tag` doesn't start with `@` (branch 7, Category filters) | `app/(main)/[sort]/[tag]/page.tsx` | Implemented |
| `/<sort>` | `PostsIndex [sort]` | Pass-through when `sort` ∈ `SORT_TYPES` (the sort-only pass-through below branch 7); literal `/404` rewrites to `/404` | `app/(main)/[sort]/page.tsx` (renders `NotFound` for invalid sorts) | Implemented |
| `/trending` | `PostsIndex ['trending']` | Pass-through (also matched by the `/<sort>` branch) | `app/(main)/trending/page.tsx` (static route shadows `[sort]`) | Implemented |
| `/roles/<tag>` (e.g. `/roles/hive-123456`) | `CommunityRoles` | Pass-through (branch 1.5, Community roles; two segments only — `/roles/@user/permlink` falls through to branch 2 and is a Post) | `app/(main)/roles/[tag]/page.tsx` | Implemented |
| `/<a>/<b>/<c>` without `@` (e.g. `/bitcoin/alice/my-post`) | `NotFound` | Rewrite → `/404` (three-segment invalid-pattern guard), unless first segment is reserved or second starts with `@` | `app/(main)/404/page.tsx` | Implemented |
| `/<a>/<b>` without `@`, non-sort (e.g. `/alice/my-post`) | `NotFound` | Rewrite → `/404` (two-segment invalid-pattern guard) | `app/(main)/404/page.tsx` | Implemented |
| `/<segment>` without `@`, non-sort, non-reserved (e.g. `/alice`) | `NotFound` | Rewrite → `/404` (single-segment invalid-pattern guard) | `app/(main)/404/page.tsx` | Implemented |
| `/%40username/...` | (same as `@` variants) | `%40` is decoded to `@` before matching (the `%40` decode step at the top of `proxy()`) | same as the corresponding `@` routes | Implemented |

`SORT_TYPES` (const in `proxy.ts`): `hot`, `trending`, `promoted`, `payout`,
`payout_comments`, `muted`, `created` — identical to the legacy `<sort>`
regex alternation.

`SECTIONS` (const in `proxy.ts`): `blog`, `posts`, `comments`, `replies`,
`payout`, `feed`, `followers`, `followed`, `settings`, `notifications`,
`communities` — identical to the legacy `<account-tab>` alternation.

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

## Static and reserved routes

`RESERVED_ROUTES` (const in `proxy.ts`) guards against reserved words being
treated as **usernames** (the `@username` branches) and keeps the
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
| `/trending`, `/hot`, `/created`, `/payout`, `/payout_comments`, `/muted` | Pass-through (`/<sort>` branch) | `app/(main)/[sort]/page.tsx` / `app/(main)/trending/page.tsx` | Implemented |
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
| `/faq.html`, `/privacy.html`, `/tos.html` | `Faq` / `Privacy` / `Tos` | Implemented at `/faq` / `/privacy` / `/tos`; `.html` URLs 301-redirect (next.config.ts) |
| `/about.html`, `/support.html` | `About` / `Support` | Not migrated — paths contain `.`, so the proxy skips them and they 404 |
| `/login.html`, `/submit.html` | `Login` / `SubmitPost` | Replaced by `/login` and `/submit`; the `.html` URLs 404 |
| `/tags` | `TagsIndex` | Not migrated — 404 |
| `/rewards` | `Rewards` | Not migrated — 404 |
| `/<tag>/@user/permlink.json` | `PostJson` | Not migrated — contains `.`, proxy skips → 404 |
| `/@user.json` | `UserJson` | Not migrated — contains `.`, proxy skips → 404 |
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
  `username`/`section`/`permlink` segments.
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
- **Trailing slash on three-segment post URLs**: `/about/@alice/my-post/`
  does not match branch 2 (`[^/]+` cannot span the trailing slash), so the
  proxy passes it through and relies on Next's implicit 308 trailing-slash
  normalization to redirect to the slash-less form, which then re-enters
  the proxy and lands on Post.

## Keeping this in sync

`proxy.ts`, this document, and `scripts/test-proxy-routes.ts` form a set:

- **Any change to a rewrite branch, `RESERVED_ROUTES`, `SECTIONS`, or
  `SORT_TYPES` in `proxy.ts` must update both this table and
  `scripts/test-proxy-routes.ts`.**
- `scripts/test-proxy-routes.ts` runs standalone (`pnpm test:proxy`); it
  imports `proxy()` directly with mocked `NextRequest` objects and asserts
  the rewrite/pass-through/404 outcome of each branch — no dev server needed.
- When a new App Router page is added under `app/`, check whether `proxy.ts`
  needs the route in `RESERVED_ROUTES` and update the tables above.
