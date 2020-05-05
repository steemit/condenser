import { call, put, select, all, takeEvery } from 'redux-saga/effects';
import { fromJS, Set, Map } from 'immutable';
import tt from 'counterpart';
import getSlug from 'speakingurl';
import base58 from 'bs58';
import secureRandom from 'secure-random';
import { PrivateKey, PublicKey } from '@steemit/steem-js/lib/auth/ecc';
import { api, broadcast, auth, memo } from '@steemit/steem-js';

import { getAccount, getContent } from 'app/redux/SagaShared';
import { postingOps, findSigningKey } from 'app/redux/AuthSaga';
import * as appActions from 'app/redux/AppReducer';
import * as globalActions from 'app/redux/GlobalReducer';
import * as transactionActions from 'app/redux/TransactionReducer';
import * as userActions from 'app/redux/UserReducer';
import { DEBT_TICKER } from 'app/client_config';
import { serverApiRecordEvent } from 'app/utils/ServerApiClient';
import { isLoggedInWithKeychain } from 'app/utils/SteemKeychain';
import { callBridge } from 'app/utils/steemApi';

export const transactionWatches = [
    takeEvery(transactionActions.BROADCAST_OPERATION, broadcastOperation),
];

const hook = {
    preBroadcast_comment,
    preBroadcast_vote,
    error_vote,
    error_custom_json,
    accepted_comment,
    accepted_custom_json,
    accepted_delete_comment,
    accepted_vote,
};

const toStringUtf8 = o =>
    o ? (Buffer.isBuffer(o) ? o.toString('utf-8') : o.toString()) : o;

function* preBroadcast_vote({ operation, username }) {
    if (!operation.voter) operation.voter = username;
    const { author, permlink } = operation;
    // give immediate feedback
    yield put(
        globalActions.set({
            key: `transaction_vote_active_${author}_${permlink}`,
            value: true,
        })
    );
    yield put(globalActions.voted(operation));
    return operation;
}

/** Keys, username, and password are not needed for the initial call.  This will check the login and may trigger an action to prompt for the password / key. */
export function* broadcastOperation({
    payload: {
        type,
        operation,
        confirm,
        warning,
        keys,
        username,
        password,
        useKeychain,
        successCallback,
        errorCallback,
        allowPostUnsafe,
    },
}) {
    const operationParam = {
        type,
        operation,
        keys,
        username,
        password,
        useKeychain,
        successCallback,
        errorCallback,
        allowPostUnsafe,
    };

    const conf = typeof confirm === 'function' ? confirm() : confirm;
    if (conf) {
        console.log('broadcastConfirm', operationParam);
        yield put(
            transactionActions.confirmOperation({
                confirm,
                warning,
                operation: operationParam,
                errorCallback,
            })
        );
        return;
    }

    const payload = {
        operations: [[type, operation]],
        keys,
        username,
        successCallback,
        errorCallback,
    };
    if (!allowPostUnsafe && hasPrivateKeys(payload)) {
        const confirm = tt('g.post_key_warning.confirm');
        const warning = tt('g.post_key_warning.warning');
        const checkbox = tt('g.post_key_warning.checkbox');
        operationParam.allowPostUnsafe = true;
        yield put(
            transactionActions.confirmOperation({
                confirm,
                warning,
                checkbox,
                operation: operationParam,
                errorCallback,
            })
        );
        return;
    }
    try {
        if (!isLoggedInWithKeychain()) {
            if (!keys || keys.length === 0) {
                payload.keys = [];
                // user may already be logged in, or just enterend a signing passowrd or wif
                const signingKey = yield call(findSigningKey, {
                    opType: type,
                    username,
                    password,
                });
                if (signingKey) payload.keys.push(signingKey);
                else {
                    if (!password) {
                        yield put(
                            userActions.showLogin({
                                operation: {
                                    type,
                                    operation,
                                    username,
                                    successCallback,
                                    errorCallback,
                                    saveLogin: true,
                                },
                            })
                        );
                        return;
                    }
                }
            }
        }
        // if the customJsonPayload has a 'required_posting_auths' key, that has value undefined, and the user is logged in. Update it.
        const updatedOps = payload.operations.map((op, idx, src) => {
            if (op[0] === 'custom_json') {
                if (
                    op[1].required_posting_auths &&
                    op[1].required_posting_auths.filter(u => u === undefined)
                        .length > 0 &&
                    username
                ) {
                    op[1].required_posting_auths = [username];
                }
            }
            return op;
        });

        payload.operations = updatedOps;

        yield call(broadcastPayload, { payload });
        let eventType = type
            .replace(/^([a-z])/, g => g.toUpperCase())
            .replace(/_([a-z])/g, g => g[1].toUpperCase());
        if (eventType === 'Comment' && !operation.parent_author)
            eventType = 'Post';
        const page =
            eventType === 'Vote'
                ? `@${operation.author}/${operation.permlink}`
                : '';
        serverApiRecordEvent(eventType, page);
    } catch (error) {
        console.error('TransactionSage', error);
        if (errorCallback) errorCallback(error.toString());
    }
}

