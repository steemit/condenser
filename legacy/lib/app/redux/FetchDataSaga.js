'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.actions = exports.fetchDataWatches = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

exports.getPostHeader = getPostHeader;
exports.fetchState = fetchState;
exports.listCommunities = listCommunities;
exports.getCommunity = getCommunity;
exports.getSubscriptions = getSubscriptions;
exports.getNotices = getNotices;
exports.getFollowers = getFollowers;
exports.updateFollowersList = updateFollowersList;
exports.getAccountNotifications = getAccountNotifications;
exports.getUnreadAccountNotificationsSaga = getUnreadAccountNotificationsSaga;
exports.markNotificationsAsReadSaga = markNotificationsAsReadSaga;
exports.fetchData = fetchData;
exports.getRewardsDataSaga = getRewardsDataSaga;

var _effects = require('redux-saga/effects');

var _steemJs = require('@steemit/steem-js');

var _FollowSaga = require('app/redux/FollowSaga');

var _GlobalReducer = require('./GlobalReducer');

var globalActions = _interopRequireWildcard(_GlobalReducer);

var _AppReducer = require('./AppReducer');

var appActions = _interopRequireWildcard(_AppReducer);

var _UserReducer = require('app/redux/UserReducer');

var userActions = _interopRequireWildcard(_UserReducer);

var _TransactionReducer = require('./TransactionReducer');

var transactionActions = _interopRequireWildcard(_TransactionReducer);

var _constants = require('./constants');

var _constants2 = _interopRequireDefault(_constants);

var _immutable = require('immutable');

var _steemApi = require('app/utils/steemApi');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = /*#__PURE__*/_regenerator2.default.mark(getPostHeader),
    _marked2 = /*#__PURE__*/_regenerator2.default.mark(fetchState),
    _marked3 = /*#__PURE__*/_regenerator2.default.mark(syncSpecialPosts),
    _marked4 = /*#__PURE__*/_regenerator2.default.mark(getAccounts),
    _marked5 = /*#__PURE__*/_regenerator2.default.mark(listCommunities),
    _marked6 = /*#__PURE__*/_regenerator2.default.mark(getCommunity),
    _marked7 = /*#__PURE__*/_regenerator2.default.mark(getSubscriptions),
    _marked8 = /*#__PURE__*/_regenerator2.default.mark(getNotices),
    _marked9 = /*#__PURE__*/_regenerator2.default.mark(getFollowers),
    _marked10 = /*#__PURE__*/_regenerator2.default.mark(updateFollowersList),
    _marked11 = /*#__PURE__*/_regenerator2.default.mark(getAccountNotifications),
    _marked12 = /*#__PURE__*/_regenerator2.default.mark(getUnreadAccountNotificationsSaga),
    _marked13 = /*#__PURE__*/_regenerator2.default.mark(markNotificationsAsReadSaga),
    _marked14 = /*#__PURE__*/_regenerator2.default.mark(fetchData),
    _marked15 = /*#__PURE__*/_regenerator2.default.mark(fetchJson),
    _marked16 = /*#__PURE__*/_regenerator2.default.mark(getRewardsDataSaga);

// import { checkTronUser } from 'app/utils/ServerApiClient';
// import { getTronAccount } from 'app/utils/tronApi';

var REQUEST_DATA = 'fetchDataSaga/REQUEST_DATA';
var FETCH_STATE = 'fetchDataSaga/FETCH_STATE';
var GET_POST_HEADER = 'fetchDataSaga/GET_POST_HEADER';
var GET_COMMUNITY = 'fetchDataSaga/GET_COMMUNITY';
var LIST_COMMUNITIES = 'fetchDataSaga/LIST_COMMUNITIES';
var GET_SUBSCRIPTIONS = 'fetchDataSaga/GET_SUBSCRIPTIONS';
var GET_NOTICES = 'fetchDataSaga/GET_NOTICES';
var GET_FOLLOWERS = 'fetchDataSaga/GET_FOLLOWERS';
var UPDATE_FOLLPWERSLIST = 'fetchDataSaga/UPDATE_FOLLPWERSLIST';
var GET_ACCOUNT_NOTIFICATIONS = 'fetchDataSaga/GET_ACCOUNT_NOTIFICATIONS';
var GET_UNREAD_ACCOUNT_NOTIFICATIONS = 'fetchDataSaga/GET_UNREAD_ACCOUNT_NOTIFICATIONS';
var MARK_NOTIFICATIONS_AS_READ = 'fetchDataSaga/MARK_NOTIFICATIONS_AS_READ';
var GET_REWARDS_DATA = 'fetchDataSaga/GET_REWARDS_DATA';

