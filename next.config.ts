import type { NextConfig } from "next";

// Baseline security response headers (audit N-02). Defined in
// lib/security-headers.ts so proxy.ts can apply the same set to responses it
// issues itself (redirects), which this headers() table does not cover.
//
// The Content-Security-Policy is NOT set here anymore: it is nonce-based and
// built per request in lib/csp.ts, set by proxy.ts (see audit N-02 follow-up).
// Routes excluded from the proxy matcher (api / _next static / favicon) do
// not get a CSP — none of them serve documents.
import { securityHeaders } from "./lib/security-headers";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Do not advertise the server framework (removes X-Powered-By header)
  poweredByHeader: false,
  // Disable Next's implicit trailing-slash 308 redirect: it fires BEFORE the
  // proxy (and before next.config headers() apply), so it carries no
  // security headers. With this flag, proxy.ts issues that redirect itself
  // with the full header set (audit N-02 follow-up). Caveat: paths outside
  // the proxy matcher (api / _next static / favicon) with a trailing slash
  // now 404 instead of redirecting — the app's own clients never call those
  // with a trailing slash.
  skipTrailingSlashRedirect: true,
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
