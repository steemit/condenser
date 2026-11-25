# Condenser next-bytemd Development Plan (bytemd Editor Integration)

- Date: 2026-11-24 (revised the same day: incorporates plan review feedback; feature points promoted to PRs; rewritten in English and moved from `.cursor/` to `docs/`)
- Related: baseline `next` branch @ `b7928961`; integration branch `next-bytemd`
- Status: **abandoned on 2026-11-26**, before any page used it. The reasons are in `docs/BYTEMD_INTEGRATION_STATUS.md` ("Abandoned"). This document is kept as the record of what was planned, and is not to be executed.
- Note: this document defines the engineering scope, the target architecture and the feature point (FP) breakdown; the implementation process of each feature point is recorded in the corresponding PR.

## 0. Conclusions first

1. **All requirements can be met, but the premise of "the editor preview matching the published page" is switching the reader-side rendering core to bytemd as well** (measured rendering differences between the two pipelines, markdown-it and remark). Scope of this round = reader-side rendering core migration + story/comment editor replacement: in total 11 reviewed feature points (FP1–FP11) + 1 step 0 (baseline and docs), which takes no FP number.
2. **The mechanism that implements the 1:1 contract is "both sides share the same configuration"**: `lib/markdown/config.ts` is the single configuration source; the editor uses bytemd's built-in preview (not `overridePreview`), and the reader side renders with the same configuration through the same `getProcessor`; rendering parity tests and ESLint import restrictions prevent drift (§3.1).
3. **"Comment editor: preview off by default" needs zero customization; "story editor: preview on by default" requires the wrapper to compute the split threshold itself**. bytemd's `mode="tab"` starts on the Write tab by default; but the center column of the submit page is only 688/774px wide at 1280/1366 viewports, below the 800px threshold of bytemd's `auto` mode, so with the defaults the story editor has **no preview** on mainstream laptops — therefore `MarkdownEditor` decides between `split` and `tab` itself from the container width (threshold 600px, §9-C5).
4. **Existing-content compatibility involves a set of Steemit semantics that must be ported** (#tag/@mention, video embed recognition and whitelist, image proxying, link hardening and phishing interception, raw-HTML posts, `center`/`pull-right`, etc.), spread across FP1–FP3; the security baseline is rebuilt section by section from legacy's 11 sections and 69 cases (§4-FP2).
5. **The technical review measured a security regression that must be resolved in FP1**: the new pipeline is not linear on pathological input (64KiB of `<b>`×21800: legacy 0.17 s, new pipeline 22.1 s; `> `×32768: 6.9 s; 50k levels of nesting: about 28 s), and post page bodies are rendered in the visitor's browser. Mitigation = a linear pre-parse guard + submit-side rejection (§3.3, FP1, FP4).
6. **Structural adjustments relative to the initial version**: the FP order becomes "reader light theme → body dark theme → YouTube → story editor → comment editor → editor dark theme" (the initial version put the dark theme work before the editors, which made acceptance impossible); the reader side now renders on its own through `renderMarkdown()` (the shipped path is the tested path); the rollback flag is passed through context; each FP is promoted to a remote PR.
7. **Content rejected by the guard falls back to the legacy pipeline instead of being rendered as blank**. The FP1 security review used a CPU profile to confirm that the parser is quadratic in the **number of lines** — without any disguise, a plain list of `- a` repeated 13010 times already takes 14.3 s, and 30k short lines take 5.7 s — so legitimate long posts also exceed the budget. Mitigation: the guard is split into the `structure` class (malicious structure) and the `budget` class (legitimate long posts over budget); the reader side falls back to the existing pipeline for both classes; the submit side rejects only the `structure` class; the editor suspends the preview for rejected content. The cost is that the 1:1 contract does not apply to this kind of content, and the existing pipeline is retained long term as the fallback renderer after this round (§9-C15).

## 1. Goals and non-goals

### 1.1 Requirement breakdown

| # | Requirement | How it is delivered | Corresponding FP |
|---|---|---|---|
| R1 | The edit box for composing a new post is replaced with bytemd | `MarkdownEditor` replaces the body textarea of `PostEditor`; the surrounding form is untouched | FP8 |
| R2 | The edit box for composing a comment is replaced with bytemd | The same component; shared by comment replies and comment editing | FP9 |
| R3 | The comment editor does not turn on the preview by default | `mode="tab"` (Write tab by default) | FP9 |
| R4 | The story editor turns on the preview by default | The wrapper picks `split` (≥600px) by container width, otherwise `tab` | FP8 |
| R5 | Preview result = rendering of the page after the post is published | Reader-side core switched to bytemd + single configuration source + parity guard | FP1–FP7 |
| R6 | Each feature point: an independent branch and PR (base `next-bytemd`), squash-merged after three-way review (spec and correctness / security / engineering consistency) and the gates | See the individual PRs and the status file | All |

### 1.2 Non-goals (not in this round; listed for later)

- math / highlight / mermaid plugins, medium-zoom
- Custom syntax extensions (e.g. `:::player`; feasibility to be verified separately)
- Migration of `lib/extract-content.ts` (first image / summary text for summary cards) — the legacy module continues to be used
- Removal of the legacy rendering pipeline (`lib/html-ready.ts`, the sanitize-html part of `lib/sanitize-config.ts`, the `markdown-it` dependency) — retained: it is both the rollback path and the fallback renderer for content the guard refuses (§3.3); removing it is not planned
- Merging `next-bytemd` into `next`/`master`

## 2. Corrections to the preliminary investigation and the initial version of the plan (verified 2026-11-24)

| # | Original claim | Verification result | Impact on the plan |
|---|---|---|---|
| S1 | The investigation did not cover the effect of the GFM tagfilter on inline `<iframe>` | **Not a problem**: the tagfilter of `micromark-extension-gfm@2.0.3` exists only in the "direct HTML output" extension and is not enabled in the remark pipeline; the inline iframe is fully preserved once the schema allows it | No need to work around it |
| S2 | The investigation did not cover GFM dialect differences | stock gfm: a single tilde `~5~` gets strikethrough; `www.x.com` and `me@steemit.com` are linked automatically (by the autolink transform inside the `mdast-util-gfm` aggregate). legacy (markdown-it `linkify:false` + `linksAny`, which only handles `https?://`) does neither | A custom GFM combination aligned with legacy (§3.4-B) |
| S3 | Initial version: the class whitelist policy had to be applied after sanitize | bytemd first pushes `className` into `attributes['*']` and **then** calls the `sanitize` callback (`bytemd/dist/index.mjs` L2526–2529); the wildcard permission can be removed inside the schema, and a **single** `['className', …]` definition used to filter class by class (with several parallel definitions, only the last one takes effect) | The class policy lives in the schema |
| S4 | Investigation: in-house rehype plugins run after sanitize | Confirmed. The `link` nodes generated in the remark phase and the custom nodes carrying `data.hName` pass through sanitize normally; the target/rel/title/class added to `a` in the rehype phase are not stripped | Linkification and embeds go in the remark phase; hardening goes in the rehype phase |
| S5 | Investigation: raw HTML posts need a special case in the component layer | A remark plugin placed first can replicate it: when `^<html>…</html>$` (shell stripped) or `^<p>…` matches, the tree is replaced with a single html node and no markdown parsing is done | As a shared plugin, the preview and the reader side take the same path |
| S6 | The investigation did not state which tab is the default | When not in split mode, the preview is shown only if `activeTab === "preview"`; otherwise the Write tab is shown; the initial `activeTab` is undefined → Write tab by default (L3469–3489) | R3 needs zero customization |
| S7 | The investigation only mentioned the version constraint of remark-directive | bytemd 1.22.0 = the unified 10 family; `mdast-util-gfm-*` must be **1.x**, and the three mdast extensions are registered in **object** form (not as factory functions); when 2.x is installed, table parsing throws `Cannot set properties of undefined (setting 'inTable')` | FP1 adds a version family guard test |
| S8 | Investigation: bytemd has no CSS variables | Confirmed (`.bytemd` and the like are all hard-coded light colors; no runtime `<style>` injection; the preview area rule is `.bytemd-preview .markdown-body{max-width:800px;margin:0 auto;padding:16px 4%}`) | The editor dark theme requires hand-written overrides (FP10) |
| S9 | The investigation's bundle size experiments were kept in a temporary directory | Partially deleted by the system's temporary file cleanup; not reproducible | During development, verification relies exclusively on tests and scripts checked into the repository; FP5 records the actual Turbopack output size |
| S10 | Investigation: for the React Viewer, only viewerEffect was mentioned | A pure React wrapper (`useMemo` calls `getProcessor(...).processSync(value)`; `try/catch` falls back to an empty string on failure), root node `div.markdown-body`, named exports `Editor`/`Viewer` | The reader side does not depend on it: it renders on its own through `renderMarkdown()` instead |
| S11 | The initial version did not cover the full picture of the legacy security tests | `__tests__/lib/sanitize-pipeline.test.ts` has 11 sections and 69 cases in total; the phishing check among them has a known legacy defect (`steemit.com.evil.com` is treated as an internal link by prefix matching; tests 6.3 and 6.4 pin the current behavior) | FP2 migrates them one by one; phishing and internal-link checks switch to exact host matching (§3.4-A D6) |
| S12 | The initial version did not describe the behavior when the processor throws | The React Viewer renders an empty string when it throws; **the Svelte Viewer (the editor preview) shows the literal `undefined` the first time it throws and keeps the old content afterwards** (`bytemd/dist/index.mjs` L2638–2644) | On the reader side, `renderMarkdown` has its own try/catch; on the preview side, the pre-parse guard prevents the throw |
| S13 | The initial version did not consider the output shape of the bytemd preview | The Svelte Viewer appends a render count comment `<!--N-->` at the end of the HTML (L2646–2649) | The definition of the 1:1 contract and its assertions must strip this comment (§3.1) |
| S14 | Initial version: a "variable block" could be extracted from github-markdown-css for the dark theme | The light and dark files of `github-markdown-css@5.9.0` contain **no custom properties at all**; the colors are literals inside the rules | The dark theme changes to "prefix all selectors of the dark file with `.dark ` and check it in" (FP6) |
| S15 | Initial version: the global attribute list of sanitize was not handled | The `'*'` of the hast-util-sanitize default schema contains about 70 global attributes (`id`, `name`, `rel`, `target`, `title`, `type`, `value`, …); without narrowing it down, authors can put `rel="opener"` on links, and `href="/\evil.com"` is treated as an internal link | The schema narrows `'*'` down to the site whitelist; link attributes are rebuilt from scratch by `harden` (FP1, FP2) |
| S16 | Investigation and initial version: comments and deep nesting are "parsed linearly, no mitigation needed" | **Does not hold**: see the measured timings in §0-5; the exception occurs as early as the rehype-raw or micromark parse stage, before any plugin | Linear pre-parse guard (FP1) + submit-side rejection (FP4) |
| S17 | The investigation and the initial version say "CodeMirror 6" in several places | bytemd 1.22.0 uses **CodeMirror 5** (`codemirror-ssr@0.65.0`); the Tab key is captured by the editor as indentation (L3242–3245), so keyboard users cannot leave the editor with Tab | FP8 handles the Tab key; the manual IME acceptance check in FP9 is given more weight |
| S18 | Initial version: bytemd `mode="auto"` can satisfy "preview on by default for the story editor" | Submit page center column width = min(viewport − 560, 896) − 32: viewport 1280 → 688px, 1366 → 774px, both below bytemd's 800px threshold for `auto` → no preview by default | The wrapper computes the threshold itself (FP8, §9-C5) |
| S19 | The initial version assumed step 0 starts from scratch | The branch, worktree, installation, baseline and remote branch of step 0 were completed during the technical review | Step 0 is rewritten as "current state + remaining items" |
| S20 | Initial version: returning an empty string once the guard intercepts is enough | The FP1 security review used a CPU profile to confirm that the micromark used by bytemd is quadratic in the **number of lines**: without any disguise, a plain list of `- a` repeated 13010 times takes 14.3 s, `> a` repeated 16383 times takes 11.1 s, and 30k short lines take 5.7 s; legitimate content such as long logs and lyrics also exceeds the budget | The guard is split into two classes (§3.3); the reader side falls back to the legacy pipeline for both; the submit side rejects only the `structure` class; the editor suspends the preview for rejected content |
| S21 | It was not found that bytemd's CJS and ESM builds behave differently | `import` points to `dist/index.mjs` (dependencies externalized, taking the packages from the store), while `require` points to the self-contained `dist/index.js`. For inputs such as `<svg><template>`, the ESM path (vitest and production) throws, which leaves the whole post empty; the CJS path (tsx scripts) works | FP1 patches it with pnpm `patchedDependencies` and adds test cases; **benchmark and comparison scripts must be ESM** (`.mts`), otherwise what gets measured is not the production parsing stack |
| S22 | Initial version: the guard is "single-pass linear" and has three classes of checks | The FP1 security review found that several of the guard's own searches cross unit boundaries and scan to the end of the document (`x<?`×32768: the guard alone takes 5.3 s, 42 s overall); heading lines are not checked at all (prefixing pathological content with `# ` bypasses the guard, 35 s); in addition, it found a wrongly written `~` closing rule, no upper limit on floods consisting only of opening brackets, and closing tags hidden inside inline code spans | The FP1 fix round corrects each item and adds regression cases |

## 3. Overall architecture (target state)

### 3.1 Definition, mechanism and guard of the "1:1 contract"

**Definition**: for any given markdown text M, under the parameters below, the innerHTML of the editor preview pane's `.markdown-body`, **after the trailing render count comment `<!--N-->` has been stripped**, is **byte-for-byte identical** to the `.markdown-body` HTML output by `MarkdownViewer` on the published page, and both sides apply the same `.markdown-body` stylesheet.

Parameter conventions (constants on the preview side; on the reader side, decided by the call site):

| Scenario | Preview-side parameters | Actual reader-side parameters | Parity |
|---|---|---|---|
| Story (`PostFull` passes `large`, `highQualityPost = payout > 10.0`, `noImage = stats.gray`) | `STORY_PLUGINS = createSitePlugins({ large: true, highQualityPost: false })` | A new post has payout 0 → `highQualityPost=false` | Byte-for-byte identical |
| Comment (`Comment.tsx` passes no options; the defaults `large=false` and `highQualityPost=true` apply) | `COMMENT_PLUGINS = createSitePlugins({ large: false, highQualityPost: true })` | Same as on the left | Byte-for-byte identical |

**Permitted differences** (all of them read-time context, not content):

- (1) When a post's payout > 10.0, external links have no `nofollow` in `rel` (invisible);
- (2) `noImage` on low-scoring posts, and `hideImages`/`isProxifyImages` (no call site in the current repository passes the latter two; they are retained capabilities);
- (3) The trailing `<!--N-->` count comment on the preview side (stripped in the definition);
- (4) Content rejected by the guard (the `structure` class or the `budget` class, §3.3) — the reader side falls back to the legacy pipeline for rendering.

**Mechanism** (by sharing the same source rather than by aligning two implementations):

- Single configuration source `lib/markdown/config.ts`: exports `createSitePlugins(options)`, `siteSanitize(schema)`, `STORY_PLUGINS`, `COMMENT_PLUGINS`;
- Editor: `<Editor plugins={…PLUGINS} sanitize={siteSanitize} …>`, using bytemd's **built-in preview** (the Editor internally instantiates bytemd's Svelte Viewer and passes it the same plugins/sanitize; `index.mjs` L2677–2696);
- Reader side: `MarkdownViewer` calls `renderMarkdown(text, options)` — internally the exact same `getProcessor({ plugins, sanitize }).processSync(body)` as the Viewer — which produces the HTML and meta information and dispatches `viewerEffect` the same way as the `@bytemd/react` Viewer. Reasons for choosing it over using `<Viewer>` directly: the shipped path is the tested path (the security baseline is tested entirely against `renderMarkdown`), a single render yields `isHtml`/`noImageActive`, and it can host the pre-parse guard and the exception fallback.

