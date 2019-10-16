import Promise from 'bluebird';
import { call, put, takeEvery, select } from 'redux-saga/effects';
import { broadcast, auth } from '@steemit/steem-js';
import * as communityActions from 'app/redux/CommunityReducer';
import { postingOps, findSigningKey } from 'app/redux/AuthSaga';
import { callBridge } from 'app/utils/steemApi';

const customOp = (action, params, actor_name) => {
    return [
        'custom_json',
        {
            required_auths: [],
            required_posting_auths: [actor_name],
            id: 'community',
            json: JSON.stringify([action, params]),
        },
    ];
};

export const communityWatches = [
    takeEvery('community/LIST_COMMUNITY_ROLES', listCommunityRoles),
    takeEvery('community/UPDATE_USER_ROLE', updateCommunityUser),
];

export function* listCommunityRoles(action) {
    yield put(communityActions.listCommunityRolesPending(true));
    try {
        const communityRoles = yield call(callBridge, 'list_community_roles', {
            community: action.payload,
        });
        yield put(communityActions.listCommunityRolesSuccess(communityRoles));
    } catch (error) {
        console.log(error);
    }
    yield put(communityActions.listCommunityRolesPending(false));
}

export function* updateCommunityUser(action) {
    yield put(communityActions.updateCommunityUserPending(true));
    try {
        const username = yield select(state =>
            state.user.getIn(['current', 'username'])
        );
        const signingKey = yield call(findSigningKey, {
            opType: 'custom_json',
            username,
        });

        const operations = [customOp('setRole', action.payload, username)];
        yield broadcast.sendAsync({ extensions: [], operations }, [signingKey]);

        yield put(communityActions.updateCommunityUserSuccess(action.payload));
    } catch (error) {
        console.log('update user error', error);
    }
    yield put(communityActions.updateCommunityUserPending(false));
}