var fetchDataWatches = exports.fetchDataWatches = [(0, _effects.takeLatest)(REQUEST_DATA, fetchData), (0, _effects.takeLatest)('@@router/LOCATION_CHANGE', fetchState), (0, _effects.takeLatest)(FETCH_STATE, fetchState), (0, _effects.takeEvery)('global/FETCH_JSON', fetchJson), (0, _effects.takeEvery)(GET_POST_HEADER, getPostHeader), (0, _effects.takeEvery)(GET_COMMUNITY, getCommunity), (0, _effects.takeLatest)(GET_SUBSCRIPTIONS, getSubscriptions), (0, _effects.takeLatest)(GET_NOTICES, getNotices), (0, _effects.takeLatest)(GET_FOLLOWERS, getFollowers), (0, _effects.takeLatest)(UPDATE_FOLLPWERSLIST, updateFollowersList), (0, _effects.takeEvery)(LIST_COMMUNITIES, listCommunities), (0, _effects.takeEvery)(GET_ACCOUNT_NOTIFICATIONS, getAccountNotifications), (0, _effects.takeEvery)(GET_UNREAD_ACCOUNT_NOTIFICATIONS, getUnreadAccountNotificationsSaga), (0, _effects.takeEvery)(GET_REWARDS_DATA, getRewardsDataSaga), (0, _effects.takeEvery)(MARK_NOTIFICATIONS_AS_READ, markNotificationsAsReadSaga)];

function getPostHeader(action) {
    var header, _action$payload, author, permlink, key;

    return _regenerator2.default.wrap(function getPostHeader$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return (0, _effects.call)(_steemApi.callBridge, 'get_post_header', action.payload);

                case 2:
                    header = _context.sent;
                    _action$payload = action.payload, author = _action$payload.author, permlink = _action$payload.permlink;
                    key = author + '/' + permlink;
                    _context.next = 7;
                    return (0, _effects.put)(globalActions.receivePostHeader((0, _defineProperty3.default)({}, key, header)));

                case 7:
                case 'end':
                    return _context.stop();
            }
        }
    }, _marked, this);
}

var is_initial_state = true;
function fetchState(location_change_action) {
    var pathname, m, username, server_location, ignore_fetch, url, _username, _ref, _ref2, state;

    return _regenerator2.default.wrap(function fetchState$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    pathname = location_change_action.payload.pathname;
                    m = pathname.match(/^\/@([a-z0-9\.-]+)(\/notifications)?/);

                    if (!(m && m.length >= 2)) {
                        _context2.next = 8;
                        break;
                    }

                    username = m[1];
                    _context2.next = 6;
                    return (0, _effects.fork)(_FollowSaga.loadFollows, 'getFollowersAsync', username, 'blog');

                case 6:
                    _context2.next = 8;
                    return (0, _effects.fork)(_FollowSaga.loadFollows, 'getFollowingAsync', username, 'blog');

                case 8:
                    _context2.next = 10;
                    return (0, _effects.select)(function (state) {
                        return state.offchain.get('server_location');
                    });

                case 10:
                    server_location = _context2.sent;
                    ignore_fetch = pathname === server_location && is_initial_state;

                    if (!ignore_fetch) {
                        _context2.next = 14;
                        break;
                    }

                    return _context2.abrupt('return');

                case 14:
                    is_initial_state = false;
                    if (process.env.BROWSER && window && window.optimize && window.optimize.isInitialized) {
                        window.optimize.refreshAll({ refresh: false });
                    }
                    url = pathname;
                    _context2.next = 19;
                    return (0, _effects.put)(appActions.fetchDataBegin());

                case 19:
                    _context2.prev = 19;
                    _username = null;

                    if (!process.env.BROWSER) {
                        _context2.next = 27;
                        break;
                    }

                    _context2.next = 24;
                    return (0, _effects.select)(function (state) {
                        return [state.user.getIn(['current', 'username'])];
                    });

                case 24:
                    _ref = _context2.sent;
                    _ref2 = (0, _slicedToArray3.default)(_ref, 1);
                    _username = _ref2[0];

                case 27:
                    _context2.next = 29;
                    return (0, _effects.call)(_steemApi.getStateAsync, url, _username, false);

                case 29:
                    state = _context2.sent;
                    _context2.next = 32;
                    return (0, _effects.put)(globalActions.receiveState(state));

                case 32:
                    _context2.next = 34;
                    return (0, _effects.put)(userActions.setUser({
                        tip_count_lock: false
                    }));

                case 34:
                    _context2.next = 36;
                    return (0, _effects.call)(syncSpecialPosts);

                case 36:
                    _context2.next = 43;
                    break;

                case 38:
                    _context2.prev = 38;
                    _context2.t0 = _context2['catch'](19);

                    console.error('~~ Saga fetchState error ~~>', url, _context2.t0);
                    _context2.next = 43;
                    return (0, _effects.put)(appActions.steemApiError(_context2.t0.message));

                case 43:
                    _context2.next = 45;
                    return (0, _effects.put)(appActions.fetchDataEnd());

                case 45:
                case 'end':
                    return _context2.stop();
            }
        }
    }, _marked2, this, [[19, 38]]);
}

