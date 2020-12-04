import { Map, List } from 'immutable';

export const defaultState = Map({
    indexLeftSideAdList: List([
        Map({
            enable: true,
            img: '/images/tron-steem-240_240.png',
            tag: 'SteemTron240*240',
            url:
                '/steemit/@steemitblog/the-trx-and-steemit-integration-is-now-live',
        }),
        Map({
            enable: true,
            img: '/images/dlive.png',
            tag: 'SteemitDlivebanner240*240',
            url: 'https://go.dlive.tv/steemit-dlive/',
        }),
        Map({
            enable: true,
            img: '/images/justswap-sider.png',
            tag: 'JustswapBanner240*240',
            url: 'https://justswap.io/#/home',
        }),
    ]),
    postLeftSideAdList: List([
        Map({
            enable: true,
            img: '/images/dlive.png',
            tag: 'SteemitDlivebanner240*240Post',
            url: 'https://go.dlive.tv/steemit-dlive/',
        }),
        Map({
            enable: true,
            img: '/images/justswap-sider.png',
            tag: 'JustswapBanner240*240Post',
            url: 'https://justswap.io/#/home',
        }),
    ]),
    rightSideAdList: [],
    bottomAdList: List([
        Map({
            enable: true,
            img: '/images/poloniex.png',
            tag: 'SteemitPoloniexbanner864*86Post',
            url: 'https://poloniex.com/',
        }),
        Map({
            enable: true,
            img: '/images/justswap.png',
            tag: 'JustswapBanner864*86Post',
            url: 'https://justswap.io/#/home',
        }),
    ]),
});

export default function reducer(state = defaultState, action = {}) {
    switch (action.type) {
        default:
            return state;
    }
}
