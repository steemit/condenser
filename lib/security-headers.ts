/**
 * Baseline security response headers (audit N-02), shared between
 * next.config.ts `headers()` (applies them to every route, including /api/*
 * route handlers and static assets) and proxy.ts (applies them to responses
 * it issues itself — redirects — which the next.config headers table does not
 * cover).
 *
 * The Content-Security-Policy deliberately does NOT live here: it requires a
 * per-request nonce, so it is built per request in lib/csp.ts and set by
 * proxy.ts (see audit N-02 follow-up / #4034 leftover). All routes render
 * per-request (app/layout.tsx `dynamic = 'force-dynamic'`), so every document
 * request passes through proxy.ts and gets the nonce-based policy.
 */

export interface SecurityHeader {
  key: string;
  value: string;
}

export const securityHeaders: SecurityHeader[] = [
  // Clickjacking: refuse to be framed at all (the app never embeds itself;
  // post-body embeds are iframes we render, not the reverse). Modern
  // browsers prefer the CSP frame-ancestors directive (set by proxy.ts),
  // this covers the rest.
  { key: 'X-Frame-Options', value: 'DENY' },
  // MIME sniffing: stop browsers re-interpreting declared content types.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Referrer leakage: full URL same-origin, origin-only cross-origin,
  // nothing on downgrade.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Permission hardening: the app uses no camera/mic/geolocation, so
  // disable the APIs outright instead of leaving them promptable.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  // Force HTTPS for a year on all subdomains once a client has seen the
  // site over HTTPS. Ignored by browsers on plain-HTTP responses, so local
  // dev over http://localhost is unaffected.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  // Cross-Origin-Opener-Policy (audit N-02 follow-up, #4034 leftover):
  // isolate this document's browsing-context group from cross-origin
  // openers, cutting off window.opener-based XS-Leaks / tab-nabbing from any
  // external page that opens us. Safe for this app: every window.open call
  // site (signup / wallet / share / mobile links, audit N-23) already passes
  // noopener,noreferrer, and login is an in-app posting-key challenge —
  // there is no OAuth popup flow that needs an opener relationship. COOP
  // does not affect iframes (post-body embeds), only top-level windows.
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

/** Apply the baseline security headers to a response (idempotent overwrite). */
export function applySecurityHeaders(response: Headers): void {
  for (const { key, value } of securityHeaders) {
    response.set(key, value);
  }
}
