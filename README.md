# Condenser

Condenser is the web frontend for [Steemit](https://steemit.com) — a client for the
Steem blockchain covering browsing, posting, commenting, voting, communities, and
notifications.

This repository is a **full rewrite** of the legacy Webpack-based Condenser
(React 15 + Redux-Saga + Immutable.js). The old tree was removed from this repo;
the historical implementation lives on in the separate `condenser-legacy` codebase
and remains the authoritative behavioral reference for rendering, routing, and
business logic.

## Tech stack

- **Next.js 16** (App Router, Turbopack, `output: 'standalone'` for Docker)
- **React 19**
- **Redux Toolkit + react-redux** — no Redux-Saga; async work lives in RSC,
  Route Handlers, and `createAsyncThunk`
- **Tailwind CSS v4** (`@tailwindcss/postcss`, single stylesheet) + **shadcn**
- **TypeScript** (strict)
- **`@steemit/steem-js`** for all chain reads/writes — server-side only
- **Redis** (`ioredis`) — optional server-side cache and session store
- Package manager: **pnpm**

## Quick start

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Then open http://localhost:3000.

Environment variables at a glance (full reference:
[docs/CONFIGURATION.md](docs/CONFIGURATION.md)):

- `STEEM_API_URL` — Steem RPC endpoint (default `https://api.steemit.com`)
- `JWT_SECRET` — **required in production**; use a strong random value
- `REDIS_URL` — **optional**; enables Redis-backed sessions and server-side
  content caching. Without it the app degrades gracefully to JWT-only sessions
  and direct RPC calls.
- `NEXT_PUBLIC_IMAGE_PROXY_PREFIX` — image proxy host (default
  `https://steemitimages.com/`)
- `NEXT_PUBLIC_WALLET_URL`, `NEXT_PUBLIC_SIGNUP_URL` — external service links

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Production build (`output: 'standalone'`) |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Unit/integration tests (Vitest + React Testing Library) |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm test:api` | Smoke-test Steem/auth API endpoints (`scripts/test-api.ts`) |
| `pnpm test:proxy` | Test `proxy.ts` route rewriting (`scripts/test-proxy-routes.ts`) |
| `pnpm test:render` | Compare the render pipeline against the legacy implementation |

Unit/integration tests live under `__tests__/` (Vitest + React Testing
Library). The `test:*` scripts are ad-hoc `tsx` checks under `scripts/`.
Run `pnpm lint` and `pnpm test` before committing.

## Project structure

```
app/            Next.js App Router
  (main)/         Route group wrapped by <AppShell>: feeds, posts, user
                  profiles, communities, search, submit
  api/            Route Handlers: auth/* (challenge-response login) and
                  steem/* (accounts, posts, comments, communities, ...)
  login/          Login page (outside the main shell)
components/     Shared UI: ui/ (shadcn primitives), layout/, cards/,
                elements/, modules/
lib/            Core logic
  html-ready.ts   HtmlReady transforms (ported from legacy)
  sanitize-config.ts  sanitize-html whitelist (ported from legacy)
  media/          URL/image regexes and image-proxy URL encoding
  steem/          Server-side steem-js client (bridge + condenser_api)
  cache/          Redis server cache, browser LRU, SWR fetch helpers
  auth/           Session management (Redis + JWT hybrid)
  crypto/         Posting-key challenge-response and signing
store/          Redux Toolkit store, slices, thunks, hooks
proxy.ts        Route rewriting (replaces middleware.ts in Next.js 16)
__tests__/      Vitest unit/integration tests (mirrors source paths)
scripts/        Ad-hoc test/comparison scripts
docs/           Project documentation (see below)
```

## Key concepts

- **Render pipeline (security-critical, fixed order)** in
  `components/elements/MarkdownViewer.tsx`: `markdown-it` →
  `lib/html-ready.ts` (HtmlReady transforms) → `lib/sanitize-config.ts`
  (sanitize-html). `html-ready.ts` and `sanitize-config.ts` were ported as a
  pair from the legacy codebase and must stay consistent with it.
- **Image proxy** (`lib/media/proxify-url.ts`): first-party images are rewritten
  to `{NEXT_PUBLIC_IMAGE_PROXY_PREFIX}/p/{base58(url)}?...`; third-party images
  pass through untouched.
- **Three-layer cache**: browser LRU (L1) → Redis (L2, stale-while-error) → RPC.
  Personalized endpoints bypass the cache when an `observer` is set so
  per-user state never leaks. Redis is optional everywhere.
- **`proxy.ts` is the routing brain**: it rewrites legacy Condenser URLs
  (`/@user`, `/category/@user/permlink`, `/[sort]/[tag]`, ...) onto App Router
  segments, following the legacy `ResolveRoute.js` matching order. Read it
  before touching any route.
- **Authentication**: posting-key-only, signature-based challenge-response.
  Active/owner keys are rejected; private keys never reach the server. Sessions
  are HTTP-only cookies backed by Redis (recommended) or JWT fallback.
  See [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md).

## Docker

Multi-stage Dockerfile (Alpine, dev + prod targets) and `docker-compose.yml` are
included — see [docs/README.Docker.md](docs/README.Docker.md).

```bash
docker compose up -d
```

## Documentation

- [docs/CONFIGURATION.md](docs/CONFIGURATION.md) — environment variables and session modes
- [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md) — posting-key challenge-response auth flow
- [docs/KEY_MANAGEMENT.md](docs/KEY_MANAGEMENT.md) — client-side private key storage and signing
- [docs/STATE_MANAGEMENT.md](docs/STATE_MANAGEMENT.md) — Redux Toolkit structure vs. the legacy saga setup
- [docs/COMPONENT_MIGRATION_SCOPE.md](docs/COMPONENT_MIGRATION_SCOPE.md) — definition of done for the migration
- [docs/ROUTE_MAP.md](docs/ROUTE_MAP.md) — legacy URL → proxy rewrite → App Router route mapping
- [docs/API_TESTING.md](docs/API_TESTING.md) — testing Steem/auth API endpoints
- [docs/README.Docker.md](docs/README.Docker.md) — Docker build and run
