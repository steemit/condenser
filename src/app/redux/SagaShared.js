import { fromJS } from 'immutable';
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import tt from 'counterpart';
import { api } from '@steemit/steem-js';
import * as globalActions from './GlobalReducer';
import * as appActions from './AppReducer';
import * as transactionActions from './TransactionReducer';
import { setUserPreferences, checkTronUser } from 'app/utils/ServerApiClient';
import { callBridge } from 'app/utils/steemApi';
import { getTronAccount } from 'app/utils/tronApi';

const wait = ms =>
    new Promise(resolve => {
        setTimeout(() => resolve(), ms);
    });

export const sharedWatches = [
    takeLatest(
        [
            appActions.SET_USER_PREFERENCES,
            appActions.TOGGLE_NIGHTMODE,
            appActions.TOGGLE_BLOGMODE,
        ],
        saveUserPreferences
    ),
    takeEvery('transaction/ERROR', showTransactionErrorNotification),
];

export function* getAccount(username, force = false) {
    let account = yield select(state =>
        state.global.get('accounts').get(username)
    );

    // hive never serves `owner` prop (among others)
    let isLite = !!account && !account.get('owner');

    if (!account || force || isLite) {
        console.log(
            'getAccount: loading',
            username,
            'force?',
            force,
            'lite?',
            isLite
        );

        [account] = yield call([api, api.getAccountsAsync], [username]);
        if (account) {
            // get tron information by steem username
            // and merge into account
            try {
                let tronAccount = fromJS(yield call(checkTronUser, username));

                // get tron balance and merge into account
                tronAccount = tronAccount.mergeDeep(
                    fromJS({ tron_balance: 0 })
                );
                if (tronAccount.get('tron_addr')) {
                    const tronNetworkAccount = yield call(
                        getTronAccount,
                        tronAccount.get('tron_addr')
                    );
                    if (
                        Object.keys(tronNetworkAccount).length > 0 &&
                        tronNetworkAccount.balance !== undefined
                    ) {
                        tronAccount = tronAccount.mergeDeep(
                            fromJS({
                                tron_balance: tronNetworkAccount.balance / 1e6,
                            })
                        );
                    }
                }
                // merge and update account
                account = fromJS(account).mergeDeep(tronAccount);
                yield put(globalActions.receiveAccount({ account }));
            } catch (err) {
                console.error('SagaShared getAccount:', err.message);
                account = fromJS(account);
                yield put(globalActions.receiveAccount({ account }));
            }
        }
    }
    return account;
}

function* showTransactionErrorNotification() {
    const errors = yield select(state => state.transaction.get('errors'));
    for (const [key, message] of errors) {
        // Do not display a notification for the bandwidthError key.
        if (key !== 'bandwidthError') {
            yield put(appActions.addNotification({ key, message }));
            yield put(transactionActions.deleteError({ key }));
        }
    }
}

export function* getContent({ author, permlink, resolve, reject }) {
    let content;
    while (!content) {
        console.log('getContent', author, permlink);
        content = yield call([api, api.getContentAsync], author, permlink);
        if (content['author'] == '') {
            // retry if content not found. #1870
            content = null;
            yield call(wait, 3000);
        }
    }

    function dbg(content) {
        const cop = Object.assign({}, content);
        delete cop['active_votes'];
        return JSON.stringify(cop);
    }

    //console.log('raw content> ', dbg(content));
    content = yield call(callBridge, 'normalize_post', { post: content });
    //console.log('normalized> ', dbg(content));

    yield put(globalActions.receiveContent({ content }));
    if (resolve && content) {
        resolve(content);
    } else if (reject && !content) {
        reject();
    }
}

/**
 * Save this user's preferences, either directly from the submitted payload or from whatever's saved in the store currently.
 *
 * @param {Object?} params.payload
 */
function* saveUserPreferences({ payload }) {
    if (payload) {
        yield setUserPreferences(payload);
    }

    const prefs = yield select(state => state.app.get('user_preferences'));
    yield setUserPreferences(prefs.toJS());
}
