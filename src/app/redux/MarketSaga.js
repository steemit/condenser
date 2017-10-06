import {takeLatest} from 'redux-saga';
import {call, put} from 'redux-saga/effects';
import {getAccount} from './SagaShared';
import {api} from 'steem';

export const marketWatches = [watchLocationChange, watchUserLogin, watchMarketUpdate];

const wait = ms => (
    new Promise(resolve => {
        setTimeout(() => resolve(), ms)
    }))

let polling = false
let active_user = null
let last_trade = null

export function* fetchMarket(location_change_action) {
    const {pathname} = location_change_action.payload;
    if (pathname && pathname != "/market") {
        polling = false
        return
    }

    if(polling == true) return
    polling = true

    while(polling) {

        try {
            const state = yield call([api, api.getOrderBookAsync], 500);
            yield put({type: 'market/RECEIVE_ORDERBOOK', payload: state});

            let trades;
            if(last_trade == null ) {
                trades = yield call([api, api.getRecentTradesAsync], 25);
                yield put({type: 'market/RECEIVE_TRADE_HISTORY', payload: trades});
            } else {
                let start = last_trade.toISOString().slice(0, -5)
                trades = yield call([api, api.getTradeHistoryAsync], start, "1969-12-31T23:59:59", 1000);
                trades = trades.reverse()
                yield put({type: 'market/APPEND_TRADE_HISTORY', payload: trades});
            }
            if(trades.length > 0) {
              last_trade = new Date((new Date(Date.parse(trades[0]['date']))).getTime() + 1000)
            }

            const state3 = yield call([api, api.getTickerAsync]);
            yield put({type: 'market/RECEIVE_TICKER', payload: state3});
        } catch (error) {
            console.error('~~ Saga fetchMarket error ~~>', error);
            yield put({type: 'global/STEEM_API_ERROR', error: error.message});
        }

        yield call(wait, 3000);
    }
}

export function* fetchOpenOrders(set_user_action) {
    const {username} = set_user_action.payload

    try {
        const state = yield call([api, api.getOpenOrdersAsync], username);
        yield put({type: 'market/RECEIVE_OPEN_ORDERS', payload: state});
        yield call(getAccount, username, true);
    } catch (error) {
        console.error('~~ Saga fetchOpenOrders error ~~>', error);
        yield put({type: 'global/STEEM_API_ERROR', error: error.message});
    }
}

export function* reloadMarket(reload_action) {
    yield fetchMarket(reload_action);
    yield fetchOpenOrders(reload_action);
}

export function* watchUserLogin() {
    yield* takeLatest('user/SET_USER', fetchOpenOrders);
}

export function* watchLocationChange() {
    yield* takeLatest('@@router/LOCATION_CHANGE', fetchMarket);
}

export function* watchMarketUpdate() {
    yield* takeLatest('market/UPDATE_MARKET', reloadMarket);
}
