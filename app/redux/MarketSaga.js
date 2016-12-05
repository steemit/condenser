import {takeLatest} from 'redux-saga';
import {call, put} from 'redux-saga/effects';
import Apis from 'shared/api_client/ApiInstances';
import MarketReducer from './MarketReducer';
import {getAccount} from './SagaShared';

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
            const db_api = Apis.instance().db_api;
            const market_api = Apis.instance().market;

            const state = yield call([db_api, db_api.exec], 'get_order_book', [500]);
            yield put(MarketReducer.actions.receiveOrderbook(state));

            let trades;
            if(last_trade == null ) {
                trades = yield call([market_api, market_api.exec], 'get_recent_trades', [25]);
                yield put(MarketReducer.actions.receiveTradeHistory(trades));
            } else {
                let start = last_trade.toISOString().slice(0, -5)
                trades = yield call([market_api, market_api.exec], 'get_trade_history', [start, "1969-12-31T23:59:59", 1000]);
                trades = trades.reverse()
                yield put(MarketReducer.actions.appendTradeHistory(trades));
            }
            if(trades.length > 0) {
              last_trade = new Date((new Date(Date.parse(trades[0]['date']))).getTime() + 1000)
            }

            const state3 = yield call([market_api, market_api.exec], 'get_ticker');
            yield put(MarketReducer.actions.receiveTicker(state3));
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
        const db_api = Apis.instance().db_api;
        const state = yield call([db_api, db_api.exec], 'get_open_orders', [username]);
        yield put(MarketReducer.actions.receiveOpenOrders(state));
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
