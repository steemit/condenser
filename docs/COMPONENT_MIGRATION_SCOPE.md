# Component migration scope (Next.js vs legacy)

This document defines **what “finishing” route and component migration means** for this repository. It is **not** a requirement to copy every file under `legacy/src/app/components/`.

## Principle

- **Migrate by shipped feature and route**, not by legacy file count.
- The new app uses **Tailwind v4 + shadcn**; ported components should **match behavior** where needed, not necessarily **pixel-perfect SCSS parity** with legacy.

## What must live in the new tree

Anything that is **imported by `app/**`** or **shared across multiple Next pages** should eventually live under root `components/` (or colocated modules), with TypeScript and the new styling system.

## What does *not* need to be migrated

| Category | Examples (legacy) | Policy |
|----------|-------------------|--------|
| **Unused by current Next routes** | Many `pages/*.jsx` screens not yet recreated in `app/` | Stay in `legacy/` until a route is planned; then migrate or rewrite. |
| **Duplicative primitives** | Legacy form controls where shadcn covers the need | Prefer **`components/ui/*`**; wrap for domain-specific behavior. |
| **Stories / tests / backups** | `*.story.jsx`, `*_BackUp.jsx`, snapshots | Do **not** migrate wholesale; add new tests under the new stack when needed (see phase seven). |
| **Ad / third-party embeds** | `GptAd`, `GoogleAd`, `VideoAd`, etc. | Migrate **only** if product still requires them on Next pages; otherwise defer or replace. |
| **Heavy editors** | `SlateEditor`, large `ReplyEditor` variants | Migrate **when** commenting/posting flows are fully owned by Next; may be a dedicated milestone. |

## Rough inventory (indicative)

- Legacy under `legacy/src/app/components/` is on the order of **200+** files (pages, modules, elements, SCSS).
- Root `components/` intentionally stays **smaller**: layout shell, shared cards/elements for **current** `app/**` routes, and shadcn primitives.

A large gap between the two trees is **expected** until every legacy route is retired or rewritten.

## How this closes phases 3 and 4 (plan semantics)

- **Phase 3 (routes/pages):** “Done” means **core Condenser-style routes** exist in App Router (feed/sort/tag, user, post, search, submit, roles, login, 404) plus **URL compatibility** via `proxy.ts`. Additional legacy-only pages (e.g. marketing/static) are **backlog**, not a blocker for calling phase 3 complete for this milestone.
- **Phase 4 (components):** “Done” means **shared UI for those routes** is in place under `components/` using the new design system. It does **not** mean every legacy component file has been ported.

## Ongoing work

- When adding a **new** Next route, list its legacy dependencies and migrate or rewrite **only** those pieces.
- Keep a **route parity table** (Markdown under `docs/` or `.cursor/`) in sync with `pnpm run test:proxy` expectations.
