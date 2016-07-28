import {fromJS, Map} from 'immutable';
import {PropTypes} from 'react';
import createModule from 'redux-modules';

const {string, object, array, bool, func, oneOfType, any} = PropTypes

export default createModule({
    name: 'transaction',
    initialState: fromJS({
        operations: [],
        status: { key: '', error: false, busy: false, },
        errors: null,
    }),
    transformations: [
        {
            action: 'CONFIRM_OPERATION',
            payloadTypes: {
                operation: object,
                confirm: oneOfType([string, func]),
                errorCallback: func,
            },
            reducer: (state, {payload}) => {
                const operation = fromJS(payload.operation)
                const confirm = payload.confirm
                return state.merge({
                    show_confirm_modal: true,
                    confirmBroadcastOperation: operation,
                    confirmErrorCallback: payload.errorCallback,
                    confirm,
                })
            }
        },
        { action: 'HIDE_CONFIRM', reducer: state =>
            state.merge({show_confirm_modal: false, confirmBroadcastOperation: undefined, confirm: undefined})
        },
        {
            // An error will end up in QUEUE
            action: 'BROADCAST_OPERATION',
            payloadTypes: {
                type: string.isRequired,
                operation: object.isRequired,
                confirm: oneOfType([string, func]), // confirmation message
                successCallback: func,
                errorCallback: func,
                keys: array,
                username: string,
                password: string,
            },
            reducer: (state) => {//, {payload: {type, operation, keys}}
                // See TransactionSaga.js
                return state
            },
        },
        {
            // An error will end up in QUEUE
            action: 'UPDATE_AUTHORITIES',
            payloadTypes: {
                accountName: string.isRequired,
                signingKey: string, // Required unless auths has password or WIF
                auths: array.isRequired, // Auths may contain the signing key
                twofa: bool,
                onSuccess: func.isRequired,
                onError: func.isRequired,
            },
            reducer: (state) => state,
        },
        {
            action: 'ERROR',
            payloadTypes: {
                operations: array.isRequired,
                keys: array.isRequired,
                error: object.isRequired, /* only errors for now */
                errorCallback: func,
            },
            reducer: (state, {payload: {operations, keys, error, errorCallback}}) => {
                let errorStr = error.toString()
                let errorKey = 'Transaction broadcast error.'
                for (const [type/*, operation*/] of operations) {
                    switch (type) {
                    case 'vote':
                        if (/uniqueness constraint/.test(errorStr)) {
                            errorKey = 'You already voted for this post'
                            console.error('You already voted for this post.')
                        }
                        break
                    case 'comment':
                        if (/You may only post once per minute/.test(errorStr)) {
                            errorKey = 'You may only post once per minute.'
                        } else if (errorStr === 'Testing, fake error')
                            errorKey = 'Testing, fake error'
                        break;
                    case 'transfer':
                        if (/get_balance/.test(errorStr)) {
                            errorKey = 'Insufficient balance.'
                        }
                        break
                    case 'withdraw_vesting':
                        if(/Account registered by another account requires 10x account creation fee worth of Steem Power before it can power down/.test(errorStr))
                            errorKey = 'Account registered by another account requires 10x account creation fee worth of Steem Power before it can power down'
                        break
                    default:
                        break
                    }
                    if (state.hasIn(['TransactionError', type + '_listener'])) {
                        state = state.setIn(['TransactionError', type], fromJS({key: errorKey, exception: errorStr}))
                    } else {
                        if (error.message) {
                            const err_lines = error.message.split('\n');
                            if (err_lines.length > 2) {
                                errorKey = err_lines[1];
                                errorStr = `Transaction failed: ${err_lines[1]}`;
                            }
                        }
                        if (errorStr.length > 200) errorStr = errorStr.substring(0, 200);
                        state = state.update('errors', errors => {
                            return errors ? errors.set(errorKey, errorStr) : Map({[errorKey]: errorStr});
                        });
                    }
                }
                if (errorCallback) try { errorCallback(errorKey) } catch (error2) { console.error(error2) }
                return state
            },
        },
        {
            action: 'DELETE_ERROR',
            payloadTypes: {key: string.isRequired},
            reducer: (state, {payload: {key}}) => {
                return state.deleteIn(['errors', key]);
            }
        },
        {
            action: 'SET',
            payloadTypes: {
                key: oneOfType([array, string]).isRequired,
                value: any,
            },
            reducer: (state, {payload: {key, value}}) => {
                key = Array.isArray(key) ? key : [key]
                return state.setIn(key, fromJS(value))
            }
        },
        {
            action: 'REMOVE',
            payloadTypes: {
                key: oneOfType([array, string]).isRequired,
            },
            reducer: (state, {payload: {key}}) => {
                key = Array.isArray(key) ? key : [key]
                return state.removeIn(key)
            }
        },
    ]
});

// const log = v => {console.log('l', v); return v}
