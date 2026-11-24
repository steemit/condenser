# bytemd Editor Integration - Status

> Integration branch: `next-bytemd` (created from `next` @ `b7928961`).
> Scope, target architecture and feature-point definitions live in
> `docs/BYTEMD_INTEGRATION_PLAN.md`. This file is updated as part of each
> feature point's PR and records only status and measurements.

## Baseline (`next` @ `b7928961`, 2026-11-24)

| Check | Result |
|---|---|
| `pnpm lint` | 0 errors / 7 warnings |
| `pnpm typecheck` | pass |
| `pnpm test` | 92 files / 1171 tests passed |
| `pnpm test:proxy` | pass |
| `pnpm build` | pass |

## Feature points

Strictly sequential; each one is one branch and one squash-merged PR into
`next-bytemd`.

| # | Branch | Scope | PR | Status |
|---|---|---|---|---|
| 0 | `bytemd/fp-00-bootstrap` | Baseline, plan and status docs | [#4074](https://github.com/steemit/condenser/pull/4074) (squash `da5898dc`) | merged |
| - | `bytemd/docs-english-plan` | Plan and status moved from `.cursor/` to `docs/`; plan rewritten in English | [#4076](https://github.com/steemit/condenser/pull/4076) | merged |
| FP1 | `bytemd/fp-01-render-core` | Rendering core skeleton, dependencies, pre-parse guard | [#4075](https://github.com/steemit/condenser/pull/4075) | in review |
| FP2 | `bytemd/fp-02-harden-schema` | Hardening + security baseline (11 sections / 69 cases) | - | pending |
| FP3 | `bytemd/fp-03-legacy-semantics` | Steemit semantics (linkify, embeds, collectors) | - | pending |
| FP4 | `bytemd/fp-04-analyze-submit` | Submit-side validation + `json_metadata` migration | - | pending |
| FP5 | `bytemd/fp-05-reader-switch` | Reader switch, rollback flag, legacy fallback, light theme, parity guards | - | pending |
| FP6 | `bytemd/fp-06-body-dark` | Dark theme for post bodies | - | pending |
| FP7 | `bytemd/fp-07-youtube-lite` | YouTube click-to-load preview | - | pending |
| FP8 | `bytemd/fp-08-story-editor` | Story editor | - | pending |
| FP9 | `bytemd/fp-09-comment-editor` | Comment editor (lazy mount, preview off by default) | - | pending |
| FP10 | `bytemd/fp-10-editor-dark` | Dark theme for the editor chrome | - | pending |
| FP11 | `bytemd/fp-11-docs-wrapup` | Docs, dead-code cleanup, final regression | - | pending |

## Measurements

Timings are single renders on the development machine. "Production path"
means bytemd's ESM build (the one vitest and the bundler use).

| Item | Value |
|---|---|
| Pathological input on the legacy pipeline (plan review) | `<b>` x 21800 (64 KiB): 170 ms; `> ` x 32768: 5 ms; 50k-deep `<div>`: 180 ms |
| Same input on the bytemd pipeline, unguarded | 22.1 s / 6.9 s / ~28 s (throws `RangeError`) |
| Ordinary block structure on the production path (warmed) | list items x 1000: 319 ms, x 2000: 620 ms, x 4000: 1.27 s; paragraphs x 1000: 207 ms; plain lines x 4000: 89 ms; quoted lines x 4000: 150 ms |
| Turbopack smoke for bytemd (FP1) | pass: production build with one client-side dynamic import and one server-side import of `lib/markdown/render` (temporary edits, not committed) |
| Reader render chunk size under Turbopack (FP5) | pending |

### Pre-parse guard after FP1 (limits in `lib/markdown/pathology.ts`)

Target: anything that passes the guard renders in about 250 ms or less.
Refused input is reported in under 150 ms (best of three; the largest value
observed in the test suite is about 85 ms).

| Class | Limit | Value |
|---|---|---|
| `structure` | `MAX_QUOTE_MARKERS_PER_LINE` | 64 |
| `structure` | `MAX_CONTAINER_MARKERS_PER_LINE` | 64 |
| `structure` | `MAX_INDENT_COLUMNS` | 256 |
| `structure` | `MAX_HTML_NESTING_DEPTH` | 256 |
| `structure` | `MAX_DELIMITER_RUN_LENGTH` | 64 |
| `structure` | `MAX_INLINE_RESOLVE_WORK` (per inline unit) | 2,000,000 |
| `budget` | `MAX_INLINE_TOKENS` (per inline unit) | 3,072 |
| `budget` | `MAX_LINES` | 2,000 |
| `budget` | `MAX_LIST_ITEMS` | 800 |
| `budget` | `MAX_QUOTE_LINES` | 2,000 |
| `budget` | `MAX_TABLE_CELLS` (per table) | 768 |
| `budget` | `MAX_INLINE_RESOLVE_WORK_TOTAL` (whole body) | 4,000,000 |
| `budget` | `MAX_INLINE_TOKENS_TOTAL` (whole body) | 3,072 |
| `budget` | `MAX_EMPHASIS_MARKERS_TOTAL` (whole body) | 5,120 |
| `budget` | `MAX_TABLE_CELLS_TOTAL` (whole body) | 1,536 |

Consequence: long or richly formatted posts that exceed a body-level budget
(for example about 300 paragraphs with inline markup, 40 KiB) are refused by
the guard and will render through the legacy pipeline once the reader switch
lands (FP5). They are legitimate content; this is the intended fallback, not
a defect.

## Open items

- Manual confirmation after FP9: IME (Chinese input) behaviour in the comment
  editor. bytemd 1.22.0 is built on CodeMirror 5; this cannot be automated.
- Accepted review findings:
  - FP1 (engineering review): `lib/markdown/pathology.ts` is about 2000 lines
    in one file. Splitting it is deferred to a standalone refactoring PR; it
    does not block the later feature points, which only call `findPathology`.
- Known limitations of the guard are listed in the header of
  `lib/markdown/pathology.ts` ("Known limitations").
