'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var humanize = require('humanize-number');
var bytes = require('bytes');

module.exports = prod_logger;

function prod_logger() {
    return (/*#__PURE__*/_regenerator2.default.mark(function logger(next) {
            var start, asset, length;
            return _regenerator2.default.wrap(function logger$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            // request
                            start = new Date();
                            asset = this.originalUrl.indexOf('/assets/') === 0 || this.originalUrl.indexOf('/images/') === 0 || this.originalUrl.indexOf('/favicon.ico') === 0;

                            if (!asset) console.log('  <-- ' + this.method + ' ' + this.originalUrl + ' ' + (this.session.uid || ''));
                            _context.prev = 3;
                            _context.next = 6;
                            return next;

                        case 6:
                            _context.next = 12;
                            break;

                        case 8:
                            _context.prev = 8;
                            _context.t0 = _context['catch'](3);

                            log(this, start, null, _context.t0, false);
                            throw _context.t0;

                        case 12:
                            length = this.response.length;

                            log(this, start, length, null, asset);

                        case 14:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, logger, this, [[3, 8]]);
        })
    );
}

function log(ctx, start, len, err, asset) {
    var status = err ? err.status || 500 : ctx.status || 404;

    var length;
    if (~[204, 205, 304].indexOf(status)) {
        length = '';
    } else if (null == len) {
        length = '-';
    } else {
        length = bytes(len);
    }

    var upstream = err ? 'xxx' : '-->';

    if (!asset || err || ctx.status > 400) console.log('  ' + upstream + ' %s %s %s %s %s %s', ctx.method, ctx.originalUrl, status, time(start), length, ctx.session.uid || '');
}

function time(start) {
    var delta = new Date() - start;
    delta = delta < 10000 ? delta + 'ms' : Math.round(delta / 1000) + 's';
    return humanize(delta);
}