import {Map, Set, List, fromJS, Iterable} from 'immutable';
import createModule from 'redux-modules';
import {PropTypes} from 'react';
import {emptyContent} from 'app/redux/EmptyState';
import constants from './constants';

const {string, object, bool, array, oneOf, oneOfType, func, any} = PropTypes

export default createModule({
    name: 'market',
    initialState: Map({status: {}}),
    transformations: [
        {
            action: 'RECEIVE_ORDERBOOK',
            reducer: (state, action) => {
                return state.set('orderbook', action.payload);
            }
        },
        {
            action: 'RECEIVE_TICKER',
            reducer: (state, action) => {
                return state.set('ticker', action.payload);
            }
        },
        {
            action: 'RECEIVE_OPEN_ORDERS',
            reducer: (state, action) => {
                return state.set('open_orders', action.payload);
            }
        },
        {
            action: 'RECEIVE_TRADE_HISTORY',
            reducer: (state, action) => {
                return state.set('history', action.payload);
            }
        },
        {
            action: 'APPEND_TRADE_HISTORY',
            reducer: (state, action) => {
                return state.set('history', [...action.payload, ...state.get('history')]);
            }
        },
        {
            action: 'RECEIVE_ACCOUNT',
            reducer: (state, action) => {
                return state.set('account', action.payload.account);
            }
        },
    ]
});
