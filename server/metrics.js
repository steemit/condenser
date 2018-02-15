const config = require('config');
let metrics = null;

if (config.metrics) {
  const StatsD = require('node-statsd');
  metrics = new StatsD({ host: config.get('metrics.host'), prefix: 'tolstoy_' });
  metrics.track = track
  metrics.cache = cache
} 

function track(context, method, args) {
  const start = new Date()
  const promise = context[method].apply(context, args)
  
  promise.then(() => {
      const end = new Date()
      const delta = end - start

      this.timing(`api.${method}.time`, delta)

  }).catch(console.log)

  return promise
}

function cache(method, type) {
  this.increment(`cache.${method}.${type}.count`)
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

module.exports = {
  metrics,
  responseTime
}
