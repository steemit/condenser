import Promise from 'bluebird';
import { api } from '@steemit/steem-js';

import stateCleaner from 'app/redux/stateCleaner';

export async function getStateAsync(url, observer) {
    // strip off query string
    url = url.split('?')[0];

    // strip off leading and trailing slashes
    if (url.length > 0 && url[0] == '/') url = url.substring(1, url.length);
    if (url.length > 0 && url[url.length - 1] == '/')
        url = url.substring(0, url.length - 1);

    // blank URL defaults to `trending`
    if (url === '') url = 'trending';

    // curation and author rewards pages are alias of `transfers`
    // @TODO: maybe remove these all together as Condenser should redirect them to Wallet?
    if (url.match(/^@.*?\/curation-rewards$/) !== null) {
        url = url.replace('/curation-rewards', '/transfers');
    } else if (url.match(/^@.*?\/author-rewards$/) !== null) {
        url = url.replace('/author-rewards', '/transfers');
    }

    const raw = await callBridge('get_state', {
        path: url,
        observer: observer === undefined ? null : observer,
    });

    const cleansed = stateCleaner(raw);
    return cleansed;
}

export async function callBridge(method, params) {
    const call = (method, params, callback) => {
        return api.call('bridge.' + method, params, callback);
    };
    return Promise.promisify(call)(method, params);
}
