'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

exports.default = useUserJson;

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ResolveRoute = require('app/ResolveRoute');

var _steemJs = require('@steemit/steem-js');

var _GDPRUserList = require('app/utils/GDPRUserList');

var _GDPRUserList2 = _interopRequireDefault(_GDPRUserList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function useUserJson(app) {
    var router = (0, _koaRouter2.default)();
    app.use(router.routes());

    router.get(_ResolveRoute.routeRegex.UserJson, /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var user_name, user, status, _ref, _ref2, chainAccount;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        // validate and build user details in JSON
                        user_name = this.url.match(_ResolveRoute.routeRegex.UserJson)[1].replace('@', '');
                        user = '';
                        status = '';
                        _context.next = 5;
                        return _steemJs.api.getAccountsAsync([user_name]);

                    case 5:
                        _ref = _context.sent;
                        _ref2 = (0, _slicedToArray3.default)(_ref, 1);
                        chainAccount = _ref2[0];


                        if (_GDPRUserList2.default.includes(user_name)) {
                            user = 'Content unavailable';
                            status = '451';
                        } else if (chainAccount) {
                            user = chainAccount;
                            try {
                                user.json_metadata = JSON.parse(user.json_metadata);
                            } catch (e) {
                                user.json_metadata = '';
                            }
                            status = '200';
                        } else {
                            user = 'No account found';
                            status = '404';
                        }
                        // return response and status code
                        this.body = { user: user, status: status };

                    case 10:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
}