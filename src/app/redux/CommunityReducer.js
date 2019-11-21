import { fromJS, Map, List } from 'immutable';

const GET_COMMUNITY_ROLES = 'community/GET_COMMUNITY_ROLES';
const GET_COMMUNITY_ROLES_PENDING = 'community/GET_COMMUNITY_ROLES_PENDING';
const SET_COMMUNITY_ROLES = 'community/SET_COMMUNITY_ROLES';

const GET_COMMUNITY_SUBSCRIBERS = 'community/GET_COMMUNITY_SUBSCRIBERS';
const GET_COMMUNITY_SUBSCRIBERS_PENDING =
    'community/GET_COMMUNITY_SUBSCRIBERS_PENDING';
const SET_COMMUNITY_SUBSCRIBERS = 'community/SET_COMMUNITY_SUBSCRIBERS';
const GET_COMMUNITY_SUBSCRIBERS_ERROR = 'community/SET_COMMUNITY_SUBSCRIBERS';

const UPDATE_USER_ROLE = 'community/UPDATE_USER_ROLE';
const SET_USER_ROLE_PENDING = 'community/SET_USER_ROLE_PENDING';
const APPLY_USER_ROLE = 'community/APPLY_USER_ROLE';

const defaultCommunityState = Map();

export default function reducer(state = defaultCommunityState, action) {
    const payload = action.payload;

    switch (action.type) {
        // Has Saga watcher.
        case GET_COMMUNITY_SUBSCRIBERS: {
            return state;
        }

        case GET_COMMUNITY_SUBSCRIBERS_PENDING: {
            const { community, pending } = payload;
            return state.setIn([community, 'listSubscribersPending'], pending);
        }

        case GET_COMMUNITY_SUBSCRIBERS_ERROR: {
            const { community, error } = payload;
            return state.setIn([community, 'listSubscribersError'], error);
        }

        case SET_COMMUNITY_SUBSCRIBERS: {
            const { community, subscribers } = payload;
            state.setIn([community, 'subscribers'], fromJS(subscribers));
            return state.setIn([community, 'subscribers'], fromJS(subscribers));
        }

        // Has Saga watcher.
        case GET_COMMUNITY_ROLES: {
            return state;
        }

        case GET_COMMUNITY_ROLES_PENDING: {
            const { community, pending } = payload;
            return state.setIn([community, 'listRolesPending'], pending);
        }
        case SET_COMMUNITY_ROLES: {
            const { community, roles } = payload;
            state.setIn([community, 'roles'], fromJS(roles));
            return state.setIn([community, 'roles'], fromJS(roles));
        }

        case SET_USER_ROLE_PENDING: {
            const { community, pending } = payload;
            return state.setIn([community, 'updatePending'], pending);
        }

        case APPLY_USER_ROLE: {
            const { community } = payload;
            const index = state
                .getIn([community, 'roles'])
                .findIndex(r => r.get(0) === payload.account);

            if (index === -1) {
                return state.updateIn([community, 'roles'], List(), list => {
                    return list.withMutations(items => {
                        items.push(List([payload.account, payload.role]));
                    });
                });
            } else {
                return state.updateIn([community, 'roles'], List(), items =>
                    items.update(index, item =>
                        item.set(0, payload.account).set(1, payload.role)
                    )
                );
            }
        }

        default:
            return state;
    }
}

/**
    @arg {community: string} payload action payload.
*/
export const getCommunityRoles = payload => ({
    type: GET_COMMUNITY_ROLES,
    payload,
});

/**
    @arg boolean payload action payload.
*/
export const getCommunityRolesPending = payload => ({
    type: GET_COMMUNITY_ROLES_PENDING,
    payload,
});

export const setCommunityRoles = payload => ({
    type: SET_COMMUNITY_ROLES,
    payload,
});

/**
    @arg {community: string} payload action payload.
*/
export const getCommunitySubscribers = payload => ({
    type: GET_COMMUNITY_SUBSCRIBERS,
    payload,
});

/**
    @arg boolean payload action payload.
*/
export const getCommunitySubscribersPending = payload => ({
    type: GET_COMMUNITY_SUBSCRIBERS_PENDING,
    payload,
});

/**
    @arg error payload action payload.
*/
export const getCommunitySubscribersError = payload => ({
    type: GET_COMMUNITY_SUBSCRIBERS_ERROR,
    payload,
});

export const setCommunitySubscribers = payload => ({
    type: SET_COMMUNITY_SUBSCRIBERS,
    payload,
});

export const updateUserRole = payload => ({
    type: UPDATE_USER_ROLE,
    payload,
});
export const setUserRolePending = payload => ({
    type: SET_USER_ROLE_PENDING,
    payload,
});
export const applyUserRole = payload => ({
    type: APPLY_USER_ROLE,
    payload,
});