**Guard** (implemented in FP5):

1. Rendering parity test `__tests__/lib/markdown/parity.test.ts`: for a fixed corpus, render with bytemd's Svelte `Viewer` (the component used by the Editor preview) and with `MarkdownViewer`, strip `<!--N-->`, and assert that the innerHTML values are equal; the corpus must cover: headings / paragraphs / lists / tables / code blocks, task lists, strikethrough, `#tag`/`@mention`, bare URLs, images, raw HTML (`center`, `pull-right`, inline iframes), the five video embed providers, raw-HTML posts, phishing links, external and internal links;
2. ESLint: `no-restricted-imports` allows `bytemd`, `@bytemd/*`, `remark-*`, `rehype-*`, `mdast-util-*`, `micromark-extension-*` and `hast-util-*` to be imported only in `lib/markdown/**`, `components/elements/MarkdownViewer.tsx`, `components/elements/MarkdownEditor.tsx`, `__tests__/lib/markdown/**` and `scripts/compare-markdown-engines.ts`; `no-restricted-syntax` forbids the JSX prop `overridePreview`;
3. Stable configuration object references: plugins/sanitize/locale must be module-level constants or come from `useMemo` (bytemd re-runs the effect and rebuilds the processor when the plugins reference changes).

### 3.2 Module layout

