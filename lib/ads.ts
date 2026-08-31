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
export const tronAdsConfig = {
  enabled: ['1', 'true'].includes(
    (process.env.NEXT_PUBLIC_TRONADS_ENABLED ?? '').toLowerCase()
  ),
  env: Number(process.env.NEXT_PUBLIC_TRONADS_ENV ?? 0),
  isMock: Number(process.env.NEXT_PUBLIC_TRONADS_MOCK ?? 0),
  sidebarPid: process.env.NEXT_PUBLIC_TRONADS_SIDEBAR_AD_PID ?? '',
  contentPcPid: process.env.NEXT_PUBLIC_TRONADS_CONTENT_PC_AD_PID ?? '',
  contentMobilePid: process.env.NEXT_PUBLIC_TRONADS_CONTENT_MOBILE_AD_PID ?? '',
};
