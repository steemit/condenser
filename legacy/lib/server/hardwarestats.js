'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _cpuStat = require('cpu-stat');

var _cpuStat2 = _interopRequireDefault(_cpuStat);

var _memStat = require('mem-stat');

var _memStat2 = _interopRequireDefault(_memStat);

var _diskStat = require('disk-stat');

var _diskStat2 = _interopRequireDefault(_diskStat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = hardwareStats;

var stats = {};

function handleError(err) {
    // perpetually throws the same error down the chain for promises
    throw err;
}

function startPromise() {
    return new _promise2.default(function (resolve, reject) {
        resolve();
    });
}

function getCpuUsage() {
    return new _promise2.default(function (resolve, reject) {
        _cpuStat2.default.usagePercent(function (err, percent, seconds) {
            if (err) return err;
            stats.cpuPercent = percent;
            resolve();
        });
    });
}

function getMemoryUsage() {
    return new _promise2.default(function (resolve, reject) {
        stats.memoryStatsInGiB = _memStat2.default.allStats('GiB');
        resolve();
    });
}

function getDiskUsage() {
    return new _promise2.default(function (resolve, reject) {
        stats.diskStats = _diskStat2.default.raw();
        resolve();
    });
}

function hardwareStats() {
    return startPromise().then(getCpuUsage, handleError).then(getMemoryUsage, handleError).then(getDiskUsage, handleError).then(function () {
        console.log((0, _stringify2.default)(stats));
    }, handleError).then(null, function (err) {
        console.log('error getting hardware stats: ' + err);
    });
}