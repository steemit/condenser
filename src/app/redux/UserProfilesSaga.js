import { call, put, takeLatest } from 'redux-saga/effects';
import * as userProfileActions from './UserProfilesReducer';
import { api } from '@steemit/steem-js';

const FETCH_PROFILE = 'userProfilesSaga/FETCH_PROFILE';

export const userProfilesWatches = [
    takeLatest(FETCH_PROFILE, fetchUserProfile),
];

export function* fetchUserProfile(action) {
    const username = action.payload;
    const chainAccount = yield call([api, api.getAccountsAsync], [username]);
    const authorAccount = chainAccount[0];
    authorAccount.json_metadata = JSON.parse(authorAccount.json_metadata);

    if (!chainAccount) throw new Error('Account not found');

    yield put(
        userProfileActions.addProfile({ username, account: authorAccount })
    );
}

// Action creators
export const actions = {
    fetchProfile: payload => ({
        type: FETCH_PROFILE,
        payload,
    }),
};
