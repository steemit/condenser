import { takeLatest, takeEvery } from 'redux-saga';
import { call, put, take, fork, race, select } from 'redux-saga/effects';
import { fetchAllNotifications, fetchSomeNotifications, markAsRead } from 'app/utils/YoApiClient';

export function getUsernameFromState(state) {
    return state.user.getIn(['currentfoo', 'username']);
}

export function getNotificationsById(state) {
    return state.notification.byId;
}

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

/**
 * Saga: notification/FETCH_ALL
 *
 * Fetch all notifications, with the expectation they'll replace the current store.
 */
export function* fetchAll() {
    const username = yield select(getUsernameFromState);
    const payload = yield call(fetchAllNotifications, username);

    yield put({
        type: 'notification/RECEIVE_ALL',
        payload,
    });
}

/**
 * Saga: notification/FETCH_SOME
 *
 * Fetch some more notifications, with the expectation they'll be UNIONed into the current store.
 *
 * @param {Object} options
 * @param {String[]} [options.types] only return these types; if not provided or falsey return all types
 * @param {String} [options.direction] either `before` or `after` to get, respectively, notifs created before or updated after what we currently have in state
 */
export function* fetchSome({ types = null, direction = 'after' }) {
    const username = yield select(getUsernameFromState);

    const allNotifs = yield select(getNotificationsById);

    // If direction is specified, find the latest or earliest notification's timestamp.
    // If types are specified, only search within those types.
    const filteredNotifs = types ? allNotifs.filter(n => types.indexOf(n.notify_type) > -1) : allNotifs;

    // Notifications are already reverse-sorted by `created` so we can just pull the last one.
    // Otherwise, sort by updated and pull the most recent (last) one.
    const timestamp = (direction === 'before') ? filteredNotifs.last().created : filteredNotifs.sortBy(n => n.updated).last().updated;

    const payload = yield call(fetchSomeNotifications, {
        username,
        types,
        [direction]: timestamp,
    });

    yield put({
        type: 'notification/APPEND_SOME',
        payload,
    });
}

/**
 * Saga: notification/UPDATE_ONE
 *
 * Ask Yo to update a single notification, with the expectation that the updated notification will eventually be appended to the current store.
 *
 * @param {String} id
 * @param {Object} updates
 */
export function* updateOne({ id, updates }) {
    if (updates.read === true) {
        const payload = yield call(markAsRead, [id]);

        yield put({
            type: 'notification/APPEND_SOME',
            payload,
        });
    }
}

export function* updateSome({ ids, updates }) {
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