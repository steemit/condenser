import { fromJS, Map, List } from 'immutable';

const SET_CURRENT_COMMUNITY = 'community/SET_CURRENT_COMMUNITY';

const LOAD_COMMUNITY_ROLES = 'community/LOAD_COMMUNITY_ROLES';
const SET_COMMUNITY_ROLES_PENDING = 'community/SET_COMMUNITY_ROLES_PENDING';
const RECEIVE_COMMUNITY_ROLES = 'community/RECEIVE_COMMUNITY_ROLES';

const UPDATE_USER_ROLE = 'community/UPDATE_USER_ROLE';
const SET_USER_ROLE_PENDING = 'community/SET_USER_ROLE_PENDING';
const APPLY_USER_ROLE = 'community/APPLY_USER_ROLE';

const defaultCommunityState = fromJS({
    communityName: '',
    roles: [],
    listPending: false,
    updatePending: false,
});

export default function reducer(state = defaultCommunityState, action) {
    const payload = action.payload;

    switch (action.type) {
        // Has a saga watcher.
        case SET_CURRENT_COMMUNITY: {
            return state.set({ communityName: payload });
        }

        case SET_COMMUNITY_ROLES_PENDING: {
            return state.merge({ listPending: payload });
        }

        case RECEIVE_COMMUNITY_ROLES: {
            const { communityName, roles } = payload;
            return state.merge({ communityName, roles });
        }

        // Has a saga watcher
        case UPDATE_USER_ROLE: {
            return state;
        }

        case SET_USER_ROLE_PENDING: {
            return state.merge({ updatePending: payload });
        }

        case APPLY_USER_ROLE: {
            const index = state
                .get('roles')
                .findIndex(r => r.get(0) === payload.account);

            if (index === -1) {
                return state.update('roles', List(), list => {
                    return list.withMutations(items => {
                        items.push(List([payload.account, payload.role]));
                    });
                });
            } else {
                return state.update('roles', List(), items =>
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
