'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _RequestTimer = require('./utils/RequestTimer');

var _RequestTimer2 = _interopRequireDefault(_RequestTimer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function requestTime(statsLoggerClient) {
    return (/*#__PURE__*/_regenerator2.default.mark(function _callee(next) {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            this.state.requestTimer = new _RequestTimer2.default(statsLoggerClient, 'request', 'method=' + this.request.method + ' path=' + this.request.path);

                            return _context.delegateYield(next, 't0', 2);

                        case 2:

                            this.state.requestTimer.finish();

                        case 3:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        })
    );
}

module.exports = requestTime;