'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.serverApiLogin = serverApiLogin;
exports.serverApiLogout = serverApiLogout;
exports.serverApiRecordEvent = serverApiRecordEvent;
exports.recordRouteTag = recordRouteTag;
exports.userActionRecord = userActionRecord;
exports.recordAdsView = recordAdsView;
exports.recordActivityTracker = recordActivityTracker;
exports.recordPageView = recordPageView;
exports.saveCords = saveCords;
exports.setUserPreferences = setUserPreferences;
exports.isTosAccepted = isTosAccepted;
exports.acceptTos = acceptTos;
exports.conductSearch = conductSearch;
exports.userSearch = userSearch;
exports.checkTronUser = checkTronUser;
exports.createTronAccount = createTronAccount;
exports.getTronAccount = getTronAccount;
exports.updateTronUser = updateTronUser;

var _steemJs = require('@steemit/steem-js');

var _authData = require('@steemfans/auth-data');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-undef */
/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unreachable */
/* eslint-disable arrow-parens */
var request_base = {
    method: 'post',
    mode: 'no-cors',
    credentials: 'same-origin',
    headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
    }
};

function serverApiLogin(account, signatures) {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    var request = (0, _assign2.default)({}, request_base, {
        body: (0, _stringify2.default)({ account: account, signatures: signatures, csrf: $STM_csrf })
    });
    return fetch('/api/v1/login_account', request);
}

function serverApiLogout() {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    var request = (0, _assign2.default)({}, request_base, {
        body: (0, _stringify2.default)({ csrf: $STM_csrf })
    });
    return fetch('/api/v1/logout_account', request);
}

var last_call = void 0;
function serverApiRecordEvent(type, val) {
    var rate_limit_ms = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5000;

    return;
    // if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    // if (last_call && new Date() - last_call < rate_limit_ms) return;
    // last_call = new Date();
    // const value = val && val.stack ? `${val.toString()} | ${val.stack}` : val;
    // if (typeof catchjs !== 'undefined') {
    //     catchjs.log(type, value);
    //     //} else if(process.env.NODE_ENV !== 'production') {
    //     //    console.log("Event>", type, value)
    // }
    // api.call(
    //     'overseer.collect',
    //     { collection: 'event', metadata: { type, value } },
    //     error => {
    //         if (error) console.warn('overseer error', error, error.data);
    //     }
    // );
}

function recordRouteTag(trackingId, tag, params) {
    var isLogin = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    var tags = {
        app: 'condenser',
        tag: tag
    };
    var fields = {
        trackingId: trackingId
    };
    switch (tag) {
        case 'post':
            fields = {
                trackingId: trackingId,
                permlink: params.permlink
            };
            break;
        case 'community_index':
            fields = {
                trackingId: trackingId,
                community_name: params.community_name
            };
            tags = {
                app: 'condenser',
                tag: tag,
                sort: params.order
            };
            break;
        case 'category':
            fields = {
                trackingId: trackingId,
                category: params.category
            };
            tags = {
                app: 'condenser',
                tag: tag,
                sort: params.order,
                is_user_feed: params.is_user_feed,
                is_my_community: params.category === 'my'
            };
            break;
        case 'index':
            fields = {
                trackingId: trackingId
            };
            tags = {
                app: 'condenser',
                tag: tag,
                sort: params.order
            };
            break;
        case 'user_index':
            fields = {
                trackingId: trackingId,
                username: params.username
            };
            tags = {
                app: 'condenser',
                tag: tag,
                section: params.section
            };
            break;
    }
    tags['is_login'] = isLogin;
    _steemJs.api.call('overseer.collect', ['custom', {
        measurement: 'route',
        fields: fields,
        tags: tags
    }], function (error) {
        if (error) console.warn('record route tag error', error, error.data);
    });
}

function userActionRecord(action, params) {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    var tags = {
        app: 'condenser',
        action_type: action
    };
    var fields = {};
    switch (action) {
        case 'comment':
            tags = {
                app: 'condenser',
                action_type: action,
                is_edit: params.is_edit,
                payout_type: params.payout_type,
                comment_type: params.comment_type
            };
            fields = {
                username: params.username
            };
            break;
        case 'vote':
            tags = {
                app: 'condenser',
                action_type: action,
                vote_type: params.vote_type
            };
            fields = {
                voter: params.voter,
                author: params.author,
                permlink: params.permlink,
                weight: params.weight
            };
            break;
        case 'update_account':
            fields = {
                username: params.username
            };
            break;
        case 'reblog':
            fields = {
                username: params.username,
                permlink: params.permlink,
                author: params.author
            };
            break;
        case 'delete_comment':
            tags = {
                app: 'condenser',
                action_type: action,
                comment_type: params.comment_type
            };
            fields = {
                username: params.username,
                permlink: params.permlink
            };
            break;
    }
    _steemJs.api.call('overseer.collect', ['custom', {
        measurement: 'user_action',
        fields: fields,
        tags: tags
    }], function (error) {
        if (error) console.warn('user action record error', error, error.data);
    });
}

