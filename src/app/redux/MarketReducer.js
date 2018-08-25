import { Map } from 'immutable';

import { createOrderSorter } from 'app/utils/MarketUtils';
import { LIQUID_TICKER } from 'app/client_config';

// Action constants
const RECEIVE_ORDERBOOK = 'market/RECEIVE_ORDERBOOK';
const RECEIVE_TICKER = 'market/RECEIVE_TICKER';
const RECEIVE_OPEN_ORDERS = 'market/RECEIVE_OPEN_ORDERS';
const RECEIVE_TRADE_HISTORY = 'market/RECEIVE_TRADE_HISTORY';
const APPEND_TRADE_HISTORY = 'market/APPEND_TRADE_HISTORY';
const TOGGLE_OPEN_ORDERS_SORT = 'market/TOGGLE_OPEN_ORDERS_SORT';
// Saga-related
export const UPDATE_MARKET = 'market/UPDATE_MARKET';

const defaultState = Map({
    status: {},
    open_orders_sort: Map({
        column: 'created',
        dataType: 'string',
        dir: 1,
    }),
});

export default function reducer(state = defaultState, action = {}) {
    const payload =
        typeof action.payload !== 'undefined' ? action.payload : null;

    switch (action.type) {
        case RECEIVE_ORDERBOOK:
            return state.set('orderbook', payload);

        case RECEIVE_TICKER:
            return state.set('ticker', payload);

        case RECEIVE_OPEN_ORDERS:
            // Store normalized data right in redux, and apply current sort.
            const { dir, column, dataType } = state
                .get('open_orders_sort')
                .toJS();
            const getValue = dataType === 'string' ? v => v : parseFloat;

            const open_orders = action.payload
                .map(o => {
                    const type =
                        o.sell_price.base.indexOf(LIQUID_TICKER) > 0
                            ? 'ask'
                            : 'bid';
                    const sbd =
                        type == 'bid' ? o.sell_price.base : o.sell_price.quote;
                    const steem =
                        type == 'ask' ? o.sell_price.base : o.sell_price.quote;
                    return {
                        ...o,
                        type: type,
                        price: parseFloat(sbd) / parseFloat(steem),
                        steem,
                        sbd,
                    };
                })
                .sort(createOrderSorter(getValue, column, dir));

            return state.set('open_orders', open_orders);

        case RECEIVE_TRADE_HISTORY:
            return state.set('history', payload);

        case APPEND_TRADE_HISTORY:
            return state.set('history', [...payload, ...state.get('history')]);

        case TOGGLE_OPEN_ORDERS_SORT:
            const toggledColumn = action.payload.column || 'created';
            const toggledDataType = action.payload.dataType || 'float';

            const toggledDir = -state.get('open_orders_sort').get('dir');

            const toggledGetValue =
                toggledDataType === 'string' ? v => v : parseFloat;

            const sortedState = state.set(
                'open_orders',
                state
                    .get('open_orders')
                    .sort(
                        createOrderSorter(
                            toggledGetValue,
                            toggledColumn,
                            toggledDir
                        )
                    )
            );

            return sortedState.set(
                'open_orders_sort',
                Map({
                    column: toggledColumn,
                    dataType: toggledDir,
                    dir: toggledDir,
                })
            );

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

export const toggleOpenOrdersSort = payload => ({
    type: TOGGLE_OPEN_ORDERS_SORT,
    payload,
});
