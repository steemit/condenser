import { fromJS } from 'immutable';
import createModule from 'redux-modules';

import transactionErrorReducer from './Transaction_Error';

export default createModule({
    name: 'transaction',
    initialState: fromJS({
        operations: [],
        status: { key: '', error: false, busy: false },
        errors: null,
    }),
    transformations: [
        {
            action: 'CONFIRM_OPERATION',
            reducer: (state, { payload }) => {
                const operation = fromJS(payload.operation);
                const confirm = payload.confirm;
                const warning = payload.warning;
                return state.merge({
                    show_confirm_modal: true,
                    confirmBroadcastOperation: operation,
                    confirmErrorCallback: payload.errorCallback,
                    confirm,
                    warning,
                });
            },
        },
        {
            action: 'HIDE_CONFIRM',
            reducer: state =>
                state.merge({
                    show_confirm_modal: false,
                    confirmBroadcastOperation: undefined,
                    confirm: undefined,
                }),
        },
        {
            // An error will end up in QUEUE
            action: 'BROADCAST_OPERATION',
            reducer: state => {
                //, {payload: {type, operation, keys}}
                return state;
            },
        },
        {
            // An error will end up in QUEUE
            action: 'UPDATE_AUTHORITIES',
            reducer: state => state,
        },
        {
            // An error will end up in QUEUE
            action: 'UPDATE_META',
            reducer: state => state,
        },
        {
            action: 'ERROR',
            reducer: transactionErrorReducer,
        },
        {
            action: 'DELETE_ERROR',
            reducer: (state, { payload: { key } }) => {
                return state.deleteIn(['errors', key]);
            },
        },
        {
            action: 'SET',
            reducer: (state, { payload: { key, value } }) => {
                key = Array.isArray(key) ? key : [key];
                return state.setIn(key, fromJS(value));
            },
        },
        {
            action: 'REMOVE',
            reducer: (state, { payload: { key } }) => {
                key = Array.isArray(key) ? key : [key];
                return state.removeIn(key);
            },
        },
    ],
});
