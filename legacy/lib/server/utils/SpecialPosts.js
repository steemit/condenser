'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.specialPosts = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var getPost = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(url) {
        var _url$split$1$split, _url$split$1$split2, author, permlink;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _url$split$1$split = url.split('@')[1].split('/'), _url$split$1$split2 = (0, _slicedToArray3.default)(_url$split$1$split, 2), author = _url$split$1$split2[0], permlink = _url$split$1$split2[1];
                        _context.next = 3;
                        return (0, _steemApi.callBridge)('get_post', { author: author, permlink: permlink });

                    case 3:
                        return _context.abrupt('return', _context.sent);

                    case 4:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function getPost(_x) {
        return _ref.apply(this, arguments);
    };
}();

/**
 * [async] Get special posts - including notices, featured, and promoted.
 *
 * @returns {object} object of {featured_posts:[], promoted_posts:[], notices:[]}
 */


var specialPosts = exports.specialPosts = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var postData, loadedPostData, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, url, post, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _url, _post, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, notice, _post2;

        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        console.info('Loading special posts');

                        _context2.next = 3;
                        return loadSpecialPosts();

                    case 3:
                        postData = _context2.sent;

                        //console.info('Loaded special posts', postData);
                        loadedPostData = {
                            featured_posts: [],
                            promoted_posts: [],
                            notices: []
                        };
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context2.prev = 8;
                        _iterator = (0, _getIterator3.default)(postData.featured_posts);

                    case 10:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            _context2.next = 20;
                            break;
                        }

                        url = _step.value;
                        _context2.next = 14;
                        return getPost(url);

                    case 14:
                        post = _context2.sent;

                        post.special = true;
                        loadedPostData.featured_posts.push(post);

                    case 17:
                        _iteratorNormalCompletion = true;
                        _context2.next = 10;
                        break;

                    case 20:
                        _context2.next = 26;
                        break;

                    case 22:
                        _context2.prev = 22;
                        _context2.t0 = _context2['catch'](8);
                        _didIteratorError = true;
                        _iteratorError = _context2.t0;

                    case 26:
                        _context2.prev = 26;
                        _context2.prev = 27;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 29:
                        _context2.prev = 29;

                        if (!_didIteratorError) {
                            _context2.next = 32;
                            break;
                        }

                        throw _iteratorError;

                    case 32:
                        return _context2.finish(29);

                    case 33:
                        return _context2.finish(26);

                    case 34:
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context2.prev = 37;
                        _iterator2 = (0, _getIterator3.default)(postData.promoted_posts);

                    case 39:
                        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                            _context2.next = 49;
                            break;
                        }

                        _url = _step2.value;
                        _context2.next = 43;
                        return getPost(_url);

                    case 43:
                        _post = _context2.sent;

                        _post.special = true;
                        loadedPostData.promoted_posts.push(_post);

                    case 46:
                        _iteratorNormalCompletion2 = true;
                        _context2.next = 39;
                        break;

                    case 49:
                        _context2.next = 55;
                        break;

                    case 51:
                        _context2.prev = 51;
                        _context2.t1 = _context2['catch'](37);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context2.t1;

                    case 55:
                        _context2.prev = 55;
                        _context2.prev = 56;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 58:
                        _context2.prev = 58;

                        if (!_didIteratorError2) {
                            _context2.next = 61;
                            break;
                        }

                        throw _iteratorError2;

                    case 61:
                        return _context2.finish(58);

                    case 62:
                        return _context2.finish(55);

                    case 63:
                        _iteratorNormalCompletion3 = true;
                        _didIteratorError3 = false;
                        _iteratorError3 = undefined;
                        _context2.prev = 66;
                        _iterator3 = (0, _getIterator3.default)(postData.notices);

                    case 68:
                        if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                            _context2.next = 81;
                            break;
                        }

                        notice = _step3.value;

                        if (!notice.permalink) {
                            _context2.next = 77;
                            break;
                        }

                        _context2.next = 73;
                        return getPost(notice.permalink);

                    case 73:
                        _post2 = _context2.sent;

                        loadedPostData.notices.push((0, _assign2.default)({}, notice, _post2));
                        _context2.next = 78;
                        break;

                    case 77:
                        loadedPostData.notices.push(notice);

                    case 78:
                        _iteratorNormalCompletion3 = true;
                        _context2.next = 68;
                        break;

                    case 81:
                        _context2.next = 87;
                        break;

                    case 83:
                        _context2.prev = 83;
                        _context2.t2 = _context2['catch'](66);
                        _didIteratorError3 = true;
                        _iteratorError3 = _context2.t2;

                    case 87:
                        _context2.prev = 87;
                        _context2.prev = 88;

                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }

                    case 90:
                        _context2.prev = 90;

                        if (!_didIteratorError3) {
                            _context2.next = 93;
                            break;
                        }

                        throw _iteratorError3;

                    case 93:
                        return _context2.finish(90);

                    case 94:
                        return _context2.finish(87);

                    case 95:

                        console.info('Loaded special posts: featured: ' + loadedPostData.featured_posts.length + ', promoted: ' + loadedPostData.promoted_posts.length + ', notices: ' + loadedPostData.notices.length);

                        return _context2.abrupt('return', loadedPostData);

                    case 97:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[8, 22, 26, 34], [27,, 29, 33], [37, 51, 55, 63], [56,, 58, 62], [66, 83, 87, 95], [88,, 90, 94]]);
    }));

    return function specialPosts() {
        return _ref2.apply(this, arguments);
    };
}();

var _config = require('config');

var config = _interopRequireWildcard(_config);

var _https = require('https');

var https = _interopRequireWildcard(_https);

var _steemApi = require('app/utils/steemApi');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Load special posts - including notices, featured, and promoted.
 *
 * @returns {promise} resolves to object of {featured_posts:[], promoted_posts:[], notices:[]}
 */
function loadSpecialPosts() {
    return new _promise2.default(function (resolve, reject) {
        var emptySpecialPosts = {
            featured_posts: [],
            promoted_posts: [],
            notices: []
        };

        if (!config.special_posts_url) {
            resolve(emptySpecialPosts);
            return;
        }

        var request = https.get(config.special_posts_url, function (resp) {
            var data = '';
            resp.on('data', function (chunk) {
                data += chunk;
            });
            resp.on('end', function () {
                var json = JSON.parse(data);
                console.info('Received special posts payload');
                //console.info('Received special posts payload', json);
                if (json === Object(json)) {
                    resolve(json);
                }
            });
        });

        request.on('error', function (e) {
            console.error('Could not load special posts', e);
            resolve(emptySpecialPosts);
        });
    });
}