import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
interface AdItem {
  enable: boolean;
  img: string;
  tag: string;
  url: string;
}

interface AdState {
  indexLeftSideAdList: AdItem[];
  postLeftSideAdList: AdItem[];
  rightSideAdList: AdItem[];
  bottomAdList: AdItem[];
}

const initialState: AdState = {
  indexLeftSideAdList: [
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
  ],
  postLeftSideAdList: [
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
  ],
  rightSideAdList: [],
  bottomAdList: [
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
  ],
};

const adSlice = createSlice({
  name: 'ad',
  initialState,
  reducers: {
    // No actions in original reducer, but structure is ready for future additions
  },
});

export default adSlice.reducer;
