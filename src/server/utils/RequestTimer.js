import assert from 'assert';
import StatsLoggerClient from './StatsLoggerClient';

/**
 * @param {array} hrtime process.hrtime() tuple
 * @returns {number} nanoseconds
 */
const hrtimeToNanoseconds = hrtime => +hrtime[0] * 1e9 + +hrtime[1];

/**
 * @param {array} hrtime process.hrtime() tuple
 * @returns {number} milliseconds
 */
const hrtimeToMilliseconds = hrtime => +hrtime[0] * 1000 + +hrtime[1] / 1000000;

/**
 * Logs total request time starting at instantiation and ending when finish() is called.
 * Additional timers can be managed with startTimer('name') and stopTimer('name')
 *
 * Results are stored in `timers` property and submitted to statsd at finish().
 */
export default class RequestTimer {
    /**
     *
     * @param {StatsLoggerClient} statsLoggerClient
     * @param {string} prefix namespace to tack on the front of each timer name
     * @param {string} tags not yet supported by statsd / StatsLoggerClient
     */
    constructor(statsLoggerClient, prefix, tags) {
        assert(
            statsLoggerClient instanceof StatsLoggerClient,
            'provide an instance of StatsLoggerClient'
        );

        this.start = process.hrtime();
        this.timers = [];
        this.inProgressTimers = {};
        this.prefix = prefix;
        this.requestTags = tags;
        this.statsLoggerClient = statsLoggerClient;
    }

    /**
     * @param {string} name
     * @param {number} duration milliseconds
     */
    logSegment(name, duration) {
        this.timers.push([`${this.prefix}.${name}`, duration]);
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
            hrtimeToMilliseconds(process.hrtime(this.inProgressTimers[name]))
        );
        delete this.inProgressTimers[name];
    }

    finish() {
        this.logSegment(
            'total_ms',
            hrtimeToMilliseconds(process.hrtime(this.start))
        );
        this.statsLoggerClient.logTimers(this.timers, this.requestTags);
    }
}
