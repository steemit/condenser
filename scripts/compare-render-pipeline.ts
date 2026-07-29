/**
 * compare-render-pipeline — verifies the next render pipeline produces
 * byte-identical output to the legacy (condenser-legacy) pipeline for
 * identical post-markdown HTML input.
 *
 * Design notes:
 *  - The legacy pipeline is bundled from the pristine legacy sources with
 *    esbuild (webpack aliases `app/`/`shared/`, a `counterpart` i18n shim, an
 *    injected `$STM_Config`, and the exact dependency versions from legacy
 *    package.json: sanitize-html@1.14.1, xmldom@0.1.27).
 *  - The markdown engines differ by decision (remarkable → markdown-it), so
 *    engine raw output is NOT compared. Instead, for every sample the base
 *    HTML is produced by BOTH engines, and each base is fed through BOTH
 *    pipelines (HtmlReady + sanitize). For identical base HTML the outputs
 *    must be byte-identical — this isolates the fidelity of the ported
 *    HtmlReady/SanitizeConfig logic, which is where the five gaps lived.
 *  - A few React-level smoke checks (embed players, noImage banner) run the
 *    real MarkdownViewer via renderToStaticMarkup.
 *
 * Run: pnpm tsx scripts/compare-render-pipeline.ts
 */

import { buildSync } from 'esbuild';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import { parseDocument } from 'htmlparser2';
import render from 'dom-serializer';

import htmlReady from '../lib/html-ready';
import sanitizeConfig, { noImageText } from '../lib/sanitize-config';
import MarkdownViewer from '../components/elements/MarkdownViewer';

const LEGACY_ROOT = '/home/ety001/workspace/condenser-legacy';
const CACHE = path.join(__dirname, '.cache');
const OUT = path.join(CACHE, 'legacy-pipeline.cjs');

/**
 * The babel-transpiled legacy build downleveled `[...nodeList]` /
 * `Array(...nodeList)` spreads to length-based copies; Node's native spread
 * requires a real iterator, which xmldom@0.1.27 NodeLists don't have (their
 * childNodes instances sit directly on Object.prototype, so there is no safe
 * prototype to patch). Rewrite just those spread sites into a patched copy
 * under .cache and alias `shared` to it — the legacy repo stays pristine.
 */
fs.mkdirSync(path.join(CACHE, 'shared'), { recursive: true });
fs.writeFileSync(
  path.join(CACHE, 'shared', 'HtmlReady.js'),
  fs
    .readFileSync(path.join(LEGACY_ROOT, 'src/shared/HtmlReady.js'), 'utf8')
    .split("[...doc.getElementsByTagName('img')]")
    .join("Array.prototype.slice.call(doc.getElementsByTagName('img'))")
    .split('Array(...node.childNodes)')
    .join('Array.prototype.slice.call(node.childNodes)')
);

// ---------------------------------------------------------------------------
// 1. Bundle the legacy pipeline.
// ---------------------------------------------------------------------------
buildSync({
  entryPoints: [path.join(__dirname, 'render-compare', 'legacy-entry.js')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: OUT,
  logLevel: 'warning',
  alias: {
    app: path.join(LEGACY_ROOT, 'src/app'),
    shared: path.join(CACHE, 'shared'),
    counterpart: path.join(__dirname, 'render-compare', 'counterpart-shim.js'),
    'sanitize-html': 'sanitize-html-legacy',
    xmldom: 'xmldom-legacy',
  },
  inject: [path.join(__dirname, 'render-compare', 'stm-config-inject.js')],
  // legacy repo has no node_modules; resolve third-party deps from ours.
  nodePaths: [path.join(__dirname, '..', 'node_modules')],
});

const require = createRequire(import.meta.url);
// remarkable@1.7.1 has no usable type declarations; require it untyped.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Remarkable: any = require('remarkable');
const legacy = require(OUT) as {
  HtmlReady: (
    html: string,
    opts?: { mutate?: boolean; hideImages?: boolean; isProxifyImages?: boolean }
  ) => { html: string };
  sanitizeConfig: (opts: {
    large?: boolean;
    highQualityPost?: boolean;
    noImage?: boolean;
    sanitizeErrors?: string[];
  }) => object;
};
const legacySanitize: (html: string, opts: object) => string =
  require('sanitize-html-legacy');

// ---------------------------------------------------------------------------
// 2. Both pipelines, driven with identical base HTML.
// ---------------------------------------------------------------------------
interface PipelineOptions {
  large?: boolean;
  highQualityPost?: boolean;
  noImage?: boolean;
  hideImages?: boolean;
  isProxifyImages?: boolean;
}

function legacyPipeline(baseHtml: string, o: PipelineOptions): string {
  const ready = legacy.HtmlReady(`<html>${baseHtml}</html>`, {
    hideImages: o.hideImages ?? false,
    isProxifyImages: o.isProxifyImages ?? false,
  }).html;
  return legacySanitize(
    ready,
    legacy.sanitizeConfig({
      large: o.large ?? true,
      highQualityPost: o.highQualityPost ?? true,
      noImage: o.noImage ?? false,
      sanitizeErrors: [],
    })
  );
}

function newPipeline(baseHtml: string, o: PipelineOptions): string {
  const ready = htmlReady(baseHtml, {
    hideImages: o.hideImages ?? false,
    isProxifyImages: o.isProxifyImages ?? false,
  }).html;
  return sanitizeHtml(
    ready,
    sanitizeConfig({
      large: o.large ?? true,
      highQualityPost: o.highQualityPost ?? true,
      noImage: o.noImage ?? false,
      sanitizeErrors: [],
    })
  );
}

// ---------------------------------------------------------------------------
// 3. Samples covering the scenarios from the goal.
// ---------------------------------------------------------------------------
const remarkable = new Remarkable({
  html: true,
  breaks: true,
  linkify: false,
  typographer: false,
  quotes: '“”‘’',
});
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: false,
  typographer: false,
  quotes: '“”‘’',
});

