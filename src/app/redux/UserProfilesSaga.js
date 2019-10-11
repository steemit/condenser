import { call, put, takeLatest } from 'redux-saga/effects';
import * as userProfileActions from './UserProfilesReducer';
import { callBridge } from 'app/utils/steemApi';

const FETCH_PROFILE = 'userProfilesSaga/FETCH_PROFILE';

export const userProfilesWatches = [
    takeLatest(FETCH_PROFILE, fetchUserProfile),
];

export function* fetchUserProfile(action) {
    const username = action.payload;
    const account = yield call(callBridge, 'get_profile', {
        account: username,
    });

    //TODO: use new profiles endpoint
    //authorAccount.json_metadata = JSON.parse(authorAccount.json_metadata);

    if (!account) throw new Error('Account not found');

    yield put(userProfileActions.addProfile({ username, account: account }));
}

// Action creators
export const actions = {
    fetchProfile: payload => ({
        type: FETCH_PROFILE,
        payload,
    }),
};
