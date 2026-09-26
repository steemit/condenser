/**
 * Static promotional ad lists (legacy src/app/redux/adReducer.js defaults).
 * Each entry renders as one slide in the AdSwipe carousel; clicks are
 * reported via overseer recordAdsView.
 */

export interface AdItem {
  enable: boolean;
  img: string;
  tag: string;
  url: string;
}

/** Right-rail carousel on feed/index pages. */
export const INDEX_LEFT_SIDE_AD_LIST: AdItem[] = [
  {
    enable: true,
    img: '/images/tron-steem-240_240.png',
    tag: 'SteemTron240*240',
    url: '/steemit/@steemitblog/the-trx-and-steemit-integration-is-now-live',
  },
  {
    enable: true,
    img: '/images/dlive.png',
    tag: 'SteemitDlivebanner240*240',
    url: 'https://go.dlive.tv/steemit-dlive/',
  },
  {
    enable: true,
    img: '/images/justswap-sider.png',
    tag: 'JustswapBanner240*240',
    url: 'https://justswap.io/#/home',
  },
];

/** Carousel on post pages (same 240x240 creative, post-scoped tags). */
export const POST_LEFT_SIDE_AD_LIST: AdItem[] = [
  {
    enable: true,
    img: '/images/tron-steem-240_240.png',
    tag: 'SteemTron240*240',
    url: '/steemit/@steemitblog/the-trx-and-steemit-integration-is-now-live',
  },
  {
    enable: true,
    img: '/images/dlive.png',
    tag: 'SteemitDlivebanner240*240Post',
    url: 'https://go.dlive.tv/steemit-dlive/',
  },
  {
    enable: true,
    img: '/images/justswap-sider.png',
    tag: 'JustswapBanner240*240Post',
    url: 'https://justswap.io/#/home',
  },
];

/** Wide banner below the post body (864x86). */
export const BOTTOM_AD_LIST: AdItem[] = [
  {
    enable: true,
    img: '/images/poloniex.png',
    tag: 'SteemitPoloniexbanner864*86Post',
    url: 'https://poloniex.com/',
  },
  {
    enable: true,
    img: '/images/justswap.png',
    tag: 'JustswapBanner864*86Post',
    url: 'https://justswap.io/#/home',
  },
];

/**
 * Tron ad network configuration (legacy tronads_* env mapping,
 * config/custom-environment-variables.json).
 */

/**
 * Vendored SDK env value that selects the TEST engine host
 * (public/js/tron-ads-sdk-1.0.49.js: `1 === options.env ?
 * 'https://test-engine.tronads.io/…' : 'https://engine.tronads.io/…'`).
 */
export const TRONADS_TEST_ENV = 1;

/** Engine origins hardcoded in the vendored SDK, keyed by env. */
const TRONADS_ENGINE_ORIGIN = 'https://engine.tronads.io';
const TRONADS_TEST_ENGINE_ORIGIN = 'https://test-engine.tronads.io';

/** Configured env value (NEXT_PUBLIC_TRONADS_ENV, legacy tronads_env). */
export function tronAdsEnvValue(): number {
  return Number(process.env.NEXT_PUBLIC_TRONADS_ENV ?? 0);
}

/**
 * Engine origin the vendored SDK loads its ad iframes from for a given env.
 * Shared with lib/csp.ts so frame-src lists exactly the origin the SDK will
 * use under the configured env — not both hardcoded hosts in every policy.
 */
export function tronAdsEngineOrigin(env: number): string {
  return env === TRONADS_TEST_ENV
    ? TRONADS_TEST_ENGINE_ORIGIN
    : TRONADS_ENGINE_ORIGIN;
}

/** Engine origin for the CONFIGURED env (what TronAd slots will embed). */
export function configuredTronAdsEngineOrigin(): string {
  return tronAdsEngineOrigin(tronAdsEnvValue());
}

export const tronAdsConfig = {
  enabled: ['1', 'true'].includes(
    (process.env.NEXT_PUBLIC_TRONADS_ENABLED ?? '').toLowerCase()
  ),
  env: tronAdsEnvValue(),
  isMock: Number(process.env.NEXT_PUBLIC_TRONADS_MOCK ?? 0),
  sidebarPid: process.env.NEXT_PUBLIC_TRONADS_SIDEBAR_AD_PID ?? '',
  contentPcPid: process.env.NEXT_PUBLIC_TRONADS_CONTENT_PC_AD_PID ?? '',
  contentMobilePid: process.env.NEXT_PUBLIC_TRONADS_CONTENT_MOBILE_AD_PID ?? '',
};
