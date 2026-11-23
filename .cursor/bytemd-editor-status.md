# bytemd Editor Integration - Status

> Integration branch: `next-bytemd` (created from `next` @ `b7928961`).
> Scope, target architecture and feature-point definitions live in
> `.cursor/bytemd-editor.plan.md`. This file is updated as part of each
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
| 0 | `bytemd/fp-00-bootstrap` | Baseline + plan and status docs | | in progress |
| FP1 | `bytemd/fp-01-render-core` | Rendering core skeleton, deps, pathology guard | - | pending |
| FP2 | `bytemd/fp-02-harden-schema` | Hardening + security baseline (11 sections / 69 cases) | - | pending |
| FP3 | `bytemd/fp-03-legacy-semantics` | Steemit semantics (linkify, embeds, collectors) | - | pending |
| FP4 | `bytemd/fp-04-analyze-submit` | Submit-side validation + `json_metadata` migration | - | pending |
| FP5 | `bytemd/fp-05-reader-switch` | Reader switch, rollback flag, light theme, parity guards | - | pending |
| FP6 | `bytemd/fp-06-body-dark` | Dark theme for post bodies | - | pending |
| FP7 | `bytemd/fp-07-youtube-lite` | YouTube click-to-load preview | - | pending |
| FP8 | `bytemd/fp-08-story-editor` | Story editor | - | pending |
| FP9 | `bytemd/fp-09-comment-editor` | Comment editor (lazy mount, preview off by default) | - | pending |
| FP10 | `bytemd/fp-10-editor-dark` | Dark theme for the editor chrome | - | pending |
| FP11 | `bytemd/fp-11-docs-wrapup` | Docs, dead-code cleanup, final regression | - | pending |

## Measurements

| Item | Value |
|---|---|
| Pathological input timings on the current (legacy) pipeline (plan review, 2026-11-24) | `<b>` x 21800 (64KiB): 170 ms; `> ` x 32768: 5 ms; 50k-deep `<div>`: 180 ms |
| Pathological input timings on the bytemd pipeline without a guard (plan review) | 22.1 s / 6.9 s / ~28 s (throws `RangeError`) |
| Turbopack smoke for bytemd (FP1) | pending |
| Reader render chunk size under Turbopack (FP5) | pending |

## Open items

- Manual confirmation after FP9: IME (Chinese input) behaviour in the comment
  editor. bytemd 1.22.0 is built on CodeMirror 5; this cannot be automated.
- Accepted P2 review findings: none yet.
