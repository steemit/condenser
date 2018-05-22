/**
 * @param {array} hrtime process.hrtime() tuple
 * @returns {number} nanoseconds
 */
const hrtimeToNanoseconds = hrtime => +hrtime[0] * 1e9 + +hrtime[1];

export default class RequestTimer {
    constructor(statsdClient, tags) {
        this.timers = [];
        this.inProgressTimers = {};
        this.requestTags = tags;
        this.statsdClient = statsdClient;
    }

    /**
     * @param {string} name
     * @param {number} duration nanoseconds
     */
    logSegment(name, duration) {
        this.timers.push([name, duration]);
    }

    startTimer(name) {
        this.inProgressTimers[name] = process.hrtime();
    }

    stopTimer(name) {
        this.logSegment(
            name,
            hrtimeToNanoseconds(process.hrtime(this.inProgressTimers[name]))
        );
        delete this.inProgressTimers[name];
    }

    sendToStatsd() {
        this.statsdClient.logTimers(this.timers, this.requestTags);
    }
}
