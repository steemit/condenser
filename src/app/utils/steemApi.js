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

    const part = url.split('/');
    const parts = part.length;
    const sorts = [
        'trending',
        'promoted',
        'hot',
        'created',
        'payout',
        'payout_comments',
        'muted',
    ];
    const acct_tabs = ['blog', 'feed', 'comments', 'recent-replies', 'payout'];

    if (parts == 1 && sorts.includes(part[0])) {
        //console.log("getState URL -- all ranked posts", url)
    } else if (parts == 2 && sorts.includes(part[0])) {
        //console.log("getState URL -- tag ranked posts", url)
    } else if (parts == 3 && part[1][0] == '@') {
        //console.log("getState URL -- discussion", url)
    } else if (parts == 1 && part[0][0] == '@') {
        //console.log("getState URL -- override account home", url)
        url = part[0] + '/blog';
    } else if (parts == 2 && part[0][0] == '@' && acct_tabs.includes(part[1])) {
        //console.log("getState URL -- account tab", url)
    } else {
        console.log('no-op getState URL -- ', url);
        return { content: {}, accounts: {} };
    }

    const raw = await callBridge('get_state', {
        path: url,
        observer: observer === undefined ? null : observer,
    });

    if (!('accounts' in raw)) raw['accounts'] = {};

    const cleansed = stateCleaner(raw);
    return cleansed;
}

export async function callBridge(method, params) {
    const call = (method, params, callback) => {
        return api.call('bridge.' + method, params, callback);
    };
    return Promise.promisify(call)(method, params);
}
