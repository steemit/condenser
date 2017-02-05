import {fromJS} from 'immutable'
import {call, put, select} from 'redux-saga/effects';
import Apis from 'shared/api_client/ApiInstances';
import g from 'app/redux/GlobalReducer'
import {takeEvery} from 'redux-saga';
import { translate } from '../Translator.js';

const wait = ms => (
    new Promise(resolve => {
        setTimeout(() => resolve(), ms)
    })
);

export const sharedWatches = [watchGetState, watchWsConnectionStatus, watchTransactionErrors]

export function* getAccount(username, force = false) {
    let account = yield select(state => state.global.get('accounts').get(username))
    if (force || !account) {
        [account] = yield call(Apis.db_api, 'get_accounts', [username])
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
        const db_api = Apis.instance().db_api;
        const state = yield call([db_api, db_api.exec], 'get_state', [url]);
        yield put(g.actions.receiveState(state));
    } catch (error) {
        console.error('~~ Saga getState error ~~>', url, error);
        yield put({type: 'global/STEEM_API_ERROR', error: error.message});
    }
}

export function* watchWsConnectionStatus() {
    yield* takeEvery('WS_CONNECTION_STATUS', showConnectionErrorNotification);
}

function* showConnectionErrorNotification({payload: {status}}) {
    const notifications = yield select(state => state.app.get('notifications'));
    if (notifications && notifications.has('ws:connection:error')) {
        if (status === 'open') {
            yield put({type: 'REMOVE_NOTIFICATION', payload: {key: 'ws:connection:error'}});
        }
    } else if (status !== 'open') {
        yield call(wait, 3000);
        const ws_connection = yield select(state => state.app.get('ws_connection'));
        if (ws_connection && ws_connection.status !== 'open') {
            yield put({type: 'ADD_NOTIFICATION', payload:
                {key: 'ws:connection:error',
                 message: translate('connection_lost_reconnecting') + '..',
                 dismissAfter: 15000}
            });
        }
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
    const content = yield call([Apis, Apis.db_api], 'get_content', author, permlink);
    yield put(g.actions.receiveContent({content}))
    if (resolve && content) {
        resolve(content);
    } else if (reject && !content) {
        reject();
    }
}