function hasPrivateKeys(payload) {
    const blob = JSON.stringify(payload.operations);
    let m,
        re = /P?(5[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{50})/g;
    while (true) {
        m = re.exec(blob);
        if (m) {
            try {
                PrivateKey.fromWif(m[1]); // performs the base58check
                return true;
            } catch (e) {}
        } else {
            break;
        }
    }
    return false;
}

function* broadcastPayload({
    payload: { operations, keys, username, successCallback, errorCallback },
}) {
    let needsActiveAuth = false;

    console.log('broadcastPayload', operations, username);

    if ($STM_Config.read_only_mode) return;
    for (const [type] of operations) {
        // see also transaction/ERROR
        yield put(
            transactionActions.remove({ key: ['TransactionError', type] })
        );
        if (!postingOps.has(type)) {
            needsActiveAuth = true;
        }
    }

    {
        const newOps = [];
        for (const [type, operation] of operations) {
            if (hook['preBroadcast_' + type]) {
                const op = yield call(hook['preBroadcast_' + type], {
                    operation,
                    username,
                });
                if (Array.isArray(op)) for (const o of op) newOps.push(o);
                else newOps.push([type, op]);
            } else {
                newOps.push([type, operation]);
            }
        }
        operations = newOps;
    }

    // status: broadcasting
    const broadcastedEvent = () => {
        for (const [type, operation] of operations) {
            if (hook['broadcasted_' + type]) {
                try {
                    hook['broadcasted_' + type]({ operation });
                } catch (error) {
                    console.error('broadcastPayload error', error);
                }
            }
        }
    };

    // get username
    const currentUser = yield select(state => state.user.get('current'));
    const currentUsername = currentUser && currentUser.get('username');
    username = username || currentUsername;

    try {
        yield new Promise((resolve, reject) => {
            // Bump transaction (for live UI testing).. Put 0 in now (no effect),
            // to enable browser's autocomplete and help prevent typos.
            const env = process.env;
            const bump = env.BROWSER
                ? parseInt(localStorage.getItem('bump') || 0)
                : 0;
            if (env.BROWSER && bump === 1) {
                // for testing
                console.log(
                    'TransactionSaga bump(no broadcast) and reject',
                    JSON.stringify(operations, null, 2)
                );
                setTimeout(() => {
                    reject(new Error('Testing, fake error'));
                }, 2000);
            } else if (env.BROWSER && bump === 2) {
                // also for testing
                console.log(
                    'TransactionSaga bump(no broadcast) and resolve',
                    JSON.stringify(operations, null, 2)
                );
                setTimeout(() => {
                    resolve();
                    broadcastedEvent();
                }, 2000);
            } else {
                if (!isLoggedInWithKeychain()) {
                    broadcast.send(
                        { extensions: [], operations },
                        keys,
                        err => {
                            if (err) {
                                reject(err);
                            } else {
                                broadcastedEvent();
                                resolve();
                            }
                        }
                    );
                } else {
                    const authType = needsActiveAuth ? 'active' : 'posting';
                    window.steem_keychain.requestBroadcast(
                        username,
                        operations,
                        authType,
                        response => {
                            if (!response.success) {
                                reject(response.message);
                            } else {
                                broadcastedEvent();
                                resolve();
                            }
                        }
                    );
                }
            }
        });
        // status: accepted
        for (const [type, operation] of operations) {
            if (hook['accepted_' + type]) {
                try {
                    yield call(hook['accepted_' + type], { operation });
                } catch (error) {
                    console.error('accepted_', error);
                }
            }
            const config = operation.__config;
            if (config && config.successMessage) {
                yield put(
                    appActions.addNotification({
                        key: 'trx_' + Date.now(),
                        message: config.successMessage,
                        dismissAfter: 5000,
                    })
                );
            }
        }
        if (successCallback)
            try {
                successCallback(operations);
            } catch (error) {
                console.error('defaultErrorCallback', error);
            }
    } catch (error) {
        console.error('TransactionSaga\tbroadcastPayload', error);
        // status: error
        yield put(
            transactionActions.error({ operations, error, errorCallback })
        );
        for (const [type, operation] of operations) {
            if (hook['error_' + type]) {
                try {
                    yield call(hook['error_' + type], { operation });
                } catch (error2) {
                    console.error('error_ hook error', error2);
                }
            }
        }
    }
}

function* accepted_comment({ operation }) {
    const { author, permlink } = operation;
    // update again with new $$ amount from the steemd node
    yield call(getContent, { author, permlink });
    yield put(globalActions.linkReply(operation));
}

function updateFollowState(action, following, state) {
    if (action == null) {
        state = state.update('blog_result', Set(), r => r.delete(following));
        state = state.update('ignore_result', Set(), r => r.delete(following));
    } else if (action === 'blog') {
        state = state.update('blog_result', Set(), r => r.add(following));
        state = state.update('ignore_result', Set(), r => r.delete(following));
    } else if (action === 'ignore') {
        state = state.update('ignore_result', Set(), r => r.add(following));
        state = state.update('blog_result', Set(), r => r.delete(following));
    }
    state = state.set('blog_count', state.get('blog_result', Set()).size);
    state = state.set('ignore_count', state.get('ignore_result', Set()).size);
    return state;
}

function* accepted_custom_json({ operation }) {
    const json = JSON.parse(operation.json);
    if (operation.id === 'follow') {
        console.log(operation);
        try {
            if (json[0] === 'follow') {
                const { follower, following, what: [action] } = json[1];
                yield put(
                    globalActions.update({
                        key: ['follow', 'getFollowingAsync', follower],
                        notSet: Map(),
                        updater: m => updateFollowState(action, following, m),
                    })
                );
            }
        } catch (e) {
            console.error(
                'TransactionSaga unrecognized follow custom_json format',
                operation.json
            );
        }
    }
    return operation;
}

function* accepted_delete_comment({ operation }) {
    yield put(globalActions.deleteContent(operation));
}

function* accepted_vote({ operation: { author, permlink, weight } }) {
    console.log(
        'Vote accepted, weight',
        weight,
        'on',
        author + '/' + permlink,
        'weight'
    );
    // update again with new $$ amount from the steemd node
    yield put(
        globalActions.remove({
            key: `transaction_vote_active_${author}_${permlink}`,
        })
    );
    yield call(getContent, { author, permlink });
}

export function* preBroadcast_comment({ operation, username }) {
    if (!operation.author) operation.author = username;
    let permlink = operation.permlink;
    const { author, __config: { originalBody, comment_options } } = operation;
    const {
        parent_author = '',
        parent_permlink = operation.category,
    } = operation;
    const { title } = operation;
    let { body } = operation;

    body = body.trim();

    let body2;
    if (originalBody) {
        const patch = createPatch(originalBody, body);
        // Putting body into buffer will expand Unicode characters into their true length
        if (patch && patch.length < new Buffer(body, 'utf-8').length)
            body2 = patch;
    }
    if (!body2) body2 = body;
    if (!permlink) permlink = yield createPermlink(title, author);

    if (typeof operation.json_metadata !== 'string')
        throw 'json not serialized';
    const op = {
        ...operation,
        permlink: permlink.toLowerCase(),
        parent_author,
        parent_permlink,
        title: (operation.title || '').trim(),
        body: body2,
    };

    const comment_op = [['comment', op]];

    // comment_options must come directly after comment
    if (comment_options) {
        const {
            max_accepted_payout = ['1000000.000', DEBT_TICKER].join(' '),
            percent_steem_dollars = 10000, // 10000 === 100%
            allow_votes = true,
            allow_curation_rewards = true,
        } = comment_options;
        comment_op.push([
            'comment_options',
            {
                author,
                permlink,
                max_accepted_payout,
                percent_steem_dollars,
                allow_votes,
                allow_curation_rewards,
                extensions: comment_options.extensions
                    ? comment_options.extensions
                    : [],
            },
        ]);
    }

    return comment_op;
}

export function* createPermlink(title, author) {
    let permlink;
    if (title && title.trim() !== '') {
        let s = slug(title);
        if (s === '') {
            s = base58.encode(secureRandom.randomBuffer(4));
        }
        // only letters numbers and dashes shall survive
        s = s.toLowerCase().replace(/[^a-z0-9-]+/g, '');

        // ensure the permlink is unique
        const head = yield call(callBridge, 'get_post_header', {
            author,
            permlink: s,
        });
        if (head && !!head.category) {
            const noise = base58
                .encode(secureRandom.randomBuffer(4))
                .toLowerCase();
            permlink = noise + '-' + s;
        } else {
            permlink = s;
        }

        // ensure permlink conforms to STEEMIT_MAX_PERMLINK_LENGTH
        if (permlink.length > 255) {
            permlink = permlink.substring(0, 255);
        }
    } else {
        permlink = Math.floor(Date.now() / 1000).toString(36);
    }

    return permlink;
}

import diff_match_patch from 'diff-match-patch';
const dmp = new diff_match_patch();

export function createPatch(text1, text2) {
    if (!text1 && text1 === '') return undefined;
    const patches = dmp.patch_make(text1, text2);
    const patch = dmp.patch_toText(patches);
    return patch;
}

function* error_custom_json({ operation: { id, required_posting_auths } }) {
    if (id === 'follow') {
        const follower = required_posting_auths[0];
        yield put(
            globalActions.update({
                key: ['follow', 'getFollowingAsync', follower, 'loading'],
                updater: () => null,
            })
        );
    }
}

function* error_vote({ operation: { author, permlink } }) {
    yield put(
        globalActions.remove({
            key: `transaction_vote_active_${author}_${permlink}`,
        })
    );
    yield call(getContent, { author, permlink }); // unvote
}

// function* error_comment({operation}) {
//     // Rollback an immediate UI update (the transaction had an error)
//     yield put(g.actions.deleteContent(operation))
//     const {author, permlink, parent_author, parent_permlink} = operation
//     yield call(getContent, {author, permlink})
//     if (parent_author !== '' && parent_permlink !== '') {
//         yield call(getContent, {parent_author, parent_permlink})
//     }
// }

function slug(text) {
    return getSlug(text.replace(/[<>]/g, ''), { truncate: 128 });
}
