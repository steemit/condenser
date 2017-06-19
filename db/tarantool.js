import config from 'config';
const newrelic = config.get('newrelic') ? require('newrelic') : undefined;
import TarantoolDriver from 'tarantool-driver';

let instance = null;

class Tarantool {
    constructor() {
        const host = config.get('tarantool.host');
        const port = config.get('tarantool.port');
        const username = config.get('tarantool.username');
        const password = config.get('tarantool.password');

        const connection = this.connection = new TarantoolDriver({host, port});
        this.ready_promise = new Promise((resolve, reject) => {
            connection.connect()
            .then(() => connection.auth(username, password))
            .then(() => resolve())
            .catch(() => resolve(false));
        });
    }

    makeCall(call_name, args) {
        return this.ready_promise
            .then(() => {
                const call_time = Date.now();
                return new Promise((resolve, reject) => {
                    this.connection[call_name].apply(this.connection, args).then(res => {
                        if (newrelic) {
                            const time_taken = Date.now() - call_time;
                            newrelic.recordMetric(`WebTransaction/Performance/tarantool/${call_name}/${args['0']}`, time_taken / 1000.0);
                        }
                        resolve(res)
                    }).catch(error => reject(error));
                });
            })
            .catch(error => {
                if (error.message.indexOf('connect') >= 0)
                    instance = null;
                return Promise.reject(error);
            });
    }

    select() {
       return this.makeCall('select', arguments);
    }
    delete() {
        return this.makeCall('delete', arguments);
    }
    insert() {
        return this.makeCall('insert', arguments);
    }
    replace() {
        return this.makeCall('replace', arguments);
    }
    update() {
        return this.makeCall('update', arguments);
    }
    eval() {
        return this.makeCall('eval', arguments);
    }
    call() {
        return this.makeCall('call', arguments);
    }
    upsert() {
        return this.makeCall('upsert', arguments);
    }
}

Tarantool.instance = function () {
    if (!instance) instance = new Tarantool();
    return instance;
};

export default Tarantool;
