import {Map} from 'immutable';

const defaultState = Map({status: {}});

export default function reducer(state = defaultState, action) {
    const payload = action.payload;

    if (action.type === 'market/RECEIVE_ORDERBOOK') {
        return state.set('orderbook', payload);
    }

    if (action.type === 'market/RECEIVE_TICKER') {
        return state.set('ticker', payload);
    }

    if (action.type === 'market/RECEIVE_OPEN_ORDERS') {
        return state.set('open_orders', payload);
    }

    if (action.type === 'market/RECEIVE_TRADE_HISTORY') {
        return state.set('history', payload);
    }

    if (action.type === 'market/APPEND_TRADE_HISTORY') {
        return state.set('history', [...payload, ...state.get('history')]);
    }

    return state;
}
