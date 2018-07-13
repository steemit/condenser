import { fromJS } from 'immutable';
import { call, put, select } from 'redux-saga/effects';
import { takeEvery, takeLatest } from 'redux-saga';
import tt from 'counterpart';
import { api } from '@steemit/steem-js';
import * as globalActions from './GlobalReducer';
import * as appActions from './AppReducer';
import * as transactionActions from './TransactionReducer';
import { setUserPreferences } from 'app/utils/ServerApiClient';

const wait = ms =>
    new Promise(resolve => {
        setTimeout(() => resolve(), ms);
    });

export const sharedWatches = [
    watchGetState,
    watchTransactionErrors,
    watchUserSettingsUpdates,
];

export function* getAccount(username, force = false) {
    let account = yield select(state =>
        state.global.get('accounts').get(username)
    );
    if (force || !account) {
        [account] = yield call([api, api.getAccountsAsync], [username]);
        if (account) {
            account = fromJS(account);
            yield put(globalActions.receiveAccount({ account }));
        }
    }
    return account;
}

export function* watchGetState() {
    yield* takeEvery(globalActions.GET_STATE, getState);
}
/** Manual refreshes.  The router is in FetchDataSaga. */
export function* getState({ payload: { url } }) {
    try {
        const state = yield call([api, api.getStateAsync], url);
        yield put(globalActions.receiveState(state));
    } catch (error) {
        console.error('~~ Saga getState error ~~>', url, error);
        yield put(appActions.steemApiError(error.message));
    }
}

export function* watchTransactionErrors() {
    yield* takeEvery('transaction/ERROR', showTransactionErrorNotification);
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
        content = yield call([api, api.getContentAsync], author, permlink);
        if (content['author'] == '') {
            // retry if content not found. #1870
            content = null;
            yield call(wait, 3000);
        }
    }

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

function* watchUserSettingsUpdates() {
    yield* takeLatest(
        [
            appActions.SET_USER_PREFERENCES,
            appActions.TOGGLE_NIGHTMODE,
            appActions.TOGGLE_BLOGMODE,
        ],
        saveUserPreferences
    );
}