function syncSpecialPosts() {
    var specialPosts, seenFeaturedPosts, seenPromotedPosts;
    return _regenerator2.default.wrap(function syncSpecialPosts$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    if (process.env.BROWSER) {
                        _context3.next = 2;
                        break;
                    }

                    return _context3.abrupt('return', null);

                case 2:
                    _context3.next = 4;
                    return (0, _effects.select)(function (state) {
                        return state.offchain.get('special_posts');
                    });

                case 4:
                    specialPosts = _context3.sent;


                    // Mark seen featured posts.
                    seenFeaturedPosts = specialPosts.get('featured_posts').map(function (post) {
                        var id = post.get('author') + '/' + post.get('permlink');
                        return post.set('seen', localStorage.getItem('featured-post-seen:' + id) === 'true');
                    });

                    // Mark seen promoted posts.

                    seenPromotedPosts = specialPosts.get('promoted_posts').map(function (post) {
                        var id = post.get('author') + '/' + post.get('permlink');
                        return post.set('seen', localStorage.getItem('promoted-post-seen:' + id) === 'true');
                    });

                    // Look up seen post URLs.

                    _context3.next = 9;
                    return (0, _effects.put)(globalActions.syncSpecialPosts({
                        featuredPosts: seenFeaturedPosts,
                        promotedPosts: seenPromotedPosts
                    }));

                case 9:

                    // Mark all featured posts as seen.
                    specialPosts.get('featured_posts').forEach(function (post) {
                        var id = post.get('author') + '/' + post.get('permlink');
                        localStorage.setItem('featured-post-seen:' + id, 'true');
                    });

                    // Mark all promoted posts as seen.
                    specialPosts.get('promoted_posts').forEach(function (post) {
                        var id = post.get('author') + '/' + post.get('permlink');
                        localStorage.setItem('promoted-post-seen:' + id, 'true');
                    });

                case 11:
                case 'end':
                    return _context3.stop();
            }
        }
    }, _marked3, this);
}

/**
 * Request account data for a set of usernames.
 *
 * @todo batch the put()s
 *
 * @param {Iterable} usernames
 */
function getAccounts(usernames) {
    var accounts;
    return _regenerator2.default.wrap(function getAccounts$(_context4) {
        while (1) {
            switch (_context4.prev = _context4.next) {
                case 0:
                    _context4.next = 2;
                    return (0, _effects.call)([_steemJs.api, _steemJs.api.getAccountsAsync], usernames);

                case 2:
                    accounts = _context4.sent;
                    _context4.next = 5;
                    return (0, _effects.put)(globalActions.receiveAccounts({ accounts: accounts }));

                case 5:
                case 'end':
                    return _context4.stop();
            }
        }
    }, _marked4, this);
}

/**
 * Request all communities
 * @param {}
 */
