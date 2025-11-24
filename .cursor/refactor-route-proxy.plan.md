# Refactor Route Proxy Logic Based on Legacy Code

## Analysis of Legacy Routing (ResolveRoute.js)

Key findings from legacy code:
1. **Regex pattern for account**: `(@[\\w\\.\\d-]+)` - **requires @ prefix**
2. **Route matching order**:
   - Static routes first (`/`, `/welcome`, `/login.html`, etc.)
   - `/roles/<tag>` (CommunityRoles)
   - `/@user/feed` (UserFeed)
   - `/@user` or `/@user/<section>` (UserProfile)
   - `/@user/<permlink>` (PostNoCategory)
   - `/category/@user/<permlink>` (Post)
   - `/trending` or `/trending/<tag>` (CategoryFilters)
   - `/search` (SearchIndex)
   - Default: `NotFound`

3. **Important**: Legacy system **only supports @username format** - regex enforces it. Paths without `@` won't match user-related routes and naturally return `NotFound`.

## Current proxy.ts Issues

1. **Redundant checks** (lines 45-60, 81-96, 116-131) for paths without `@` that return 404
2. **Duplicated constants**: `reservedRoutes` defined 4 times, `sections` defined once
3. **Potential routing conflicts**: Paths like `/category/username/permlink` (without @) might accidentally match `app/[username]/[section]/page.tsx` if they reach Next.js

## Solution: Simplify Like Legacy

Following legacy pattern:
1. **Extract constants** at the top: `RESERVED_ROUTES` and `SECTIONS`
2. **Remove redundant checks** - paths without `@` won't match our patterns, so they'll naturally fall through
3. **Add single safety check** at the end to catch paths that look like they should have `@` but don't, before they reach Next.js dynamic routes
4. **Match legacy route order** for consistency

## Implementation Steps

1. Extract constants:
   - `RESERVED_ROUTES` (static routes that shouldn't be treated as categories)
   - `SECTIONS` (user profile sections)
2. Remove redundant checks (lines 45-60, 81-96, 116-131)
3. Reorganize route matching to follow legacy order:
   - Static routes check (already done via skip logic)
   - `/category/@username/permlink` → `/post/category/username/permlink`
   - `/@username/feed` → handle separately (if needed)
   - `/@username/<section>` → pass through to `[username]/[section]`
   - `/@username/<permlink>` → `/post-no-category/username/permlink`
   - `/@username` → pass through to `[username]`
4. Add single unified check at the end for paths without `@` that should have it
5. Test all route patterns match legacy behavior

## Route Patterns to Support

Based on legacy:
- `/category/@username/permlink` → Post page
- `/@username` → User profile (redirects to `/@username/blog`)
- `/@username/<section>` → User profile section
- `/@username/<permlink>` → Post without category (redirects to category version)
- `/@username/feed` → User feed (if needed)
- Static routes: `/trending`, `/login`, `/search`, etc.
- Everything else without `@` → 404

