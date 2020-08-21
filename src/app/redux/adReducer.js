import { Map } from 'immutable';

export const defaultState = Map({
    leftSideAdList: [
        {
            enable: true,
            img: '/images/dlive.png',
            tag: 'SteemitDlivebanner240*240',
            url: 'https://dlive.tv/',
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
    ],
});

export default function reducer(state = defaultState, action = {}) {
    switch (action.type) {
        default:
            return state;
    }
}
