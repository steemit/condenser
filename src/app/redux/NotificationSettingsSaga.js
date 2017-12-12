import { takeLatest } from 'redux-saga';
import { call, put, select } from 'redux-saga/effects';
import {
    getNotificationSettings,
    saveNotificationSettings,
} from 'app/utils/YoApiClient';

export function getUsernameFromState(state) {
    return state.user.getIn(['current', 'username']);
}

export function getNotificationSettingsFromState(state) {
    return state.notificationsettings.groups;
}

/**
 * Saga: notificationsettings/FETCH
 *
 * Ask Yo for the current user's settings.
 */
export function* fetchNotificationSettings() {
    const username = yield select(getUsernameFromState);
    const payload = yield call(getNotificationSettings, username);

    if (payload.error) {
        yield put({
            type: 'notificationsettings/RECEIVE_ERROR',
            msg: payload.error,
        });
    } else {
        yield put({
            type: 'notificationsettings/RECEIVE',
            payload,
        });
    }
}

/**
 * Saga: notificationsettings/UPDATE
 *
 * Save the settings we have in our state to Yo.
 */
export function* updateNotificationSettings() {
    const username = yield select(getUsernameFromState);
    const settings = yield select(getNotificationSettingsFromState);

    const payload = yield call(saveNotificationSettings, username, settings);

    if (payload.error) {
        yield put({
            type: 'notificationsettings/RECEIVE_ERROR',
            msg: payload.error,
        });
    } else {
        yield put({
            type: 'notificationsettings/RECEIVE',
            payload,
        });
    }
}

export function* NotificationSettingsSaga() {
    yield [
        takeLatest('notificationsettings/FETCH', fetchNotificationSettings),
        takeLatest(
            'notificationsettings/TOGGLE_GROUP',
            updateNotificationSettings
        ),
    ];
}
