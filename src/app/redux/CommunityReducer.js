import { fromJS, Map, List } from 'immutable';

const LOAD_COMMUNITY_ROLES = 'community/LOAD_COMMUNITY_ROLES';
const SET_COMMUNITY_ROLES_PENDING = 'community/SET_COMMUNITY_ROLES_PENDING';
const RECEIVE_COMMUNITY_ROLES = 'community/RECEIVE_COMMUNITY_ROLES';

const UPDATE_USER_ROLE = 'community/UPDATE_USER_ROLE';
const SET_USER_ROLE_PENDING = 'community/SET_USER_ROLE_PENDING';
const APPLY_USER_ROLE = 'community/APPLY_USER_ROLE';

const defaultCommunityState = Map();

export default function reducer(state = defaultCommunityState, action) {
    const payload = action.payload;

    switch (action.type) {
        case SET_COMMUNITY_ROLES_PENDING: {
            const { community, pending } = payload;
            return state.setIn([community, 'listPending'], pending);
        }

        case RECEIVE_COMMUNITY_ROLES: {
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
export const loadCommunityRoles = payload => ({
    type: LOAD_COMMUNITY_ROLES,
    payload,
});

/**
    @arg boolean payload action payload.
*/
export const setCommunityRolesPending = payload => ({
    type: SET_COMMUNITY_ROLES_PENDING,
    payload,
});

export const receiveCommunityRoles = payload => ({
    type: RECEIVE_COMMUNITY_ROLES,
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
