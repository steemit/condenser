import { takeLatest, takeEvery } from 'redux-saga';
import { call, put, take, fork, race } from 'redux-saga/effects';
import { fetchAllNotifications, fetchSomeNotifications, markAsRead } from 'app/utils/YoApiClient';

function delay(millis) {
    const promise = new Promise(resolve => {
        setTimeout(() => resolve(true), millis);
    });
    return promise;
}

function* pollNotifications() {
    try {
        yield call(delay, 5000);
        yield put({
            type: 'notification/FETCH_SOME',
            username: 'test_user', // todo: get user from state
            since: 123, // todo: store timestamp in state & use it here -- action should update timestamp when txn is complete
        });
    } catch (error) {
        // cancellation error -- can handle this if you wish
        return;
    }
}

// Wait for successful response, then fire another request
// Cancel polling if user logs out
function* watchPollData() {
    while (true) {
        yield take([
            'notification/RECEIVE_ALL', // hang out til we get our first batch of notifs...
            'notification/APPEND_SOME', // or after one of the polls are done
        ]);
        yield race([
            call(pollNotifications), // and then queue up
            take('user/LOGOUT'), // or quit if they log out
        ]);
    }
}

function* fetchAll({ username }) {
    const payload = yield call(fetchAllNotifications, username);

    yield put({
        type: 'notification/RECEIVE_ALL',
        payload,
    });
}

function* fetchSome({ username, since }) {
    const payload = yield call(fetchSomeNotifications, username, since);

    yield put({
        type: 'notification/APPEND_SOME',
        payload,
    });
}

function* updateOne({ id, updates }) {
    if (updates.read === true) {
        const payload = yield call(markAsRead, [id]);

        yield put({
            type: 'notification/APPEND_SOME',
            payload,
        });
    }
}

function* updateSome({ ids, updates }) {
    if (updates.read === true) {
        const payload = yield call(markAsRead, ids);

        yield put({
            type: 'notification/APPEND_SOME',
            payload,
        });
    }
}

export function* NotificationPollSaga() {
    yield [
        fork(watchPollData),
    ];
}

export function* NotificationFetchSaga() {
    yield [
        takeLatest('notification/FETCH_ALL', fetchAll),
        takeLatest('notification/FETCH_SOME', fetchSome),
        takeEvery('notification/UPDATE_ONE', updateOne),
        takeEvery('notification/UPDATE_SOME', updateSome),
    ];
}