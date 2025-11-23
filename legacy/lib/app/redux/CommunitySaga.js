'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.communityWatches = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

exports.getCommunityRoles = getCommunityRoles;
exports.getCommunitySubscribers = getCommunitySubscribers;
exports.updateUserRole = updateUserRole;

var _effects = require('redux-saga/effects');

var _CommunityReducer = require('app/redux/CommunityReducer');

var reducer = _interopRequireWildcard(_CommunityReducer);

var _FetchDataSaga = require('app/redux/FetchDataSaga');

var _steemApi = require('app/utils/steemApi');

var _TransactionReducer = require('./TransactionReducer');

var transactionActions = _interopRequireWildcard(_TransactionReducer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = /*#__PURE__*/_regenerator2.default.mark(getCommunityRoles),
    _marked2 = /*#__PURE__*/_regenerator2.default.mark(getCommunitySubscribers),
    _marked3 = /*#__PURE__*/_regenerator2.default.mark(updateUserRole);

var communityWatches = exports.communityWatches = [(0, _effects.takeEvery)('community/GET_COMMUNITY_ROLES', getCommunityRoles), (0, _effects.takeEvery)('community/GET_COMMUNITY_SUBSCRIBERS', getCommunitySubscribers), (0, _effects.takeEvery)('community/UPDATE_USER_ROLE', updateUserRole)];

function getCommunityRoles(action) {
    var community, roles;
    return _regenerator2.default.wrap(function getCommunityRoles$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    community = action.payload;
                    _context.next = 3;
                    return (0, _effects.put)(reducer.getCommunityRolesPending({ community: community, pending: true }));

                case 3:
                    _context.prev = 3;
                    _context.next = 6;
                    return (0, _effects.call)(_steemApi.callBridge, 'list_community_roles', {
                        community: community
                    });

                case 6:
                    roles = _context.sent;
                    _context.next = 9;
                    return (0, _effects.call)(_FetchDataSaga.getCommunity, action);

                case 9:
                    _context.next = 11;
                    return (0, _effects.put)(reducer.setCommunityRoles({ community: community, roles: roles }));

                case 11:
                    _context.next = 17;
                    break;

                case 13:
                    _context.prev = 13;
                    _context.t0 = _context['catch'](3);
                    _context.next = 17;
                    return (0, _effects.put)(reducer.getCommunityRolesError({ community: community, error: _context.t0 }));

                case 17:
                    _context.next = 19;
                    return (0, _effects.put)(reducer.getCommunityRolesPending({ community: community, pending: false }));

                case 19:
                case 'end':
                    return _context.stop();
            }
        }
    }, _marked, this, [[3, 13]]);
}

function getCommunitySubscribers(action) {
    var community, subscribers;
    return _regenerator2.default.wrap(function getCommunitySubscribers$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    community = action.payload;
                    _context2.next = 3;
                    return (0, _effects.put)(reducer.getCommunitySubscribersPending({ community: community, pending: true }));

                case 3:
                    _context2.prev = 3;
                    _context2.next = 6;
                    return (0, _effects.call)(_steemApi.callBridge, 'list_subscribers', {
                        community: community
                    });

                case 6:
                    subscribers = _context2.sent;
                    _context2.next = 9;
                    return (0, _effects.call)(_FetchDataSaga.getCommunity, action);

                case 9:
                    _context2.next = 11;
                    return (0, _effects.put)(reducer.setCommunitySubscribers({ community: community, subscribers: subscribers }));

                case 11:
                    _context2.next = 17;
                    break;

                case 13:
                    _context2.prev = 13;
                    _context2.t0 = _context2['catch'](3);
                    _context2.next = 17;
                    return (0, _effects.put)(reducer.getCommunitySubscribersError({ community: community, error: _context2.t0 }));

                case 17:
                    _context2.next = 19;
                    return (0, _effects.put)(reducer.getCommunitySubscribersPending({ community: community, pending: false }));

                case 19:
                case 'end':
                    return _context2.stop();
            }
        }
    }, _marked2, this, [[3, 13]]);
}

function updateUserRole(action) {
    var community, username;
    return _regenerator2.default.wrap(function updateUserRole$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    community = action.payload.community;
                    _context3.next = 3;
                    return (0, _effects.put)(reducer.setUserRolePending({ community: community, pending: true }));

                case 3:
                    _context3.prev = 3;
                    _context3.next = 6;
                    return (0, _effects.select)(function (state) {
                        return state.user.getIn(['current', 'username']);
                    });

                case 6:
                    username = _context3.sent;
                    _context3.next = 9;
                    return (0, _effects.put)(transactionActions.broadcastOperation({
                        type: 'custom_json',
                        operation: {
                            id: 'community',
                            required_posting_auths: [username],
                            json: (0, _stringify2.default)(['setRole', action.payload])
                        }
                        //successCallback,
                        //errorCallback,
                    }));

                case 9:
                    _context3.next = 11;
                    return (0, _effects.put)(reducer.applyUserRole(action.payload));

                case 11:
                    _context3.next = 16;
                    break;

                case 13:
                    _context3.prev = 13;
                    _context3.t0 = _context3['catch'](3);

                    console.log('update user error', _context3.t0);

                case 16:
                    _context3.next = 18;
                    return (0, _effects.put)(reducer.setUserRolePending({ community: community, pending: false }));

                case 18:
                case 'end':
                    return _context3.stop();
            }
        }
    }, _marked3, this, [[3, 13]]);
}