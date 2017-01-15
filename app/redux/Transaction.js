import {fromJS, Map} from 'immutable';
import createModule from 'redux-modules';
import { translate } from 'app/Translator';

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
            reducer: (state) => {//, {payload: {type, operation, keys}}
                // See TransactionSaga.js
                return state
            },
        },
        {
            // An error will end up in QUEUE
            action: 'UPDATE_AUTHORITIES',
            reducer: (state) => state,
        },
        {
            // An error will end up in QUEUE
            action: 'UPDATE_META',
            reducer: (state) => state,
        },
        {
            action: 'ERROR',
            reducer: (state, {payload: {operations, error, errorCallback}}) => {
                let errorStr = error.toString()
                let errorKey = 'Transaction broadcast error.'
                for (const [type/*, operation*/] of operations) {
                    switch (type) {
                    case 'vote':
                        if (/uniqueness constraint/.test(errorStr)) {
                            errorKey = translate('you_already_voted_for_this_post')
                            console.error('You already voted for this post.')
                        }
                        break
                    case 'comment':
                        if (/You may only post once per minute/.test(errorStr)) {
                            errorKey = translate('you_may_only_post_once_per_minute')
                        } else if (errorStr === 'Testing, fake error')
                            errorKey = 'Testing, fake error'
                        break;
                    case 'transfer':
                        if (/get_balance/.test(errorStr)) {
                            errorKey = translate('insufficient_balance')
                        }
                        break
                    case 'withdraw_vesting':
                        if(/Account registered by another account requires 10x account creation fee worth of Steem Power before it can power down/.test(errorStr))
                            errorKey = translate('account_registered_by_anoter_account_requires_10x_creation_fee_worth_of_VESTING_TOKEN_before_it_can_power_down')
                        break
                    default:
                        break
                    }
                    if (state.hasIn(['TransactionError', type + '_listener'])) {
                        state = state.setIn(['TransactionError', type], fromJS({key: errorKey, exception: errorStr}))
                    } else {
                        if (error.message) {
                            // Depends on FC_ASSERT formatting
                            // https://github.com/steemit/steemit.com/issues/222
                            const err_lines = error.message.split('\n');
                            if (err_lines.length > 2) {
                                errorKey = err_lines[1];
                                const txt = errorKey.split(': ')
                                if(txt.length && txt[txt.length - 1].trim() !== '') {
                                    errorKey = errorStr = txt[txt.length - 1]
                                } else
                                    errorStr = translate('transaction_failed_error', {error: err_lines[1]});
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
            reducer: (state, {payload: {key}}) => {
                return state.deleteIn(['errors', key]);
            }
        },
        {
            action: 'SET',
            reducer: (state, {payload: {key, value}}) => {
                key = Array.isArray(key) ? key : [key]
                return state.setIn(key, fromJS(value))
            }
        },
        {
            action: 'REMOVE',
            reducer: (state, {payload: {key}}) => {
                key = Array.isArray(key) ? key : [key]
                return state.removeIn(key)
            }
        },
    ]
});

// const log = v => {console.log('l', v); return v}
