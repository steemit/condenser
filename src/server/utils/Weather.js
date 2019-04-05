import * as config from 'config';
import axios from 'axios';
import NodeCache from 'node-cache';

export function Weather() {
    this.cache = new NodeCache();
    this.refresh();
}

Weather.prototype.refresh = async function() {
    return await axios({
        url: config.weather_endpoint,
    })
        .then(response => {
            console.info('Received weather data from endpoint...');
            this.cache.set('weather', response.data, (err, success) => {
                if (err) {
                    rej(err);
                    return;
                }
                console.info('Weather data refreshed...');
            });
        })
        .catch(err => {
            console.error('Could not fetch weather data', err);
        });
};

Weather.prototype.get = async function() {
    return new Promise((res, rej) => {
        this.cache.get('weather', (err, value) => {
            if (err) {
                console.error('Could not retrieve Steem Market data');
                res({});
                return;
            }
            res(value || {});
        });
    });
};
