import type { NextConfig } from "next";

// Baseline security response headers (audit N-02). Applied to every route,
// including /api/* route handlers and immutable static assets under
// /_next/static - none of these directives alter JSON bodies or asset
// delivery, so a single catch-all rule is safe.
//
// The Content-Security-Policy here is deliberately minimal: only directives
// that need no per-request nonce infrastructure (frame-ancestors / object-src
// / base-uri / form-action). A full CSP with script-src etc. requires nonce
// plumbing through the render pipeline and must be coordinated with the
// anonymous-page public caching work (PR #4032); tracked as a follow-up.
export const securityHeaders = [
  // Clickjacking: refuse to be framed at all (the app never embeds itself;
  // post-body embeds are iframes we render, not the reverse). Modern
  // browsers prefer the CSP frame-ancestors directive below, this covers
  // the rest.
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
  // Minimal CSP - see comment above for why script/style/img directives
  // are out of scope here.
  {
    key: 'Content-Security-Policy',
    value:
      "frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self'",
  },
];

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Do not advertise the server framework (removes X-Powered-By header)
  poweredByHeader: false,
  // Enable React strict mode
  reactStrictMode: true,
  
  // Configure images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'steemitimages.com',
      },
      {
        protocol: 'https',
        hostname: 'steemit-dev-imagehoster-001.us-east-1.elasticbeanstalk.com',
      },
    ],
  },
  
  // Server external packages (moved from experimental)
  serverExternalPackages: ['@steemit/steem-js'],

  // Dev-only: extra origins allowed to reach the dev server (HMR websocket
  // included). Next.js blocks non-localhost dev origins by default; set
  // NEXT_DEV_ALLOWED_ORIGINS="192.168.1.10,host.local" when accessing the
  // dev server from another machine on the LAN.
  allowedDevOrigins: process.env.NEXT_DEV_ALLOWED_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean),
  
  // Turbopack configuration (Next.js 16 default)
  turbopack: {
    // Empty config to silence warning
  },
  
  // Transpile packages if needed
  transpilePackages: [],

  // Legacy URL aliases (legacy ResolveRoute.js mapped /login.html to the
  // login page, and hosted the help/legal pages at .html paths). Declared
  // here rather than in proxy.ts so the redirects are evaluated before the
  // route-resolution proxy.
  async redirects() {
    return [
      {
        source: '/login.html',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/faq.html',
        destination: '/faq',
        permanent: true,
      },
      {
        source: '/privacy.html',
        destination: '/privacy',
        permanent: true,
      },
      {
        source: '/tos.html',
        destination: '/tos',
        permanent: true,
      },
    ];
  },

  // Baseline security response headers on every route, including /api/*
  // route handlers and static assets (audit N-02). See securityHeaders.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
