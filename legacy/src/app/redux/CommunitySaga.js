import { call, put, takeEvery, select } from 'redux-saga/effects';
import * as reducer from 'app/redux/CommunityReducer';
import { getCommunity } from 'app/redux/FetchDataSaga';
import { callBridge } from 'app/utils/steemApi';
import * as transactionActions from './TransactionReducer';

export const communityWatches = [
    takeEvery('community/GET_COMMUNITY_ROLES', getCommunityRoles),
    takeEvery('community/GET_COMMUNITY_SUBSCRIBERS', getCommunitySubscribers),
    takeEvery('community/UPDATE_USER_ROLE', updateUserRole),
];

export function* getCommunityRoles(action) {
    const community = action.payload;
    yield put(reducer.getCommunityRolesPending({ community, pending: true }));
    try {
        const roles = yield call(callBridge, 'list_community_roles', {
            community,
        });
        yield call(getCommunity, action);
        yield put(reducer.setCommunityRoles({ community, roles }));
    } catch (error) {
        yield put(reducer.getCommunityRolesError({ community, error }));
    }
    yield put(reducer.getCommunityRolesPending({ community, pending: false }));
}

export function* getCommunitySubscribers(action) {
    const community = action.payload;
    yield put(
        reducer.getCommunitySubscribersPending({ community, pending: true })
    );
    try {
        const subscribers = yield call(callBridge, 'list_subscribers', {
            community,
        });
        yield call(getCommunity, action);
        yield put(reducer.setCommunitySubscribers({ community, subscribers }));
    } catch (error) {
        yield put(reducer.getCommunitySubscribersError({ community, error }));
    }
    yield put(
        reducer.getCommunitySubscribersPending({ community, pending: false })
    );
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
