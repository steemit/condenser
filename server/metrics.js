'use strict';

var config = require('config');
var metrics = null;

if (config.metrics) {
  var StatsD = require('node-statsd');
  metrics = new StatsD({
    host: config.get('metrics.host'),
    prefix: config.get('metrics.name') + '_' + (process.env.METRICS_NODE ? process.env.METRICS_NODE : '')
  });
}

module.exports = {
  metrics,
  responseTime
}

/**
 * StatsD a response time with microsecond precision
 * @return {Function}
 */
function responseTime() {
  return function *(next) {
    const start = process.hrtime();
    yield next;
    const elapsed = process.hrtime(start);
    if (metrics) metrics.timing('_response_time', + (elapsed[0] * 1e3 + elapsed[1] / 1e6).toFixed(3)); //  in ms
  };
}