function listCommunities(action) {
    var _action$payload2, observer, query, sort, communities;

    return _regenerator2.default.wrap(function listCommunities$(_context5) {
        while (1) {
            switch (_context5.prev = _context5.next) {
                case 0:
                    _action$payload2 = action.payload, observer = _action$payload2.observer, query = _action$payload2.query, sort = _action$payload2.sort;
                    _context5.prev = 1;
                    _context5.next = 4;
                    return (0, _effects.call)(_steemApi.callBridge, 'list_communities', {
                        observer: observer,
                        query: query,
                        sort: sort
                    });

                case 4:
                    communities = _context5.sent;
                    _context5.next = 7;
                    return (0, _effects.put)(globalActions.receiveCommunities(communities.length > 0 ? communities : []));

                case 7:
                    _context5.next = 12;
                    break;

                case 9:
                    _context5.prev = 9;
                    _context5.t0 = _context5['catch'](1);

                    console.log('Error requesting communities:', _context5.t0);

                case 12:
                case 'end':
                    return _context5.stop();
            }
        }
    }, _marked5, this, [[1, 9]]);
}

/**
 * Request data for given community
 * @param {string} name of community
 */
function getCommunity(action) {
    var currentUser, currentUsername, community;
    return _regenerator2.default.wrap(function getCommunity$(_context6) {
        while (1) {
            switch (_context6.prev = _context6.next) {
                case 0:
                    if (action.payload) {
                        _context6.next = 2;
                        break;
                    }

                    throw 'no community specified';

                case 2:
                    _context6.next = 4;
                    return (0, _effects.select)(function (state) {
                        return state.user.get('current');
                    });

                case 4:
                    currentUser = _context6.sent;
                    currentUsername = currentUser && currentUser.get('username');

                    // TODO: If no current user is logged in, skip the observer param.

                    _context6.next = 8;
                    return (0, _effects.call)(_steemApi.callBridge, 'get_community', {
                        name: action.payload,
                        observer: currentUsername
                    });

                case 8:
                    community = _context6.sent;

                    if (!community.name) {
                        _context6.next = 12;
                        break;
                    }

                    _context6.next = 12;
                    return (0, _effects.put)(globalActions.receiveCommunity((0, _defineProperty3.default)({}, community.name, (0, _extends3.default)({}, community))));

                case 12:
                case 'end':
                    return _context6.stop();
            }
        }
    }, _marked6, this);
}

/**
 * Request all user subscriptions
 * @param {string} name of account
 */
function getSubscriptions(action) {
    var subscriptions;
    return _regenerator2.default.wrap(function getSubscriptions$(_context7) {
        while (1) {
            switch (_context7.prev = _context7.next) {
                case 0:
                    if (action.payload) {
                        _context7.next = 2;
                        break;
                    }

                    throw 'no account specified';

                case 2:
                    _context7.next = 4;
                    return (0, _effects.put)(globalActions.loadingSubscriptions(true));

                case 4:
                    _context7.prev = 4;
                    _context7.next = 7;
                    return (0, _effects.call)(_steemApi.callBridge, 'list_all_subscriptions', {
                        account: action.payload
                    });

                case 7:
                    subscriptions = _context7.sent;
                    _context7.next = 10;
                    return (0, _effects.put)(globalActions.receiveSubscriptions({
                        subscriptions: subscriptions,
                        username: action.payload
                    }));

                case 10:
                    _context7.next = 15;
                    break;

                case 12:
                    _context7.prev = 12;
                    _context7.t0 = _context7['catch'](4);

                    console.log('Error Fetching Account Subscriptions: ', _context7.t0);

                case 15:
                    _context7.next = 17;
                    return (0, _effects.put)(globalActions.loadingSubscriptions(false));

                case 17:
                case 'end':
                    return _context7.stop();
            }
        }
    }, _marked7, this, [[4, 12]]);
}

/**
 * Request Notices
 * @param {string} name of account
 */
function getNotices(action) {
    var notices;
    return _regenerator2.default.wrap(function getNotices$(_context8) {
        while (1) {
            switch (_context8.prev = _context8.next) {
                case 0:
                    _context8.prev = 0;
                    _context8.next = 3;
                    return (0, _effects.call)(_steemApi.callBridge, 'get_notices', {
                        limit: 1
                    }, 'turtle.');

                case 3:
                    notices = _context8.sent;
                    _context8.next = 6;
                    return (0, _effects.put)(globalActions.receiveNotices(notices));

                case 6:
                    _context8.next = 11;
                    break;

                case 8:
                    _context8.prev = 8;
                    _context8.t0 = _context8['catch'](0);

                    console.log('Error Fetching get_notices: ', _context8.t0);

                case 11:
                case 'end':
                    return _context8.stop();
            }
        }
    }, _marked8, this, [[0, 8]]);
}

