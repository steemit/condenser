import { fork, call, put, takeLatest } from 'redux-saga/effects';
import MarketReducer from 'app/redux/MarketReducer';
import {getAccount} from './shared';
import {api} from 'golos-js';

export function* marketWatches() {
    yield fork(watchLocationChange);
    yield fork(watchUserLogin);
    yield fork(watchMarketUpdate);
}
 

const wait = ms => (
    new Promise(resolve => {
        setTimeout(() => resolve(), ms)
    }))

let polling = false
let active_user = null
let last_trade = null

function* fetchMarket(location_change_action) {
    const {pathname} = location_change_action.payload;
    if (pathname && pathname != "/market") {
        polling = false
        return
    }

    if(polling == true) return
    polling = true

    while(polling) {

        try {
            const state = yield call([api, api.getOrderBookExtendedAsync], 500);
            yield put(MarketReducer.actions.receiveOrderbook(state));

            let trades;
            if(last_trade == null ) {
                trades = yield call([api, api.getRecentTradesAsync], 25);
                yield put(MarketReducer.actions.receiveTradeHistory(trades));
            } else {
                let start = last_trade.toISOString().slice(0, -5)
                trades = yield call([api, api.getTradeHistoryAsync], start, "1969-12-31T23:59:59", 1000);
                trades = trades.reverse()
                yield put(MarketReducer.actions.appendTradeHistory(trades));
            }
            if(trades.length > 0) {
              last_trade = new Date((new Date(Date.parse(trades[0]['date']))).getTime() + 1000)
            }

            const state3 = yield call([api, api.getTickerAsync]);
            yield put(MarketReducer.actions.receiveTicker(state3));
        } catch (error) {
            console.error('~~ Saga fetchMarket error ~~>', error);
            yield put({type: 'global/CHAIN_API_ERROR', error: error.message});
        }

        yield call(wait, 3000);
    }
}

function* fetchOpenOrders(set_user_action) {
    const {username} = set_user_action.payload

    try {
        const state = yield call([api, api.getOpenOrdersAsync], username);
        yield put(MarketReducer.actions.receiveOpenOrders(state));
        yield call(getAccount, username, true);
    } catch (error) {
        console.error('~~ Saga fetchOpenOrders error ~~>', error);
        yield put({type: 'global/CHAIN_API_ERROR', error: error.message});
    }
}

function* reloadMarket(reload_action) {
    yield fetchMarket(reload_action);
    yield fetchOpenOrders(reload_action);
}

function* watchUserLogin() {
    yield takeLatest('user/SET_USER', fetchOpenOrders);
}

function* watchLocationChange() {
    yield takeLatest('@@router/LOCATION_CHANGE', fetchMarket);
}

function* watchMarketUpdate() {
    yield takeLatest('market/UPDATE_MARKET', reloadMarket);
}
