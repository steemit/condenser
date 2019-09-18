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
    const tabs = [
        'blog',
        'feed',
        'comments',
        'recent-replies',
        'notifications',
        'payout',
    ];

    if (parts == 1 && sorts.includes(part[0])) {
        //console.log("getState URL -- all ranked posts", url)
    } else if (parts == 2 && sorts.includes(part[0])) {
        //console.log("getState URL -- tag ranked posts", url)
    } else if (parts == 3 && part[1][0] == '@') {
        //console.log("getState URL -- discussion", url)
    } else if (parts == 1 && part[0][0] == '@') {
        //console.log("getState URL -- override account home", url)
        url = part[0] + '/blog';
    } else if (parts == 2 && part[0][0] == '@') {
        // special case: `followers`, `settings`, etc
        if (!tabs.includes(part[1])) {
            //console.log("getState URL -- override account tab", url)
            url = part[0] + '/null';
        } else {
            //console.log("getState URL -- account tab", url)
        }
    } else {
        console.log('no-op getState URL -- ', url);
        return { content: {}, accounts: {} };
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
        /*        return {
    "id": "1",
    "jsonrpc": "2.0",
    "result": [
        {
            "date": "2019-09-12 21:49:54",
            "msg": "@test-safari error: post does not belong to community",
            "score": 35,
            "type": "error"
        },
        {
            "date": "2019-09-11 15:44:00",
            "msg": "@hive-171485 set @test-safari admin",
            "score": 15,
            "type": "set_role"
        },
        {
            "date": "2019-09-10 21:04:18",
            "msg": "@hive-19816 set @test-safari admin",
            "score": 15,
            "type": "set_role"
        },
        {
            "date": "2019-09-10 16:50:15",
            "msg": "@test-safari error: post is already not pinned",
            "score": 35,
            "type": "error"
        },
};*/
        return api.call('bridge.' + method, params, callback);
    };
    return Promise.promisify(call)(method, params);
}
