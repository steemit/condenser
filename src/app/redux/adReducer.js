import { Map, List } from 'immutable';

export const defaultState = Map({
    indexLeftSideAdList: List([
        Map({
            enable: true,
            img: '/images/dlive.png',
            tag: 'SteemitDlivebanner240*240',
            url: 'https://go.dlive.tv/steemit-dlive/',
        }),
        Map({
            enable: false,
            img: '',
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
            enable: false,
            img: '',
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
            enable: false,
            img: '',
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