/**
 * Request Notices
 * @param {string} name of account
 */
function getFollowers(action) {
    var _action$payload3, title, accountname, currentPage, per_page, list;

    return _regenerator2.default.wrap(function getFollowers$(_context9) {
        while (1) {
            switch (_context9.prev = _context9.next) {
                case 0:
                    console.log(action.payload);
                    _action$payload3 = action.payload, title = _action$payload3.title, accountname = _action$payload3.accountname, currentPage = _action$payload3.currentPage, per_page = _action$payload3.per_page;
                    _context9.prev = 2;
                    _context9.next = 5;
                    return (0, _effects.call)(_steemApi.callBridge, title === 'Followers' ? 'get_followers_by_page' : 'get_following_by_page', [accountname, currentPage, per_page, 'blog'], 'condenser_api.');

                case 5:
                    list = _context9.sent;

                    console.log(list);
                    _context9.next = 9;
                    return (0, _effects.put)(globalActions.receiveFollowersList(list));

                case 9:
                    _context9.next = 14;
                    break;

                case 11:
                    _context9.prev = 11;
                    _context9.t0 = _context9['catch'](2);

                    console.log('Error Fetching receiveFollowersList: ', _context9.t0);

                case 14:
                case 'end':
                    return _context9.stop();
            }
        }
    }, _marked9, this, [[2, 11]]);
}

function updateFollowersList(list) {
    return _regenerator2.default.wrap(function updateFollowersList$(_context10) {
        while (1) {
            switch (_context10.prev = _context10.next) {
                case 0:
                    console.log(list);
                    _context10.prev = 1;
                    _context10.next = 4;
                    return (0, _effects.put)(globalActions.receiveFollowersList([]));

                case 4:
                    _context10.next = 9;
                    break;

                case 6:
                    _context10.prev = 6;
                    _context10.t0 = _context10['catch'](1);

                    console.log('Error Fetching updateFollowersList: ', _context10.t0);

                case 9:
                case 'end':
                    return _context10.stop();
            }
        }
    }, _marked10, this, [[1, 6]]);
}

/**
 * Request notifications for given account
 * @param {object} payload containing:
 *   - account (string)
 *   - last_id (string), optional, for pagination
 *   - limit (int), optional, defualt is 100
 */
function getAccountNotifications(action) {
    var notifications, limit, isLastPage;
    return _regenerator2.default.wrap(function getAccountNotifications$(_context11) {
        while (1) {
            switch (_context11.prev = _context11.next) {
                case 0:
                    if (action.payload) {
                        _context11.next = 2;
                        break;
                    }

                    throw 'no account specified';

                case 2:
                    _context11.next = 4;
                    return (0, _effects.put)(globalActions.notificationsLoading(true));

                case 4:
                    _context11.prev = 4;
                    _context11.next = 7;
                    return (0, _effects.call)(_steemApi.callBridge, 'account_notifications', action.payload);

                case 7:
                    notifications = _context11.sent;

                    if (!(notifications && notifications.error)) {
                        _context11.next = 14;
                        break;
                    }

                    console.error('~~ Saga getAccountNotifications error ~~>', notifications.error);
                    _context11.next = 12;
                    return (0, _effects.put)(appActions.steemApiError(notifications.error.message));

                case 12:
                    _context11.next = 18;
                    break;

                case 14:
                    limit = action.payload.limit ? action.payload.limit : 100;
                    isLastPage = notifications.length < action.payload.limit;
                    _context11.next = 18;
                    return (0, _effects.put)(globalActions.receiveNotifications({
                        name: action.payload.account,
                        notifications: notifications,
                        isLastPage: isLastPage
                    }));

                case 18:
                    _context11.next = 25;
                    break;

                case 20:
                    _context11.prev = 20;
                    _context11.t0 = _context11['catch'](4);

                    console.error('~~ Saga getAccountNotifications error ~~>', _context11.t0);
                    _context11.next = 25;
                    return (0, _effects.put)(appActions.steemApiError(_context11.t0.message));

                case 25:
                    _context11.next = 27;
                    return (0, _effects.put)(globalActions.notificationsLoading(false));

                case 27:
                case 'end':
                    return _context11.stop();
            }
        }
    }, _marked11, this, [[4, 20]]);
}

