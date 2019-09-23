import Promise from 'bluebird';
import { api } from '@steemit/steem-js';
import { ifHive } from 'app/utils/StateFunctions';

import stateCleaner from 'app/redux/stateCleaner';

export async function getStateAsync(url, observer) {
    if (observer === undefined) observer = null;

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
    let hive;

    if (parts == 1 && sorts.includes(part[0])) {
        //console.log("get state URL -- all ranked posts", url)
    } else if (parts == 2 && sorts.includes(part[0])) {
        //console.log("get state URL -- tag ranked posts", url)
        hive = ifHive(part[1]);
    } else if (parts == 3 && part[1][0] == '@') {
        //console.log("get state URL -- discussion", url)
        hive = ifHive(part[0]);
    } else if (parts == 1 && part[0][0] == '@') {
        //console.log("get state URL -- override account home", url)
        url = part[0] + '/blog';
    } else if (parts == 2 && part[0][0] == '@' && acct_tabs.includes(part[1])) {
        //console.log("get state URL -- account tab", url)
    } else {
        //console.log('no-op getState URL -- ', url);
        return { content: {}, accounts: {} };
    }

    const raw = await callBridge('get_state', {
        path: url,
        observer: observer,
    });

    if (!('accounts' in raw)) raw['accounts'] = {};
    if (!('community' in raw)) raw['community'] = {};

    if (hive && !(hive in raw['community'])) {
        raw['community'][hive] = await callBridge('get_community', {
            name: hive,
            observer: observer,
        });
    }

    raw['topics'] = await callBridge('get_trending_topics');

    const cleansed = stateCleaner(raw);
    return cleansed;
}

export async function callBridge(method, params) {
    const call = (method, params, callback) => {
        return api.call('bridge.' + method, params, callback);
    };
    return Promise.promisify(call)(method, params);
}