function recordAdsView(_ref) {
    var trackingId = _ref.trackingId,
        adTag = _ref.adTag;

    _steemJs.api.call('overseer.collect', ['ad', { trackingId: trackingId, adTag: adTag }], function (error) {
        if (error) console.warn('overseer error', error);
    });
}

function recordActivityTracker(_ref2) {
    var trackingId = _ref2.trackingId,
        activityTag = _ref2.activityTag,
        pathname = _ref2.pathname,
        referrer = _ref2.referrer;

    var data = {
        measurement: 'activity_tracker',
        tags: {
            activityTag: activityTag,
            appType: 'condenser'
        },
        fields: {
            views: 1,
            trackingId: trackingId,
            pathname: pathname,
            referrer: referrer,
            ua: navigator ? navigator.userAgent.toLowerCase() : null
        }
    };
    _steemJs.api.call('overseer.collect', ['custom', data], function (error) {
        if (error) console.warn('overseer error:', data, error);
    });
}

var last_page = void 0,
    last_views = void 0,
    last_page_promise = void 0;
function recordPageView(page, referer, account) {
    if (last_page_promise && page === last_page) return last_page_promise;

    if (!process.env.BROWSER) return _promise2.default.resolve(0);
    if (window.ga) {
        // virtual pageview
        window.ga('set', 'page', page);
        window.ga('send', 'pageview');
    }
    // last_page_promise = api.callAsync('overseer.pageview', {
    //     page,
    //     referer,
    //     account,
    // });
    last_page = page;
    return last_page_promise;
}

function saveCords(x, y) {
    var request = (0, _assign2.default)({}, request_base, {
        body: (0, _stringify2.default)({ csrf: $STM_csrf, x: x, y: y })
    });
    fetch('/api/v1/save_cords', request);
}

function setUserPreferences(payload) {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return _promise2.default.resolve();
    var request = (0, _assign2.default)({}, request_base, {
        body: (0, _stringify2.default)({ csrf: window.$STM_csrf, payload: payload })
    });
    return fetch('/api/v1/setUserPreferences', request);
}

function isTosAccepted() {
    if (process.env.NODE_ENV !== 'production') {
        // TODO: remove this. endpoint in dev currently down.
        return true;
    }
    var request = (0, _assign2.default)({}, request_base, {
        body: (0, _stringify2.default)({ csrf: window.$STM_csrf })
    });
    return fetch('/api/v1/isTosAccepted', request).then(function (res) {
        return res.json();
    });
}

function acceptTos() {
    var request = (0, _assign2.default)({}, request_base, {
        body: (0, _stringify2.default)({ csrf: window.$STM_csrf })
    });
    return fetch('/api/v1/acceptTos', request);
}
function conductSearch(req) {
    var bodyWithCSRF = (0, _extends3.default)({}, req.body, {
        csrf: window.$STM_csrf
    });
    var request = (0, _assign2.default)({}, request_base, {
        body: (0, _stringify2.default)(bodyWithCSRF)
    });
    return fetch('/api/v1/search', request);
}

function userSearch(req) {
    var bodyWithCSRF = (0, _extends3.default)({}, req.body, {
        csrf: window.$STM_csrf
    });
    var request = (0, _assign2.default)({}, request_base, {
        body: (0, _stringify2.default)(bodyWithCSRF)
    });
    return fetch('/hive_accounts/_search', request);
}

function checkTronUser(data) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'steem';

    var queryString = '';
    if (type === 'steem') {
        queryString = '/api/v1/tron_user?username=' + data;
    } else {
        queryString = '/api/v1/tron_user?tron_addr=' + data;
    }
    return fetch(queryString).then(function (res) {
        return res.json();
    }).then(function (res) {
        if (res.error) throw new Error(res.error);
        return res.result;
    });
}

function createTronAccount() {
    var queryString = '/api/v1/create_account';
    return fetch(queryString);
}
function getTronAccount(tron_address) {
    var queryString = '/api/v1/get_account?tron_address=' + tron_address;
    return fetch(queryString);
}

function updateTronUser(data, privKey) {
    var r = (0, _authData.signData)(data, privKey);
    var request = (0, _assign2.default)({}, request_base, {
        body: (0, _stringify2.default)(r)
    });
    return fetch('/api/v1/tron_user', request).then(function (res) {
        return res.json();
    });
}