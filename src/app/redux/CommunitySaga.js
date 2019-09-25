import Promise from 'bluebird';
import { call, put, takeEvery, select } from 'redux-saga/effects';
import { api, broadcast, auth } from '@steemit/steem-js';
import * as communityActions from 'app/redux/CommunityReducer';
import { postingOps, findSigningKey } from 'app/redux/AuthSaga';

const wait = ms =>
    new Promise(resolve => {
        setTimeout(() => resolve(), ms);
    });

export async function callBridge(method, params) {
    api.setOptions({ url: 'https://api.steemitdev.com' });
    const call = (method, params, callback) => {
        return api.call('bridge.' + method, params, callback);
    };
    return Promise.promisify(call)(method, params);
}

const generateHivemindOperation = (action, params, actor_name) => {
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
    takeEvery('community/ADD_USER_WITH_ROLE_TO_COMMUNITY', addCommunityUser),
];

export function* listCommunityRoles(action) {
    yield put(communityActions.listCommunityRolesPending(true));
    try {
        const communityRoles = yield call(callBridge, 'list_community_roles', {
            community: action.payload,
        });
        yield put(communityActions.listCommunityRolesSuccess(communityRoles));
    } catch (error) {
        yield put(
            communityActions.listCommunityRolesError(
                error ? error.toString() : true
            )
        );
    }
    yield put(communityActions.listCommunityRolesPending(false));
}

export function* updateCommunityUser(action) {
    yield put(communityActions.updateCommunityUserPending(true));
    try {
        // TODO: Call list Community roles on success.
        yield put(communityActions.updateCommunityUserSuccess());
    } catch (error) {
        yield put(communityActions.updateCommunityUserError(error));
    }
    yield put(communityActions.updateCommunityUserPending(false));
}

export function* addCommunityUser(action) {
    yield put(communityActions.addCommunityUserPending(true));
    try {
        const { community, username, role } = action.payload;
        const currentUser = yield select(state => state.user.get('current'));
        const currentUsername = currentUser && currentUser.get('username');
        const signingKey = yield call(findSigningKey, {
            opType: 'custom_json',
            currentUsername,
        });
        const setRoleOperation = generateHivemindOperation(
            'setRole',
            { community: community, account: username, role: role },
            currentUsername
        );

        yield broadcast.sendAsync(
            {
                extensions: [],
                operations: [setRoleOperation],
            },
            [signingKey]
        );
        yield call(wait, 4000);
        yield put(communityActions.listCommunityRoles(community));
        yield put(communityActions.addCommunityUserSuccess());
    } catch (error) {
        yield put(communityActions.addCommunityUserError(error));
    }
    yield put(communityActions.addCommunityUserPending(false));
}