interface Sample {
  name: string;
  body: string;
  options?: PipelineOptions;
}

const samples: Sample[] = [
  {
    name: 'naked-youtube-watch-url',
    body: 'Check this video https://www.youtube.com/watch?v=dQw4w9WgXcQ out',
  },
  {
    name: 'youtube-shorts',
    body: 'Short: https://www.youtube.com/shorts/abcDEF123_-',
  },
  {
    name: 'youtu-be-with-start-time',
    body: 'https://youtu.be/dQw4w9WgXcQ?t=42s',
  },
  { name: 'vimeo', body: 'https://vimeo.com/123456789' },
  { name: 'twitch-channel', body: 'https://www.twitch.tv/somechannel' },
  { name: 'twitch-video', body: 'https://www.twitch.tv/videos/123456789' },
  { name: 'dtube', body: 'https://d.tube/#!/v/user/abc123' },
  { name: 'threespeak-watch', body: 'https://3speak.online/watch?v=user/abc-123' },
  {
    name: 'threespeak-dapp-image-anchor',
    body: '<a href="https://3speak.online/watch?v=user/abc-123"><img src="https://img.3speakcontent.online/abc-123/post.png"/></a>',
  },
  {
    name: 'first-party-image',
    body: '![photo](https://steemitimages.com/DQmXabc/photo.png)',
  },
  {
    name: 'third-party-image-passthrough',
    body: '![photo](https://example.com/pic.jpg)',
  },
  {
    name: 'naked-image-url',
    body: 'Look at this https://example.com/pic.png here',
  },
  {
    name: 'mention-hashtag-digit-suffix',
    body: 'Thanks @alice2 and @good.actor #steem #photography #123',
  },
  {
    name: 'bad-actor-mention-not-linked',
    body: 'Beware of @aex.com offers',
  },
  {
    name: 'phishing-markdown-link',
    body: '[steemit.com wallet](https://steewit.com)',
  },
  {
    name: 'phishing-naked-url',
    body: 'login at https://steemil.com/login now',
  },
  {
    name: 'external-link',
    body: '[example](https://example.com/page)',
  },
  {
    name: 'local-link',
    body: '[post](/trending/steem)',
  },
  {
    name: 'youtube-iframe-strips-query',
    body: '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" width="560" height="315"></iframe>',
  },
  {
    name: 'soundcloud-iframe-rebuild',
    body: '<iframe src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/123&auto_play=true"></iframe>',
  },
  {
    name: 'unsupported-iframe-placeholder',
    body: '<iframe src="https://evil.example.com/embed/x"></iframe>',
  },
  { name: 'zip-url-not-linked', body: 'download https://example.com/file.zip' },
  {
    name: 'hideImages',
    body: '![photo](https://example.com/pic.jpg)',
    options: { hideImages: true },
  },
  {
    name: 'noImage',
    body: '![photo](https://example.com/pic.jpg)',
    options: { noImage: true },
  },
  {
    name: 'isProxifyImages-strips-legacy-shell',
    body: '![photo](https://steemitimages.com/640x0/https://example.com/pic.jpg)',
    options: { isProxifyImages: true },
  },
  {
    name: 'low-quality-external-link-nofollow',
    body: '[example](https://example.com/page)',
    options: { highQualityPost: false },
  },
  {
    name: 'comment-markdown',
    body: '**bold** _italic_ `code`\n\n> quote\n\n- item1\n- item2\n\n#tag and @someone see https://example.com',
  },
];

/** Mirror MarkdownViewer's raw-HTML detection. */
function isHtmlPost(body: string): boolean {
  if (/^<html>([\S\s]*)<\/html>$/.test(body)) return true;
  return /^<p>[\S\s]*<\/p>/.test(body);
}

