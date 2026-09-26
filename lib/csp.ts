/**
 * Content-Security-Policy construction (audit N-02 follow-up, #4034 leftover).
 *
 * The policy is nonce-based: proxy.ts generates a fresh nonce per request,
 * sets the policy on BOTH the request headers (that is how the Next.js render
 * pipeline discovers the nonce and stamps it onto the framework/bootstrap
 * scripts it emits — see the Next.js "Content Security Policy" guide) and the
 * response. All routes render per-request (app/layout.tsx
 * `dynamic = 'force-dynamic'`), so no static page is ever served with a stale
 * nonce.
 *
 * Coordination note (PR #4032): that PR made anonymous post pages publicly
 * cacheable on the LEGACY (master branch) stack, where it had to fall back to
 * a placeholder nonce for cacheable responses. The Next.js rewrite emits no
 * public Cache-Control on HTML and renders every request dynamically, so a
 * per-request nonce has no cache to break here — the full policy below is
 * safe without any cache coordination.
 *
 * Directive rationale (mirrors the legacy production helmet config in
 * condenser-legacy/config/production.json where the feature set is the same,
 * tightened where this stack allows):
 *  - script-src 'strict-dynamic': host allowlists are ignored in favour of
 *    nonce propagation, which is what keeps runtime-injected first-party
 *    scripts working (the vendored /js/tron-ads-sdk loader in
 *    components/elements/TronAd.tsx is injected by the (nonced) app bundle).
 *    The Google tag manager hosts stay listed for pre-strict-dynamic
 *    browsers; app/layout.tsx also stamps its SSR gtag tags with the nonce.
 *    'unsafe-eval' is appended in development only (React dev tools eval).
 *  - style-src allows the Google Fonts stylesheet plus nonced Next.js inline
 *    styles; style-src-attr keeps React `style={{…}}` attributes working
 *    (legacy allowed 'unsafe-inline' for the whole style-src — this is
 *    strictly tighter for <style> elements).
 *  - img-src * data: post bodies embed arbitrary third-party images (only
 *    first-party ones are proxied through steemitimages.com), same as legacy.
 *  - frame-src enumerates the 6 embed origins of lib/sanitize-config.ts's
 *    iframe whitelist (derived from its exported IFRAME_EMBED_HOSTS, so the
 *    two layers cannot drift) plus the TronAd engine origin for the
 *    CONFIGURED env (lib/ads.ts configuredTronAdsEngineOrigin) — a second,
 *    independent layer over the render-pipeline whitelist.
 *  - connect-src 'self' (all chain/auth traffic goes through /api) plus GA
 *    collect endpoints when GA is configured, plus the image-upload endpoint
 *    origin — the SDC_UPLOAD_IMAGE_URL origin when set, else the same
 *    DEFAULT_UPLOAD_URL fallback lib/media/upload-image.ts posts to (legacy
 *    always allowed the upload host). `ws:` is appended in development for
 *    the HMR websocket.
 *  - media-src stays 'self': legacy production helmet additionally listed
 *    gateway.pinata.cloud, but that entry is dead on this stack — the
 *    sanitize whitelist (allowedTags, ported from master) has no
 *    video/audio/source/track tags, so post bodies cannot emit media
 *    elements at all, and legacy's IPFS-gateway URL rewriting
 *    (HtmlReady ipfsPrefix) is disabled there too (ipfs_prefix: false in
 *    every shipped condenser-legacy config) and a pass-through here
 *    (lib/html-ready.ts). Pinning 'self' keeps the directive total while
 *    dropping an origin nothing can load from.
 *  - upgrade-insecure-requests is deliberately omitted: dev runs on plain
 *    HTTP and HSTS already pins production clients to HTTPS.
 */

import { configuredTronAdsEngineOrigin } from '@/lib/ads';
import { DEFAULT_UPLOAD_URL } from '@/lib/media/upload-url';
import { IFRAME_EMBED_HOSTS } from '@/lib/sanitize-config';

