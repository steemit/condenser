# Route Map

This document maps every legacy Condenser URL pattern to its handling in the
Next.js rewrite: the branch in `proxy.ts` (the route-rewrite proxy that
replaces `middleware.ts`), the App Router file that ultimately serves it, and
the migration status.

Sources of truth:

- Legacy routing: `condenser-legacy/src/app/ResolveRoute.js` (matching order)
- New routing: `proxy.ts` (rewrite branches, in matching order) + `app/`

`proxy.ts` intentionally follows the legacy `ResolveRoute.js` matching order.
All `proxy.ts` line references below are to the file at the repo root.

## Rewrite branches in `proxy.ts`

| Legacy URL pattern | Legacy page | proxy.ts branch | Next.js route | Status |
|---|---|---|---|---|
| `/` | `PostsIndex ['trending']` | none (no rewrite; matcher allows it) | `app/page.tsx` (client redirect to `/trending`) | Implemented |
| `/category/@username/permlink` | `Post` | Rewrite → `/post/<category>/<username>/<permlink>` (proxy.ts:87-96); skipped when `category` is reserved | `app/(main)/post/[category]/[username]/[permlink]/page.tsx` | Implemented |
| `/@username/feed` | `PostsIndex ['home', user]` | Rewrite → `/user/<username>/feed` (proxy.ts:98-108) | `app/(main)/user/[username]/[section]/page.tsx` (fetches `bridge.get_account_posts` with sort `feed`, like legacy `PostsIndex ['home', user]`) | Implemented |
| `/@username/<section>` | `UserProfile` | Rewrite → `/user/<username>/<section>` (proxy.ts:110-121); `section` must be in `SECTIONS` (proxy.ts:22-25) | `app/(main)/user/[username]/[section]/page.tsx` | Implemented |
| `/@username/<permlink>` | `PostNoCategory` | Rewrite → `/post-no-category/<username>/<permlink>` (proxy.ts:123-133); only when second segment is not a section | `app/(main)/post-no-category/[username]/[permlink]/page.tsx` (fetches category, redirects to `/<category>/@user/permlink`) | Implemented |
| `/@username` | `UserProfile` (blog tab) | Rewrite → `/user/<username>` (proxy.ts:135-147); reserved usernames rewrite to `/404` | `app/(main)/user/[username]/page.tsx` (client redirect to `/@<username>/blog`) | Implemented |
| `/<sort>/<tag>` | `PostsIndex [sort, tag]` | Pass-through when `sort` ∈ `SORT_TYPES` and `tag` doesn't start with `@` (proxy.ts:149-158) | `app/(main)/[sort]/[tag]/page.tsx` | Implemented |
| `/<sort>` | `PostsIndex [sort]` | Pass-through when `sort` ∈ `SORT_TYPES` (proxy.ts:160-173); literal `/404` rewrites to `/404` | `app/(main)/[sort]/page.tsx` (renders `NotFound` for invalid sorts) | Implemented |
| `/trending` | `PostsIndex ['trending']` | Pass-through (also matched by the `/<sort>` branch) | `app/(main)/trending/page.tsx` (static route shadows `[sort]`) | Implemented |
| `/roles/<tag>` (e.g. `/roles/hive-123456`) | `CommunityRoles` | Pass-through (proxy.ts:80-85) | `app/(main)/roles/[tag]/page.tsx` | Implemented |
| `/<a>/<b>/<c>` without `@` (e.g. `/bitcoin/alice/my-post`) | `NotFound` | Rewrite → `/404` (proxy.ts:177-184), unless first segment is reserved or second starts with `@` | `app/(main)/404/page.tsx` | Implemented |
| `/<a>/<b>` without `@`, non-sort (e.g. `/alice/my-post`) | `NotFound` | Rewrite → `/404` (proxy.ts:186-193) | `app/(main)/404/page.tsx` | Implemented |
| `/<segment>` without `@`, non-sort, non-reserved (e.g. `/alice`) | `NotFound` | Rewrite → `/404` (proxy.ts:195-202) | `app/(main)/404/page.tsx` | Implemented |
| `/%40username/...` | (same as `@` variants) | `%40` is decoded to `@` before matching (proxy.ts:38-44) | same as the corresponding `@` routes | Implemented |

