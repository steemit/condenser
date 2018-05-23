import net from 'net';

/**
 * In production, log stats to graphite if a connection is available.
 * In dev, console.log 'em.
 */
export default class StatsLoggerClient {
    constructor(GRAPHITE_HOST, GRAPHITE_PORT) {
        if (GRAPHITE_HOST && GRAPHITE_PORT) {
            this.GRAPHITE_HOST = GRAPHITE_HOST;
            this.GRAPHITE_PORT = GRAPHITE_PORT;
            this.socket = null;
            this.connected = false;
            this.connect();
        } else {
            console.log(
                'StatsLoggerClient: no graphite server available, logging to console.'
            );
            // Implement debug loggers here, as any new calls are added in methods below.
            this.SDC = {
                timing() {
                    console.log('graphite call: ', arguments);
                },
            };
        }
    }

    connect() {
        this.socket = net.connect(this.GRAPHITE_PORT, this.GRAPHITE_HOST);
        this.socket.setKeepAlive(true);
        this.socket.on('connect', this.onConnect.bind(this));
        this.socket.on('error', this.onError.bind(this));
    }

    onConnect() {
        console.log(
            'connected to graphite server',
            this.GRAPHITE_HOST,
            this.GRAPHITE_PORT
        );
        this.connected = true;
    }

    onError(error) {
        console.error('graphite server socket error', error);
        this.socket.destroy();
        this.socket.unref();
        this.connected = false;
        setTimeout(this.connect.bind(this), 1000); // wait just a second before attempting to reconnect
    }

    /**
     * Given an array of timer tuples that look like [namespace, value]
     * log them all to statsd.
     */
    logTimers(tuples, tags) {
        if (!this.connected) {
            console.warn('graphite not connected; will not try and log');
            return;
        }

        const timestamp = +new Date();
        tuples.map(tuple => {
            this.socket.write(`${tuple[0]} ${tuple[1]} ${timestamp}`); // TODO: figure out tags: ${tags}\n`);
        });
    }
}
