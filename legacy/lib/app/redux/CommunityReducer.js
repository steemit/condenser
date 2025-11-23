'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.applyUserRole = exports.setUserRolePending = exports.updateUserRole = exports.setCommunitySubscribers = exports.getCommunitySubscribersError = exports.getCommunitySubscribersPending = exports.getCommunitySubscribers = exports.setCommunityRoles = exports.getCommunityRolesError = exports.getCommunityRolesPending = exports.getCommunityRoles = undefined;
exports.default = reducer;

var _immutable = require('immutable');

var GET_COMMUNITY_ROLES = 'community/GET_COMMUNITY_ROLES';
var GET_COMMUNITY_ROLES_PENDING = 'community/GET_COMMUNITY_ROLES_PENDING';
var SET_COMMUNITY_ROLES = 'community/SET_COMMUNITY_ROLES';
var GET_COMMUNITY_ROLES_ERROR = 'community/GET_COMMUNITY_ROLES_ERROR';

var GET_COMMUNITY_SUBSCRIBERS = 'community/GET_COMMUNITY_SUBSCRIBERS';
var GET_COMMUNITY_SUBSCRIBERS_PENDING = 'community/GET_COMMUNITY_SUBSCRIBERS_PENDING';
var SET_COMMUNITY_SUBSCRIBERS = 'community/SET_COMMUNITY_SUBSCRIBERS';
var GET_COMMUNITY_SUBSCRIBERS_ERROR = 'community/GET_COMMUNITY_SUBSCRIBERS_ERROR';

var UPDATE_USER_ROLE = 'community/UPDATE_USER_ROLE';
var SET_USER_ROLE_PENDING = 'community/SET_USER_ROLE_PENDING';
var APPLY_USER_ROLE = 'community/APPLY_USER_ROLE';

var defaultCommunityState = (0, _immutable.Map)();

function reducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultCommunityState;
    var action = arguments[1];

    var payload = action.payload;
    switch (action.type) {
        // Has Saga watcher.
        case GET_COMMUNITY_SUBSCRIBERS:
            {
                return state;
            }

        case GET_COMMUNITY_SUBSCRIBERS_PENDING:
            {
                var community = payload.community,
                    pending = payload.pending;

                return state.setIn([community, 'listSubscribersPending'], pending);
            }

        case GET_COMMUNITY_SUBSCRIBERS_ERROR:
            {
                var _community = payload.community,
                    error = payload.error;

                return state.setIn([_community, 'listSubscribersError'], error);
            }

        case SET_COMMUNITY_SUBSCRIBERS:
            {
                var _community2 = payload.community,
                    subscribers = payload.subscribers;

                return state.setIn([_community2, 'subscribers'], subscribers);
            }

        // Has Saga watcher.
        case GET_COMMUNITY_ROLES:
            {
                return state;
            }

        case GET_COMMUNITY_ROLES_PENDING:
            {
                var _community3 = payload.community,
                    _pending = payload.pending;

                return state.setIn([_community3, 'listRolesPending'], _pending);
            }
        case SET_COMMUNITY_ROLES:
            {
                var _community4 = payload.community,
                    roles = payload.roles;

                state.setIn([_community4, 'roles'], (0, _immutable.fromJS)(roles));
                return state.setIn([_community4, 'roles'], (0, _immutable.fromJS)(roles));
            }

        case SET_USER_ROLE_PENDING:
            {
                var _community5 = payload.community,
                    _pending2 = payload.pending;

                return state.setIn([_community5, 'updatePending'], _pending2);
            }

        case APPLY_USER_ROLE:
            {
                var _community6 = payload.community;

                var index = state.getIn([_community6, 'roles']).findIndex(function (r) {
                    return r.get(0) === payload.account;
                });

                if (index === -1) {
                    return state.updateIn([_community6, 'roles'], (0, _immutable.List)(), function (list) {
                        return list.withMutations(function (items) {
                            items.push((0, _immutable.List)([payload.account, payload.role]));
                        });
                    });
                } else {
                    return state.updateIn([_community6, 'roles'], (0, _immutable.List)(), function (items) {
                        return items.update(index, function (item) {
                            return item.set(0, payload.account).set(1, payload.role);
                        });
                    });
                }
            }

        default:
            return state;
    }
}

/**
    @arg {community: string} payload action payload.
*/
var getCommunityRoles = exports.getCommunityRoles = function getCommunityRoles(payload) {
    return {
        type: GET_COMMUNITY_ROLES,
        payload: payload
    };
};

/**
    @arg boolean payload action payload.
*/
var getCommunityRolesPending = exports.getCommunityRolesPending = function getCommunityRolesPending(payload) {
    return {
        type: GET_COMMUNITY_ROLES_PENDING,
        payload: payload
    };
};

var getCommunityRolesError = exports.getCommunityRolesError = function getCommunityRolesError(payload) {
    return {
        type: GET_COMMUNITY_ROLES_ERROR,
        payload: payload
    };
};

var setCommunityRoles = exports.setCommunityRoles = function setCommunityRoles(payload) {
    return {
        type: SET_COMMUNITY_ROLES,
        payload: payload
    };
};

/**
    @arg {community: string} payload action payload.
*/
var getCommunitySubscribers = exports.getCommunitySubscribers = function getCommunitySubscribers(payload) {
    return {
        type: GET_COMMUNITY_SUBSCRIBERS,
        payload: payload
    };
};

/**
    @arg boolean payload action payload.
*/
var getCommunitySubscribersPending = exports.getCommunitySubscribersPending = function getCommunitySubscribersPending(payload) {
    return {
        type: GET_COMMUNITY_SUBSCRIBERS_PENDING,
        payload: payload
    };
};

/**
    @arg error payload action payload.
*/
var getCommunitySubscribersError = exports.getCommunitySubscribersError = function getCommunitySubscribersError(payload) {
    return {
        type: GET_COMMUNITY_SUBSCRIBERS_ERROR,
        payload: payload
    };
};

var setCommunitySubscribers = exports.setCommunitySubscribers = function setCommunitySubscribers(payload) {
    return {
        type: SET_COMMUNITY_SUBSCRIBERS,
        payload: payload
    };
};

var updateUserRole = exports.updateUserRole = function updateUserRole(payload) {
    return {
        type: UPDATE_USER_ROLE,
        payload: payload
    };
};
var setUserRolePending = exports.setUserRolePending = function setUserRolePending(payload) {
    return {
        type: SET_USER_ROLE_PENDING,
        payload: payload
    };
};
var applyUserRole = exports.applyUserRole = function applyUserRole(payload) {
    return {
        type: APPLY_USER_ROLE,
        payload: payload
    };
};