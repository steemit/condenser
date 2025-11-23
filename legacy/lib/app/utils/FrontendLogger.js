'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

exports.default = frontendLogger;
exports.formatEventReport = formatEventReport;

var _ServerApiClient = require('app/utils/ServerApiClient');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Handles window error events by logging to overseer.
 *
 * This function relies on these globals:
 * - process.env.VERSION
 * - window.location.href
 *
 * @param {ErrorEvent} event
 */
function frontendLogger(event) {
    if (window.$STM_csrf) {
        var report = formatEventReport(event, window.location.href, process.env.VERSION);
        (0, _ServerApiClient.serverApiRecordEvent)('client_error', report);
    }
}

/**
 * Format a browser error event report
 *
 * @param {ErrorEvent} event
 * @param {string} href
 * @param {string} version
 *
 * @return {object}
 */
function formatEventReport(event, href, version) {
    var trace = (0, _typeof3.default)(event.error) === 'object' && event.error !== null && typeof event.error.stack === 'string' ? event.error.stack : false;
    return {
        trace: trace,
        message: event.message,
        href: href,
        version: version
    };
}