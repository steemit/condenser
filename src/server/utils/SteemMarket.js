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
            this.refresh();
        }
    });
    this.cache = cache;
    // Store empty data while we wait for the network request to complete
    this.storeEmpty().then(() => this.refresh());
}

SteemMarket.prototype.storeEmpty = function() {
    const key = config.steem_market_cache.key;
    return new Promise((res, rej) => {
        this.cache.set(key, {}, (err, success) => {
            console.info('Storing empty Steem Market data...');
            res();
        });
    });
};

SteemMarket.prototype.get = async function() {
    return new Promise((res, rej) => {
        const key = config.steem_market_cache.key;
        this.cache.get(key, (err, value) => {
            if (err) {
                console.error('Could not retrieve Steem Market data');
                res({});
                return;
            }
            res(value || {});
        });
    });
};

SteemMarket.prototype.refresh = async function() {
    console.info('Refreshing Steem Market data...');

    const url = config.steem_market_endpoint;
    const token = config.steem_market_token;
    const key = config.steem_market_cache.key;
    if (!url) {
        console.info('No Steem Market endpoint provided...');
        return this.storeEmpty();
    }

    return await axios({
        url: url,
        method: 'GET',
        headers: {
            Authorization: `Token ${token}`,
        },
    })
        .then(response => {
            console.info('Received Steem Market data from endpoint...');
            this.cache.set(key, response.data, (err, success) => {
                if (err) {
                    rej(err);
                    return;
                }
                console.info('Steem Market data refreshed...');
            });
        })
        .catch(err => {
            console.error('Could not fetch Steem Market data', err);
            return this.storeEmpty();
        });
};
