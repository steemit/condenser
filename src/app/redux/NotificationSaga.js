import { takeLatest } from 'redux-saga';
import { call, put, take, fork, race, select } from 'redux-saga/effects';

import {
    fetchNotifications,
    markAsRead,
    markAsUnread,
    markAsShown,
} from 'app/utils/YoApiClient';
import * as notificationActions from './NotificationReducer';

import { selectors as userSelectors } from './UserReducer';

const POLL_WAIT_MS = 5000;

const notificationSelectors = notificationActions.selectors;

/**
 * Derive the correct timestamp from some notifications based on the desired direction.
 *
 * @param {String} direction
 * @param {OrderedMap} filteredNotifs
 * @return {Boolean|String}
 */
export function getTimestamp(direction, filteredNotifs) {
    if (filteredNotifs.count() < 1) return false;

    return direction === 'before'
        ? filteredNotifs.last().created
        : filteredNotifs.sortBy(n => n.updated).last().updated;
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
        yield put(notificationActions.fetchSome('after'));
    } catch (error) {
        yield put(notificationActions.appendSomeError('poll cancelled')); // maybe another type here?
    }
}

/**
 * Wait for successful response, then fire another request.
 * Cancel polling if user logs out.
 */
function* watchPollData() {
    while (true) {
        yield take([
            notificationActions.RECEIVE_ALL, // hang out til we get our first batch of notifs...
            notificationActions.APPEND_SOME, // or after one of the polls are done
        ]);

        const idsReadPending = yield select(
            notificationSelectors.getIdsReadPending
        );
        const idsUnreadPending = yield select(
            notificationSelectors.getIdsUnreadPending
        );
        const idsShownPending = yield select(
            notificationSelectors.getIdsShownPending
        );

        if (idsReadPending.count() > 0) {
            const payload = yield call(markAsRead, idsReadPending.toArray());

            if (payload.error) {
                yield put(notificationActions.sentUpdatesError(payload.error));
            } else {
                yield put(notificationActions.sentUpdates({ read: true }));
            }
        }

        if (idsUnreadPending.count() > 0) {
            const payload = yield call(
                markAsUnread,
                idsUnreadPending.toArray()
            );

            if (payload.error) {
                yield put(notificationActions.sentUpdatesError(payload.error));
            } else {
                yield put(notificationActions.sentUpdates({ read: false }));
            }
        }

        if (idsShownPending.count() > 0) {
            const payload = yield call(markAsShown, idsShownPending.toArray());

            if (payload.error) {
                yield put(notificationActions.sentUpdatesError(payload.error));
            } else {
                yield put(notificationActions.sentUpdates({ shown: true }));
            }
        }

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
    const username = yield select(userSelectors.getUsername);

    try {
        const payload = yield call(fetchNotifications, username);
        yield put(notificationActions.receiveAll(payload));
    } catch (error) {
        yield put(notificationActions.receiveAllError(error));
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
 * @param {Object} list which list is this fetch related to?
 */
export function* fetchSome({ types = null, direction = 'after' }) {
    try {
        const username = yield select(userSelectors.getUsername);

        const allNotifs = yield select(
            notificationSelectors.getNotificationsById
        );

        // If direction is specified, find the latest or earliest notification's timestamp.
        // If types are specified, only search within those types.
        const filteredNotifs = types
            ? allNotifs.filter(n => types.indexOf(n.notify_type) > -1)
            : allNotifs;

        // Notifications are already reverse-sorted by `created` so we can just pull the last one.
        // Otherwise, sort by updated and pull the most recent (last) one.
        const timestamp = yield call(getTimestamp, direction, filteredNotifs);
        const filter = {};
        if (timestamp) {
            filter[direction] = timestamp;
        }

        try {
            const payload = yield call(fetchNotifications, {
                username,
                types,
                ...filter,
            });

            yield put(notificationActions.appendSome(payload));

            if (direction === 'before') {
                yield put(
                    notificationActions.setLastFetchBeforeCount(
                        types ? types.toString() : 'all',
                        payload.length
                    )
                );
            }
        } catch (error) {
            yield put(notificationActions.appendSomeError(error));
        }
    } catch (err) {
        yield put(notificationActions.fetchSomeError('poll cancelled'));
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
        try {
            const payload = yield call(markAsRead, [id]);
            yield put(notificationActions.appendSome(payload));
        } catch (error) {
            // TODO
        }
    }
}

export function* updateSome({ ids, updates }) {
    if (updates.read === true) {
        try {
            const payload = yield call(markAsRead, ids);
            yield put(notificationActions.appendSome(payload));
        } catch (error) {
            // TODO
        }
    }
}

export function* NotificationPollSaga() {
    yield fork(watchPollData);
}

export function* NotificationFetchSaga() {
    yield [
        takeLatest(notificationActions.FETCH_ALL, fetchAll),
        takeLatest(notificationActions.FETCH_SOME, fetchSome),
    ];
}
