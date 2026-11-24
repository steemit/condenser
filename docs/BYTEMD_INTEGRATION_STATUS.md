# bytemd Editor Integration - Status

> Integration branch: `next-bytemd` (created from `next` @ `b7928961`).
> Scope, target architecture and feature-point definitions live in
> `docs/BYTEMD_INTEGRATION_PLAN.md`. This file is updated as part of each
> feature point's PR and records only status and measurements.

## Hard gate (recorded 2026-11-25)

**Until both of the following are done, no page may render a body through
`renderMarkdown`.** The reading-side switch (FP5) is blocked on both.

1. **Isolated rendering.** A body is rendered in a Web Worker, with a hard
   timeout (the worker is terminated), a cap on the size of the HTML and a
   fallback for what times out, fails or is refused. Whatever the body is,
   the parser then runs on no page's main thread.
2. **Replacement of the guard** (`lib/markdown/pathology.ts`) by a prefilter
   that is independent of block structure (the external review's constraint:
   the verdict depends on character counts and per-line prefixes only). Such
   a prefilter spares the common hostile bodies a timeout; it is not the
   line of defence.

Why: the pre-parse guard of FP1 is a heuristic prefilter, not a security
boundary (see "Known gaps" below). Four rounds of review and an external
review each found bodies that pass it and still take the pipeline seconds, or
make it produce megabytes of HTML.

