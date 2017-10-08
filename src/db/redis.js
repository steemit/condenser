import config from 'config';
import redis from 'redis';

let instance = null;

class Redis {
    constructor() {
        const host = config.get('redis.host');
        const port = config.get('redis.port');
        this.client = redis.createClient({host, port});
        this.ready_promise = new Promise((resolve, reject) => {
            this.client.on("connect", () => {
                console.log("connected to redis instance " + host + ":" + port);
                resolve(true);
            });
            this.client.on("error", (err) => {
                console.log("redis error: " + err);
                reject(err);
            });
        });
    }

    makeCall(call_name, args) {
        return this.ready_promise
            .then(() => {
                return new Promise((resolve, reject) => {
                    args.push((err, res) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(res && res.length > 0 && res[0] === '{' ? JSON.parse(res) : res);
                        }
                    });
                    this.client[call_name].apply(this.client, args);
                });
            })
            .catch((error) => {
                if (error.message.indexOf('connect') >= 0) {
                    instance = null;
                }
                return Promise.reject(error);
            });
    }

    get(key) {
        return this.makeCall('get', [key]);
    }
    set(key, value) {
        return this.makeCall('set', [key, JSON.stringify(value)]);
    }
}

Redis.instance = function () {
    if (!instance) instance = new Redis();
    return instance;
};

export default Redis;
