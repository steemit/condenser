import SDC from 'statsd-client';

/**
 * In production, log stats to statsd.
 * In dev, console.log 'em.
 */
export default class StatsLoggerClient {
    constructor(STATSD_IP) {
        if (STATSD_IP) {
            this.SDC = new SDC({
                host: STATSD_IP,
                prefix: 'condenser',
            });
        } else {
            console.log(
                'StatsLoggerClient: no statsd available, logging to console.'
            );
            // Implement debug loggers here, as any new calls are added in methods below.
            this.SDC = {
                timing() {
                    console.log('statsd timing call: ', arguments);
                },
            };
        }
    }

    /**
     * Given an array of timer tuples that look like [namespace, milliseconds]
     * log them all to statsd.
     */
    logTimers(tuples, tags) {
        tuples.map(tuple => {
            this.SDC.timing(tuple[0], tuple[1], tags);
        });
    }
}