/**
 * Request unread notifications for given account
 * @param {object} payload containing:
 *   - account (string)
 */

function getUnreadAccountNotificationsSaga(action) {
    var unreadNotifications;
    return _regenerator2.default.wrap(function getUnreadAccountNotificationsSaga$(_context12) {
        while (1) {
            switch (_context12.prev = _context12.next) {
                case 0:
                    if (action.payload) {
                        _context12.next = 2;
                        break;
                    }

                    throw 'no account specified';

                case 2:
                    _context12.next = 4;
                    return (0, _effects.put)(globalActions.notificationsLoading(true));

                case 4:
                    _context12.prev = 4;
                    _context12.next = 7;
                    return (0, _effects.call)(_steemApi.callBridge, 'unread_notifications', action.payload);

                case 7:
                    unreadNotifications = _context12.sent;

                    if (!(unreadNotifications && unreadNotifications.error)) {
                        _context12.next = 14;
                        break;
                    }

                    console.error('~~ Saga getUnreadAccountNotifications error ~~>', unreadNotifications.error);
                    _context12.next = 12;
                    return (0, _effects.put)(appActions.steemApiError(unreadNotifications.error.message));

                case 12:
                    _context12.next = 16;
                    break;

                case 14:
                    _context12.next = 16;
                    return (0, _effects.put)(globalActions.receiveUnreadNotifications({
                        name: action.payload.account,
                        unreadNotifications: unreadNotifications
                    }));

                case 16:
                    _context12.next = 23;
                    break;

                case 18:
                    _context12.prev = 18;
                    _context12.t0 = _context12['catch'](4);

                    console.error('~~ Saga getUnreadAccountNotifications error ~~>', _context12.t0);
                    _context12.next = 23;
                    return (0, _effects.put)(appActions.steemApiError(_context12.t0.message));

                case 23:
                    _context12.next = 25;
                    return (0, _effects.put)(globalActions.notificationsLoading(false));

                case 25:
                case 'end':
                    return _context12.stop();
            }
        }
    }, _marked12, this, [[4, 18]]);
}

function markNotificationsAsReadSaga(action) {
    var _action$payload4, timeNow, username, _successCallback, ops;

    return _regenerator2.default.wrap(function markNotificationsAsReadSaga$(_context13) {
        while (1) {
            switch (_context13.prev = _context13.next) {
                case 0:
                    _action$payload4 = action.payload, timeNow = _action$payload4.timeNow, username = _action$payload4.username, _successCallback = _action$payload4.successCallback;
                    ops = ['setLastRead', { date: timeNow }];
                    _context13.next = 4;
                    return (0, _effects.put)(globalActions.notificationsLoading(true));

                case 4:
                    _context13.prev = 4;
                    _context13.next = 7;
                    return (0, _effects.put)(transactionActions.broadcastOperation({
                        type: 'custom_json',
                        operation: {
                            id: 'notify',
                            required_posting_auths: [username],
                            json: (0, _stringify2.default)(ops)
                        },
                        successCallback: function successCallback() {
                            _successCallback(username, timeNow);
                        },
                        errorCallback: function errorCallback() {
                            console.log('There was an error marking notifications as read!');
                            globalActions.notificationsLoading(false);
                        }
                    }));

                case 7:
                    _context13.next = 13;
                    break;

                case 9:
                    _context13.prev = 9;
                    _context13.t0 = _context13['catch'](4);
                    _context13.next = 13;
                    return (0, _effects.put)(globalActions.notificationsLoading(false));

                case 13:
                case 'end':
                    return _context13.stop();
            }
        }
    }, _marked13, this, [[4, 9]]);
}

