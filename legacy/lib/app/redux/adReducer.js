'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.defaultState = undefined;
exports.default = reducer;

var _immutable = require('immutable');

var defaultState = exports.defaultState = (0, _immutable.Map)({
    indexLeftSideAdList: (0, _immutable.List)([(0, _immutable.Map)({
        enable: true,
        img: '/images/tron-steem-240_240.png',
        tag: 'SteemTron240*240',
        url: '/steemit/@steemitblog/the-trx-and-steemit-integration-is-now-live'
    }), (0, _immutable.Map)({
        enable: true,
        img: '/images/dlive.png',
        tag: 'SteemitDlivebanner240*240',
        url: 'https://go.dlive.tv/steemit-dlive/'
    }), (0, _immutable.Map)({
        enable: true,
        img: '/images/justswap-sider.png',
        tag: 'JustswapBanner240*240',
        url: 'https://justswap.io/#/home'
    })]),
    postLeftSideAdList: (0, _immutable.List)([(0, _immutable.Map)({
        enable: true,
        img: '/images/tron-steem-240_240.png',
        tag: 'SteemTron240*240',
        url: '/steemit/@steemitblog/the-trx-and-steemit-integration-is-now-live'
    }), (0, _immutable.Map)({
        enable: true,
        img: '/images/dlive.png',
        tag: 'SteemitDlivebanner240*240Post',
        url: 'https://go.dlive.tv/steemit-dlive/'
    }), (0, _immutable.Map)({
        enable: true,
        img: '/images/justswap-sider.png',
        tag: 'JustswapBanner240*240Post',
        url: 'https://justswap.io/#/home'
    })]),
    rightSideAdList: [],
    bottomAdList: (0, _immutable.List)([(0, _immutable.Map)({
        enable: true,
        img: '/images/poloniex.png',
        tag: 'SteemitPoloniexbanner864*86Post',
        url: 'https://poloniex.com/'
    }), (0, _immutable.Map)({
        enable: true,
        img: '/images/justswap.png',
        tag: 'JustswapBanner864*86Post',
        url: 'https://justswap.io/#/home'
    })])
});

function reducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState;
    var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    switch (action.type) {
        default:
            return state;
    }
}