import { fromJS, Map } from 'immutable';

// Action constants
const CONFIRM_OPERATION = 'transaction/CONFIRM_OPERATION';
const HIDE_CONFIRM = 'transaction/HIDE_CONFIRM';
export const BROADCAST_OPERATION = 'transaction/BROADCAST_OPERATION';
const ERROR = 'transaction/ERROR'; // Has a watcher in SagaShared
const DELETE_ERROR = 'transaction/DELETE_ERROR';
const DISMISS_ERROR = 'transaction/DISMISS_ERROR';
const SET = 'transaction/SET';
const REMOVE = 'transaction/REMOVE';
// Saga-related
const defaultState = fromJS({
    operations: [],
    status: { key: '', error: false, busy: false },
    errors: {
        bandwidthError: false,
    },
});

export default function reducer(state = defaultState, action) {
    const payload = action.payload;

    switch (action.type) {
        case CONFIRM_OPERATION: {
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
        }

        case HIDE_CONFIRM:
            return state.merge({
                show_confirm_modal: false,
                confirmBroadcastOperation: undefined,
                confirm: undefined,
            });

        case BROADCAST_OPERATION:
            // See TransactionSaga.js
            return state;

        case ERROR: {
            const { operations, error, errorCallback } = payload;

            let errorStr = error.toString();
            let errorKey = 'Transaction broadcast error.';
            for (const [type /*, operation*/] of operations) {
                switch (type) {
                    case 'vote':
                        if (/uniqueness constraint/.test(errorStr)) {
                            errorKey = 'You already voted for this post';
                            console.error('You already voted for this post.');
                        }
                        if (/Voting weight is too small/.test(errorStr)) {
                            errorKey = 'Voting weight is too small';
                            errorStr =
                                'Voting weight is too small, please accumulate more voting power or steem power.';
                        }
                        break;
                    case 'comment':
                        if (
                            /You may only post once per minute/.test(errorStr)
                        ) {
                            errorKey = 'You may only post once per minute.';
                        } else if (errorStr === 'Testing, fake error')
                            errorKey = 'Testing, fake error';
                        break;
                    default:
                        break;
                }
                if (state.hasIn(['TransactionError', type + '_listener'])) {
                    state = state.setIn(
                        ['TransactionError', type],
                        fromJS({ key: errorKey, exception: errorStr })
                    );
                } else {
                    if (error.message) {
                        // TODO: This reformatting could be better, in most cases, errorKey and errorString end up being similar if not identical.
                        // Depends on FC_ASSERT formatting
                        // https://github.com/steemit/steemit.com/issues/222
                        const err_lines = error.message.split('\n');
                        if (err_lines.length > 2) {
                            errorKey = err_lines[1];
                            const txt = errorKey.split(': ');
                            if (
                                txt.length &&
                                txt[txt.length - 1].trim() !== ''
                            ) {
                                errorKey = errorStr = txt[txt.length - 1];
                            } else
                                errorStr = `Transaction failed: ${
                                    err_lines[1]
                                }`;
                        }
                    }
                    // TODO: This would perhaps be better expressed as a Case, Switch statement.
                    // TODO: The precise reason for why this clipping needs to happen is unclear.
                    if (errorStr.length > 200)
                        errorStr = errorStr.substring(0, 200);
                    // Catch for unknown key better error handling
                    if (/unknown key: /.test(errorKey)) {
                        errorKey = "Steem account doesn't exist.";
                        errorStr =
                            "Transaction failed: Steem account doesn't exist.";
                    }
                    // Catch for invalid active authority
                    if (/Missing Active Authority /.test(errorKey)) {
                        errorKey = 'Not your valid active key.';
                        errorStr =
                            'Transaction failed: Not your valid active key.';
                    }
                    // TODO: refactor this so that the keys are consistent and sane, i.e. do not include user name in error key.
                    state = state.update('errors', errors => {
                        return errors
                            ? errors.set(errorKey, errorStr)
                            : Map({ [errorKey]: errorStr });
                    });
                    // Sane error key for the bandwidth error.
                    if (
                        errorKey.includes('bandwidth') ||
                        errorStr.includes('bandwidth') ||
                        errorStr.includes('RC') // Error key for HF-20 insufficient RC error, #3001.
                    ) {
                        state = state.setIn(['errors', 'bandwidthError'], true);
                    }
                }
            }

            if (errorCallback) {
                errorCallback(errorKey);
            } else {
                throw new Error(
                    'PANIC: no callback registered to handle error ' + errorKey
                );
            }

            return state;
        }

        case DELETE_ERROR:
            return state.deleteIn(['errors', payload.key]);

        case DISMISS_ERROR:
            return state.setIn(['errors', payload.key], false);

        case SET:
            return state.setIn(
                Array.isArray(payload.key) ? payload.key : [payload.key],
                fromJS(payload.value)
            );

        case REMOVE:
            return state.removeIn(
                Array.isArray(payload.key) ? payload.key : [payload.key]
            );

        default:
            return state;
    }
}

// Action creators
export const confirmOperation = payload => ({
    type: CONFIRM_OPERATION,
    payload,
});

export const hideConfirm = payload => ({
    type: HIDE_CONFIRM,
    payload,
});

export const broadcastOperation = payload => ({
    type: BROADCAST_OPERATION,
    payload,
});

export const error = payload => ({
    type: ERROR,
    payload,
});

export const deleteError = payload => ({
    type: DELETE_ERROR,
    payload,
});

export const dismissError = payload => ({
    type: DISMISS_ERROR,
    payload,
});

export const set = payload => ({
    type: SET,
    payload,
});

export const remove = payload => ({
    type: REMOVE,
    payload,
});
