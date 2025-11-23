'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _StatsLoggerClient = require('./StatsLoggerClient');

var _StatsLoggerClient2 = _interopRequireDefault(_StatsLoggerClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @param {array} hrtime process.hrtime() tuple
 * @returns {number} nanoseconds
 */
var hrtimeToNanoseconds = function hrtimeToNanoseconds(hrtime) {
    return +hrtime[0] * 1e9 + +hrtime[1];
};

/**
 * @param {array} hrtime process.hrtime() tuple
 * @returns {number} milliseconds
 */
var hrtimeToMilliseconds = function hrtimeToMilliseconds(hrtime) {
    return +hrtime[0] * 1000 + +hrtime[1] / 1000000;
};

/**
 * Logs total request time starting at instantiation and ending when finish() is called.
 * Additional timers can be managed with startTimer('name') and stopTimer('name')
 *
 * Results are stored in `timers` property and submitted to statsd at finish().
 */

var RequestTimer = function () {
    /**
     *
     * @param {StatsLoggerClient} statsLoggerClient
     * @param {string} prefix namespace to tack on the front of each timer name
     * @param {string} tags not yet supported by statsd / StatsLoggerClient
     */
    function RequestTimer(statsLoggerClient, prefix, tags) {
        (0, _classCallCheck3.default)(this, RequestTimer);

        (0, _assert2.default)(statsLoggerClient instanceof _StatsLoggerClient2.default, 'provide an instance of StatsLoggerClient');

        this.start = process.hrtime();
        this.timers = [];
        this.inProgressTimers = {};
        this.prefix = prefix;
        this.requestTags = tags;
        this.statsLoggerClient = statsLoggerClient;
    }

    /**
     * @param {string} name
     * @param {number} duration milliseconds
     */


    (0, _createClass3.default)(RequestTimer, [{
        key: 'logSegment',
        value: function logSegment(name, duration) {
            this.timers.push([this.prefix + '.' + name, duration]);
        }

        /**
         * Starts keeping track of something to time.
         *
         * @param {string} name
         */

    }, {
        key: 'startTimer',
        value: function startTimer(name) {
            (0, _assert2.default)(typeof name === 'string', 'a name for the timer must be provided');

            this.inProgressTimers[name] = process.hrtime();
        }

        /**
         * Stops an in-progress timer and stores it in the list of timers to log when the request is finished.
         *
         * @param {*} name
         */

    }, {
        key: 'stopTimer',
        value: function stopTimer(name) {
            (0, _assert2.default)(typeof this.inProgressTimers[name] !== 'undefined', 'provide an existing timer name');

            this.logSegment(name, hrtimeToMilliseconds(process.hrtime(this.inProgressTimers[name])));
            delete this.inProgressTimers[name];
        }
    }, {
        key: 'finish',
        value: function finish() {
            this.logSegment('total_ms', hrtimeToMilliseconds(process.hrtime(this.start)));
            this.statsLoggerClient.logTimers(this.timers, this.requestTags);
        }
    }]);
    return RequestTimer;
}();

exports.default = RequestTimer;