import {fromJS} from 'immutable'
import {call, put, select} from 'redux-saga/effects';
import g from 'app/redux/GlobalReducer'
import {takeEvery, takeLatest} from 'redux-saga';
import tt from 'counterpart';
import {api} from 'steem';
import {setUserPreferences} from 'app/utils/ServerApiClient';

const wait = ms => (
    new Promise(resolve => {
        setTimeout(() => resolve(), ms)
    })
);

export const sharedWatches = [watchGetState, watchTransactionErrors, watchUserSettingsUpdates]

export function* getAccount(username, force = false) {
    let account = yield select(state => state.global.get('accounts').get(username))
    if (force || !account) {
        [account] = yield call([api, api.getAccountsAsync], [username])
        if(account) {
            account = fromJS(account)
            yield put(g.actions.receiveAccount({account}))
        }
    }
    return account
}

export function* watchGetState() {
    yield* takeEvery('global/GET_STATE', getState);
}
/** Manual refreshes.  The router is in FetchDataSaga. */
export function* getState({payload: {url}}) {
    try {
        const state = yield call([api, api.getStateAsync], url)
        yield put(g.actions.receiveState(state));
    } catch (error) {
        console.error('~~ Saga getState error ~~>', url, error);
        yield put({type: 'global/STEEM_API_ERROR', error: error.message});
    }
}

export function* watchTransactionErrors() {
    yield* takeEvery('transaction/ERROR', showTransactionErrorNotification);
}

function* showTransactionErrorNotification() {
    const errors = yield select(state => state.transaction.get('errors'));
    for (const [key, message] of errors) {
        yield put({type: 'ADD_NOTIFICATION', payload: {key, message}});
        yield put({type: 'transaction/DELETE_ERROR', payload: {key}});
    }
}

export function* getContent({author, permlink, resolve, reject}) {
    let content;
    while(!content) {
        content = yield call([api, api.getContentAsync], author, permlink);
        if(content["author"] == "") { // retry if content not found. #1870
            content = null;
            yield call(wait, 3000);
        }
    }

    yield put(g.actions.receiveContent({content}))
    if (resolve && content) {
        resolve(content);
    } else if (reject && !content) {
        reject();
    }
}

function* saveUserPreferences({payload}) {
    yield setUserPreferences(payload);
}

function* watchUserSettingsUpdates() {
    yield* takeLatest('SET_USER_PREFERENCES', saveUserPreferences);
}