```
lib/markdown/                      # New: the only directory allowed to touch the bytemd / unified ecosystem
  config.ts        createSitePlugins(options) / siteSanitize / STORY_PLUGINS / COMMENT_PLUGINS
  schema.ts        siteSanitize: github default schema + site narrowing and extensions; exports the schema snapshot anchor
  gfm.ts           remarkSiteGfm: strikethrough(singleTilde:false) + table + task-list; no autolink, no footnote
  gfm-actions.ts   Toolbar buttons (strikethrough / task list / table), ported from @bytemd/plugin-gfm (MIT; copyright notice kept in the file header) — FP8
  raw-html-post.ts remarkRawHtmlPost: raw-HTML post detection (same regexes as legacy)
  pathology.ts     findPathology(body) → { class: 'structure' | 'budget', reason } | null; linear pre-parse guard
  linkify.ts       remark phase: #tag / @mention / bare URL / bare image URL / bare video URL → link and embed nodes; with a collector
  harden.ts        rehype phase (after sanitize): link attribute rebuild, phishing interception, image handling, iframe whitelist, 3Speak image-text combination, td.style filtering, script trap
  embed.ts         YouTube lite preview placeholder + viewerEffect — FP7
  render.ts        renderMarkdown(body, options) → { html, isHtml, noImageActive, file, refused }
  analyze.ts       analyzePost(body) → { disallowedTags, hashtags, usertags, images, links, pathological } — FP4
  engine.ts        MarkdownEngine context: 'bytemd' | 'legacy' — FP5
  locales.ts       condenser locale → bytemd locale lazy loading — FP8
components/elements/
  MarkdownViewer.tsx        Reader side (keeps the existing props and the signatures of the 4 call sites)
  MarkdownViewerLegacy.tsx  The current MarkdownViewer implementation moved over as is (rollback path) — FP5
  MarkdownEditor.tsx        bytemd Editor wrapper (the only module importing @bytemd/react) — FP8
__tests__/lib/markdown/      One-to-one with the modules above
scripts/compare-markdown-engines.ts   Corpus comparison of the legacy pipeline vs the new pipeline — FP5
scripts/build-markdown-theme.mjs      Generates the body dark theme styles with the `.dark ` prefix — FP6
```

Dependency ownership: FP1 adds `bytemd@1.22.0`, `@bytemd/plugin-breaks@1.22.0`, `mdast-util-gfm-{strikethrough,table,task-list-item}@^1`, `micromark-extension-gfm-{strikethrough,table,task-list-item}@^1`, `hast-util-raw`, `hast-util-sanitize` (the same version bytemd uses) and the required `@types/*`; FP5 adds `github-markdown-css@5.9.0` (exact); FP8 adds `@bytemd/react@1.22.0`. `lib/html-ready.ts`, `lib/sanitize-config.ts`, `lib/media/links.ts`, `lib/media/proxify-url.ts` and `lib/phishing.ts` stay as they are: the first two serve the rollback path and `extract-content`; the last three (regexes, image proxy, phishing check) are **reused directly** by the new pipeline, not copied.