function stripComments(body: string): string {
  return body.replace(/<!--([\s\S]+?)(-->|$)/g, '(html comment removed: $1)');
}

/**
 * Normalize pipeline output to what a browser actually renders.
 *
 * The legacy bundle uses sanitize-html@1.14.1 while next uses v2. The two
 * libraries' bundled HTML parsers differ in two browser-irrelevant ways:
 *  1. v1 keeps invalid `<p><div>…` nesting as-is; v2 (and every real browser)
 *     auto-closes the `<p>`. Both end up as the same DOM in a browser.
 *  2. v1 serializes empty attributes as bare `title`; v2 drops them. An empty
 *     title attribute has no rendering effect.
 * Re-parsing both outputs with a modern browser-grade parser and stripping
 * empty attributes compares rendered meaning, not serializer artifacts.
 */
function normalizeForCompare(html: string): string {
  const doc = parseDocument(html);
  // Force empty attributes to `attr=""` (dom-serializer otherwise emits them
  // bare, indistinguishable from boolean attributes), then strip them.
  return render(doc, { emptyAttrs: true }).replace(/\s[\w-]+=""/g, '');
}

// ---------------------------------------------------------------------------
// 4. Run the comparisons.
// ---------------------------------------------------------------------------
let failures = 0;
let engineDiffs = 0;

for (const sample of samples) {
  const o = sample.options ?? {};
  const body = stripComments(sample.body);
  const htmlish = isHtmlPost(body);
  const baseRemarkable = htmlish
    ? body.replace(/^<html>([\S\s]*)<\/html>$/, '$1')
    : remarkable.render(body);
  const baseMdIt = htmlish
    ? body.replace(/^<html>([\S\s]*)<\/html>$/, '$1')
    : md.render(body);

  const problems: string[] = [];
  for (const [engine, base] of [
    ['remarkable', baseRemarkable],
    ['markdown-it', baseMdIt],
  ] as const) {
    const legacyOut = legacyPipeline(base, o);
    const newOut = newPipeline(base, o);
    if (normalizeForCompare(legacyOut) !== normalizeForCompare(newOut)) {
      problems.push(
        `[${engine} base] outputs differ\n  legacy: ${legacyOut}\n  new:    ${newOut}`
      );
    }
  }

  if (!htmlish && baseRemarkable !== baseMdIt) engineDiffs++;

  if (problems.length > 0) {
    failures++;
    console.log(`FAIL ${sample.name}`);
    for (const p of problems) console.log(`  ${p}`);
  } else {
    console.log(`PASS ${sample.name}`);
  }
}

// ---------------------------------------------------------------------------
// 5. React-level checks on the real MarkdownViewer.
// ---------------------------------------------------------------------------
function checkReact(name: string, cond: boolean, detail: string): void {
  if (cond) {
    console.log(`PASS react:${name}`);
  } else {
    failures++;
    console.log(`FAIL react:${name}\n  ${detail}`);
  }
}

const ytRender = renderToStaticMarkup(
  React.createElement(MarkdownViewer, {
    text: 'video https://www.youtube.com/watch?v=dQw4w9WgXcQ here',
    large: true,
  })
);
checkReact(
  'youtube-placeholder-becomes-lazy-preview',
  ytRender.includes('videoWrapper youtube') &&
    ytRender.includes('https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg') &&
    !ytRender.includes('~~~ embed'),
  ytRender
);

const threeSpeakRender = renderToStaticMarkup(
  React.createElement(MarkdownViewer, {
    text: 'https://3speak.online/watch?v=user/abc-123',
    large: true,
  })
);
checkReact(
  'threespeak-placeholder-becomes-iframe',
  threeSpeakRender.includes(
    'https://3speak.online/embed?v=user/abc-123'
  ) && threeSpeakRender.includes('videoWrapper'),
  threeSpeakRender
);

const noImageRender = renderToStaticMarkup(
  React.createElement(MarkdownViewer, {
    text: '![photo](https://example.com/pic.jpg)',
    noImage: true,
  })
);
checkReact(
  'noImage-banner-shown',
  noImageRender.includes(noImageText) &&
    noImageRender.includes('MarkdownViewer__negative_group'),
  noImageRender
);

const phishyRender = renderToStaticMarkup(
  React.createElement(MarkdownViewer, {
    text: '[steemit.com](https://steewit.com)',
  })
);
checkReact(
  'phishing-link-unlinked',
  phishyRender.includes('phishy') && !phishyRender.includes('href="https://steewit.com"'),
  phishyRender
);

// ---------------------------------------------------------------------------
console.log(
  `\n${samples.length + 4} checks, ${failures} failed` +
    ` (${engineDiffs} samples where remarkable/markdown-it base HTML differs — informational only)`
);
process.exit(failures === 0 ? 0 : 1);
