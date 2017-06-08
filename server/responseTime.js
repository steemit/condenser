'use strict';

var config = require('../config').default;

if (config.metrics) {
  var StatsD = require('node-statsd');
  var metrics = new StatsD({
    host: config.metrics.host,
    prefix: config.metrics.name + (process.env.METRICS_NODE ? process.env.METRICS_NODE : '')
  });
}

/**
 * StatsD a response time with microsecond precision
 * @return {Function}
 */
module.exports = function responseTime() {
    return function *(next) {
        const start = process.hrtime();
        yield next;
        const elapsed = process.hrtime(start);
        if (metrics) metrics.timing('_response_time', + (elapsed[0] * 1e3 + elapsed[1] / 1e6).toFixed(3)); //  in ms
    };
}
