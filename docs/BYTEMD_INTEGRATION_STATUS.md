# bytemd Editor Integration - Status

> Integration branch: `next-bytemd` (created from `next` @ `b7928961`).
> Scope, target architecture and feature-point definitions live in
> `docs/BYTEMD_INTEGRATION_PLAN.md`. This file is updated as part of each
> feature point's PR and records only status and measurements.

## Abandoned (2026-11-26)

The bytemd integration was stopped before any page used it. Nothing of it is
on `next` or `master`. This branch carries the two documentation PRs; PR
[#4075](https://github.com/steemit/condenser/pull/4075) (FP1) is closed
without being merged. The plan is kept as the record of what was intended,
and is not to be executed.

### Why it was abandoned

1. **Rendering on the reading side did not hold up against hostile input.**
   The requirement was a preview identical to the published page, which meant
   moving the reading side to bytemd's pipeline as well. That pipeline is not
   linear in its input: a 64 KiB hostile body can take it tens of seconds or
   exhaust the call stack, where the Markdown step of the pipeline the site
   uses today stays below 0.4 s. Protecting it with a static check that runs
   before the parser did not converge: four review rounds and an independent
   review each found bodies that pass the check and still take seconds. The
   review's conclusion was that the protection has to be isolation (a Web
   Worker, a hard timeout, a cap on the output). A spike confirmed that
   isolation is feasible, at a cost of its own.
2. **bytemd's rendering is not the site's rendering.** On 1047 recent posts
   and 264 comments fetched from the public API, bytemd's stock rendering and
   the page produce a different DOM for 92 % of the posts (for a third of
   them the visible text differs as well). The site-specific processing
   (proxied images with a lightbox, video embeds, mentions, hashtags, links
   with the away-from-Steemit warning) lives in the current pipeline only.
   Making the two sides match means either moving the page to bytemd's
   pipeline (the first point) or replacing bytemd's preview with the site's
   own renderer.
3. **What would be left did not justify the dependency.** With its preview
   replaced, bytemd would contribute the editing interface only: about 187 KB
   of gzipped JavaScript for a toolbar and keyboard shortcuts, on CodeMirror
   5, which is no longer maintained.

### What the measurements also showed

- On real content the pipeline the site uses today is fast: the whole page
  pipeline takes 1.2 ms at the median, 28 ms at the 99th percentile and
  70 ms at most (warm).
- A Markdown renderer compiled to WebAssembly is not the lever either. The
  Markdown step is about a tenth of the page's rendering time; on hostile
  input the slow part is what comes after it (`HtmlReady` and
  `sanitize-html`), and swapping the Markdown step did not change that.
- The current pipeline has worst cases of its own on hostile input, about
  2 s on a 64 KiB body. They predate this work and are unaffected by it.

Timings are order-of-magnitude references taken on one development machine.

### What it took

Two documentation PRs, merged (#4074, #4076). FP1 through four review rounds,
closed without being merged. One independent review and two feasibility
spikes (isolated rendering; Markdown renderers compiled to WebAssembly), none
of them merged.

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
`next-bytemd`. (The order below is the one that was planned; the work stopped
after FP1.)

| # | Branch | Scope | PR | Status |
|---|---|---|---|---|
| 0 | `bytemd/fp-00-bootstrap` | Baseline, plan and status docs | [#4074](https://github.com/steemit/condenser/pull/4074) (squash `da5898dc`) | merged |
| - | `bytemd/docs-english-plan` | Plan and status moved from `.cursor/` to `docs/`; plan rewritten in English | [#4076](https://github.com/steemit/condenser/pull/4076) | merged |
| FP1 | `bytemd/fp-01-render-core` | Rendering core skeleton, dependencies, pre-parse guard | [#4075](https://github.com/steemit/condenser/pull/4075) | closed, not merged |
| FP2 | `bytemd/fp-02-harden-schema` | Hardening + security baseline (11 sections / 69 cases) | - | not started (abandoned) |
| FP3 | `bytemd/fp-03-legacy-semantics` | Steemit semantics (linkify, embeds, collectors) | - | not started (abandoned) |
| FP4 | `bytemd/fp-04-analyze-submit` | Submit-side validation + `json_metadata` migration | - | not started (abandoned) |
| FP5 | `bytemd/fp-05-reader-switch` | Reader switch, rollback flag, legacy fallback, light theme, parity guards | - | not started (abandoned) |
| FP6 | `bytemd/fp-06-body-dark` | Dark theme for post bodies | - | not started (abandoned) |
| FP7 | `bytemd/fp-07-youtube-lite` | YouTube click-to-load preview | - | not started (abandoned) |
| FP8 | `bytemd/fp-08-story-editor` | Story editor | - | not started (abandoned) |
| FP9 | `bytemd/fp-09-comment-editor` | Comment editor (lazy mount, preview off by default) | - | not started (abandoned) |
| FP10 | `bytemd/fp-10-editor-dark` | Dark theme for the editor chrome | - | not started (abandoned) |
| FP11 | `bytemd/fp-11-docs-wrapup` | Docs, dead-code cleanup, final regression | - | not started (abandoned) |

## Measurements

Timings are single renders on the development machine. "Production path"
means bytemd's ESM build (the one vitest and the bundler use).

| Item | Value |
|---|---|
| Pathological input on the legacy pipeline (plan review) | `<b>` x 21800 (64 KiB): 170 ms; `> ` x 32768: 5 ms; 50k-deep `<div>`: 180 ms |
| Same input on the bytemd pipeline, unguarded | 22.1 s / 6.9 s / ~28 s (throws `RangeError`) |
| Ordinary block structure on the production path (warmed) | list items x 1000: 319 ms, x 2000: 620 ms, x 4000: 1.27 s; paragraphs x 1000: 207 ms; plain lines x 4000: 89 ms; quoted lines x 4000: 150 ms |
| Turbopack smoke for bytemd (FP1) | pass: production build with one client-side dynamic import and one server-side import of `lib/markdown/render` (temporary edits, not committed) |
| Reader render chunk size under Turbopack (FP5) | not measured (abandoned) |

### Pre-parse guard after FP1 (limits in `lib/markdown/pathology.ts`)

The guard is in PR #4075, which is closed without being merged, so it is not
on this branch. Its target was not met: bodies were found that pass the guard
and still take seconds (see "Why it was abandoned").

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

- **Abandoned (2026-11-26).** No feature point is to be started. The items
  below are kept as the record of what was open when the work stopped.
- Manual confirmation after FP9: IME (Chinese input) behaviour in the comment
  editor. bytemd 1.22.0 is built on CodeMirror 5; this cannot be automated.
- Accepted review findings:
  - FP1 (engineering review): `lib/markdown/pathology.ts` is about 2000 lines
    in one file. Splitting it is deferred to a standalone refactoring PR; it
    does not block the later feature points, which only call `findPathology`.
- Known limitations of the guard are listed in the header of
  `lib/markdown/pathology.ts` ("Known limitations").
