import { fromJS, Map } from 'immutable';

// Action constants
const SET_CURRENT_COMMUNITY = 'community/SET_CURRENT_COMMUNITY';

const LIST_COMMUNITY_ROLES = 'community/LIST_COMMUNITY_ROLES';
const LIST_COMMUNITY_ROLES_PENDING = 'community/LIST_COMMUNITY_ROLES_PENDING';
const LIST_COMMUNITY_ROLES_ERROR = 'community/LIST_COMMUNITY_ROLES_ERROR';
const LIST_COMMUNITY_ROLES_SUCCESS = 'community/LIST_COMMUNITY_ROLES_SUCCESS';

const UPDATE_USER_ROLE = 'community/UPDATE_USER_ROLE';
const UPDATE_USER_ROLE_PENDING = 'community/UPDATE_USER_ROLE_PENDING';
const UPDATE_USER_ROLE_ERROR = 'community/UPDATE_USER_ROLE_ERROR';
const UPDATE_USER_ROLE_SUCCESS = 'community/UPDATE_USER_ROLE_SUCCESS';

const ADD_USER_WITH_ROLE_TO_COMMUNITY =
    'community/ADD_USER_WITH_ROLE_TO_COMMUNITY';
const ADD_USER_WITH_ROLE_TO_COMMUNITY_PENDING =
    'community/ADD_USER_WITH_ROLE_TO_COMMUNITY_PENDING';
const ADD_USER_WITH_ROLE_TO_COMMUNITY_ERROR =
    'community/ADD_USER_WITH_ROLE_TO_COMMUNITY_ERROR';
const ADD_USER_WITH_ROLE_TO_COMMUNITY_SUCCESS =
    'community/ADD_USER_WITH_ROLE_TO_COMMUNITY_SUCCESS';

const defaultCommunityState = fromJS({
    community: '',
    communityUsersWithRoles: [],
    communityListUsersWithRolesPending: false,
    communityListUsersWithRolesError: false,
    communityListUsersWithRoles: false,
    communityUpdateUserRolePending: false,
    communityUpdateUserRoleError: false,
    communityAddUserWithRolePending: false,
    communityAddUserWithRoleError: false,
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
                communityListUsersWithRolesPending: payload,
            });
        }
        case LIST_COMMUNITY_ROLES_ERROR: {
            return state.merge({
                communityListUsersWithRolesError: payload,
            });
        }
        case LIST_COMMUNITY_ROLES_SUCCESS: {
            return state.merge({ communityUsersWithRoles: payload });
        }
        // Has a saga watcher
        case UPDATE_USER_ROLE: {
            return state;
        }
        case UPDATE_USER_ROLE_PENDING: {
            return state.merge({ communityUpdateUserRolePending: payload });
        }
        case UPDATE_USER_ROLE_ERROR: {
            return state.merge({ communityUpdateUserRoleError: payload });
        }
        case UPDATE_USER_ROLE_SUCCESS: {
            return state;
        }
        // Has a saga watcher
        case ADD_USER_WITH_ROLE_TO_COMMUNITY: {
            return state;
        }
        case ADD_USER_WITH_ROLE_TO_COMMUNITY_PENDING: {
            return state.merge({ communityAddUserWithRolePending: payload });
        }
        case ADD_USER_WITH_ROLE_TO_COMMUNITY_ERROR: {
            return state.merge({
                communityAddUserWithRoleError: payload,
            });
        }
        case ADD_USER_WITH_ROLE_TO_COMMUNITY_SUCCESS: {
            return state;
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
    type: UPDATE_USER_ROLE_PENDING,
    payload,
});

export const listCommunityRolesError = payload => ({
    type: UPDATE_USER_ROLE_ERROR,
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

export const addCommunityUser = payload => ({
    type: ADD_USER_WITH_ROLE_TO_COMMUNITY,
    payload,
});

export const addCommunityUserPending = payload => ({
    type: ADD_USER_WITH_ROLE_TO_COMMUNITY_PENDING,
    payload,
});

export const addCommunityUserError = payload => ({
    type: ADD_USER_WITH_ROLE_TO_COMMUNITY_ERROR,
    payload,
});

export const addCommunityUserSuccess = payload => ({
    type: ADD_USER_WITH_ROLE_TO_COMMUNITY_SUCCESS,
    payload,
});

export const updateCommunityUserPending = payload => ({
    type: UPDATE_USER_ROLE_PENDING,
    payload,
});

export const updateCommunityUserError = payload => ({
    type: UPDATE_USER_ROLE_ERROR,
    payload,
});

export const updateCommunityUserSuccess = payload => ({
    type: UPDATE_USER_ROLE_SUCCESS,
    payload,
});
