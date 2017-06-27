var humanize = require('humanize-number');
var bytes = require('bytes');
var config = require('../config').default;
var metrics = require('./metrics').metrics;

module.exports = prod_logger;

function prod_logger() {
    return function *logger(next) {
        // request
        var start = new Date;
        var asset = this.originalUrl.indexOf('/assets/') === 0
            || this.originalUrl.indexOf('/images/') === 0
            || this.originalUrl.indexOf('/favicon.ico') === 0;
        if (!asset)
            console.log('  <-- [reqid ' + this.response.header['x-request-id'] + '] ' + this.method + ' ' + this.originalUrl + ' ' + (this.session.uid || ''));
        try {
            yield next;
        } catch (err) {
            log(this, start, null, err, false);
            throw err;
        }
        var length = this.response.length;
        log(this, start, length, null, asset);
    }
}

function log(ctx, start, len, err, asset) {
    var status = err
        ? (err.status || 500)
        : (ctx.status || 404);

    var length;
    if (~[204, 205, 304].indexOf(status)) {
        length = '';
    } else if (null == len) {
        length = '-';
    } else {
        length = bytes(len);
    }

    var upstream = err ? 'xxx' : '-->';

    if (!asset || err || ctx.status > 400) console.log('  ' + upstream + ' [reqid %s] %s %s %s %s %s %s',
        ctx.response.header['x-request-id'],
        ctx.method,
        ctx.originalUrl,
        status,
        time(start),
        length,
        ctx.session.uid || '');

    if (metrics) metrics.increment('_http_code_' + status);
}

function time(start) {
    var delta = new Date - start;
    delta = delta < 10000
        ? delta + 'ms'
        : Math.round(delta / 1000) + 's';
    return humanize(delta);
}