Scope of this gate: `renderMarkdown`, which no page calls today. The editor
preview planned for FP8 and FP9 is to run the same parser inside the page by
another entry point (bytemd's own preview), and the plan's answer for it,
suspending the preview for rejected content, rests on the guard as well.
What that path is to get is part of the revision of the plan, which waits for
the owner.

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
| FP1 | `bytemd/fp-01-render-core` | Rendering core skeleton, dependencies, heuristic prefilter (not a security boundary; see "Hard gate" and "Known gaps") | [#4075](https://github.com/steemit/condenser/pull/4075) | in review |
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

The guard is a heuristic prefilter, not a security boundary. It refuses, in
bounded time, the shapes it recognises; a body that breaks none of the limits
below is not thereby fast or small (see "Known gaps").

Calibration: the budgets are calibrated one dimension at a time, each so that
a body at its limit renders in about 250 ms at most. A long post near the limit
of several budgets at once is slower (measured cold on the development machine:
up to about 0.9 s).
Refused input is reported in under 150 ms; the test suite asserts this for
every refused shape (best of three runs).

What the calibration does not cover: it was done with plain shapes. The same
count in a nested shape is several times slower (`a* ` x 3072 takes 0.2 s to
0.3 s, `*a ` x 1536 followed by `a* ` x 1536 2.1 s to 2.4 s), so 250 ms is
what the body a limit was set with takes, not a bound on every body at that
limit.

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
| `budget` | `MAX_RAW_MARKUP_TAGS_TOTAL` (tags in HTML blocks and raw-HTML posts, whole body) | 4,096 |
| `budget` | `html-nesting-uncertain` (nesting over `MAX_HTML_NESTING_DEPTH` only if possibly inert text is markup) | 256 |

Consequence: long or richly formatted posts that exceed a body-level budget
(for example about 300 paragraphs with inline markup, 40 KiB) are refused by
the guard and will render through the legacy pipeline once the reader switch
lands (FP5). They are legitimate content; this is the intended fallback, not
a defect. The fallback is a fallback for content, not a protection against
pathological input: the legacy pipeline has slow and oversized input of its
own (see "Known gaps").

## Known gaps (2026-11-25)

The pre-parse guard is a heuristic prefilter, not a security boundary. Every
body below passes it today, and the pipeline takes seconds on it or makes a
great deal of HTML from it. Each has an `it.fails` case in
`__tests__/lib/markdown/known-gaps.test.ts` (all but the last row), so the gap
is visible to the test run: the day the guard refuses the body, that case is
reported as failing, and its `.fails` is removed. The same file holds, as
ordinary cases, the bodies of the reviews that the guard refuses today.

Times are single renders of the new pipeline on the development machine, from
the external review (pure ESM) where it has the body, otherwise from that
review's harness or from vitest (both under a load average of about 7.5).
They are order-of-magnitude references.

| Family | Body | New pipeline | HTML |
|---|---|---|---|
| A paragraph hidden behind a block that the parser has closed (round 4; ten bodies) | indented code, an empty list item and `<b>` on three lines, then `a* ` x 16383 | 7 s to 12 s | 49 KB |
| The same, list items ended by bare carriage returns | `- a` + CR + CR, x 8000 | 7.6 s | 160 KB |
| Whitespace, which no rule counts | `a` + 65000 tabs + `b` | 0.27 s | 65 KB |
| Markers nested under the token cap | `*a ` x 512 + `a* ` x 512 (1024 markers, a third of the cap) | 0.48 s | 6.7 KB |
| | `*a ` x 768 + `a* ` x 768 | 0.61 s | 10 KB |
| | `~~a ` x 768 + `a~~ ` x 768 | 0.57 s | 12 KB |
| | 30 runs of 64 asterisks, open and close (60 markers that count) | 0.80 s | 16 KB |
| Containers under their line budgets | (`>` x 64 + `a`), 990 lines | 0.73 s | 7.7 KB |
| | (`>` x 64 + `a` + a blank line), x 480 | 1.8 s | 834 KB |
| | (`>` x 16 + `a` + a blank line), x 990 | 1.4 s | 437 KB |
| | 128 indented lists, then 1800 lazy lines | 0.72 s | 14 KB |
| Output amplification, which no rule looks at | a reference definition with a destination of 50 KB, cited 1500 times | 3.6 s | 75 MB |
| | the same with a destination of 5 KB | 0.63 s | 7.5 MB |
| | `<div><p>`, 12 formatting tags x 8 with attributes, `<p>x` x 2700 | 1.7 s | 1.66 MB |
| | the same with `<p>x` x 700 | 0.61 s | 431 KB |
| A gap in precision only (listed here, not tested) | `> ` + `a* ` x 1024, a setext line, `a* ` x 1024: the guard splits the paragraph in two | 0.14 s to 0.27 s | 6 KB |

Three facts go with the list:

- **The guard is not a security boundary.** A CPU profile of the external
  review shows at least nine super-linear hot spots, in seven packages:
  micromark's `splice`, `subcontent`, `resolveAllAttention`,
  `tokenizeLabelEnd` and `resolveAllLabelEnd`; the strikethrough resolver and
  the table's `addImpl`; `prepareList` of mdast-util-from-markdown; parse5's
  position mixin and `hasInButtonScope`; besides several recursions. An
  input-side static check cannot vouch for the running time of third-party
  parsers. Whether a body passes the guard says nothing about how long it
  takes.
- **The legacy pipeline is not a safe fallback either.** It has input that
  takes it 1.2 s to 2.6 s (a table of 700 columns: 2.6 s; 800 lines of 32
  list markers: 1.4 s) and input that makes it produce 75 MB of HTML, the
  reference expansion above, in 1.6 s. The last of these exists in production
  today, where the legacy pipeline renders every body. A fallback path needs
  a timeout of its own.
- **Rejecting the `structure` class on the submit side (FP4) has no security
  value.** An attacker does not post through this site. It is a convenience
  for the author, and nothing more.

## Measurement caveat (2026-11-25)

A measurement script run by tsx (`node --import tsx`, a `.mts` file) that
imports a `.ts` file of this repository loads the markdown stack as CommonJS:
`bytemd/dist/index.js` and `@bytemd/plugin-breaks/dist/index.js` turn up in
`require.cache`. That is not the build vitest and production take, which
resolve to the ESM build, and on some input it is far slower: `a`, 60000
spaces and `b` took 9.6 s on the CommonJS build, and 52 ms to 97 ms in vitest
on the same machine in the same hour.

So calibrate and decide in vitest, or with a script bundled to pure ESM. A
timing or a verdict taken from a tsx script is not evidence. Every timing in
this file and in the comments of `lib/markdown/` is an order-of-magnitude
reference from the development machine, under whatever load it was at the
time.

## Open items

- **Hard gate before FP5** (see the top of this file): isolated rendering and
  the replacement of the guard by a structure-independent prefilter. The
  direction waits for the owner's confirmation; the plan is revised in full
  after that (see the status update of 2026-11-25 in section 3.3 of the
  plan).
- Manual confirmation after FP9: IME (Chinese input) behaviour in the comment
  editor. bytemd 1.22.0 is built on CodeMirror 5; this cannot be automated.
- Accepted review findings:
  - FP1 (engineering review): `lib/markdown/pathology.ts` is about 3300 lines
    in one file. Splitting it is deferred to a standalone refactoring PR; it
    does not block the later feature points, which only call `findPathology`.
- The guard reads the block structure of a body (which lines are a
  paragraph, an HTML block, fenced code, a table row) with a model of its
  own. Three reviews in a row found a paragraph hidden behind a block the
  parser had closed, so the model is now checked against the markdown
  parser itself: `__tests__/lib/markdown/block-parity.test.ts` builds 816
  bodies from lists of containers, block openers and separators, and asks
  the parser where a line of inline markers lies. The full product of those
  lists is 4080 bodies, five seconds or more in the suite, so the suite
  checks a covering part of it: every container with every opener, each
  pair meeting each kind of separator once (nothing but the line ending, a
  blank line, a line with a quote marker alone). A fourth round and the
  external review found further such bodies outside that table. The suite
  shows that the model agrees with the parser on the bodies it builds, and
  nothing more.
- The false refusals of the guard are listed under "Known limitations" in the
  header of `lib/markdown/pathology.ts`, and what it lets through under
  "Known gaps" there and in the section above. One false refusal is a cost
  the reader side still pays: a flood of hostile markers that the guard
  classes as `budget` (`x<?` x 32768, `x<!--` x 16384 and the like) is not
  rendered by this pipeline, and goes to the legacy pipeline, which needs
  about 0.6 s to 2 s for those two shapes on a 64 KiB post (measured in the
  third review). That is what they cost today; the fallback does not make it
  worse, and it does not make it better either.
