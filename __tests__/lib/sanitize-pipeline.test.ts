/**
 * Render-pipeline security regression suite (audit N-11).
 *
 * The pipeline markdown-it → HtmlReady → sanitize-html is the site's only
 * XSS barrier, yet none of its layers had CI coverage: a widening of
 * allowedTags, of the 6-origin iframe whitelist, or of the link/image
 * hardening would not have turned CI red. This suite freezes the payload
 * corpus that the 2026-09-21 security audit dynamically validated (113+
 * payloads, all neutralized) into deterministic regression tests so that any
 * future relaxation of the filter fails the build.
 *
 * No production code is changed. The harness below is a faithful, commented
 * re-assembly of the exact pipeline that MarkdownViewer runs in its useMemo —
 * see components/elements/MarkdownViewer.tsx (steps mirrored line by line):
 *
 *   MarkdownViewer.tsx:64-109                 here (renderPost)
 *   ──────────────────────────────────────    ─────────────────────────
 *   raw-HTML post detection (<html> wrap      step 1 (isHtml detection)
 *     or leading <p>)                         
 *   HTML-comment strip ("JS-DOS" mitigation)  step 2 (stripComments)
 *   md.render (skipped for raw-HTML posts)    step 3
 *   htmlReady(rendered, {hideImages,          step 4
 *     isProxifyImages})
 *   sanitizeHtml(rendered, sanitizeConfig(    step 5
 *     {large, highQualityPost, noImage}))
 *   secondary trap: /<\s*script/gi → refuse   step 6 (trapRefuses)
 *
 * The trap (refusing to render anything matching /<\s*script/gi) lives in
 * the COMPONENT layer (MarkdownViewer.tsx:105-108), not in lib/. This suite
 * covers everything the lib layers guarantee and, at the end, asserts the
 * lib-layer invariant the trap depends on: sanitize output for the whole
 * corpus never trips the trap predicate. See the "secondary trap boundary"
 * describe block.
 *
 * Assertions are deliberately behavioral, not byte-exact: we assert the
 * absence of live dangerous constructs (real tags carrying handlers,
 * javascript:/vbscript:/data:text/html URLs in href/src positions, non-
 * whitelisted iframes) and the presence of key structures on the positive
 * path. Escaped inert text (&lt;script&gt;) is safe by definition and is
 * asserted as such where the pipeline chooses text-escaping as its defense.
 */

import { describe, expect, it } from 'vitest';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import htmlReady from '@/lib/html-ready';
import sanitizeConfig from '@/lib/sanitize-config';

// Same engine configuration as MarkdownViewer.tsx:29-35.
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: false,
  typographer: false,
  quotes: '\u201c\u201d\u2018\u2019',
});

interface RenderOptions {
  large?: boolean;
  highQualityPost?: boolean;
  noImage?: boolean;
  hideImages?: boolean;
  isProxifyImages?: boolean;
}

/**
 * Mirror of MarkdownViewer's render useMemo. Defaults match the component's
 * prop defaults (large=false, highQualityPost=true, noImage=false,
 * hideImages=false, isProxifyImages=false).
 */
function renderPost(
  text: string,
  {
    large = false,
    highQualityPost = true,
    noImage = false,
    hideImages = false,
    isProxifyImages = false,
  }: RenderOptions = {}
): { html: string; clean: string; isHtml: boolean; sanitizeErrors: string[] } {
  if (!text) return { html: '', clean: '', isHtml: false, sanitizeErrors: [] };

  let body = text;

  // Step 1: raw-HTML post detection (MarkdownViewer.tsx:70-77).
  let isHtml = false;
  const m = body.match(/^<html>([\S\s]*)<\/html>$/);
  if (m && m.length === 2) {
    isHtml = true;
    body = m[1];
  } else if (/^<p>[\S\s]*<\/p>/.test(body)) {
    isHtml = true;
  }

  // Step 2: strip HTML comments — "JS-DOS" mitigation (MarkdownViewer.tsx:80).
  body = body.replace(/<!--([\s\S]+?)(-->|$)/g, '(html comment removed: $1)');

  // Step 3: markdown → HTML, skipped for raw-HTML posts (MarkdownViewer.tsx:83).
  let rendered = isHtml ? body : md.render(body);

  // Step 4: HtmlReady mutation (MarkdownViewer.tsx:86).
  rendered = htmlReady(rendered, { hideImages, isProxifyImages }).html;

  // Step 5: sanitize-html XSS filter (MarkdownViewer.tsx:90-98).
  const sanitizeErrors: string[] = [];
  const clean = sanitizeHtml(
    rendered,
    sanitizeConfig({ large, highQualityPost, noImage, sanitizeErrors })
  );

  // Step 6: component-layer secondary trap (MarkdownViewer.tsx:105-108).
  const html = /<\s*script/gi.test(clean) ? '' : clean;
  return { html, clean, isHtml, sanitizeErrors };
}

/** The component's trap predicate, verbatim (MarkdownViewer.tsx:105). */
function trapRefuses(clean: string): boolean {
  return /<\s*script/gi.test(clean);
}

