import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
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
  
  // Turbopack configuration (Next.js 16 default)
  turbopack: {
    // Empty config to silence warning
  },
  
  // Transpile packages if needed
  transpilePackages: [],

  // Legacy URL aliases (legacy ResolveRoute.js mapped /login.html to the
  // login page). Declared here rather than in proxy.ts so the redirect is
  // evaluated before the route-resolution proxy.
  async redirects() {
    return [
      {
        source: '/login.html',
        destination: '/login',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
