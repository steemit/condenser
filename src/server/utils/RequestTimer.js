import assert from 'assert';
import StatsLoggerClient from './StatsLoggerClient';

/**
 * @param {array} hrtime process.hrtime() tuple
 * @returns {number} nanoseconds
 */
const hrtimeToNanoseconds = hrtime => +hrtime[0] * 1e9 + +hrtime[1];

/**
 * Logs total request time starting at instantiation and ending when finish() is called.
 * Additional timers can be managed with startTimer('name') and stopTimer('name')
 *
 * Results are stored in `timers` property and submitted to statsd at finish().
 */
export default class RequestTimer {
    /**
     *
     * @param {StatsLoggerClient} statsdClient
     * @param {object} tags a single-depth object where each property is a tag name and each value is a tag value
     */
    constructor(statsdClient, tags) {
        assert(
            statsdClient instanceof StatsLoggerClient,
            'provide an instance of StatsLoggerClient'
        );

        this.start = process.hrtime();
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

    /**
     * Starts keeping track of something to time.
     *
     * @param {string} name
     */
    startTimer(name) {
        assert(
            typeof name === 'string',
            'a name for the timer must be provided'
        );

        this.inProgressTimers[name] = process.hrtime();
    }

    /**
     * Stops an in-progress timer and stores it in the list of timers to log when the request is finished.
     *
     * @param {*} name
     */
    stopTimer(name) {
        assert(
            typeof this.inProgressTimers[name] !== 'undefined',
            'provide an existing timer name'
        );

        this.logSegment(
            name,
            hrtimeToNanoseconds(process.hrtime(this.inProgressTimers[name]))
        );
        delete this.inProgressTimers[name];
    }

    finish() {
        this.logSegment(
            'total_ns',
            hrtimeToNanoseconds(process.hrtime(this.start))
        );
        this.statsdClient.logTimers(this.timers, this.requestTags);
    }
}
