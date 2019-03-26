import * as config from 'config';
import axios from 'axios';
import NodeCache from 'node-cache';

export function SteemMarket() {
    const ttl = config.steem_market_cache.ttl;
    const cache = new NodeCache({
        stdTTL: ttl,
    });
    const key = config.steem_market_cache.key;
    cache.on('expired', (k, v) => {
        console.log('Cache key expired', k);
        if (key === k) {
            this.promise = this.refresh();
        }
    });
    this.cache = cache;
    this.promise = this.refresh();
}

SteemMarket.prototype.get = async function() {
    await this.promise;

    const key = config.steem_market_cache.key;
    return new Promise((res, rej) => {
        this.cache.get(key, (err, value) => {
            if (err) {
                console.error('Could not retrieve Steem Market data');
                return;
            }
            res(value);
        });
    });
};

SteemMarket.prototype.refresh = function() {
    console.info('Refreshing Steem Market data...');

    const url = config.steem_market_endpoint;
    const token = config.steem_market_token;
    const key = config.steem_market_cache.key;
    if (!url) {
        console.info('No Steem Market endpoint provided...');
        return new Promise((res, rej) => {
            this.cache.set(key, {}, (err, success) => {
                console.info('Stored empty Steem Market data...');
                res();
            });
        });
    }

    return new Promise((res, rej) => {
        const options = {
            url: url,
            method: 'GET',
            headers: {
                Authorization: `Token ${token}`,
            },
        };

        axios(options)
            .then(response => {
                console.info('Received Steem Market data from endpoint...');
                this.cache.set(key, response.data, (err, success) => {
                    if (err) {
                        console.error('Error storing currencies in cache', err);
                        return;
                    }
                    console.info('Steem Market data refreshed...');
                    res();
                });
            })
            .catch(err => {
                console.error('Could not fetch Steem Market data', err);
            });
    });
};