`SORT_TYPES` (proxy.ts:28-30): `hot`, `trending`, `promoted`, `payout`,
`payout_comments`, `muted`, `created` — identical to the legacy `<sort>`
regex alternation.

`SECTIONS` (proxy.ts:22-25): `blog`, `posts`, `comments`, `replies`,
`payout`, `feed`, `followers`, `followed`, `settings`, `notifications`,
`communities` — identical to the legacy `<account-tab>` alternation.

## GDPR-blocked accounts

`lib/gdpr-user-list.ts` ports legacy `src/app/utils/GDPRUserList.js`
verbatim. Mirroring legacy `ResolveRoute.js`, any route family that exposes
a GDPR-listed account returns `NotFound`: `/@user/feed` (UserFeed),
`/@user` + all sections (UserProfile), `/@user/permlink` (PostNoCategory),
and `/category/@user/permlink` (Post).

A single guard in `proxy.ts` (proxy.ts:58-68) covers all four families —
the `@`-segment is always the first or second path segment — by rewriting
to `/404`. Usernames containing a dot (e.g. `mateja.klaric`) never reach
the guard: the `.` skip (proxy.ts:48-56) passes them through and they 404
via `not-found.tsx`, which is the same net effect.

## Static and reserved routes

`RESERVED_ROUTES` (proxy.ts:15-19) guards against reserved words being
treated as categories or usernames. Whether a page actually exists for them:

| Path | proxy.ts handling | Next.js route | Status |
|---|---|---|---|
| `/login` | Pass-through | `app/login/page.tsx` (outside the `(main)` shell) | Implemented (legacy used `/login.html`) |
| `/submit` | Pass-through | `app/(main)/submit/page.tsx` | Implemented (legacy used `/submit.html`) |
| `/search` | Pass-through | `app/(main)/search/page.tsx` | Implemented |
| `/communities` | Pass-through | `app/(main)/communities/page.tsx` | Implemented |
| `/trending`, `/hot`, `/created`, `/payout`, `/payout_comments`, `/muted` | Pass-through (`/<sort>` branch) | `app/(main)/[sort]/page.tsx` / `app/(main)/trending/page.tsx` | Implemented |
| `/promoted` | Pass-through (`/<sort>` branch; note: in `SORT_TYPES` but **not** in `RESERVED_ROUTES`) | `app/(main)/[sort]/page.tsx` | Implemented |
| `/404` | Explicitly skipped (proxy.ts:48-56) | `app/(main)/404/page.tsx` | Implemented (proxy 404 target) |
| `/api/*`, `/_next/*`, `/static/*`, any path containing `.` | Skipped by proxy (proxy.ts:48-56); also excluded by the `matcher` (proxy.ts:208-219) | `app/api/**`, `app/.well-known/**`, `public/**` | Implemented |
| `/tags` | Pass-through (reserved) | — | **Not migrated** (legacy `TagsIndex`); falls through to `not-found.tsx` |
| `/rewards` | Pass-through (reserved) | — | **Not migrated** (legacy `Rewards`); falls through to `not-found.tsx` |
| `/welcome`, `/about`, `/faq`, `/privacy`, `/support`, `/tos` | Pass-through (reserved) | — | **Not migrated** (marketing/static pages; legacy served them at `/about.html` etc. plus `/welcome`) |

## Intentionally absent legacy routes

Verified against `condenser-legacy/src/app/ResolveRoute.js` and
`condenser-legacy/src/app/components/pages/`:

| Legacy route | Legacy page | Status in new app |
|---|---|---|
| `/welcome` | `Welcome` | Not migrated — 404 |
| `/faq.html`, `/about.html`, `/support.html`, `/privacy.html`, `/tos.html` | `Faq` / `About` / `Support` / `Privacy` / `Tos` | Not migrated — paths contain `.`, so the proxy skips them and they 404 |
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
