import RequestTimer from './utils/RequestTimer';

function requestTime(statsLoggerClient) {
    return function*(next) {
        this.state.requestTimer = new RequestTimer(statsLoggerClient);

        this.state.requestTimer.startTimer('request.total_ns');

        yield* next;

        this.state.requestTimer.stopTimer('request.total_ns');
        this.state.requestTimer.sendToStatsd();
    };
}

module.exports = requestTime;
