import TarantoolDriver from 'tarantool-driver';

const config = require('config');
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
            .catch(error => resolve(false));
        });
    }

    makeCall(call_name, args) {
        return this.ready_promise
            .then(() => this.connection[call_name].apply(this.connection, args))
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
