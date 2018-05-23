import RequestTimer from './utils/RequestTimer';

function requestTime(statsLoggerClient) {
    return function*(next) {
        this.state.requestTimer = new RequestTimer(statsLoggerClient, {
            method: this.request.method,
            path: this.request.path,
        });

        yield* next;

        this.state.requestTimer.finish();
    };
}

module.exports = requestTime;
