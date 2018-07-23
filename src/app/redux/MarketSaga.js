import { call, put, takeLatest } from 'redux-saga/effects';
import { api } from '@steemit/steem-js';

import * as marketActions from './MarketReducer';
import * as appActions from './AppReducer';
import * as userActions from './UserReducer';
import { getAccount } from './SagaShared';

export const marketWatches = [
    takeLatest(userActions.SET_USER, fetchOpenOrders),
    takeLatest('@@router/LOCATION_CHANGE', fetchMarket),
    takeLatest(marketActions.UPDATE_MARKET, reloadMarket),
];

const wait = ms =>
    new Promise(resolve => {
        setTimeout(() => resolve(), ms);
    });

let polling = false;
let active_user = null;
let last_trade = null;

export function* fetchMarket(location_change_action) {
    const { pathname } = location_change_action.payload;
    if (pathname && pathname != '/market') {
        polling = false;
        return;
    }

    if (polling == true) return;
    polling = true;

    while (polling) {
        try {
            const state = yield call([api, api.getOrderBookAsync], 500);
            yield put(marketActions.receiveOrderbook(state));

            let trades;
            if (last_trade == null) {
                trades = yield call([api, api.getRecentTradesAsync], 25);
                yield put(marketActions.receiveTradeHistory(trades));
            } else {
                let start = last_trade.toISOString().slice(0, -5);
                trades = yield call(
                    [api, api.getTradeHistoryAsync],
                    start,
                    '1969-12-31T23:59:59',
                    1000
                );
                trades = trades.reverse();
                yield put(marketActions.appendTradeHistory(trades));
            }
            if (trades.length > 0) {
                last_trade = new Date(
                    new Date(Date.parse(trades[0]['date'])).getTime() + 1000
                );
            }

            const state3 = yield call([api, api.getTickerAsync]);
            yield put(marketActions.receiveTicker(state3));
        } catch (error) {
            console.error('~~ Saga fetchMarket error ~~>', error);
            yield put(appActions.steemApiError(error.message));
        }

        yield call(wait, 3000);
    }
}

export function* fetchOpenOrders(set_user_action) {
    const { username } = set_user_action.payload;

    try {
        const state = yield call([api, api.getOpenOrdersAsync], username);
        yield put(marketActions.receiveOpenOrders(state));
        yield call(getAccount, username, true);
    } catch (error) {
        console.error('~~ Saga fetchOpenOrders error ~~>', error);
        yield put(appActions.steemApiError(error.message));
    }
}

export function* reloadMarket(reload_action) {
    yield fetchMarket(reload_action);
    yield fetchOpenOrders(reload_action);
}
