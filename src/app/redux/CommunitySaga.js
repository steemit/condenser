import Promise from 'bluebird';
import { call, put, takeEvery } from 'redux-saga/effects';
import { api, broadcast, auth } from '@steemit/steem-js';
import * as communityActions from 'app/redux/CommunityReducer';

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
        /*
      [
        ["hive-174552", "owner", ""],
        ["maitland", "admin", ""]
      ];
      */
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
        const setRoleOperation = generateHivemindOperation(
            'setRole',
            {
                community: communityOwnerName,
                account: accountName,
                role: 'admin',
            },
            communityOwnerName,
            communityOwnerPosting
        );
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

export function* customOps(action) {
    const {
        accountName,
        communityTitle,
        communityDescription,
        communityNSFW,
        communityOwnerName,
        communityOwnerWifPassword,
    } = action.payload;
    yield call(wait, 3000);
    try {
        const communityOwnerPosting = auth.getPrivateKeys(
            communityOwnerName,
            communityOwnerWifPassword,
            ['posting']
        );

        const setRoleOperation = generateHivemindOperation(
            'setRole',
            {
                community: communityOwnerName,
                account: accountName,
                role: 'admin',
            },
            communityOwnerName,
            communityOwnerPosting
        );

        const updatePropsOperation = generateHivemindOperation(
            'updateProps',
            {
                community: communityOwnerName,
                props: {
                    title: communityTitle,
                    about: communityDescription,
                    is_nsfw: !!communityNSFW,
                },
            },
            communityOwnerName,
            communityOwnerPosting
        );

        yield broadcast.sendAsync(
            {
                extensions: [],
                operations: [setRoleOperation, updatePropsOperation],
            },
            [
                auth.toWif(
                    communityOwnerName,
                    communityOwnerWifPassword,
                    'posting'
                ),
            ]
        );
    } catch (error) {}
}
