'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getDynamicGlobalProperties = exports.getStateAsync = exports._user_list = exports._list_temp = exports.callBridge = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var callBridge = exports.callBridge = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(method, params) {
        var pre = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'bridge.';
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        console.log('call bridge', method, params && (0, _stringify2.default)(params).substring(0, 200));

                        return _context.abrupt('return', new _promise2.default(function (resolve, reject) {
                            _steemJs.api.call(pre + method, params, function (err, data) {
                                if (err) {
                                    console.error('~~ apii.calBridge error ~~~>', err);

                                    if (err.message === 'Network request failed') {
                                        (0, _RPCNode.changeRPCNodeToDefault)();
                                    }

                                    reject(err);
                                } else resolve(data);
                            });
                        }));

                    case 2:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function callBridge(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

var getStateAsync = exports.getStateAsync = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(url, observer) {
        var ssr = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        var _parsePath, page, tag, sort, key, state, posts, _posts, account, profile, cleansed;

        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;

                        if (observer === undefined) observer = null;

                        _parsePath = parsePath(url), page = _parsePath.page, tag = _parsePath.tag, sort = _parsePath.sort, key = _parsePath.key;


                        console.log('GSA', url, observer, ssr);
                        state = {
                            accounts: {},
                            community: {},
                            content: {},
                            discussion_idx: {},
                            profiles: {}
                        };

                        // load `content` and `discussion_idx`

                        if (!(page == 'posts' || page == 'account')) {
                            _context2.next = 13;
                            break;
                        }

                        _context2.next = 8;
                        return loadPosts(sort, tag, observer, ssr);

                    case 8:
                        posts = _context2.sent;


                        state['content'] = posts['content'];
                        state['discussion_idx'] = posts['discussion_idx'];
                        _context2.next = 20;
                        break;

                    case 13:
                        if (!(page == 'thread')) {
                            _context2.next = 20;
                            break;
                        }

                        _context2.next = 16;
                        return loadThread(key[0], key[1]);

                    case 16:
                        _posts = _context2.sent;

                        state['content'] = _posts['content'];
                        _context2.next = 20;
                        break;

                    case 20:
                        if (!(tag && (0, _Community.ifHive)(tag))) {
                            _context2.next = 29;
                            break;
                        }

                        _context2.prev = 21;
                        _context2.next = 24;
                        return callBridge('get_community', {
                            name: tag,
                            observer: observer
                        });

                    case 24:
                        state['community'][tag] = _context2.sent;
                        _context2.next = 29;
                        break;

                    case 27:
                        _context2.prev = 27;
                        _context2.t0 = _context2['catch'](21);

                    case 29:

                        // for SSR, load profile on any profile page or discussion thread author
                        account = tag && tag[0] == '@' ? tag.slice(1) : page == 'thread' ? key[0].slice(1) : null;

                        if (!(ssr && account)) {
                            _context2.next = 35;
                            break;
                        }

                        _context2.next = 33;
                        return callBridge('get_profile', { account: account });

                    case 33:
                        profile = _context2.sent;

                        if (profile && profile['name']) {
                            state['profiles'][account] = profile;
                        }

                    case 35:
                        if (!ssr) {
                            _context2.next = 39;
                            break;
                        }

                        _context2.next = 38;
                        return callBridge('get_trending_topics', {
                            limit: 12
                        });

                    case 38:
                        state['topics'] = _context2.sent;

                    case 39:
                        cleansed = (0, _stateCleaner2.default)(state);
                        return _context2.abrupt('return', cleansed);

                    case 43:
                        _context2.prev = 43;
                        _context2.t1 = _context2['catch'](0);

                        console.error('~~ getStateAsync error ~~~>', _context2.t1);

                        if (_context2.t1.message === 'Network request failed') {
                            (0, _RPCNode.changeRPCNodeToDefault)();
                        }

                        throw _context2.t1;

                    case 48:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[0, 43], [21, 27]]);
    }));

    return function getStateAsync(_x4, _x5) {
        return _ref2.apply(this, arguments);
    };
}();

