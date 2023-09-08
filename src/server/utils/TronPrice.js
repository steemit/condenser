import * as config from 'config';
import axios from 'axios';
import NodeCache from 'node-cache';

const key = `${config.steem_market_cache.key}_tron`;
export function TronPrice() {
    const ttl = config.steem_market_cache.ttl;
    const cache = new NodeCache({
        stdTTL: ttl,
    });
    // const key = `${config.steem_market_cache.key}_tron`;
    cache.on('expired', (k, v) => {
        console.log('Tron price Cache key expired', k);
        if (key === k) {
            this.refresh();
        }
    });
    this.cache = cache;
    // Store empty data while we wait for the network request to complete
    this.storeEmpty().then(() => this.refresh());
}

TronPrice.prototype.storeEmpty = function() {
    // const key = config.steem_market_cache.key;
    return new Promise((res, rej) => {
        this.cache.set(key, {}, (err, success) => {
            console.info('Storing empty tron price data...');
            res();
        });
    });
};

TronPrice.prototype.get = async function() {
    return new Promise((res, rej) => {
        // const key = config.steem_market_cache.key;
        this.cache.get(key, (err, value) => {
            if (err) {
                console.error('Could not retrieve tron price data');
                res({});
                return;
            }
            res(value || {});
        });
    });
};

TronPrice.prototype.refresh = async function() {
    console.info('Refreshing tron price data...');

    const url = 'https://apilist.tronscan.org/api/token/price?token=trx';
    // const key = config.steem_market_cache.key;
    if (!url) {
        console.info('No tron price provided...');
        return this.storeEmpty();
    }

    return await axios({
        url: url,
        method: 'GET',
    })
        .then(response => {
            console.info('Received Tron price data from endpoint...');
            this.cache.set(key, response.data, (err, success) => {
                if (err) {
                    rej(err);
                    return;
                }
                console.info('tron price data refreshed...');
            });
        })
        .catch(err => {
            console.error('Could not fetch tron price data:', err.message);
            return this.storeEmpty();
        });
};