/** CSPRNG nonce, base64-encoded (matches the Next.js guide's pattern). */
export function generateCspNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString('base64');
}

/** Origins of the GA tag/collect endpoints, used when GA is configured. */
const GA_SCRIPT_ORIGINS = [
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
];

/**
 * Origin of the upload endpoint. Falls back to the DEFAULT_UPLOAD_URL
 * constant shared with lib/media/upload-image.ts, mirroring the client's
 * fallback when SDC_UPLOAD_IMAGE_URL is unset — whatever origin uploads
 * actually target must be in connect-src or the upload fetch is blocked.
 */
function uploadOrigin(): string | null {
  const raw = process.env.SDC_UPLOAD_IMAGE_URL || DEFAULT_UPLOAD_URL;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Build the CSP header value for one request. Pure apart from the env reads
 * documented above. Those differ by name: the SDC_* reads are plain
 * server-side runtime values (proxy runs on the Node.js runtime), but the
 * NEXT_PUBLIC_TRONADS_ENV lookup via configuredTronAdsEngineOrigin follows
 * NEXT_PUBLIC_* semantics — Next.js's getDefineEnv (Turbopack) inlines any
 * such var set in the build environment into the nodejs bundle too, so the
 * value here is a baked-in build-time literal unless the build left the
 * variable unset (in which case the runtime value applies here while the
 * browser keeps its inlined default — see docs/CONFIGURATION.md).
 */
export function buildCspHeaderValue(nonce: string): string {
  const isDev = process.env.NODE_ENV === 'development';
  const gaEnabled = Boolean(process.env.SDC_GOOGLE_ANALYTICS_ID);

  const scriptSources = ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'"];
  if (gaEnabled) scriptSources.push(...GA_SCRIPT_ORIGINS);
  if (isDev) scriptSources.push("'unsafe-eval'");

  const connectSources = ["'self'"];
  if (gaEnabled) connectSources.push('https://www.google-analytics.com', 'https://*.google-analytics.com');
  const upload = uploadOrigin();
  if (upload) connectSources.push(upload);
  if (isDev) connectSources.push('ws:'); // HMR websocket (plain-HTTP dev server)

  // frame-src: DERIVED from sanitize-config's exported embed whitelist (a
  // literal copy here would be a third place to forget) plus the TronAd
  // engine origin for the configured env only. The vendored SDK hardcodes
  // BOTH engine hosts and picks per `env === 1` (see lib/ads.ts), so a
  // policy that matches the deployment lists exactly one of them.
  const frameSources = [
    "'self'",
    ...IFRAME_EMBED_HOSTS.map((host) => `https://${host}`),
    configuredTronAdsEngineOrigin(),
  ];

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSources.join(' ')}`,
    // Google Fonts stylesheet (layout.tsx <link>) + nonced Next inline
    // styles. In development Next's devtools/HMR runtime injects <style>
    // elements (e.g. the next/font @font-face) at runtime without a nonce —
    // the framework's own CSP guide therefore uses 'unsafe-inline' for
    // styles in dev. A nonce and 'unsafe-inline' cannot coexist (the nonce
    // disables the keyword), so dev drops the nonce from this directive;
    // production stays nonce-only. This mirrors the Next.js CSP guide's
    // dev/prod split.
    isDev
      ? "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com"
      : `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
    // React style={{…}} attributes; nonce in style-src would block them.
    "style-src-attr 'unsafe-inline'",
    'img-src * data:',
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src ${connectSources.join(' ')}`,
    `frame-src ${frameSources.join(' ')}`,
    // 'self' only — see the media-src rationale in the module comment (the
    // legacy gateway.pinata.cloud entry is dead on this stack: no media
    // elements survive sanitize, no IPFS gateway rewriting).
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ];
  return directives.join('; ');
}
