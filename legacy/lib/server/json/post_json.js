'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

exports.default = usePostJson;

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ResolveRoute = require('app/ResolveRoute');

var _steemJs = require('@steemit/steem-js');

var _GDPRUserList = require('app/utils/GDPRUserList');

var _GDPRUserList2 = _interopRequireDefault(_GDPRUserList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function usePostJson(app) {
    var router = (0, _koaRouter2.default)();
    app.use(router.routes());

    router.get(_ResolveRoute.routeRegex.PostJson, /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var author, permalink, status, post;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        // validate and build post details in JSON
                        author = this.url.match(/(\@[\w\d\.-]+)/)[0].replace('@', '');
                        permalink = this.url.match(/(\@[\w\d\.-]+)\/?([\w\d-]+)/)[2];
                        status = '';
                        _context.next = 5;
                        return _steemJs.api.getContentAsync(author, permalink);

                    case 5:
                        post = _context.sent;


                        if (_GDPRUserList2.default.includes(post.author)) {
                            post = 'Content unavailable';
                            status = '451';
                        } else if (post.author) {
                            status = '200';
                            // try parse for post metadata
                            try {
                                post.json_metadata = JSON.parse(post.json_metadata);
                            } catch (e) {
                                post.json_metadata = '';
                            }
                        } else {
                            post = 'No post found';
                            status = '404';
                        }
                        // return response and status code
                        this.body = { post: post, status: status };

                    case 8:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
}