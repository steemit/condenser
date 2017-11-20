import {Map} from 'immutable';

const defaultState = Map({status: {}});

export default function reducer(state = defaultState, action) {
    const payload = action.payload;

    switch (action.type) {
        case 'market/RECEIVE_ORDERBOOK':
            return state.set('orderbook', payload);

        case 'market/RECEIVE_TICKER':
            return state.set('ticker', payload);

        case 'market/RECEIVE_OPEN_ORDERS':
            return state.set('open_orders', payload);

        case 'market/RECEIVE_TRADE_HISTORY':
            return state.set('history', payload);

        case 'market/APPEND_TRADE_HISTORY':
            return state.set('history', [...payload, ...state.get('history')]);

        default:
            return state;
    }
}
