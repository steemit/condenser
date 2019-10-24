import { call, put, takeEvery, select } from 'redux-saga/effects';
import * as reducer from 'app/redux/CommunityReducer';
import { findSigningKey } from 'app/redux/AuthSaga';
import { getCommunity } from 'app/redux/FetchDataSaga';
import { callBridge } from 'app/utils/steemApi';
import * as transactionActions from './TransactionReducer';

export const communityWatches = [
    takeEvery('community/LOAD_COMMUNITY_ROLES', loadCommunityRoles),
    takeEvery('community/UPDATE_USER_ROLE', updateUserRole),
];

export function* loadCommunityRoles(action) {
    const community = action.payload;
    yield put(reducer.setCommunityRolesPending({ community, pending: true }));
    const roles = yield call(callBridge, 'list_community_roles', { community });
    yield call(getCommunity, action);
    yield put(reducer.receiveCommunityRoles({ community, roles }));
    yield put(reducer.setCommunityRolesPending({ community, pending: false }));
}

export function* updateUserRole(action) {
    const { community } = action.payload;
    yield put(reducer.setUserRolePending({ community, pending: true }));
    try {
        const username = yield select(state =>
            state.user.getIn(['current', 'username'])
        );

        yield put(
            transactionActions.broadcastOperation({
                type: 'custom_json',
                operation: {
                    id: 'community',
                    required_posting_auths: [username],
                    json: JSON.stringify(['setRole', action.payload]),
                },
                //successCallback,
                //errorCallback,
            })
        );

        yield put(reducer.applyUserRole(action.payload));
    } catch (error) {
        console.log('update user error', error);
    }
    yield put(reducer.setUserRolePending({ community, pending: false }));
}
