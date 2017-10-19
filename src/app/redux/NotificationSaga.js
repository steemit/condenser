import { takeLatest } from 'redux-saga';
import { call, put, take, fork, race, select } from 'redux-saga/effects';
import { fetchAllNotifications, fetchSomeNotifications, markAsRead } from 'app/utils/YoApiClient';

const POLL_WAIT_MS = 5000;

export function getUsernameFromState(state) {
    return state.user.getIn(['current', 'username']);
}

export function getNotificationsById(state) {
    return state.notification.byId;
}

export function getIdsReadPending(state) {
    return state.notification.idsReadPending;
}

export function getIdsShownPending(state) {
    return state.notification.idsShownPending;
}

/**
 * Derive the correct timestamp from some notifications based on the desired direction.
 *
 * @param {String} direction
 * @param {OrderedMap} filteredNotifs
 * @return {Boolean|String}
 */
export function getTimestamp(direction, filteredNotifs) {
    if (filteredNotifs.count() < 1) return false;

    return (direction === 'before') ? filteredNotifs.last().created : filteredNotifs.sortBy(n => n.updated).last().updated;
}

function delay(millis) {
    const promise = new Promise(resolve => {
        setTimeout(() => resolve(true), millis);
    });
    return promise;
}

function* pollNotifications() {
    try {
        yield call(delay, POLL_WAIT_MS);
        yield put({
            type: 'notification/FETCH_SOME',
            direction: 'after',
        });
    } catch (error) {
        yield put({
            type: 'notification/APPEND_SOME_ERROR', // maybe another type here?
            msg: 'poll cancelled',
        });
    }
}

/**
 * Wait for successful response, then fire another request.
 * Cancel polling if user logs out.
 */
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
 * After any server notifs come in, wait a couple seconds, take a diff of user changes,
 * and for anything that's changed, send the updates to the server.
 */
function* watchSyncData() {
    while (true) {
        yield call(delay, POLL_WAIT_MS);

        const idsReadPending = yield select(getIdsReadPending);
        const idsShownPending = yield select(getIdsShownPending);

        // todo: pause watchPollData at this point -- or maybe we just do this in the same loop?
        if (idsReadPending.count() + idsShownPending.count() > 0) {
            // this is what we want when shown endpoint is up
            // todo: once mark-as-shown is available get this up & running
        }

        if (idsReadPending.count() > 0) {
            // for now during dev, we only mark as read
            const payload = yield call(markAsRead, idsReadPending.toArray());

            if (payload.error) {
                yield put({
                    type: 'notification/SENT_UPDATES_ERROR',
                    msg: payload.error,
                });
            } else {
                yield put({
                    type: 'notification/SENT_UPDATES',
                    updates: { read: true },
                });

                yield put({
                    type: 'notification/APPEND_SOME',
                    payload,
                });
            }
        }
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

    if (payload.error) {
        yield put({
            type: 'notification/RECEIVE_ALL_ERROR',
            msg: payload.error,
        });
    } else {
        yield put({
            type: 'notification/RECEIVE_ALL',
            payload,
        });
    }
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
    const timestamp = yield call(getTimestamp, direction, filteredNotifs);
    const filter = {};
    if (timestamp) {
        filter[direction] = timestamp;
    }

    const payload = yield call(fetchSomeNotifications, {
        username,
        types,
        ...filter,
    });

    if (payload.error) {
        yield put({
            type: 'notification/APPEND_SOME_ERROR',
            msg: payload.error,
        });
    } else {
        yield put({
            type: 'notification/APPEND_SOME',
            payload,
        });
    }
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
//    yield fork(watchPollData);
//    yield fork(watchSyncData);
}

export function* NotificationFetchSaga() {
    yield [
        takeLatest('notification/FETCH_ALL', fetchAll),
        takeLatest('notification/FETCH_SOME', fetchSome),
        //takeEvery('notification/UPDATE_ONE', updateOne),
        //takeEvery('notification/UPDATE_SOME', updateSome),
    ];
}
