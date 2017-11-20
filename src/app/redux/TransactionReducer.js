import {fromJS, Map} from 'immutable';

const defaultState = fromJS({
    operations: [],
    status: { key: '', error: false, busy: false, },
    errors: null
});

export default function reducer(state = defaultState, action) {
    const payload = action.payload;

    switch (action.type) {
        case 'transaction/CONFIRM_OPERATION': {
            const operation = fromJS(payload.operation);
            const confirm = payload.confirm;
            const warning = payload.warning;
            return state.merge({
                show_confirm_modal: true,
                confirmBroadcastOperation: operation,
                confirmErrorCallback: payload.errorCallback,
                confirm,
                warning
            });
        }

        case 'transaction/HIDE_CONFIRM':
            return state.merge({show_confirm_modal: false, confirmBroadcastOperation: undefined, confirm: undefined});

        case 'transaction/BROADCAST_OPERATION':
            // See TransactionSaga.js
            return state;

        case 'transaction/UPDATE_AUTHORITIES':
            return state;

        case 'transaction/UPDATE_META':
            return state;

        case 'transaction/ERROR': {
            const {operations, error, errorCallback} = payload;
            let errorStr = error.toString();
            let errorKey = 'Transaction broadcast error.';
            for (const [type/*, operation*/] of operations) {
                switch (type) {
                    case 'vote':
                        if (/uniqueness constraint/.test(errorStr)) {
                            errorKey = 'You already voted for this post';
                            console.error('You already voted for this post.')
                        }
                        break;
                    case 'comment':
                        if (/You may only post once per minute/.test(errorStr)) {
                            errorKey = 'You may only post once per minute.'
                        } else if (errorStr === 'Testing, fake error')
                            errorKey = 'Testing, fake error';
                        break;
                    case 'transfer':
                        if (/get_balance/.test(errorStr)) {
                            errorKey = 'Insufficient balance.'
                        }
                        break;
                    case 'withdraw_vesting':
                        if(/Account registered by another account requires 10x account creation fee worth of Steem Power/.test(errorStr))
                            errorKey = 'Account requires 10x the account creation fee in Steem Power (approximately 300 SP) before it can power down.'
                        break;
                    default:
                        break;
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
                            const txt = errorKey.split(': ');
                            if(txt.length && txt[txt.length - 1].trim() !== '') {
                                errorKey = errorStr = txt[txt.length - 1];
                            } else
                                errorStr = `Transaction failed: ${err_lines[1]}`;
                        }
                    }
                    if (errorStr.length > 200) errorStr = errorStr.substring(0, 200);
                    // Catch for unknown key better error handling
                    if (/unknown key: /.test(errorKey)) {
                        errorKey = "Steem account doesn't exist.";
                        errorStr = "Transaction failed: Steem account doesn't exist.";
                    }
                    // Catch for invalid active authority
                    if (/Missing Active Authority /.test(errorKey)) {
                        errorKey = "Not your valid active key.";
                        errorStr = "Transaction failed: Not your valid active key.";
                    }
                    state = state.update('errors', (errors) => {
                        return errors ? errors.set(errorKey, errorStr) : Map({[errorKey]: errorStr});
                    });
                }
            }

            if (errorCallback) {
                errorCallback(errorKey);
            } else {
                throw new Error('PANIC: no callback registered to handle error ' + errorKey);
            }

            return state;
        }

        case 'transaction/DELETE_ERROR':
            return state.deleteIn(['errors', payload.key]);

        case 'transaction/SET':
            return state.setIn(Array.isArray(payload.key) ? payload.key : [payload.key], fromJS(payload.value))

        case 'transaction/REMOVE':
            return state.removeIn(Array.isArray(payload.key) ? payload.key : [payload.key]);

        default:
            return state;
    }
}
