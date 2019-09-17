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

const ADD_USER_WITH_ROLE_TO_COMMUNITY =
    'community/ADD_USER_WITH_ROLE_TO_COMMUNITY';
const ADD_USER_WITH_ROLE_TO_COMMUNITY_PENDING =
    'community/ADD_USER_WITH_ROLE_TO_COMMUNITY_PENDING';
const ADD_USER_WITH_ROLE_TO_COMMUNITY_ERROR =
    'community/ADD_USER_WITH_ROLE_TO_COMMUNITY_ERROR';

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
        default:
            return state;
    }
}
