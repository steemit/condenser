import { call, put, takeEvery } from 'redux-saga/effects';
import { api } from '@steemit/steem-js';
import * as communityActions from 'app/redux/CommunityReducer';

export const communityWatches = [
    takeEvery('community/LIST_COMMUNITY_ROLES', listCommunityRoles),
    takeEvery('community/UPDATE_USER_ROLE', updateCommunityUser),
    takeEvery('community/ADD_USER_WITH_ROLE_TO_COMMUNITY', addCommunityUser),
];

/**
    @arg string type the action type
    @arg {object} payload action payload.
*/

export function* listCommunityRoles({ payload: { communityHiveName } }) {
    yield put(communityActions.listCommunityRolesPending(true));
    try {
        const communityRoles = yield call(
            api,
            api.call(
                'bridge.list_community_roles',
                { community: communityHiveName },
                () => {
                    debugger;
                }
            )
        );
        yield put(communityActions.listCommunityRolesSuccess(communityRoles));
    } catch (error) {
        yield put(communityActions.listCommunityRolesError(error));
    }
    yield put(communityActions.listCommunityRolesPending(false));
}

export function* updateCommunityUser({ payload: { communityHiveName } }) {
    yield put(communityActions.updateCommunityUserPending(true));
    try {
        // TODO: Call list Community roles on success.
        yield put(communityActions.updateCommunityUserSuccess());
    } catch (error) {
        yield put(communityActions.updateCommunityUserError(error));
    }
    yield put(communityActions.updateCommunityUserPending(false));
}

export function* addCommunityUser({ payload: { communityHiveName } }) {
    yield put(communityActions.addCommunityUserPending(true));
    try {
        // TODO: Call list Community roles on success.
        yield put(communityActions.addCommunityUserSuccess());
    } catch (error) {
        yield put(communityActions.addCommunityUserError(error));
    }
    yield put(communityActions.addCommunityUserPending(false));
}
