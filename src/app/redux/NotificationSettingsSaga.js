import { takeLatest } from 'redux-saga';
import { call, put, select } from 'redux-saga/effects';

import {
    getNotificationSettings,
    saveNotificationSettings,
} from 'app/utils/YoApiClient';
import * as notificationsettingsActions from './NotificationSettingsReducer';

export function getUsernameFromState(state) {
    return state.user.getIn(['current', 'username']);
}

export function getNotificationSettingsFromState(state) {
    return state.notificationsettings.get('groups');
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
        yield put(notificationsettingsActions.receiveError(payload.error));
    } else {
        yield put(notificationsettingsActions.receive(payload));
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
        yield put(notificationsettingsActions.receiveError(payload.error));
    } else {
        yield put(notificationsettingsActions.receive(payload));
    }
}

export function* NotificationSettingsSaga() {
    yield [
        takeLatest(
            notificationsettingsActions.FETCH,
            fetchNotificationSettings
        ),
        takeLatest(
            notificationsettingsActions.TOGGLE_GROUP,
            updateNotificationSettings
        ),
    ];
}
