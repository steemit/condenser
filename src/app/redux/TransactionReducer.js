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

function last_part(value, sep) {
    const parts = value.split(sep);
    return parts[parts.length - 1];
}

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

            let msg;
            let key = error.toString().replace(/rethrow$/, '');

            if (/You may only post once every/.test(key)) {
                // Assert Exception:( now - auth.last_root_post ) > STEEM_MIN_ROOT_COMMENT_INTERVAL: You may only post once every 5 minutes.
                msg = 'You may only post once every five minutes.';
            } else if (
                /Your current vote on this comment is identical/.test(key)
            ) {
                // Assert Exception:itr->vote_percent != o.weight: Your current vote on this comment is identical to this vote.
                msg =
                    'Your current vote on this comment is identical to this vote.';
            } else if (/Please wait to transact, or power up STEEM/.test(key)) {
                // plugin exception:Account: test-safari has 1154101776 RC, needs 1274161808 RC. Please wait to transact, or power up STEEM.rethrow
                try {
                    const m = [...key.matchAll(/(\d+) RC/g)];
                    const spv = 0.0005;
                    const fudge = 1.1;
                    const has_vests = parseInt(m[0][1], 10) / 1e6;
                    const needs_vests = parseInt(m[1][1], 10) / 1e6;
                    const sp = (
                        (needs_vests - has_vests) *
                        spv *
                        fudge
                    ).toFixed(3);
                    msg = `Bandwidth error: insufficient Resource Credits. Please wait to transact, or power up ${
                        sp
                    } STEEM.`;
                } catch (e) {
                    console.error('bandwidth parse error', key);
                    msg = 'Bandwidth error: ' + last_part(key, ':');
                }
            } else if (/unknown key: /.test(key)) {
                // RPCError: unknown key:unknown key:
                msg = "Transaction failed: Steem account doesn't exist.";
            } else if (/missing required posting authority/.test(key)) {
                // missing required posting authority:Missing Posting Authority test-safari
                msg = last_part(key, ':');
            } else if (/Cannot delete a comment with net positive/.test(key)) {
                // Assert Exception:comment.net_rshares <= 0: Cannot delete a comment with net positive votes.
                msg = last_part(key, ':');
            } else if (/current vote on this comment is identical/.test(key)) {
                // Assert Exception:itr->vote_percent != o.weight: Your current vote on this comment is identical to this vote.
                msg = 'You already voted on this post.';
            } else if (/transaction tapos exception/.test(key)) {
                // TODO: document full error string, simplify `msg`
                msg = 'Unable to complete transaction.  Try again later. (Cause: ' + key + ')';
            } else {
                msg = 'Transaction broadcast error: ' + last_part(key, ':');
                console.error('unhandled error:', key, 'msg:', error.message);
            }

            // SagaShared / showTransactionErrorNotification
            state = state.update('errors', errors => {
                return errors ? errors.set(key, msg) : Map({ [key]: msg });
            });

            if (msg.includes('RC') || msg.includes('Bandwidth')) {
                state = state.setIn(['errors', 'bandwidthError'], true); //show_bandwidth_error_modal
            }

            if (!errorCallback)
                throw new Error(`PANIC: no error callback for '${key}'`);
            errorCallback(msg);

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
