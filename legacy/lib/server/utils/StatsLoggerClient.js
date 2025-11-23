'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _statsdClient = require('statsd-client');

var _statsdClient2 = _interopRequireDefault(_statsdClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * In production, log stats to statsd.
 * In dev, console.log 'em.
 */
var StatsLoggerClient = function () {
    function StatsLoggerClient(STATSD_IP) {
        (0, _classCallCheck3.default)(this, StatsLoggerClient);

        if (STATSD_IP) {
            this.SDC = new _statsdClient2.default({
                host: STATSD_IP,
                prefix: 'condenser'
            });
        } else {
            console.log('StatsLoggerClient: no server available, logging to console.');
            // Implement debug loggers here, as any new calls are added in methods below.
            this.SDC = {
                timing: function timing() {
                    console.log('StatsLoggerClient call: ', arguments);
                }
            };
        }
    }

    /**
     * Given an array of timer tuples that look like [namespace, value]
     * log them all to statsd.
     */


    (0, _createClass3.default)(StatsLoggerClient, [{
        key: 'logTimers',
        value: function logTimers(tuples) {
            var _this = this;

            var timestamp = +new Date();
            tuples.map(function (tuple) {
                _this.SDC.timing(tuple[0], tuple[1]);
            });
        }
    }]);
    return StatsLoggerClient;
}();

exports.default = StatsLoggerClient;