var loadThread = function () {
    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(account, permlink) {
        var author, content;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        author = account.slice(1);
                        _context3.next = 3;
                        return callBridge('get_discussion', { author: author, permlink: permlink });

                    case 3:
                        content = _context3.sent;
                        return _context3.abrupt('return', { content: content });

                    case 5:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function loadThread(_x7, _x8) {
        return _ref3.apply(this, arguments);
    };
}();

var loadPosts = function () {
    var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(sort, tag, observer, ssr) {
        var account, posts, params, _params, content, keys, idx, post, key, discussion_idx;

        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        account = tag && tag[0] == '@' ? tag.slice(1) : null;
                        posts = void 0;

                        if (!account) {
                            _context4.next = 9;
                            break;
                        }

                        params = { sort: sort, account: account, observer: observer };
                        _context4.next = 6;
                        return callBridge('get_account_posts', params);

                    case 6:
                        posts = _context4.sent;
                        _context4.next = 13;
                        break;

                    case 9:
                        _params = { sort: sort, tag: tag, observer: observer };
                        _context4.next = 12;
                        return callBridge('get_ranked_posts', _params);

                    case 12:
                        posts = _context4.sent;

                    case 13:
                        content = {};
                        keys = [];

                        for (idx in posts) {
                            post = posts[idx];
                            key = post['author'] + '/' + post['permlink'];

                            content[key] = post;
                            keys.indexOf(key) == -1 && keys.push(key);
                        }

                        discussion_idx = {};

                        discussion_idx[tag] = {};
                        discussion_idx[tag][sort] = keys;

                        return _context4.abrupt('return', { content: content, discussion_idx: discussion_idx });

                    case 20:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function loadPosts(_x9, _x10, _x11, _x12) {
        return _ref4.apply(this, arguments);
    };
}();

var getDynamicGlobalProperties = exports.getDynamicGlobalProperties = function () {
    var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.next = 2;
                        return _steemJs.api.getDynamicGlobalPropertiesAsync();

                    case 2:
                        return _context5.abrupt('return', _context5.sent);

                    case 3:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function getDynamicGlobalProperties() {
        return _ref5.apply(this, arguments);
    };
}();

var _steemJs = require('@steemit/steem-js');

var _Community = require('app/utils/Community');

var _stateCleaner = require('app/redux/stateCleaner');

var _stateCleaner2 = _interopRequireDefault(_stateCleaner);

var _RPCNode = require('app/utils/RPCNode');

var _index = require('axios/index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _list_temp = exports._list_temp = [];

var _user_list = exports._user_list = [];

function parsePath(url) {
    // strip off query string
    url = url.split('?')[0];

    // strip off leading and trailing slashes
    if (url.length > 0 && url[0] == '/') url = url.substring(1, url.length);
    if (url.length > 0 && url[url.length - 1] == '/') url = url.substring(0, url.length - 1);

    // blank URL defaults to `trending`
    if (url === '') url = 'trending';

    var part = url.split('/');
    var parts = part.length;
    var sorts = ['trending', 'promoted', 'hot', 'created', 'payout', 'payout_comments', 'muted'];
    var acct_tabs = ['blog', 'feed', 'posts', 'comments', 'replies', 'payout'];

    var page = null;
    var tag = null;
    var sort = null;
    var key = null;

    if (parts == 1 && sorts.includes(part[0])) {
        page = 'posts';
        sort = part[0];
        tag = '';
    } else if (parts == 2 && sorts.includes(part[0])) {
        page = 'posts';
        sort = part[0];
        tag = part[1];
    } else if (parts == 3 && part[1][0] == '@') {
        page = 'thread';
        tag = part[0];
        key = [part[1], part[2]];
    } else if (parts == 1 && part[0][0] == '@') {
        page = 'account';
        sort = 'blog';
        tag = part[0];
    } else if (parts == 2 && part[0][0] == '@') {
        if (acct_tabs.includes(part[1])) {
            page = 'account';
            sort = part[1];
        } else {
            // settings, followers, notifications, etc (no-op)
        }
        tag = part[0];
    } else {
        // no-op URL
    }

    return { page: page, tag: tag, sort: sort, key: key };
}