'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.remove = exports.set = exports.dismissError = exports.deleteError = exports.error = exports.broadcastOperation = exports.hideConfirm = exports.confirmOperation = exports.BROADCAST_OPERATION = undefined;

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

exports.default = reducer;

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Action constants
var CONFIRM_OPERATION = 'transaction/CONFIRM_OPERATION';
var HIDE_CONFIRM = 'transaction/HIDE_CONFIRM';
var BROADCAST_OPERATION = exports.BROADCAST_OPERATION = 'transaction/BROADCAST_OPERATION';
var ERROR = 'transaction/ERROR'; // Has a watcher in SagaShared
var DELETE_ERROR = 'transaction/DELETE_ERROR';
var DISMISS_ERROR = 'transaction/DISMISS_ERROR';
var SET = 'transaction/SET';
var REMOVE = 'transaction/REMOVE';
// Saga-related
var defaultState = (0, _immutable.fromJS)({
    operations: [],
    status: { key: '', error: false, busy: false },
    errors: {
        bandwidthError: false
    }
});

function last_part(value, sep) {
    var parts = value.split(sep);
    return parts[parts.length - 1];
}

function reducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState;
    var action = arguments[1];

    var payload = action.payload;

    switch (action.type) {
        case CONFIRM_OPERATION:
            {
                var operation = (0, _immutable.fromJS)(payload.operation);
                var confirm = payload.confirm;
                var warning = payload.warning;
                return state.merge({
                    show_confirm_modal: true,
                    confirmBroadcastOperation: operation,
                    confirmErrorCallback: payload.errorCallback,
                    confirm: confirm,
                    warning: warning
                });
            }

        case HIDE_CONFIRM:
            return state.merge({
                show_confirm_modal: false,
                confirmBroadcastOperation: undefined,
                confirm: undefined
            });

        case BROADCAST_OPERATION:
            // See TransactionSaga.js
            return state;

        case ERROR:
            {
                var operations = payload.operations,
                    _error = payload.error,
                    errorCallback = payload.errorCallback;


                var msg = void 0;
                var key = _error.toString().replace(/rethrow$/, '');

                if (/You may only post once every/.test(key)) {
                    // Assert Exception:( now - auth.last_root_post ) > STEEM_MIN_ROOT_COMMENT_INTERVAL: You may only post once every 5 minutes.
                    msg = 'You may only post once every five minutes.';
                } else if (/Your current vote on this comment is identical/.test(key)) {
                    // Assert Exception:itr->vote_percent != o.weight: Your current vote on this comment is identical to this vote.
                    msg = 'Your current vote on this comment is identical to this vote.';
                } else if (/Please wait to transact, or power up STEEM/.test(key)) {
                    // plugin exception:Account: test-safari has 1154101776 RC, needs 1274161808 RC. Please wait to transact, or power up STEEM.rethrow
                    try {
                        var m = [].concat((0, _toConsumableArray3.default)(key.matchAll(/(\d+) RC/g)));
                        var spv = 0.0005;
                        var fudge = 1.1;
                        var has_vests = parseInt(m[0][1], 10) / 1e6;
                        var needs_vests = parseInt(m[1][1], 10) / 1e6;
                        var sp = ((needs_vests - has_vests) * spv * fudge).toFixed(3);
                        msg = 'Bandwidth error: insufficient Resource Credits. Please wait to transact, or power up ' + sp + ' STEEM.';
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
                    console.error('unhandled error:', key, 'msg:', _error.message);
                }

                // SagaShared / showTransactionErrorNotification
                state = state.update('errors', function (errors) {
                    return errors ? errors.set(key, msg) : (0, _immutable.Map)((0, _defineProperty3.default)({}, key, msg));
                });

                if (msg.includes('RC') || msg.includes('Bandwidth')) {
                    state = state.setIn(['errors', 'bandwidthError'], true); //show_bandwidth_error_modal
                }

                if (!errorCallback) throw new Error('PANIC: no error callback for \'' + key + '\'');
                errorCallback(msg);

                return state;
            }

        case DELETE_ERROR:
            return state.deleteIn(['errors', payload.key]);

        case DISMISS_ERROR:
            return state.setIn(['errors', payload.key], false);

        case SET:
            return state.setIn(Array.isArray(payload.key) ? payload.key : [payload.key], (0, _immutable.fromJS)(payload.value));

        case REMOVE:
            return state.removeIn(Array.isArray(payload.key) ? payload.key : [payload.key]);

        default:
            return state;
    }
}

// Action creators
var confirmOperation = exports.confirmOperation = function confirmOperation(payload) {
    return {
        type: CONFIRM_OPERATION,
        payload: payload
    };
};

var hideConfirm = exports.hideConfirm = function hideConfirm(payload) {
    return {
        type: HIDE_CONFIRM,
        payload: payload
    };
};

var broadcastOperation = exports.broadcastOperation = function broadcastOperation(payload) {
    return {
        type: BROADCAST_OPERATION,
        payload: payload
    };
};

var error = exports.error = function error(payload) {
    return {
        type: ERROR,
        payload: payload
    };
};

var deleteError = exports.deleteError = function deleteError(payload) {
    return {
        type: DELETE_ERROR,
        payload: payload
    };
};

var dismissError = exports.dismissError = function dismissError(payload) {
    return {
        type: DISMISS_ERROR,
        payload: payload
    };
};

var set = exports.set = function set(payload) {
    return {
        type: SET,
        payload: payload
    };
};

var remove = exports.remove = function remove(payload) {
    return {
        type: REMOVE,
        payload: payload
    };
};