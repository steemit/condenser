import { Map } from 'immutable';

// Action constants
const RECEIVE_ORDERBOOK = 'market/RECEIVE_ORDERBOOK';
const RECEIVE_TICKER = 'market/RECEIVE_TICKER';
const RECEIVE_OPEN_ORDERS = 'market/RECEIVE_OPEN_ORDERS';
const RECEIVE_TRADE_HISTORY = 'market/RECEIVE_TRADE_HISTORY';
const APPEND_TRADE_HISTORY = 'market/APPEND_TRADE_HISTORY';
// Saga-related
export const UPDATE_MARKET = 'market/UPDATE_MARKET';

const defaultState = Map({ status: {} });

export default function reducer(state = defaultState, action) {
    const payload = action.payload;

    switch (action.type) {
        case RECEIVE_ORDERBOOK:
            return state.set('orderbook', payload);

        case RECEIVE_TICKER:
            return state.set('ticker', payload);

        case RECEIVE_OPEN_ORDERS:
            return state.set('open_orders', payload);

        case RECEIVE_TRADE_HISTORY:
            return state.set('history', payload);

        case APPEND_TRADE_HISTORY:
            return state.set('history', [...payload, ...state.get('history')]);

        default:
            return state;
    }
}

// Action creators
export const receiveOrderbook = payload => ({
    type: RECEIVE_ORDERBOOK,
    payload,
});

export const receiveTicker = payload => ({
    type: RECEIVE_TICKER,
    payload,
});

export const receiveOpenOrders = payload => ({
    type: RECEIVE_OPEN_ORDERS,
    payload,
});

export const receiveTradeHistory = payload => ({
    type: RECEIVE_TRADE_HISTORY,
    payload,
});

export const appendTradeHistory = payload => ({
    type: APPEND_TRADE_HISTORY,
    payload,
});

export const updateMarket = payload => ({
    type: UPDATE_MARKET,
    payload,
});
