import Promise from 'bluebird';
import { api } from '@steemit/steem-js';
import { ifHive } from 'app/utils/StateFunctions';

import stateCleaner from 'app/redux/stateCleaner';

export async function callBridge(method, params) {
    console.log('call bridge', method, params);
    const call = (method, params, callback) => {
        return api.call('bridge.' + method, params, callback);
    };
    return Promise.promisify(call)(method, params);
}

export async function getStateAsync(url, observer, ssr = false) {
    if (observer === undefined) observer = null;

    const { page, tag, sort, key } = parsePath(url);

    let state = {
        accounts: {},
        community: {},
        content: {},
        discussion_idx: {},
    };

    // load `content` and `discussion_idx`
    if (page == 'posts' || page == 'account') {
        const posts = await loadPosts(sort, tag, observer);
        state['content'] = posts['content'];
        state['discussion_idx'] = posts['discussion_idx'];
    } else if (page == 'thread') {
        const posts = await loadThread(key[0], key[1]);
        state['content'] = posts['content'];
    } else {
        // no-op
    }

    // append `community` key
    if (tag && ifHive(tag)) {
        state['community'][tag] = await callBridge('get_community', {
            name: tag,
            observer: observer,
        });
    }

    if (ssr) {
        // append `topics` key
        state['topics'] = await callBridge('get_trending_topics', { observer });
    }

    const cleansed = stateCleaner(state);
    return cleansed;
}

async function loadThread(account, permlink) {
    const author = account.slice(1);
    posts = await callBridge('get_discussion', { author, permlink });
    return { content: posts };
}

async function loadPosts(sort, tag, observer) {
    const account = tag && tag[0] == '@' ? tag.slice(1) : null;

    let posts;
    if (account)
        posts = await callBridge('get_account_posts', {
            sort,
            account,
            observer,
        });
    else posts = await callBridge('get_ranked_posts', { sort, tag, observer });

    let content = {};
    let keys = [];
    for (var idx in posts) {
        const post = posts[idx];
        const key = post['author'] + '/' + post['permlink'];
        content[key] = post;
        keys.push(key);
    }

    let discussion_idx = {};
    discussion_idx[tag] = {};
    discussion_idx[tag][sort] = keys;

    return { content, discussion_idx };
}

function parsePath(url) {
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

    let page = null;
    let tag = null;
    let sort = null;
    let key = null;

    if (parts == 1 && sorts.includes(part[0])) {
        page = 'posts';
        sort = part[0];
        tag = '';
    } else if (parts == 2 && sorts.includes(part[0])) {
        page = 'posts';
        sort = part[0];
        tag = part[1];
    } else if (parts == 3 && part[1][0] == '@') {
        page = 'thread';
        tag = part[0];
        key = [part[1], part[2]];
    } else if (parts == 1 && part[0][0] == '@') {
        page = 'account';
        sort = 'blog';
        tag = part[0];
    } else if (parts == 2 && part[0][0] == '@' && acct_tabs.includes(part[1])) {
        page = 'account';
        sort = part[1] == 'recent-replies' ? 'replies' : part[1];
        tag = part[0];
    } else {
        // no-op URL
    }

    return { page, tag, sort, key };
}