function fetchData(action) {
    var _action$payload5, order, author, permlink, postFilter, observer, category, call_name, args, fetched, endOfData, fetchLimitReached, fetchDone, batch, data, lastValue;

    return _regenerator2.default.wrap(function fetchData$(_context14) {
        while (1) {
            switch (_context14.prev = _context14.next) {
                case 0:
                    // TODO: postFilter unused
                    _action$payload5 = action.payload, order = _action$payload5.order, author = _action$payload5.author, permlink = _action$payload5.permlink, postFilter = _action$payload5.postFilter, observer = _action$payload5.observer;
                    category = action.payload.category;

                    if (!category) category = '';

                    _context14.next = 5;
                    return (0, _effects.put)(globalActions.fetchingData({ order: order, category: category }));

                case 5:
                    call_name = void 0, args = void 0;

                    if (category[0] == '@') {
                        call_name = 'get_account_posts';
                        args = {
                            sort: order,
                            account: category.slice(1),
                            limit: _constants2.default.FETCH_DATA_BATCH_SIZE,
                            start_author: author,
                            start_permlink: permlink,
                            observer: observer
                        };
                    } else {
                        call_name = 'get_ranked_posts';
                        args = {
                            sort: order,
                            tag: category,
                            limit: _constants2.default.FETCH_DATA_BATCH_SIZE,
                            start_author: author,
                            start_permlink: permlink,
                            observer: observer
                        };
                    }

                    _context14.next = 9;
                    return (0, _effects.put)(appActions.fetchDataBegin());

                case 9:
                    _context14.prev = 9;
                    fetched = 0;
                    endOfData = false;
                    fetchLimitReached = false;
                    fetchDone = false;
                    batch = 0;

                case 15:
                    if (fetchDone) {
                        _context14.next = 29;
                        break;
                    }

                    _context14.next = 18;
                    return (0, _effects.call)(_steemApi.callBridge, call_name, args);

                case 18:
                    data = _context14.sent;


                    endOfData = data.length < _constants2.default.FETCH_DATA_BATCH_SIZE;

                    batch++;
                    fetchLimitReached = batch >= _constants2.default.MAX_BATCHES;

                    if (data.length > 0) {
                        lastValue = data[data.length - 1];

                        args.start_author = lastValue.author;
                        args.start_permlink = lastValue.permlink;
                    }

                    // Still return all data but only count ones matching the filter.
                    // Rely on UI to actually hide the posts.
                    fetched += postFilter ? data.filter(postFilter).length : data.length;

                    fetchDone = endOfData || fetchLimitReached || fetched >= _constants2.default.FETCH_DATA_BATCH_SIZE;

                    _context14.next = 27;
                    return (0, _effects.put)(globalActions.receiveData({
                        data: data,
                        order: order,
                        category: category,
                        author: author,
                        fetching: !fetchDone,
                        endOfData: endOfData
                    }));

                case 27:
                    _context14.next = 15;
                    break;

                case 29:
                    _context14.next = 36;
                    break;

                case 31:
                    _context14.prev = 31;
                    _context14.t0 = _context14['catch'](9);

                    console.error('~~ Saga fetchData error ~~>', call_name, args, _context14.t0);
                    _context14.next = 36;
                    return (0, _effects.put)(appActions.steemApiError(_context14.t0.message));

                case 36:
                    _context14.next = 38;
                    return (0, _effects.put)(appActions.fetchDataEnd());

                case 38:
                case 'end':
                    return _context14.stop();
            }
        }
    }, _marked14, this, [[9, 31]]);
}