Version family table (consult it when adding any unified-ecosystem package; pinned by FP1's guard test):

| Package | Family | Notes |
|---|---|---|
| `unified` | 10.x | Required by bytemd 1.22.0 |
| `remark-parse` / `remark-rehype` / `rehype-raw` / `rehype-sanitize` / `rehype-stringify` | 10 / 10 / 6 / 5 / 9 | Direct dependencies of bytemd |
| `mdast-util-from-markdown` | 1.x | Required by remark-parse |
| `mdast-util-gfm-*`, `micromark-extension-gfm-*` | 1.x | Direct dependencies of this plan (2.x belongs to the unified 11 family and cannot be used) |
| `hast-util-sanitize`, `hast-util-raw` | 4.x / 7.x | Consistent with the dependencies of rehype-sanitize / rehype-raw |

### 3.3 Pipeline stages and legacy semantics mapping

The new pipeline = the fixed order of bytemd's `getProcessor` (`bytemd/dist/index.mjs` L2514–2537): **remark plugins → remark-rehype(allowDangerousHtml) → rehype-raw → rehype-sanitize(schema) → the plugins' rehype hooks → stringify**. `renderMarkdown` adds one layer before and after it: an `isPathological` guard before, and nothing after (the script trap is already handled by a structural check at the end of the pipeline); the whole thing is wrapped in try/catch, and any exception → empty string + `console.error`.

| Stage | Legacy implementation | New implementation | Position |
|---|---|---|---|
| Pathological input protection | None (relies on the catch fallback at `html-ready.ts:135-145`, which can take seconds) | `pathology.ts`: a linear scan of the source text; when a limit is exceeded, `renderMarkdown` returns an empty string and sets `refused`, and the reader side falls back to the legacy pipeline on that basis | Before parsing |
| Raw-HTML post detection and shell removal | `MarkdownViewer.tsx:71-77`, `PostEditor.tsx:284-290` | `raw-html-post.ts` (the same pair of regexes) | remark, first |
| HTML comments | `MarkdownViewer.tsx:80` replaces them over the whole text with readable text before rendering | Complete comments are dropped by sanitize; unclosed comments are shown as escaped text | sanitize |
| markdown dialect | markdown-it (html, breaks) `MarkdownViewer.tsx:29-35` | remark-parse + `@bytemd/plugin-breaks` + `gfm.ts` | remark |
| #tag / @mention / bare URL / bare image linkification | `html-ready.ts:297-384` | `linkify.ts` (skipped when the parent is link/inlineCode/code) | remark (output goes through sanitize) |
| Video embed recognition | `html-ready.ts:400-640` | `linkify.ts` → `div.videoWrapper > iframe` (from FP7 on, YouTube is a lite placeholder) | remark |
| 3Speak dApp image-text combination | `html-ready.ts:148-152, 473-508` | `harden.ts`: recognizes the `a[href*=3speak.online/watch?v=] > img` structure (in mdast this combination may be split into several nodes, so it must be matched on hast) | rehype |
| Link attribute rebuild and phishing interception | `html-ready.ts:170-195`, `sanitize-config.ts:246-274` | `harden.ts`: discards all author-provided link attributes, then rebuilds them per policy; exact host matching | rehype |
| Wrapping iframes in videoWrapper | `html-ready.ts:198-218` | `harden.ts` | rehype |
| Image https normalization, clickable link wrapping, proxying, srcset | `html-ready.ts:220-272`, `sanitize-config.ts:202-216` | `harden.ts` | rehype |
| Tag / attribute / protocol whitelist | `sanitize-config.ts:102-177` | `schema.ts` (rehype-sanitize; `'*'` narrowing, className narrowing, protocols aligned with legacy) | sanitize |
| iframe whitelist and normalization, placeholder for disallowed embeds | `sanitize-config.ts:37-77, 179-201` | `harden.ts` (reuses `iframeWhitelist`) | rehype |
| div class whitelist | `sanitize-config.ts:217-238` | `schema.ts` (a single `['className', …]` definition) | sanitize |
| td style | `sanitize-config.ts:239-245` | `harden.ts` (keeps only `text-align:right`) | rehype |
| `<script>` secondary trap | `MarkdownViewer.tsx:105-108` (regex over the output string) | `harden.ts` end-of-pipeline structural check (a script element present → the whole output is emptied and console.error is called) | rehype, last |
| Exception fallback | `html-ready.ts:135-145` | `render.ts` try/catch → empty string | Outer layer |
| `~~~ embed:` placeholder slicing → player | `MarkdownViewer.tsx:120-189` | No text placeholder; the YouTube lite preview is mounted by the viewerEffect in `embed.ts` | FP7 |

The checks of `findPathology` fall into two classes; the thresholds are finalized in FP1 through benchmarks and pinned as constants; measurements must be taken on the ESM path (S21).

- **`structure` class** (`structure`; never produced by legitimately written content): the number of `>` quote markers on a single line, the number of container markers on a single line (quotes + list markers), the number of leading indent columns, HTML nesting depth (a linear estimate from a stack scan following the browsers' implicit closing rules, so as to avoid false positives on the many normal HTML posts with unclosed `<p>`/`<li>`), the length of a single emphasis marker run, the parsing work within a paragraph (closable emphasis runs + `]`) × number of tokens, the number of cells in a single table, and the total number of special tokens in an inline unit (`[`, `_`, `<`, backtick, `&`, `\`, etc.). Heading lines, list item lines and paragraph lines are checked alike; markup inside inline code spans and inside link destinations/titles is not counted.
- **`budget` class** (`budget`, which legitimate long posts may exceed): total number of lines, number of list items, number of quote lines, number of lines in a single paragraph. The goal: any content that passes the guard takes no more than about 250ms per render on the local machine.

When any single item exceeds its limit, `{ class, reason }` is returned. Downstream handling: the reader side (FP5) falls back to the legacy pipeline for both classes; the submit side (FP4) rejects only the `structure` class; the editor (FP8, FP9) suspends the preview for rejected content and degrades to plain-text editing.

### 3.4 Behavioral differences list

**A. Intentional differences relative to the current state (legacy)**

| # | Difference | Nature |
|---|---|---|
| D1 | HTML comments: change from "replaced with readable text, truncated to the end when unclosed" to "complete comments removed, unclosed comments shown as escaped text" | Simplification; security-equivalent (in both forms, the payload inside a comment does not take effect) |
| D2 | Strikethrough `~~x~~` renders normally (today `<s>` is stripped by sanitize) | Fix |
| D3 | Task list syntax added | Enhancement |
| D4 | The allowed tag set is widened per the github schema (span/details/summary/kbd/mark/small/ins/dl, etc.); `center` and `iframe` are kept; width/height/align/title on `<img>` take effect | Relaxation; the final list is defined by the tag and attribute snapshot checked in by FP2 |
| D5 | Filtering of div classes changes from "exact match on the whole value" to "per-class filtering" | Slightly looser, security-equivalent |
| D6 | Phishing and internal-link checks change to **exact host matching** (fixes the legacy defect where `steemit.com.evil.com` is treated as an internal link by prefix matching) | Security fix |
| D7 | Bare image URLs: legacy replaces the whole text node containing the URL with the image (the surrounding text is lost; with two bare image URLs in the same paragraph, the whole post renders empty); the new implementation replaces only the URL itself | Fix |
| D8 | Body typography changes from `.Markdown*` (globals.css:143-385) to `.markdown-body` from github-markdown-css | **Visual redesign** (the direct result of "aligning with the bytemd preview") |
| D9 | Pathological input (extremely deep nesting, extremely long quote chains) is simply not rendered | Protection; legacy "stalls for several seconds and then degrades to empty" |
| D10 | The `~~~ embed:` text placeholder no longer appears in the HTML | Internal implementation change |

**B. Trade-offs relative to stock bytemd (all made to align with legacy)**

| # | Trade-off |
|---|---|
| B1 | Autolink literals are not enabled (bare domains and email addresses stay plain text) |
| B2 | Single-tilde strikethrough is not enabled |
| B3 | Footnotes are not enabled |
| B4 | Only `http`/`https`/`steem`/`esteem` are accepted as link protocols (the default schema also allows mailto/xmpp/irc/ircs) |
| B5 | The global attribute list `'*'` is narrowed down to the site whitelist (about 70 entries by default) |

FP5's comparison script assigns each difference to an ID in the tables above; differences that cannot be classified must be adjudicated one by one before FP5 is merged.

### 3.5 Rollback flag `MARKDOWN_ENGINE`

- Values: `bytemd` (default) | `legacy`. The root layout (server side) reads `process.env.MARKDOWN_ENGINE` and passes it to the client through React context (`MarkdownEngineProvider`); `MarkdownViewer` reads it through `useMarkdownEngine()` — SSR and hydration naturally see the same value, and no `window` global is used.
- With `legacy`, `MarkdownViewerLegacy` is rendered (`next/dynamic` lazy-loads the current implementation; in a Client Component, `next/dynamic` still does SSR by default, so the legacy path does not lose server-side rendering).
- In rollback mode the reader side is legacy while the editor preview is still bytemd, so the two are inconsistent — a known cost of an emergency rollback, to be written into `docs/CONFIGURATION.md`.
- Lifecycle: retained. The legacy pipeline stays both as the rollback path and as the fallback renderer for content the guard refuses (§3.3, decision C15); removing it is not planned.

### 3.6 Styles

- `app/globals.css` remains the single stylesheet entry point: it `@import`s the github-markdown-css light file (FP5) and the generated dark file (FP6).
- The selectors of the site's supplementary rules for post bodies (`videoWrapper`, `youtube`/`play`, `phishy`, `pull-*`/`text-*`, the smaller comment font size) are **extended** to `:is(.Markdown, .markdown-body)` — they must not be moved directly onto `.markdown-body`, otherwise the rollback path would lose these styles.
- The outer container of the new path does not carry the `.Markdown` class (rules such as `.Markdown a` and `.Markdown img` have the same specificity as the `.markdown-body` selectors and would override each other); the outer element keeps `MarkdownViewer` (the hook for the low-score notice styles).
- On the reader side, the `.markdown-body` background is set to transparent so that it inherits the card background; the preview area and the post page share the same typography rules, and differences are allowed only in container width and comment font size.

## 4. Feature point breakdown

Common acceptance gate for all FPs: `pnpm lint` (0 errors, `BUDGET = 0` in `scripts/lint-budget.mjs`), `pnpm typecheck`, `pnpm test`, `pnpm test:proxy` and `pnpm build` all green, and the PR's CI all green (CI is triggered on every `pull_request` and runs typecheck / lint:ci / test / test:proxy / build).

### Step 0 (not a feature point) Baseline and docs — `bytemd/fp-00-bootstrap`

Create the integration branch `next-bytemd` (from `next` @ `b7928961`) and record the baseline on a clean checkout: lint 0 errors / 7 warnings; typecheck passes; 92 test files and 1171 cases all pass; test:proxy passes; build succeeds. This PR submits this plan together with `docs/BYTEMD_INTEGRATION_STATUS.md`. Documentation only; no three-way review.

### FP1 Rendering core skeleton and dependencies — `bytemd/fp-01-render-core`

- Goal: bytemd is brought into the repository, and the `lib/markdown/` skeleton, `renderMarkdown` and the pre-parse guard for pathological input are established; no page is connected (zero behavior change).
- Changes:
  - Dependencies (the ownership table in §3.2); keep `pnpm-lock.yaml` in sync; add to `allowBuilds` in `pnpm-workspace.yaml` only when a new package actually has a build script and actually needs to be allowed;
  - `lib/markdown/{gfm,raw-html-post,pathology,schema,config,render}.ts`;
  - Initial `schema.ts`: (a) `'*'` narrowed to an explicit site whitelist of global attributes (at minimum removing `id`, `name`, `target`, `rel`, `action`, `method`, `encType`, `htmlFor`, `useMap`, `isMap`, `prompt`); (b) the `className` wildcard permission removed, with a **single** definition for `div`: `['className', 'pull-right', 'pull-left', 'text-justify', 'text-rtl', 'text-center', 'text-right', 'videoWrapper', 'phishy']` (same as `sanitize-config.ts:219-228`); the task list `ul`/`li`/`input` rules follow the github schema; (c) `center` allowed; (d) `protocols` aligned with legacy (§3.4-B B4); **allowing iframe is left to FP2 and lands in the same batch as whitelist enforcement**;
  - `render.ts`: `renderMarkdown(body, options)` → `{ html, isHtml, noImageActive, file, refused }`; `isHtml` is determined with the same pair of regexes as legacy; `noImageActive` is whether the output contains `noImageText`; the guard call is inside the try, and non-string input also falls back instead of throwing;
  - `pathology.ts` + benchmark tests: the checks are split into the `structure` class and the `budget` class (§3.3); for every slow shape measured in the security review (`<b>`×21800, `> `×32768, 50k levels of `<div>`, the `# ` prefix variant, `x<?`×32768, `~a~`×16384, `[`×65536, `` `<b>`</b>` ``×7281, `- a\n\n`×13010, etc.), assert "rejected, returns an empty string with `refused` non-empty, and a single run takes < 150ms (minimum of 3 runs)"; for 64KiB of flat body text, assert that it renders normally and record the timing; the benchmark script must be ESM;
  - pnpm `patchedDependencies`: patch `hast-util-from-parse5@7.1.2` so that the ESM path handles `<svg><template>` the same way as the CJS build (S21), and pin it with test cases;
  - Differential tests of the nesting estimator checked in (fixed seed; `parse5@6.0.1` at an exact version as a devDependency).
  - `__tests__/lib/markdown/version-guard.test.ts`: asserts major versions per the version family table in §3.2 (resolving the packages through the real resolution paths of `remark-parse` and `rehype-sanitize`, to avoid false results under pnpm strict mode).
- Tests: dialect baseline (soft line breaks, tables, task lists, `~~x~~`, `~x~` without strikethrough, bare domains / email addresses / URLs kept as plain text, raw-HTML posts not parsed as markdown, complete comments removed with no marker text appearing, unclosed comments output as escaped text with no script tags, `<center>` kept, the div class whitelist, author-provided `id`/`name`/`target`/`rel` removed); schema snapshot (tags, attributes, protocols).
- Acceptance: common gate + all of the above tests green + **Turbopack smoke test** (temporarily add two references on the branch and run `pnpm build`: a `next/dynamic` client import inside `SubmitPostClient`, and one server-layer import; revert once it passes, and do not check it in; write the result to the status file).
- Review focus: the version family and the `fromMarkdownExtensions` registration form; whether the `'*'` narrowing leaves out any exploitable attribute; the linearity of the guard itself and bypasses; false positives of the guard on normal long content (wrongly rejected content loses rendering by the new pipeline); no page behavior change.

### FP2 Hardening and security baseline — `bytemd/fp-02-harden-schema`

- Goal: the new pipeline's XSS defenses and the legacy hardening semantics are in place; allowing iframes and enforcing the whitelist land in the same batch.
- Changes:
  - `schema.ts` finalized: iframe attributes (src/width/height/frameborder/allowfullscreen, etc.); `a` keeps only `href`/`title`; src/alt/width/height/align/title for `img`; align and colspan/rowspan for `td`/`th`; start for `ol`;
  - `harden.ts`:
    1. Links: **discard all author-provided attributes, then rebuild** (the same approach as the legacy a-transform, `sanitize-config.ts:246-274`). href normalization: an href counts as valid only if it starts with `#`, `/` (and not `/\`), or `http(s)://`, `steem://`, `esteem://`; otherwise `https://` is prepended; internal link / CDN image link / external link are always decided by **exact host matching** (§3.4-A D6); the phishing check reuses `looksPhishy` → replaced with `div.phishy` (`title` is a constant message); when `highQualityPost=false`, the `rel` of external links contains `nofollow`;
    2. Images: `noImage` → `noImageText` placeholder; non-http(s) src → `brokenimg.jpg`; `http://` → `//`; `srcset` added for the default size; wrapped in `<a href=proxifyImageUrl(src,'0x0/') target=_blank>` when the parent is not an `a`; `hideImages` → `pre.image-url-only`; `isProxifyImages` → only strips the legacy proxy shell; other non-local images go through `proxifyImageUrl(src, true)`;
    3. iframes: `iframeWhitelist` applied to each one (imported from `lib/sanitize-config.ts` to keep a single source); on a match, normalized to frameborder=0 + the allowfullscreen attribute + 640×360 / 480×270 depending on `large`; no match → `<div>(Unsupported …)</div>`; wrapped when there is no outer `div.videoWrapper`;
    4. `td.style` keeps only `text-align:right`;
    5. End-of-pipeline structural check: a script element present in the tree → clear the root and call `console.error`.
- Tests (security baseline rebuild): migrate the 11 sections of `__tests__/lib/sanitize-pipeline.test.ts` to `__tests__/lib/markdown/security-baseline.test.ts`, with `renderMarkdown` as the unit under test. Assertion principle: keep the original tests' behavioral assertions that "dangerous constructs do not take effect", and express them wherever possible through **parsed DOM semantics** (attributes, textContent) rather than the raw string shape — the escaping shape of the new pipeline differs from legacy (rehype-stringify outputs `<` as `&#x3C;` and does not escape `>`).

  | Legacy section | How it is migrated |
  |---|---|
  | 1 script and event attributes (1.1–1.10) | Migrated as is; **new** negative cases: an internal link must not carry the author's `target`/`rel`; `href="/\evil.com"` must not be treated as an internal link |
  | 2 URL protocols (2.1–2.8) | Migrated; 2.2 passing under legacy was a coincidence, so it changes to a semantic assertion (the link has no href and there is no script element) |
  | 3 iframe whitelist (3.1–3.12) | Migrated; 3.5 needs rewriting: sanitize strips the `javascript:` src first, the placeholder text does not contain the original URL, assert "no iframe, a placeholder is present, no script" |
  | 4 mXSS (4.1–4.13) | Migrated; the defense may change from "escape into text" to "remove"; confirm item by item that the payload does not take effect |
  | 5 DOM clobbering | Migrated; after FP1's `'*'` narrowing, id/name are removed (they no longer survive with a prefix), and `<img` appears in the `brokenimg.jpg` form |
  | 6 Phishing (6.1–6.4) | 6.1/6.2 migrated; **6.3 and 6.4 are both inverted into positive assertions** (`steemit.com.evil.com` must be handled as an external link or be intercepted) |
  | 7 HTML comments | Already covered in FP1 under the new semantics (D1); not repeated |
  | 8 Deep recursion fallback | Rewritten: the input is kept but intercepted by the pre-parse guard; assert "does not throw, outputs an empty string, takes < 50ms"; the 30s timeout is not kept |
  | 9 Nested code escaping (audit F36) | Migrated; assertions change to DOM semantics (the textContent of the code element equals the original payload) |
  | 10 Benign content passes | Migrated |
  | 11 Secondary trap boundaries | Migrated (no output in the whole corpus may match `/<\s*script/gi`) |

  Cases that depend on bare-text linkification (e.g. 6.1) are covered in FP2 in markdown link form first, and FP3 completes the bare-text form; add cases for the **five** `options` switches (`large`, `highQualityPost`, `noImage`, `hideImages`, `isProxifyImages`); three snapshots (tags, attributes, protocols) are checked in.
- Acceptance: common gate + security baseline all green.
- Review focus (security first): understanding of the sanitize order; whether the attributes `harden` produces itself all come from constants or validated data; iframe whitelist bypasses (case, protocol-relative, userinfo, lookalike domains); whether `td.style` can still carry CSS injection; completeness of the `'*'` narrowing.

### FP3 Porting Steemit semantics — `bytemd/fp-03-legacy-semantics`

- Goal: the visible behavior of existing posts under the new pipeline is aligned with legacy.
- Changes:
  - `linkify.ts` (remark phase): walk the text nodes (skipped when the parent is `link`/`inlineCode`/`code`), recognizing in the same order as `html-ready.ts:308-312, 340-382`: first bare video URLs (YouTube, Vimeo, Twitch, DTube, 3Speak; regexes reused from `lib/media/links.ts`), then #tag (purely numeric tags ignored; link to `/trending/<tag>`) and @mention (validated with `validateAccountName`; link to `/@<user>`), and finally the URLs matched by `linksAny`. Replacement is performed per **URL substring**: image extensions → `image` nodes; `.zip`/`.exe` are not linked; phishing URLs → `div.phishy` nodes (`title` is added by `harden.ts` as a constant; it is not allowed through the schema); the rest → `link` nodes; surrounding text is kept (D7);
  - Embed nodes: `div.videoWrapper > iframe` is built from the canonical URL templates in the whitelist (Vimeo with a start time, Twitch distinguishing videos/channel, DTube, 3Speak), and `links` / thumbnails are registered in the collector; in this FP, YouTube outputs a direct iframe first (FP7 replaces it with a lite placeholder);
  - `harden.ts` adds recognition of the 3Speak image-text combination (the structure described by `threespeakImageLink` in `links.ts`, matched on hast);
  - Paragraphs containing only embed nodes are promoted to block-level nodes (to avoid a leftover empty `<p>`);
  - collector: `options.collect` records hashtags / usertags / images / links, with the same semantics as `htmlReady(html, { mutate: false })` (recording the original URLs written by the author).
- Tests: rewrite the samples from `__tests__/lib/html-ready.test.ts` and `scripts/compare-render-pipeline.ts` into `renderMarkdown` cases; at least 1 positive case + 1 lookalike-domain negative case for each embed provider; no linkification inside code or existing links; a bare image URL keeps its surrounding text, and two bare image URLs in the same paragraph both render normally (D7 regression); complete the bare-text phishing cases reserved in FP2; the 3Speak combination is recognized both in a block-level wrapper and in an inline position.
- Acceptance: common gate + all of the above cases green.
- Review focus: completeness of the item-by-item comparison with legacy; whether the hrefs produced by linkification come only from controlled templates or URLs that have passed the protocol check; whether embed nodes necessarily satisfy the FP2 whitelist.

### FP4 Submit-side validation migration — `bytemd/fp-04-analyze-submit`

- Goal: the writing side no longer depends on the legacy pipeline, clearing the way for the editor replacement.
- Changes:
  - `analyze.ts`: `analyzePost(body)` → `{ disallowedTags, hashtags, usertags, images, links, pathological }`;
  - `disallowedTags` is decided from **the real sanitizer's result** rather than from a separately written set of rules: parse the author's raw HTML fragments (`html` nodes in mdast; the whole body for raw-HTML posts) into hast with `hast-util-raw` and count the tag multiset; then call `hast-util-sanitize` with the same `siteSanitize(defaultSchema)` and count the tags that are gone afterwards — covering both cases, "tag not in the whitelist" and "violates the `ancestors` rule (e.g. `td`/`tr`/`th` outside a table)"; the `<html>` shell is exempted per the legacy rules (`PostEditor.tsx:298-301`);
  - Submission is rejected when `pathological` is the **`structure` class** (new i18n copy, complete across the 9 overlay files); the `budget` class may be submitted — on the reader side it falls back to the legacy pipeline for rendering;
  - `PostEditor.tsx`: `buildJsonMetadata` and the "disallowed tag rejection" switch to `analyzePost` (L88-118, L290, L298-309); the imports of `markdown-it`, `@/lib/html-ready` and `allowedTags` are removed; the remaining logic (byte limit, permlink, payout/beneficiaries, broadcast, drafts) is untouched.
- Tests: the existing 17 cases in `__tests__/components/PostEditor.test.tsx` all pass **without assertion changes**; add `analyze.test.ts` (fixed samples comparing json_metadata tags/users/image/links against legacy output; `td` outside a table is judged disallowed; pathological input is rejected).
- Acceptance: common gate + existing tests pass with zero changes.
- Review focus: whether `disallowedTags` can miss cases; whether it really shares the same schema object as the reader side; coverage of the new i18n key.

### FP5 Reader switch — `bytemd/fp-05-reader-switch`

- Goal: the bodies of post pages / comments / help pages / announcements are rendered by the new pipeline (the default engine), bringing the rollback flag, light typography and the comparison tool.
- Changes:
  - `MarkdownViewer.tsx` rewritten: engine switch + `renderMarkdown` + viewerEffect dispatch (equivalent to the effect handling of the `@bytemd/react` Viewer: `plugins.map(p => p.viewerEffect?.({ markdownBody, file }))`, with cleanup functions paired); the current implementation moves to `MarkdownViewerLegacy.tsx`; when `renderMarkdown` returns `refused`, `MarkdownViewerLegacy` is rendered as well (guard fallback); `engine.ts` and `MarkdownEngineProvider` in the root layout;
  - CSS: `globals.css` imports the light github-markdown-css; the supplementary rule selectors are extended to `:is(.Markdown, .markdown-body)`; the outer element of the new path does not carry `.Markdown`;
  - `scripts/compare-markdown-engines.ts` (`pnpm test:render:engines`): **must be ESM** (`.mts`, run with `node --import tsx`; S21); input = the repository's fixed corpus + (optionally) a number of real posts fetched from the API; output = every difference, classified under a §3.4 ID or as "unclassified", plus a separate list of the entries that "fell back because the guard rejected them";
  - Guard implementation: `parity.test.ts` + the two ESLint rules (§3.1); the import path of `IFRAME_EMBED_HOSTS` in `lib/csp.ts` remains valid, and `__tests__/lib/csp.test.ts` is unchanged;
  - `docs/CONFIGURATION.md` gains `MARKDOWN_ENGINE`;
  - The size of the reader-side rendering chunk in the actual Turbopack output (compared with the current pipeline) is recorded in the status file.
- Tests: new-path rendering cases (headings / lists / tables / code blocks / image proxy / link attributes / embeds); `__tests__/components/cards/PostFull.nsfw.test.tsx` passes on the new path; rollback cases under the `legacy` engine; cases of falling back to legacy after a guard rejection (one each for the `structure` class and the `budget` class); `parity.test.ts`.
- Acceptance: common gate + every difference reported by the comparison script on the fixed corpus is classified, and every guard-rejected entry is confirmed one by one to be genuinely over budget or pathological + manual testing on a dev server (viewport 1440, light theme): a typical post page, a post with video, a post with tables / code, the comment section, the help page and announcements display correctly; under the `legacy` flag, the rendering is identical to the `next` branch.
- Review focus: whether a second `dangerouslySetInnerHTML` sink exists; whether `.Markdown` rules leak into the new path; whether the rollback path's styles are complete; conflicts between the Tailwind preflight and github-markdown-css; whether all five read-time switches take effect; whether viewerEffect cleanup is paired; whether the legacy code is really lazy-loaded.

### FP6 Body dark theme — `bytemd/fp-06-body-dark`

- Goal: in dark mode, the body colors of the post page match github-markdown dark.
- Changes: `scripts/build-markdown-theme.mjs` reads `github-markdown-dark.css`, prefixes **all selectors** with `.dark ` (higher specificity, independent of the import order) and generates `app/markdown-dark.css`, which is checked in; `globals.css` `@import`s it after the light file; a sync test (after regeneration, it matches the checked-in file); the reader-side body background is transparent so that it inherits the card background.
- Acceptance: common gate + `pnpm build-markdown-theme` is idempotent + manual testing on a dev server (dark theme): post page, comment section, help page and announcements have correct colors, with no white background.
- Review focus: whether the generated file is tied to the dependency version; whether legacy path styles were modified by mistake; no regression under the light theme.

### FP7 YouTube lite preview — `bytemd/fp-07-youtube-lite`

- Goal: restore legacy's "YouTube thumbnail + iframe loaded only on click" (`YoutubePreview.tsx`), with the preview and the post page sharing the same source and the same form.
- Changes:
  - `schema.ts`: allow the three attributes the placeholder needs (`dataSiteEmbed`, `dataId`, `dataStart` on `div`); update the snapshot;
  - `embed.ts`: the YouTube branch of `linkify.ts` changes to output the placeholder `<div class="videoWrapper" data-site-embed="youtube" data-id=… data-start=…>`, which contains a thumbnail `<img>` with the same URL as `YoutubePreview` (guaranteeing the SSR first paint and no layout shift); `viewerEffect({ markdownBody })` queries the placeholders and mounts `<YoutubePreview …/>` with `createRoot`, returning an unmount function;
  - `harden.ts`: the thumbnail inside the placeholder is exempt from the "wrap in a clickable link" rule.
- Tests: placeholder HTML snapshot; viewerEffect mount / unmount (jsdom); the parity test covers three kinds of input: "bare YouTube URL, `<iframe>` embed, markdown link wrapping a URL"; the thumbnail is not wrapped in a link.
- Acceptance: common gate + manual testing on a dev server: the first paint of the post page contains no YouTube iframe, and it loads on click; the editor does not exist yet, so the preview side is covered by the parity test.
- Review focus: whether mounting and cleanup of the React root are paired; whether the source of the `data-*` attributes is controlled.

### FP8 Story editor — `bytemd/fp-08-story-editor`

- Goal: the body input of `submit_story` is replaced with bytemd, with the preview on by default at desktop widths.
- Changes:
  - Dependency `@bytemd/react@1.22.0`; `lib/markdown/gfm-actions.ts` (MIT header notice); `lib/markdown/locales.ts` (condenser's 9 locales → bytemd locales, with `it` and `uk` falling back to `en`, following the lazy-loading form of `lib/i18n/messages.ts`);
  - `components/elements/MarkdownEditor.tsx` (`'use client'`; the single entry point, loaded via `next/dynamic` + `ssr:false`): `<Editor value onChange plugins sanitize mode locale uploadImages editorConfig />`; imports `bytemd/dist/index.css`; height about 70vh;
  - **Split threshold computed by the wrapper**: the wrapper measures the container width with a ResizeObserver: `width >= 600 ? 'split' : 'tab'` (S18); posting a story uses `STORY_PLUGINS`;
  - Tab key: `editorConfig.extraKeys.Tab` changes to inserting spaces (or, depending on configuration, moving focus out of the editor) so that keyboard users are not trapped (S17) — note that bytemd adds `Tab`/`Shift-Tab` with `editor.addKeyMap` after creating the editor, so overriding them has to go through a plugin's `editorEffect`;
  - Handling of rejected content: the wrapper calls `findPathology` on the current value with a debounce of about 150ms (ahead of bytemd's own 300ms preview debounce); when the result is non-empty, it unmounts the bytemd editor and renders a plain textarea that keeps the `value/onChange` semantics, plus a notice (new i18n key) — the `structure` notice says the content needs adjusting; the `budget` notice says it will be rendered in compatibility mode after publishing;
  - `PostEditor.tsx`: when `type === 'submit_story'`, the body textarea → `MarkdownEditor`; keep `id="body"` (attached to the wrapper element), the placeholder copy (`g.write_your_story`) and the markdown hint; clearing relies on the controlled `value`;
  - `uploadImages` → `uploadImage(file, username)` from `lib/media/upload-image.ts`; bytemd does not catch exceptions thrown by `uploadImages`, so the wrapper must catch them itself, show an i18n notice and return an empty array;
  - Test double `__tests__/helpers/mock-markdown-editor.tsx`: replaces `MarkdownEditor` with a textarea that keeps `value/onChange/placeholder`, so that `PostEditor.test.tsx` needs only one added line of `vi.mock`; `MarkdownEditor.test.tsx` tests controlled value write-back, `onChange`, `uploadImages` wiring and the split threshold (with the container width mocked).
- Acceptance: common gate + dev server testing (browser automation + manual checks): **viewport matrix 1920 / 1440 / 1366 / 1280 / 1024 / 390** — the first four are split with the preview always visible; the last two are tab with the Write tab by default; toolbar / keyboard shortcuts / full screen usable; image upload via drag-and-drop and paste; draft restore; clearing; toolbar tooltips work under CSP; **1:1 check**: take the 5 real posts of different types listed in item (2) of the FP11 full regression checklist, inject their bodies into the draft (`localStorage['replyEditorData-submit']`), strip `<!--N-->`, and compare the innerHTML of the preview `.markdown-body` with that of the post page `.markdown-body`; carried out under the light theme, with dark left to FP10.
- Review focus: plugins/sanitize/locale reference stability; whether the controlled value risks cursor jumping; the error path on upload failure; i18n key coverage; whether the editor chunk is lazy-loaded; Tab key handling.

### FP9 Comment editor — `bytemd/fp-09-comment-editor`

- Goal: comment replies and comment editing are replaced with bytemd, with the preview off by default and mounting on demand.
- Changes:
  - `PostEditor.tsx`: for `submit_comment` / `edit`, the body → `MarkdownEditor` with `mode="tab"`, a height of about 240px and `COMMENT_PLUGINS` (`large=false`, the same as the comment reader side);
  - Lazy mounting: the top-level reply box at `CommentsList.tsx:119-130` (shown as soon as the user is logged in) changes to "mount the editor only after the placeholder box gets focus / is clicked", and the placeholder box looks the same as the editor's writing area to avoid layout shift; the reply / edit box at `Comment.tsx:230-260` is already conditionally rendered and stays that way;
  - When editing a comment, the initial `body` value and the permlink logic are unchanged; the 16KiB byte limit is unchanged.
- Tests: the comment-related cases in `PostEditor.test.tsx`; lazy mounting cases (the editor is not rendered before interaction and is rendered after); cases for the `mode` and plugin constant arguments.
- Acceptance: common gate + manual testing on a dev server (viewports 1440 and 390): only the writing area is visible by default; after switching to the preview tab, it is byte-for-byte identical to how the comment displays once published (`<!--N-->` stripped); expanding multi-level replies does not stutter; comment editing back-fills correctly; **Chinese input method (IME) typing is smooth** — bytemd is built on CodeMirror 5, this item cannot be automated and needs manual confirmation after the merge (it does not block the merge; it is recorded under the pending confirmation items in the status file).
- Review focus: whether lazy mounting covers all entry points; unmount cleanup; whether `COMMENT_PLUGINS` matches the comment reader-side parameters.

### FP10 Editor dark theme — `bytemd/fp-10-editor-dark`

- Goal: in dark mode, the editor (toolbar, writing area, status bar, preview area) is readable, and the preview and the post page use the same set of body colors.
- Changes: `.dark .bytemd*` overrides (background, borders, text, toolbar, status bar, split divider line, the tippy `light-border` theme, `.cm-s-default` token colors); the styles are merged into `globals.css`; the preview area background matches the post page.
- Acceptance: common gate + manual testing on a dev server (dark theme, viewport 1440): the chrome of the story editor and the comment editor is readable, and headings / body text / links / code blocks / quotes / tables look the same in the preview area and on the post page; no regression under the light theme.
- Review focus: contrast problems that appear only under `.dark`; whether the body dark theme styles were modified by mistake.

### FP11 Docs and wrap-up — `bytemd/fp-11-docs-wrapup`

- Changes:
  - Add `docs/MARKDOWN_RENDERING.md` (in English): pipeline order, configuration source, the 1:1 contract and its guard, `MARKDOWN_ENGINE`, the behavioral differences list, the classes of the pathological input guard and the legacy fallback, how to add syntax (an in-house BytemdPlugin + the version family table), security red lines;
  - Update the "body rendering" description in `README.md` (around L96-98);
  - Finalize `docs/BYTEMD_INTEGRATION_STATUS.md`; clean up dead code confirmed to be unused;
  - Local documents (not checked in; in the main working tree): entries such as "post body rendering pipeline" in `AGENTS.md`, `docs/AI-driver/04-rendering-pipeline.md` and rule 6 of its README — modified locally, not checked in (`docs/AI-driver/` is untracked local documentation).
- Acceptance: common gate + the status table corresponds one-to-one with the PR list + every item of the full regression checklist checked off.
- Full regression checklist: (1) three kinds of pages (post page, comment section, submit) × light / dark theme; (2) the 1:1 check (FP8 method) on 5 real posts of different types — an ordinary post with text and images, one with external links and `#tag`/`@mention`, one with a video embed, a raw-HTML post, one with tables and code; (3) rollback with `MARKDOWN_ENGINE=legacy` works; (4) security baseline all green; (5) output size recorded (the data from FP5).
- Review focus: whether the docs and the code are consistent; whether the dead code cleanup removed legacy path code by mistake.

## 5. Dependency order

```
Step 0   ─► FP1       ─► FP2               ─► FP3       ─► FP4         ─► FP5    ─► FP6        ─► FP7          ─► FP8    ─► FP9     ─► FP10       ─► FP11
Baseline    Rendering    Hardening and        Steemit      Submit-side    Reader    Body          YouTube         Story     Comment    Editor        Docs and
and docs    core         security baseline    semantics    validation     switch    dark theme    lite preview    editor    editor     dark theme    wrap-up
```

Strictly serial. Rationale: FP3's embed nodes depend on FP2 allowing iframes; FP4 depends on FP3's collector and on the schema finalized in FP2; FP5 depends on the complete pipeline from FP1–FP4; FP6/FP7 modify the path introduced by FP5; the "preview = published page" of FP8/FP9 presupposes FP5–FP7; FP10's editor dark theme presupposes the existence of the editors from FP8/FP9; FP11 wraps up.

## 6. Execution process

One branch per feature point (`bytemd/fp-NN-<slug>`, cut from the latest commit of `next-bytemd`) and one PR with `next-bytemd` as its base. Process: development → three-way review (in parallel, read-only: A spec and correctness, B security, C engineering consistency; each runs the tests and lint themselves and outputs `P0/P1/P2 + file:line + evidence + recommendation`) → fixes and re-verification (fixes are done by the development side; the reviewers stay read-only and each re-verifies the items they raised; in the final round, all three parties do a regression read-through of the complete diff; exit criteria are P0 = 0 and P1 = 0, with each P2 either fixed or its acceptance rationale recorded; at most 4 rounds) → gates (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:proxy`, `pnpm build` — five items — + manual dev server testing for FP5–FP10 + the PR's CI all green) → squash merge (`gh pr merge --squash --delete-branch`; after the merge, verify with `gh pr view --json state,mergedAt,mergeCommit` and check that the tree of `next-bytemd` matches its state before the merge).

`next-bytemd` advances only through squash merges of PRs; the status file is merged together with the squash of the feature point it belongs to.

## 7. Progress record

The status, PR links, review rounds and accepted P2s of each feature point are recorded in `docs/BYTEMD_INTEGRATION_STATUS.md`.

## 8. Risks and mitigations

| # | Risk | Mitigation |
|---|---|---|
| K1 | A version family mismatch among ecosystem packages (unified 10 vs 11) causes silent failure | FP1 version guard test; conservative pinning of dependency versions; consult the §3.2 version family table when adding ecosystem packages |
| K2 | The new pipeline has an XSS gap that legacy does not have | FP1–FP3 rebuild the 11-section, 69-case security baseline and add negative cases; `'*'` attribute narrowing and snapshots; the rollback flag; the FP5 comparison script |
| K3 | Pathological input or a legitimate long post freezes the visitor's tab | FP1 linear pre-parse guard (`structure` class + `budget` class) + ESM benchmark tests; FP5 reader side falls back to the legacy pipeline for rejected content; FP4 submit side rejects the `structure` class; FP8/FP9 editor suspends the preview for rejected content |
| K4 | Turbopack/Next 16 resolution problems with bytemd's build output | Exposed early by the FP1 smoke test (both the client and server layers); if it fails, resolve it first before continuing |
| K5 | CodeMirror 5 cannot initialize under jsdom, making tests unstable | The editor always goes through a test double (FP8); CodeMirror is never instantiated in unit tests |
| K6 | The review-and-fix loop does not converge | §6 sets a maximum of 4 rounds; stop and escalate once exceeded |
| K7 | `.env` / port conflicts between the worktree and the main working tree | The dev server uses a separate port; `.env` is only copied on the local machine |
| K8 | Upstream bytemd v1 is no longer maintained, and the steemit fork has no commits of its own | Pin 1.22.0; solve problems with in-house plugins inside this repository |
| K9 | The new pipeline takes longer than legacy to render a normal long post (measured in review: 64KiB of flat body text 0.32–0.50 s, legacy 0.035 s) | FP1 benchmark tests record the timings; FP5 tests the long-post experience in practice; if unacceptable, move body rendering down to the server later (a server-side rendering form) |
| K10 | The typography redesign (D8) brings visual regressions | FP5/FP6/FP10 browser testing checklists; difference classification by the comparison script |
| K11 | The editor preview side shows `undefined` when an error occurs (S12) | Pre-parse guard + the editor wrapper suspends the preview for rejected content; the submit side rejects the `structure` class |
| K12 | Measurement scripts take the CJS build path, so the thresholds do not match production behavior (S21) | All benchmark and comparison scripts use ESM; FP1 patches the dependency and adds ESM/CJS consistency cases |

## 9. Decision log

Execution according to this plan is confirmed, with each feature point promoted to a PR. C1–C8 are decisions already listed in the initial version; C9–C15 are items newly identified during review, executed as recommended and recorded here.

| # | Decision | Value | Notes |
|---|---|---|---|
| C1 | Baseline branch | `next` @ `b7928961` | Local is in sync with origin/next |
| C2 | Working directory | A separate git worktree (isolated from the main working tree) | Avoids interrupting other work in the main working tree |
| C3 | Including the reader-side migration and the typography redesign in this round | Included | The only self-consistent way to get "preview = published page" |
| C4 | Rollback flag | `MARKDOWN_ENGINE` is kept | The legacy pipeline is not removed in this round |
| C5 | Story editor split threshold | Computed by the wrapper: split when the container is ≥600px, otherwise tab (Write tab by default) | bytemd's default 800px threshold yields no preview at 1280/1366 viewports; at 600px each pane is about 300px, still usable |
| C6 | Remote operations | One PR per FP (base `next-bytemd`), squash merge | Confirmed; no merge into `next`/`master` |
| C7 | GFM dialect | Aligned with legacy (§3.4-B) | — |
| C8 | Number and granularity of FPs | 11 reviewed FPs | — |
| C9 | Phishing and internal-link checks switch to exact host matching (D6) | Proceed | Security fix; the known defect pinned by legacy tests 6.3/6.4 |
| C10 | HTML comment behavior change (D1) | Proceed | Security-equivalent |
| C11 | Widening the allowed tag set and making `<img>` size attributes take effect (D4) | Proceed | The final list is defined by the snapshot |
| C12 | Image upload by drag / paste (FP8) | Keep | Not explicitly required; a native bytemd capability that reuses the existing `uploadImage` (posting key signing) and adds no backend |
| C13 | The top-level reply box changes to mounting the editor on click (FP9) | Keep | Avoids loading the editor every time a logged-in user opens a post page |
| C14 | How the local documents (`AGENTS.md`, `docs/AI-driver`) are updated | Modified locally after FP11 is merged; not checked in | `docs/AI-driver/` is untracked local documentation |
| C15 | Role of the legacy pipeline | Kept long term as the fallback renderer for "content rejected by the guard", not merely as the rollback flag | Raised by the measured conclusions of the FP1 security review (S20); "removing legacy after production validation" is no longer planned |

## Appendix A: Repository conventions

Code comments, commit messages, error strings and the contents of `docs/` use English; the package manager is pnpm; `pnpm lint` stays at 0 errors; new i18n keys go only in `messages/overlays/{locale}.json`; `app/globals.css` is the single stylesheet entry point; the rendering pipeline is security-critical and order-sensitive, and author content must not be rendered with `dangerouslySetInnerHTML` outside the pipeline. Everything visible in the repository is written in English, including PR titles (English conventional commits) and PR bodies (split into Summary / Changes / Test plan / Out of scope). `.cursor/` is no longer used; plan and status documents live under `docs/`.

## Appendix B: Verification record

**B.1 Verification experiments (2026-11-24, node v24.18.0; the scripts were one-off experiments, and the conclusions have been turned into test cases for FP1/FP2)**

| # | Experiment | Result |
|---|---|---|
| 1 | stock `@bytemd/plugin-gfm` + a schema that allows iframes: single-line `<iframe>`, `<center><iframe></center>`, `Watch this: <iframe></iframe>` | All three are fully preserved (the tagfilter does not take effect) |
| 2 | stock gfm: `costs ~5~ dollars and ~~gone~~` | `<del>5</del>` and `<del>gone</del>` |
| 3 | stock gfm: `see www.example.com/x or mail me@steemit.com or https://a.b/c` | All three are linked automatically |
| 4 | Custom GFM (unified 10 family, the three mdast extensions registered as objects): table + task list | `<table>…` and `<li class="task-list-item"><input type="checkbox" …>` come out normally |
| 5 | Same as above: bare domain / email address / URL | Stay plain text |
| 6 | Same as above: `~5~ ~~gone~~`; `Watch: <iframe …></iframe>` (allowed by the schema) | `~5~` as is, `<del>gone</del>`; the iframe is preserved |
| 7 | `<div class="pull-right">`, `<div class="fixed inset-0">`, `<span class="hidden">` (a single `['className', …]` definition) | `pull-right` kept; `class=""`; the span's class is removed |
| 8 | Counter-example: three parallel `['className', X]` definitions | Only the last one takes effect → whitelisted classes are stripped by mistake |
| 9 | `raw-html-post` remark plugin: `<html><body><p>Hello _world_ #x</p>…</body></html>`, `<p>Intro</p>\n\n**bold?**` | The markdown is not parsed |
| 10 | Remark-phase nodes: `link{url:'/trending/steem'}`, `link{url:'/@ety001'}`, `div.videoWrapper > iframe` | Relative links are preserved through sanitize; custom nodes correctly become elements |
| 11 | `<center>` (allowed by the schema), `[t](/trending/x)`, `[j](javascript:alert(1))` | `<center>` kept; relative link kept; the `javascript:` href is removed |
| 12 | Version family counter-example: `mdast-util-gfm-table@2.0.1` + bytemd | Table input throws `Cannot set properties of undefined (setting 'inTable')` |

**B.2 Measured conclusions of the technical review (2026-11-24; all B.1 items reproduced independently, plus additions)**

| Item | Legacy | New pipeline |
|---|---|---|
| `<b>`×21800 (64KiB) | 170 ms | 22.1 s (throws `RangeError`; the exception occurs in rehype-raw) |
| `> `×32768 (64KiB) | 5 ms | 6.9 s (the exception occurs in micromark parse, before any plugin) |
| `> `×8128 (16KiB comment) | 3 ms | 0.7 s |
| 50k-deep `<div>` nesting (the input of legacy test 8.1) | 0.18 s | 26.8–29.1 s |
| Normal 64KiB of flat body text | 35 ms | 322–509 ms |

Other conclusions: the Svelte Viewer's preview HTML ends with `<!--N-->`; the light and dark files of `github-markdown-css@5.9.0` both have 0 custom properties; the default schema's `'*'` has about 70 entries, and `id`/`name` survive with the `user-content-` prefix; in the prototype written to the initial version's spec, `<a href="/trending/x" target="_blank" rel="opener">` was output as is and `href="/\evil.com"` was judged an internal link; of the 62 portable legacy security test cases, 20 fail as originally asserted on the new pipeline (details in the mapping table in §4-FP2); the Svelte Viewer can be instantiated directly in jsdom; repeated `$set` with an unchanged reference does not re-run the processor; the reader-side rendering bundle measures approximately 322 KiB min / 90 KiB gz (current pipeline 407 / 146).

**B.3 Facts about the bytemd 1.22.0 build output** (`node_modules/bytemd/dist/`, for direct reference by each FP)

`index.mjs`: L2514–2537 (getProcessor order; the className permission comes before the sanitize callback); L2638–2644 (the Svelte Viewer's try/catch); L2646–2649 (appending `<!--N-->`); L2677–2696 (the Editor preview instantiating the Viewer); L3168–3176 (Editor props); L3242–3245 (Tab key capture); L3339–3340 (ResizeObserver); L3460 (`split = mode === "split" || mode === "auto" && containerWidth >= 800`); L3469–3491 (when not in split mode, the preview is shown only if `activeTab === "preview"`); L3508–3515 (`setValue` only when the external value differs from the editor's). `types.d.ts`: L132–157 (BytemdPlugin), L158–205 (EditorProps), L206–229 (ViewerProps). `index.css`: `.bytemd{…color:#24292e;border:1px solid #e1e4e8;background-color:#fff;height:300px}`, `.bytemd-preview .markdown-body{max-width:800px;margin:0 auto;padding:16px 4%}`; no CSS variables and no runtime `<style>` injection. `@bytemd/react/dist/index.mjs`: L3 (Editor), L32 (Viewer), L40–47 (try/catch), L73 (empty string fallback), L77 (named exports). `hast-util-sanitize@4.1.0/lib/schema.js`: L4–5 (id/name prefix), L96–169 (the `'*'` global attribute list).

## Appendix C: Index of evidence for the current state (condenser `next` @ `b7928961`)

- `components/elements/PostEditor.tsx`: markdown-it instance L74–80; `buildJsonMetadata` L88–118; drafts L189–217; `handleSubmit` L219–397; isHtml check L284–288; disallowed tag rejection L298–309; broadcasting of the raw body L354; body textarea L473–481; clearing L617–632
- `components/elements/MarkdownViewer.tsx`: props L11–23 (`highQualityPost` defaults to true, `large` to false); raw-HTML detection L71–77; comment replacement L80; pipeline L83–98; script trap L105–108; low-score notice L112, L200–213; `~~~ embed:` slicing L120–189; outer class names L191–198
- `components/cards/PostFull.tsx`: `highQualityPost = payout > 10.0` L65, `noImage = stats.gray` L66, call L142–147 (passes `large`, `highQualityPost`, `noImage`)
- `components/layout/FeedLayout.tsx` L38, L54: two columns `[240px_minmax(0,1fr)]` at ≥760px, three columns `[240px_minmax(0,1fr)_320px]` at ≥1200px, center column `px-4`; `app/(main)/submit/SubmitPostClient.tsx` L58: `centerClassName="md:max-w-4xl"`
- `lib/html-ready.ts`: signature L86–89; catch fallback L135–145; 3Speak preprocessing L148–152; `link()` L170–195; `iframe()` L198–218; `img()` L220–248; proxying L251–272; bare images / linkification L275–330; `linkify()` L332–384; video embed chain L386–640
- `lib/sanitize-config.ts`: `iframeWhitelist` L37–77; `IFRAME_EMBED_HOSTS` L88–95; `allowedTags` L102–138; attributes L157–176; protocols L177; iframe/img/div/td/a transforms L179–274
- `lib/media/links.ts` (`any`/`local`/`image`/`youTube` and the `linksRe` default export), `lib/media/proxify-url.ts` (`proxifyImageUrl` L131, `defaultSrcSet` L29, `isDefaultImageSize` L47), `lib/phishing.ts:93` (`looksPhishy`)
- Call sites: `components/cards/PostFull.tsx:142`, `components/cards/Comment.tsx:185` (passes no options), `components/elements/HelpArticle.tsx:140`, `components/layout/Announcement.tsx:52`; editor mounts: `components/cards/CommentsList.tsx:119–130`, `components/cards/Comment.tsx:230–260`, `app/(main)/submit/SubmitPostClient.tsx`
- Existing tests: `__tests__/lib/sanitize-pipeline.test.ts` (912 lines, 11 describes, 69 its: script and event attributes, URL protocols, iframe whitelist, mXSS, DOM clobbering, phishing, HTML comments, deep recursion fallback, nested code escaping, benign content, secondary trap boundaries), `__tests__/lib/html-ready.test.ts` (49 lines), `__tests__/components/PostEditor.test.tsx` (528 lines, 17 cases; the body input is located with `getByPlaceholderText('Write your story...')`), `__tests__/lib/csp.test.ts`, `__tests__/components/cards/PostFull.nsfw.test.tsx`
- Existing scripts: `scripts/compare-render-pipeline.ts` (byte-for-byte comparison against legacy), `scripts/lint-budget.mjs`
- Configuration and conventions: `vitest.config.ts`, `vitest.setup.ts`, `pnpm-workspace.yaml`, `.github/workflows/ci.yml` (triggered by `pull_request` and by pushes to next/master), `lib/csp.ts:61, 128–143`, `app/layout.tsx` (the `__SDC_UPLOAD_IMAGE_URL__` injection block), `lib/i18n/config.ts:9`, `lib/i18n/messages.ts:11–22`, `app/globals.css:5, 92, 143–385`, `README.md:96-98`
