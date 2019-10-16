import { fromJS, Map, List } from 'immutable';

const SET_CURRENT_COMMUNITY = 'community/SET_CURRENT_COMMUNITY';

const LIST_COMMUNITY_ROLES = 'community/LIST_COMMUNITY_ROLES';
const LIST_COMMUNITY_ROLES_PENDING = 'community/LIST_COMMUNITY_ROLES_PENDING';
const LIST_COMMUNITY_ROLES_SUCCESS = 'community/LIST_COMMUNITY_ROLES_SUCCESS';

const UPDATE_USER_ROLE = 'community/UPDATE_USER_ROLE';
const UPDATE_USER_ROLE_PENDING = 'community/UPDATE_USER_ROLE_PENDING';
const UPDATE_USER_ROLE_SUCCESS = 'community/UPDATE_USER_ROLE_SUCCESS';

const defaultCommunityState = fromJS({
    community: '',
    roles: [],
    listPending: false,
    updatePending: false,
});

export default function reducer(state = defaultCommunityState, action) {
    const payload = action.payload;

    switch (action.type) {
        // Has a saga watcher.
        case SET_CURRENT_COMMUNITY: {
            return state.merge({ community: payload });
        }

        // Has a saga watcher.
        case LIST_COMMUNITY_ROLES: {
            return state;
        }
        case LIST_COMMUNITY_ROLES_PENDING: {
            return state.merge({
                listPending: payload,
            });
        }
        case LIST_COMMUNITY_ROLES_SUCCESS: {
            return state.merge({ roles: payload });
        }

        // Has a saga watcher
        case UPDATE_USER_ROLE: {
            return state;
        }
        case UPDATE_USER_ROLE_PENDING: {
            return state.merge({ updatePending: payload });
        }
        case UPDATE_USER_ROLE_SUCCESS: {
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
    @arg string community name.
*/
export const setCurrentCommunity = payload => ({
    type: SET_CURRENT_COMMUNITY,
    payload,
});

/**
    @arg {community: string} payload action payload.
*/
export const listCommunityRoles = payload => {
    return {
        type: LIST_COMMUNITY_ROLES,
        payload,
    };
};

/**
    @arg boolean payload action payload.
*/
export const listCommunityRolesPending = payload => ({
    type: LIST_COMMUNITY_ROLES_PENDING,
    payload,
});

export const listCommunityRolesSuccess = payload => ({
    type: LIST_COMMUNITY_ROLES_SUCCESS,
    payload,
});

export const updateCommunityUser = payload => ({
    type: UPDATE_USER_ROLE,
    payload,
});
export const updateCommunityUserPending = payload => ({
    type: UPDATE_USER_ROLE_PENDING,
    payload,
});
export const updateCommunityUserSuccess = payload => ({
    type: UPDATE_USER_ROLE_SUCCESS,
    payload,
});