/**
    @arg {string} id unique key for result global['fetchJson_' + id]
    @arg {string} url
    @arg {object} body (for JSON.stringify)
*/
function fetchJson(_ref3) {
    var _ref3$payload = _ref3.payload,
        id = _ref3$payload.id,
        url = _ref3$payload.url,
        body = _ref3$payload.body,
        successCallback = _ref3$payload.successCallback,
        _ref3$payload$skipLoa = _ref3$payload.skipLoading,
        skipLoading = _ref3$payload$skipLoa === undefined ? false : _ref3$payload$skipLoa;
    var payload, result;
    return _regenerator2.default.wrap(function fetchJson$(_context15) {
        while (1) {
            switch (_context15.prev = _context15.next) {
                case 0:
                    _context15.prev = 0;
                    payload = {
                        method: body ? 'POST' : 'GET',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: body ? (0, _stringify2.default)(body) : undefined
                    };
                    _context15.next = 4;
                    return skipLoading ? fetch(url, payload) : (0, _effects.call)(fetch, url, payload);

                case 4:
                    result = _context15.sent;
                    _context15.next = 7;
                    return result.json();

                case 7:
                    result = _context15.sent;

                    if (successCallback) result = successCallback(result);
                    _context15.next = 11;
                    return (0, _effects.put)(globalActions.fetchJsonResult({ id: id, result: result }));

                case 11:
                    _context15.next = 18;
                    break;

                case 13:
                    _context15.prev = 13;
                    _context15.t0 = _context15['catch'](0);

                    console.error('fetchJson', _context15.t0);
                    _context15.next = 18;
                    return (0, _effects.put)(globalActions.fetchJsonResult({ id: id, error: _context15.t0 }));

                case 18:
                case 'end':
                    return _context15.stop();
            }
        }
    }, _marked15, this, [[0, 13]]);
}
function getRewardsDataSaga(action) {
    var rewards;
    return _regenerator2.default.wrap(function getRewardsDataSaga$(_context16) {
        while (1) {
            switch (_context16.prev = _context16.next) {
                case 0:
                    _context16.next = 2;
                    return (0, _effects.put)(appActions.fetchDataBegin());

                case 2:
                    _context16.prev = 2;
                    _context16.next = 5;
                    return (0, _effects.call)(_steemApi.callBridge, 'get_payout_stats', {});

                case 5:
                    rewards = _context16.sent;

                    if (!(rewards && rewards.error)) {
                        _context16.next = 12;
                        break;
                    }

                    console.error('~~ Saga getRewardsDataSaga error ~~>', rewards.error);
                    _context16.next = 10;
                    return (0, _effects.put)(appActions.steemApiError(rewards.error.message));

                case 10:
                    _context16.next = 14;
                    break;

                case 12:
                    _context16.next = 14;
                    return (0, _effects.put)(globalActions.receiveRewards({ rewards: rewards }));

                case 14:
                    _context16.next = 21;
                    break;

                case 16:
                    _context16.prev = 16;
                    _context16.t0 = _context16['catch'](2);

                    console.error('~~ Saga getRewardsDataSaga error ~~>', _context16.t0);
                    _context16.next = 21;
                    return (0, _effects.put)(appActions.steemApiError(_context16.t0.message));

                case 21:
                    _context16.next = 23;
                    return (0, _effects.put)(appActions.fetchDataEnd());

                case 23:
                case 'end':
                    return _context16.stop();
            }
        }
    }, _marked16, this, [[2, 16]]);
}

// Action creators
var actions = exports.actions = {
    listCommunities: function listCommunities(payload) {
        return {
            type: LIST_COMMUNITIES,
            payload: payload
        };
    },

    getCommunity: function getCommunity(payload) {
        return {
            type: GET_COMMUNITY,
            payload: payload
        };
    },

    getSubscriptions: function getSubscriptions(payload) {
        return {
            type: GET_SUBSCRIPTIONS,
            payload: payload
        };
    },

    getNotices: function getNotices(payload) {
        return {
            type: GET_NOTICES,
            payload: payload
        };
    },

    getFollowers: function getFollowers(payload) {
        return {
            type: GET_FOLLOWERS,
            payload: payload
        };
    },

    updateFollowersList: function updateFollowersList(payload) {
        return {
            type: UPDATE_FOLLPWERSLIST,
            payload: payload
        };
    },

    getAccountNotifications: function getAccountNotifications(payload) {
        return {
            type: GET_ACCOUNT_NOTIFICATIONS,
            payload: payload
        };
    },

    getUnreadAccountNotifications: function getUnreadAccountNotifications(payload) {
        return {
            type: GET_UNREAD_ACCOUNT_NOTIFICATIONS,
            payload: payload
        };
    },

    markNotificationsAsRead: function markNotificationsAsRead(payload) {
        return {
            type: MARK_NOTIFICATIONS_AS_READ,
            payload: payload
        };
    },

    requestData: function requestData(payload) {
        return {
            type: REQUEST_DATA,
            payload: payload
        };
    },

    getPostHeader: function getPostHeader(payload) {
        return {
            type: GET_POST_HEADER,
            payload: payload
        };
    },

    fetchState: function fetchState(payload) {
        return {
            type: FETCH_STATE,
            payload: payload
        };
    },

    getRewardsData: function getRewardsData(payload) {
        return {
            type: GET_REWARDS_DATA,
            payload: payload
        };
    }
};