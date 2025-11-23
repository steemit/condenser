'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.default = useRedirects;

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var redirects = [
// example: [/\/about(\d+)-(.+)/, '/about?$0:$1', 302],
[/^\/recent\/?$/, '/created'], [/^\/pick_account.*/, 'https://signup.steemit.com']];

function useRedirects(app) {
    var router = (0, _koaRouter2.default)();

    app.use(router.routes());

    redirects.forEach(function (r) {
        router.get(r[0], /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            var _this = this;

            var dest;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            dest = (0, _keys2.default)(this.params).reduce(function (value, key) {
                                return value.replace('$' + key, _this.params[key]);
                            }, r[1]);

                            console.log('server redirect: [' + r[0] + '] ' + this.request.url + ' -> ' + dest);
                            this.status = r[2] || 301;
                            this.redirect(dest);

                        case 4:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));
    });
}