// ---------------------------------------------------------------------------
// Assertion helpers — normalized (lowercase) / tag-aware checks.
// Tag-awareness matters: the pipeline sometimes neutralizes by entity-escaping
// (&lt;img onerror=...), which safely RETAINS the substring "onerror=" in
// inert text. A naive substring check would false-positive on that.
// ---------------------------------------------------------------------------

/** No live <script...</script> sequence anywhere (tag or close-tag). */
function expectNoScriptTag(html: string): void {
  expect(html.toLowerCase()).not.toContain('<script');
  expect(html).not.toMatch(/<\s*\/?\s*script/i);
}

/** No real tag carries an on* event-handler attribute. */
function expectNoEventHandlers(html: string): void {
  // The separator class includes '/' because HTML5 tokenization treats a
  // solidus in a tag as an attribute separator: `<img src=x/onerror=…>` is
  // an onerror attribute, not part of the src value (#4042 leftover).
  expect(html).not.toMatch(/<[a-zA-Z][^>]*[\s"'\/]on[a-zA-Z]+\s*=/i);
}

/**
 * No javascript:/vbscript:/data:text/html URL in a live href/src attribute
 * position. Tag-aware like expectNoEventHandlers: escaped inert text
 * (&lt;a href="javascript:…"&gt;) safely retains the substring and must not
 * false-positive. (HtmlReady neutralizes non-http(s) schemes by prepending
 * https:// — e.g. href="https://javascript:alert(1)" — which is inert.)
 */
function expectNoActiveScriptUrl(html: string): void {
  // Same '/' separator note as expectNoEventHandlers: `<a/href=…>` is an
  // href attribute under HTML5 tokenization rules.
  expect(html).not.toMatch(
    /<[a-zA-Z][^>]*[\s"'\/](href|src)\s*=\s*["']?\s*(javascript|vbscript|data:text\/html)\s*:/i
  );
}

// ---------------------------------------------------------------------------
// Corpus shared by the trap-boundary sweep at the end of this file.
// ---------------------------------------------------------------------------
const corpus: Array<[string, string]> = [
  ['script-raw', '<script>alert(1)</script>'],
  ['script-md', 'hello *world* <script>alert(1)</script> bye'],
  ['script-mixed-case', '<ScRipt>alert(1)</sCriPt>after'],
  ['img-onerror', '<img src=x onerror=alert(1)>'],
  ['js-href-raw', '<a href="javascript:alert(1)">click</a>'],
  ['js-href-md', '[click me](javascript:alert(1))'],
  ['iframe-evil', '<iframe src="https://evil.com/embed/x"></iframe>'],
  ['mxss-noembed', '<noembed><img src=x onerror=alert(1)></noembed>'],
  ['mxss-noscript', '<noscript><p title="</noscript><img src=x onerror=alert(1)>">'],
  ['clobber-a-id', '<a id="location">clobber</a>'],
  ['phish-naked', 'login at https://steemil.com/login now'],
  ['comment-basic', 'hello <!-- secret --> world'],
  ['code-fence-script', '```\n<script>alert(1)</script>\n```'],
];

// ---------------------------------------------------------------------------
// 1. Script tags and inline event handlers
//    Defense target: allowedTags excludes script; allowedAttributes carries
//    no on* handlers on any tag; sanitize drops script content wholesale.
// ---------------------------------------------------------------------------
describe('sanitize pipeline: script tags and event handlers', () => {
  // 1.1 raw <script> in a raw-HTML post → dropped entirely (empty output)
  it('1.1 drops a raw <script> block and its content', () => {
    const { html } = renderPost('<script>alert(1)</script>');
    expect(html).toBe('');
    expectNoScriptTag(html);
  });

  // 1.2 <script> embedded in a markdown body → tag+content removed, prose kept
  it('1.2 strips <script> inside markdown but keeps surrounding prose', () => {
    const { html } = renderPost('hello *world* <script>alert(1)</script> bye');
    expectNoScriptTag(html);
    expect(html).toContain('hello');
    expect(html).toContain('<em>world</em>');
    expect(html).toContain('bye');
    expect(html).not.toContain('alert');
  });

  // 1.3 <html>-wrapped raw post → markdown step skipped, script still dropped
  it('1.3 strips <script> from a raw-HTML (<html>-wrapped) post', () => {
    const { html, isHtml } = renderPost(
      '<html><p>ok</p><script>alert(1)</script></html>'
    );
    expect(isHtml).toBe(true);
    expectNoScriptTag(html);
    expect(html).toContain('<p>ok</p>');
  });

  // 1.4 mixed-case tag-name evasion → still dropped
  it('1.4 strips mixed-case <ScRipt>', () => {
    const { html } = renderPost('<ScRipt>alert(1)</sCriPt>after');
    expectNoScriptTag(html);
    expect(html).toContain('after');
    expect(html).not.toContain('<s');
  });

  // 1.5 <img src=x onerror=...> raw HTML → handler stripped, src replaced
  //     with the broken-image placeholder (src fails the https? whitelist)
  it('1.5 strips onerror from a raw <img> and replaces non-http src', () => {
    const { html } = renderPost('<p><img src=x onerror=alert(1)></p>');
    expectNoEventHandlers(html);
    expect(html).not.toContain('onerror');
    expect(html).toContain('brokenimg.jpg');
    expect(html).not.toMatch(/<img[^>]*src="x"/i);
  });

  // 1.6 same vector through the markdown route (inline HTML in a paragraph)
  it('1.6 strips onerror from inline HTML inside a markdown body', () => {
    const { html } = renderPost(
      'head\n\n<img src=x onerror=alert(1)>\n\ntail'
    );
    expectNoEventHandlers(html);
    expect(html).toContain('head');
    expect(html).toContain('tail');
    expect(html).toContain('brokenimg.jpg');
  });

  // 1.7 handler on an allowed tag (<b onmouseover=…>) → tag kept, attr gone
  it('1.7 keeps allowed <b> but strips onmouseover', () => {
    const { html } = renderPost('<b onmouseover=alert(1)>bold</b>');
    expect(html).toContain('<b>bold</b>');
    expectNoEventHandlers(html);
    expect(html).not.toContain('onmouseover');
  });

  // 1.8 uppercase attribute-name evasion → still stripped
  it('1.8 strips uppercase ONERROR', () => {
    const { html } = renderPost('<img src=x ONERROR=alert(1)>');
    expectNoEventHandlers(html);
    expect(html).not.toMatch(/onerror/i);
  });

  // 1.9 onload on an otherwise-whitelisted iframe → handler gone, embed kept
  it('1.9 strips onload from a whitelisted iframe while keeping the embed', () => {
    const { html } = renderPost(
      '<iframe src="https://www.youtube.com/embed/abc" onload=alert(1)></iframe>'
    );
    expectNoEventHandlers(html);
    expect(html).toContain('<iframe');
    expect(html).toContain('https://www.youtube.com/embed/abc');
  });

  // 1.10 onclick / attacker-supplied target on an anchor → both dropped,
  //      hardening attrs re-added by the a-transform only
  it('1.10 strips onclick and attacker target from anchors', () => {
    const { html } = renderPost(
      '<a href="https://example.com" target="_parent" onclick="alert(1)">x</a>'
    );
    expectNoEventHandlers(html);
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noopener"');
    expect(html).not.toContain('_parent');
  });
});

// ---------------------------------------------------------------------------
// 2. URL scheme filtering
//    Defense target: sanitize allowedSchemes = http/https/steem/esteem, and
//    HtmlReady::link() prepends https:// to scheme-less/unknown-scheme URLs
//    (neutralizing javascript:/vbscript:/data:/ftp: into inert forms).
//    markdown-it's own validateLink additionally demotes javascript:/data:
//    markdown links to inert text.
// ---------------------------------------------------------------------------
describe('sanitize pipeline: URL scheme filtering', () => {
  // 2.1 raw anchor with javascript: href → no live javascript: URL survives
  it('2.1 neutralizes a raw javascript: href', () => {
    const { html } = renderPost('<a href="javascript:alert(1)">click</a>');
    expectNoActiveScriptUrl(html);
    expect(html).toContain('click');
    // HtmlReady prepends https:// — the result is an inert pseudo-URL.
    expect(html).not.toMatch(/href=["']?javascript:/i);
  });

  // 2.2 markdown link route → markdown-it validateLink rejects the scheme,
  //     leaving inert literal text and no anchor at all
  it('2.2 demotes a markdown javascript: link to inert text', () => {
    const { html } = renderPost('[click me](javascript:alert(1))');
    expect(html).not.toContain('<a ');
    expectNoActiveScriptUrl(html);
    expect(html).toContain('click me');
  });

  // 2.3 vbscript: scheme → same neutralization
  it('2.3 neutralizes a vbscript: href', () => {
    const { html } = renderPost('<a href="vbscript:msgbox(1)">v</a>');
    expectNoActiveScriptUrl(html);
    expect(html).not.toMatch(/href=["']?vbscript:/i);
    expect(html).toContain('>v<');
  });

  // 2.4 data:text/html payload in href → no data: URL in any href position
  it('2.4 neutralizes a data:text/html href', () => {
    const { html } = renderPost(
      '<a href="data:text/html,<script>alert(1)</script>">d</a>'
    );
    expectNoActiveScriptUrl(html);
    expectNoScriptTag(html);
    expect(html).toContain('>d<');
  });

  // 2.5 ftp:// scheme → stripped from the href (https://-prefixed inert form)
  it('2.5 does not pass an ftp: scheme through as href', () => {
    const { html } = renderPost('<a href="ftp://example.com/f">f</a>');
    expect(html).not.toMatch(/href=["']?ftp:/i);
    expect(html).toContain('>f<');
  });

  // 2.6 data:image/svg+xml markdown image (svg can carry onload) → markdown-it
  //     refuses the scheme; nothing becomes an <img>
  it('2.6 refuses a data:image/svg+xml markdown image', () => {
    const { html } = renderPost('![x](data:image/svg+xml,<svg onload=alert(1)>)');
    expect(html).not.toContain('<img');
    expectNoEventHandlers(html);
    expect(html).not.toContain('onload');
  });

  // 2.7 data: svg image via raw HTML → img transform replaces non-https src
  //     with the broken-image placeholder
  it('2.7 replaces a raw data:image/svg+xml src with the placeholder', () => {
    const { html } = renderPost(
      '<img src="data:image/svg+xml,<svg onload=alert(1)>">'
    );
    expect(html).toContain('brokenimg.jpg');
    expectNoEventHandlers(html);
    expect(html).not.toContain('onload');
  });

  // 2.8 entity-obfuscated scheme (" jav&#x09;ascript:") → decoded by the
  //     parser, then neutralized; never reaches the browser as a scheme
  it('2.8 neutralizes an entity-obfuscated scheme href', () => {
    const { html } = renderPost('<a href=" jav&#x09;ascript:alert(1)">x</a>');
    expectNoActiveScriptUrl(html);
    expect(html).toContain('>x<');
  });
});

// ---------------------------------------------------------------------------
// 3. iframe embed whitelist (exactly 6 origins — security-critical)
//    Defense target: sanitize-config iframeWhitelist; any non-matching src is
//    replaced by a "(Unsupported …)" placeholder div. The regexes are
//    anchored, so lookalike/userinfo/mxs domains must not slip through.
// ---------------------------------------------------------------------------
describe('sanitize pipeline: iframe whitelist', () => {
  // 3.1 non-whitelisted origin → placeholder, no iframe element
  it('3.1 replaces a non-whitelisted iframe with an Unsupported placeholder', () => {
    const { html, sanitizeErrors } = renderPost(
      '<iframe src="https://evil.com/embed/x"></iframe>'
    );
    expect(html).not.toContain('<iframe');
    expect(html).toContain('(Unsupported https://evil.com/embed/x)');
    expect(sanitizeErrors.some((e) => e.includes('Invalid iframe URL'))).toBe(
      true
    );
  });

  // 3.2 lookalike domain (youtube.com.evil.com) → anchor beats suffix
  it('3.2 rejects the youtube.com.evil.com lookalike', () => {
    const { html } = renderPost(
      '<iframe src="https://youtube.com.evil.com/embed/x"></iframe>'
    );
    expect(html).not.toContain('<iframe');
    expect(html).toContain('(Unsupported https://youtube.com.evil.com/embed/x)');
  });

  // 3.3 userinfo trick (evil.com@youtube.com) → anchor beats userinfo
  it('3.3 rejects the evil.com@youtube.com userinfo trick', () => {
    const { html } = renderPost(
      '<iframe src="https://evil.com@youtube.com/embed/x"></iframe>'
    );
    expect(html).not.toContain('<iframe');
    expect(html).toContain('(Unsupported https://evil.com@youtube.com/embed/x)');
  });

  // 3.4 vimeo lookalike → same
  it('3.4 rejects the player.vimeo.com.evil.com lookalike', () => {
    const { html } = renderPost(
      '<iframe src="https://player.vimeo.com.evil.com/video/1"></iframe>'
    );
    expect(html).not.toContain('<iframe');
    expect(html).toContain('(Unsupported https://player.vimeo.com.evil.com/video/1)');
  });

  // 3.5 javascript: iframe src → not in any allowed scheme, placeholder
  it('3.5 rejects a javascript: iframe src', () => {
    const { html } = renderPost('<iframe src="javascript:alert(1)"></iframe>');
    expect(html).not.toContain('<iframe');
    expectNoActiveScriptUrl(html);
    expect(html).toContain('(Unsupported javascript:alert(1))');
  });

  // 3.6-3.11 the six whitelisted origins survive, wrapped and dimensioned.
  // HtmlReady wraps them in div.videoWrapper; the transform pins dimensions
  // (480x270 for large=false) and rebuilds the attribute set from scratch.
  it('3.6 keeps a whitelisted YouTube embed and strips its query string', () => {
    const { html } = renderPost(
      '<iframe src="https://www.youtube.com/embed/abc123?autoplay=1"></iframe>'
    );
    expect(html).toContain('class="videoWrapper"');
    expect(html).toContain('src="https://www.youtube.com/embed/abc123"');
    expect(html).not.toContain('autoplay');
    expect(html).toContain('width="480"');
    expect(html).toContain('height="270"');
    expect(html).toContain('allowfullscreen');
  });

  it('3.7 keeps a whitelisted Vimeo embed with a canonical numeric src', () => {
    const { html } = renderPost(
      '<iframe src="https://player.vimeo.com/video/123"></iframe>'
    );
    expect(html).toContain('src="https://player.vimeo.com/video/123"');
    expect(html).toContain('class="videoWrapper"');
  });

  it('3.8 keeps a whitelisted 3Speak embed', () => {
    const { html } = renderPost(
      '<iframe src="https://3speak.online/embed?v=u/v"></iframe>'
    );
    expect(html).toContain('src="https://3speak.online/embed?v=u/v"');
  });

  it('3.9 keeps a whitelisted SoundCloud embed and de-arms autoplay', () => {
    const { html } = renderPost(
      '<iframe src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/19&auto_play=true"></iframe>'
    );
    expect(html).toContain('src="https://w.soundcloud.com/player/?url=');
    expect(html).toContain('auto_play=false');
    expect(html).not.toContain('auto_play=true');
  });

  it('3.10 keeps a whitelisted Twitch embed', () => {
    const { html } = renderPost(
      '<iframe src="https://player.twitch.tv/?channel=x"></iframe>'
    );
    expect(html).toContain('src="https://player.twitch.tv/?channel=x"');
  });

  it('3.11 keeps a whitelisted DTube embed', () => {
    const { html } = renderPost('<iframe src="https://emb.d.tube/#!/u/v"></iframe>');
    expect(html).toContain('src="https://emb.d.tube/#!/u/v"');
  });

  // 3.12 protocol-relative whitelisted src (legacy-permitted form) kept
  it('3.12 keeps a protocol-relative YouTube embed src', () => {
    const { html } = renderPost('<iframe src="//www.youtube.com/embed/abc"></iframe>');
    expect(html).toContain('src="//www.youtube.com/embed/abc"');
  });
});

// ---------------------------------------------------------------------------
// 4. mXSS mutation vectors
//    Defense target: parser-context confusion (noembed/xmp/textarea/noscript/
//    style CDATA/svg foreignObject/conditional comments/template/select/
//    math mglyph). The xmldom parse + serialize and the sanitize allowlist
//    together must ensure no live dangerous construct reaches the output —
//    either the content is dropped or it survives only as escaped text.
// ---------------------------------------------------------------------------
describe('sanitize pipeline: mXSS vectors', () => {
  // 4.1 noembed → content survives only as entity-escaped inert text
  it('4.1 neutralizes a noembed payload by escaping it to text', () => {
    const { html } = renderPost('<noembed><img src=x onerror=alert(1)></noembed>');
    expect(html).not.toContain('<noembed');
    expect(html).not.toContain('<img'); // no live img tag (only &lt;img)
    expect(html).toContain('&lt;img');
    expectNoEventHandlers(html);
    expectNoScriptTag(html);
  });

  // 4.2 noframes → same escaping defense
  it('4.2 neutralizes a noframes payload by escaping it to text', () => {
    const { html } = renderPost('<noframes><img src=x onerror=alert(1)></noframes>');
    expect(html).not.toContain('<noframes');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
    expectNoEventHandlers(html);
  });

  // 4.3 xmp → content dropped entirely
  it('4.3 drops an xmp payload', () => {
    const { html } = renderPost('<xmp><img src=x onerror=alert(1)></xmp>');
    expect(html).not.toContain('<xmp');
    expect(html).not.toContain('<img');
    expectNoEventHandlers(html);
  });

  // 4.4 textarea → dropped
  it('4.4 drops a textarea payload', () => {
    const { html } = renderPost('<textarea><img src=x onerror=alert(1)></textarea>');
    expect(html).not.toContain('<textarea');
    expectNoEventHandlers(html);
    expect(html).not.toContain('onerror');
  });

  // 4.5 noscript title breakout (attribute-context confusion) → no live img
  it('4.5 neutralizes the noscript attribute breakout', () => {
    const { html } = renderPost(
      '<noscript><p title="</noscript><img src=x onerror=alert(1)>">'
    );
    expect(html).not.toContain('<noscript');
    expect(html).not.toContain('<img');
    expectNoEventHandlers(html);
  });

  // 4.6 <style><![CDATA[…]]></style> → style (not an allowed tag) dropped.
  //     The CDATA absence check is case-insensitive: a mixed-case marker
  //     (`<![CDaTa[`) surviving to the output would be just as live (#4042
  //     leftover regex tightening).
  it('4.6 drops style/CDATA payloads without emitting <style or any-case CDATA', () => {
    const { html } = renderPost(
      '<style><![CDATA[<img src=x onerror=alert(1)>]]></style>'
    );
    expect(html).not.toContain('<style');
    expect(html).not.toMatch(/cdata/i);
    expectNoEventHandlers(html);
    expect(html).not.toContain('onerror');

    const mixed = renderPost(
      '<STYLE><![CDaTa[<img src=x onerror=alert(1)>]]></STYLE>'
    );
    expect(mixed.html).not.toMatch(/<style/i);
    expect(mixed.html).not.toMatch(/cdata/i);
    expectNoEventHandlers(mixed.html);
  });

  // 4.7 svg foreignObject + iframe srcdoc → srcdoc is not an allowed iframe
  //     attribute; the attribute-less iframe degrades to a placeholder
  it('4.7 strips an iframe srcdoc inside svg foreignObject', () => {
    const { html } = renderPost(
      '<svg><foreignObject><iframe srcdoc="&lt;script&gt;alert(1)&lt;/script&gt;"></iframe></foreignObject></svg>'
    );
    expect(html).not.toContain('srcdoc');
    expect(html).not.toContain('<iframe');
    expect(html).toContain('Unsupported');
    expectNoScriptTag(html);
  });

  // 4.8 conditional-comment breakout `<!--[if]>…<script-->` → comment strip
  //     runs first; remains inert escaped text, no comment syntax survives
  it('4.8 neutralizes the conditional-comment breakout', () => {
    const { html } = renderPost('<!--[if]><script>alert(1)</script-->');
    expect(html).not.toContain('<!--');
    expectNoScriptTag(html);
    expectNoEventHandlers(html);
  });

  // 4.9 template → dropped
  it('4.9 drops a template payload', () => {
    const { html } = renderPost('<template><script>alert(1)</script></template>');
    expect(html).not.toContain('<template');
    expectNoScriptTag(html);
  });

  // 4.10 select/style re-parse confusion → dropped
  it('4.10 drops the select/style confusion payload', () => {
    const { html } = renderPost(
      '<select><option><style></select></style><img src=x onerror=alert(1)></option></select>'
    );
    expect(html).not.toContain('<select');
    expect(html).not.toContain('<style');
    expect(html).not.toContain('<img');
    expectNoEventHandlers(html);
  });

  // 4.11 math/mglyph (classic Chrome mXSS) → dropped
  it('4.11 drops the math/mglyph payload', () => {
    const { html } = renderPost(
      '<math><mglyph><style><img src=x onerror=alert(1)></style></mglyph></math>'
    );
    expect(html).not.toContain('<math');
    expectNoEventHandlers(html);
    expect(html).not.toContain('onerror');
  });

  // 4.12 svg animate href injection → dropped with the svg subtree
  it('4.12 drops an svg animate href injection', () => {
    const { html } = renderPost(
      '<svg><animate attributeName="href" values="javascript:alert(1)"/></svg>'
    );
    expect(html).not.toContain('<svg');
    expect(html).not.toContain('<animate');
    expectNoActiveScriptUrl(html);
  });

  // 4.13 form/input image with javascript src → whole subtree dropped
  it('4.13 drops a form/input javascript src', () => {
    const { html } = renderPost(
      '<form><input type="image" src="javascript:alert(1)"></form>'
    );
    expect(html).not.toContain('<form');
    expect(html).not.toContain('<input');
    expectNoActiveScriptUrl(html);
  });
});

// ---------------------------------------------------------------------------
// 5. DOM clobbering
//    Defense target: allowedAttributes has no id/name on any tag, so anchors
//    named "location"/images named "body" cannot clobber document globals.
// ---------------------------------------------------------------------------
describe('sanitize pipeline: DOM clobbering', () => {
  // 5.1 <a id="location"> → id stripped
  it('5.1 strips id attributes from anchors', () => {
    const { html } = renderPost('<a id="location">clobber</a>');
    expect(html).not.toMatch(/\sid\s*=/i);
    expect(html).not.toContain('location');
    expect(html).toContain('clobber');
  });

  // 5.2 <img name="body"> → name stripped
  it('5.2 strips name attributes from images', () => {
    const { html } = renderPost('<img name="body" src="https://example.com/x.png">');
    expect(html).not.toMatch(/\sname\s*=/i);
    expect(html).toContain('src="https://example.com/x.png"');
  });

  // 5.3/5.4 pin the S7 gap from audit #4042: tags WITHOUT a transformTags
  // entry (p, h1, …) also have no allowedAttributes entry, so ALL their
  // attributes are dropped. A future widening of allowedAttributes (e.g.
  // adding a global id, or re-enabling handlers on some tag) must turn
  // these red — previously these relaxations would have gone unpinned.
  it('5.3 strips id from a non-transform tag (<p id="location">)', () => {
    const { html } = renderPost('<p id="location">clobber</p>');
    expect(html).not.toMatch(/\sid\s*=\s*["']?location/i);
    expect(html).toContain('<p>clobber</p>');
  });

  it('5.4 strips event handlers from a non-transform tag (<h1 onclick>)', () => {
    const { html } = renderPost('<h1 onclick="alert(1)">Title</h1>');
    expectNoEventHandlers(html);
    expect(html).not.toContain('onclick');
    expect(html).toContain('<h1>Title</h1>');
  });

  // 5.5 the HTML5 solidus attribute separator must not smuggle an attribute
  // past the filters (#4042 leftover regex tightening): `<img src=x/onerror=…`
  // is an onerror attribute under HTML5 tokenization.
  it('5.5 neutralizes solidus-separated attribute payloads', () => {
    const { html } = renderPost('<html><img src=x/onerror=alert(1)></html>');
    expectNoEventHandlers(html);
    expect(html).not.toContain('<img');
    const { html: mdRoute } = renderPost('head\n\n<a/href="javascript:alert(1)">x</a>\n\ntail');
    expectNoActiveScriptUrl(mdRoute);
    expect(mdRoute).not.toContain('<a');
  });
});

// ---------------------------------------------------------------------------
// 6. Phishing defenses
//    Defense target: HtmlReady::link() unlinks anchors whose text looks like
//    steemit.com but whose href is not; linkify() refuses to linkify
//    blacklist domains, emitting a phishy div instead.
// ---------------------------------------------------------------------------
describe('sanitize pipeline: phishing defenses', () => {
  // 6.1 naked blacklisted domain (steemil.com) → never becomes a link
  it('6.1 refuses to linkify a blacklisted domain', () => {
    const { html } = renderPost('login at https://steemil.com/login now');
    expect(html).toContain('class="phishy"');
    expect(html).toContain('possible phishing attempt');
    expect(html).not.toContain('href="https://steemil.com');
  });

  // 6.2 markdown link with steemit-looking text to a blacklisted host →
  //     unlinked into a phishy div
  it('6.2 unlinks a steemit.com-text link to a blacklisted host', () => {
    const { html } = renderPost('[steemit.com wallet](https://steewit.com)');
    expect(html).toContain('class="phishy"');
    expect(html).not.toContain('href="https://steewit.com"');
    expect(html).toContain('steewit.com');
  });

  // 6.3/6.4 lookalike SUFFIX domain (steemit.com.evil.com). Characterization,
  // deliberately pinned: legacy-parity behavior is that the un-link heuristic
  // matches the href by PREFIX (https://steemit.com…), so this domain is not
  // unlinked and — because sanitize's a-transform also prefix-matches — it is
  // treated as an internal steemit link (no external warning, no noopener).
  // This is a known legacy limitation (byte-identical to condenser-legacy by
  // scripts/compare-render-pipeline.ts). The test pins it so that any change
  // here — fix or further regression — surfaces for explicit security review.
  it('6.3 pins current handling of the steemit.com.evil.com lookalike (naked URL)', () => {
    const { html } = renderPost('login at https://steemit.com.evil.com now');
    expectNoScriptTag(html);
    expectNoEventHandlers(html);
    expect(html).toContain('href="https://steemit.com.evil.com"');
  });

  it('6.4 pins current handling of the steemit.com.evil.com lookalike (markdown link)', () => {
    const { html } = renderPost('[steemit.com](https://steemit.com.evil.com)');
    expectNoScriptTag(html);
    expectNoEventHandlers(html);
    expect(html).toContain('href="https://steemit.com.evil.com"');
  });
});

// ---------------------------------------------------------------------------
// 7. HTML comment stripping ("JS-DOS" mitigation) — runs FIRST, before
//    markdown-it, so comment-borne payloads never reach the parser as markup.
// ---------------------------------------------------------------------------
describe('sanitize pipeline: HTML comment stripping', () => {
  // 7.1 plain comment → replaced with marker text, no comment syntax out
  it('7.1 strips a plain HTML comment', () => {
    const { html } = renderPost('hello <!-- secret --> world');
    expect(html).not.toContain('<!--');
    expect(html).not.toContain('-->');
    expect(html).toContain('html comment removed');
    expect(html).toContain('hello');
    expect(html).toContain('world');
  });

  // 7.2 bogus/conditional `<!-->` → consumed, rest of the post intact
  it('7.2 consumes the <!--> bogus comment form', () => {
    const { html } = renderPost('a <!--> b');
    expect(html).not.toContain('<!--');
    expect(html).toContain('a');
    expect(html).toContain('b');
  });

  // 7.3 unterminated comment (no -->) → still stripped to end of input
  it('7.3 consumes an unterminated comment to end of input', () => {
    const { html } = renderPost('keep <!-- <script>alert(1)</script>');
    expect(html).not.toContain('<!--');
    expectNoScriptTag(html);
    expect(html).toContain('keep');
  });
});

// ---------------------------------------------------------------------------
// 8. Deep-recursion fail-safe
//    Defense target: htmlReady catches parse/traverse errors and returns
//    empty output; pathological nesting must degrade, never throw.
// ---------------------------------------------------------------------------
describe('sanitize pipeline: deep-recursion fail-safe', () => {
  // 8.1 50k-deep nesting via the raw-HTML route → no throw, empty output
  //     (htmlReady's catch converts the stack overflow into '')
  it('8.1 does not throw on 50000-level nesting and degrades to empty output', () => {
    const deep =
      '<html>' + '<div>'.repeat(50000) + 'x' + '</div>'.repeat(50000) + '</html>';
    let result: ReturnType<typeof renderPost>;
    expect(() => {
      result = renderPost(deep);
    }).not.toThrow();
    expect(result!.html).toBe('');
    expectNoScriptTag(result!.html);
  }, 30000);

  // 8.2 same depth through the markdown route → also must not throw
  it('8.2 does not throw on deeply nested markdown-route input', () => {
    const deep = '<div>'.repeat(50000) + 'x' + '</div>'.repeat(50000);
    let result: ReturnType<typeof renderPost>;
    expect(() => {
      result = renderPost(deep);
    }).not.toThrow();
    expect(typeof result!.html).toBe('string');
    expectNoScriptTag(result!.html);
  }, 30000);
});

// ---------------------------------------------------------------------------
// 9. Nested code spans/fences (audit F36 re-check)
//    Defense target: markdown-it entity-escapes HTML inside code, so payloads
//    in code position render as inert text; HtmlReady's linkify skips text
//    inside <code>. The escape must hold across every nesting shape.
// ---------------------------------------------------------------------------
describe('sanitize pipeline: nested code escaping (audit F36)', () => {
  // 9.1 inline code span containing <script> → escaped inside <code>
  it('9.1 entity-escapes <script> inside an inline code span', () => {
    const { html } = renderPost('`<script>alert(1)</script>`');
    expect(html).toContain('<code>');
    expect(html).toContain('&lt;script&gt;');
    expectNoScriptTag(html);
  });

  // 9.2 fenced block containing <script> → escaped inside pre/code
  it('9.2 entity-escapes <script> inside a fenced code block', () => {
    const { html } = renderPost('```\n<script>alert(1)</script>\n```');
    expect(html).toContain('<pre><code>');
    expect(html).toContain('&lt;script&gt;');
    expectNoScriptTag(html);
  });

  // 9.3 inline code with img/onerror → escaped, no live handler
  it('9.3 entity-escapes an img/onerror payload in inline code', () => {
    const { html } = renderPost('`<img src=x onerror=alert(1)>`');
    expect(html).toContain('&lt;img');
    expectNoEventHandlers(html);
    expect(html).not.toContain('<img');
  });

  // 9.4 fence mixing a javascript: anchor and a script → both escaped
  it('9.4 entity-escapes mixed payloads inside one fence', () => {
    const { html } = renderPost(
      '```html\n<a href="javascript:alert(1)">x</a>\n<script>alert(1)</script>\n```'
    );
    // markdown-it escapes < > & in code but keeps raw quotes in text.
    expect(html).toContain('&lt;a href="javascript:alert(1)"&gt;');
    expect(html).toContain('&lt;script&gt;');
    expectNoScriptTag(html);
    expectNoActiveScriptUrl(html);
  });

  // 9.5 four-backtick fence containing a three-backtick fence → inner fence
  //     stays literal text, escaping still holds
  it('9.5 keeps an inner fence literal inside an outer fence', () => {
    const { html } = renderPost('````\n```\ncode\n```\n````');
    expect(html).toContain('<pre><code>');
    expect(html).toContain('```');
  });

  // 9.6 two-backtick span containing a one-backtick span with <script>
  it('9.6 escapes a script inside nested backtick spans', () => {
    const { html } = renderPost('``a `<script>` b``');
    expect(html).toContain('&lt;script&gt;');
    expectNoScriptTag(html);
  });

  // 9.7 unterminated code span → markdown-it fallback leaves no live markup
  it('9.7 leaves no live script from an unterminated code span', () => {
    const { html } = renderPost('``<script>alert(1)`');
    expectNoScriptTag(html);
    expectNoEventHandlers(html);
  });

  // 9.8 fence containing an HTML comment and an img/onerror → the comment is
  //     stripped pre-parse (step 2), the img payload stays escaped text
  it('9.8 strips comments before parsing and keeps fence payloads escaped', () => {
    const { html } = renderPost(
      '```\n<!-- --> <img src=x onerror=alert(1)>\n```'
    );
    expect(html).not.toContain('<!--');
    expect(html).toContain('&lt;img');
    expectNoEventHandlers(html);
  });
});

// ---------------------------------------------------------------------------
// 10. Benign content (positive path)
//     Defense target: the filter must not over-block — normal markdown and
//     hardening attributes are the contract law-abiding posts rely on.
// ---------------------------------------------------------------------------
describe('sanitize pipeline: benign content passes through', () => {
  it('10.1 preserves standard markdown structures', () => {
    const { html } = renderPost(
      '# Title\n\n**bold** _italic_ `code`\n\n> quote\n\n- a\n- b\n\n[link](/trending/steem)'
    );
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
    expect(html).toContain('<code>code</code>');
    expect(html).toContain('<blockquote>');
    expect(html).toContain('<li>a</li>');
    expect(html).toContain('href="/trending/steem"');
  });

  it('10.2 hardens external links but not steemit.com links', () => {
    const { html } = renderPost(
      '[ext](https://example.com/page) and [int](https://steemit.com/@alice)'
    );
    expect(html).toContain('href="https://example.com/page"');
    expect(html).toContain('rel="noopener"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('href="https://steemit.com/@alice"');
    // Internal link gets no external-link warning.
    const intLink = html.substring(html.indexOf('https://steemit.com/@alice'));
    expect(intLink).not.toContain('This link will take you away');
  });
});

// ---------------------------------------------------------------------------
// 11. Secondary-trap boundary (component layer)
//     MarkdownViewer refuses to render anything matching /<\s*script/gi after
//     sanitize (MarkdownViewer.tsx:105-108). That refusal lives in the
//     component; what the lib layers owe it is that clean output never trips
//     the predicate. Sweeping the whole corpus asserts exactly that.
// ---------------------------------------------------------------------------
describe('sanitize pipeline: secondary-trap boundary', () => {
  it('11.1 sanitize output for the whole corpus never trips the component trap', () => {
    for (const [name, payload] of corpus) {
      const { clean } = renderPost(payload);
      expect(trapRefuses(clean), `corpus case "${name}" tripped the trap`).toBe(
        false
      );
      expectNoScriptTag(clean);
    }
  });

  it('11.2 trap predicate itself mirrors MarkdownViewer.tsx:105', () => {
    // Sanity-check the mirrored predicate against its known semantics.
    expect(trapRefuses('<script>x</script>')).toBe(true);
    expect(trapRefuses('<ScRipt>x')).toBe(true);
    expect(trapRefuses('< script>x')).toBe(true); // the \s* in the regex
    expect(trapRefuses('&lt;script&gt;')).toBe(false); // escaped text is fine
    expect(trapRefuses('<p>ok</p>')).toBe(false);
  });
});
