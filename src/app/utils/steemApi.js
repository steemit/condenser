import { api } from '@steemit/steem-js';
import { ifHive } from 'app/utils/Community';
import stateCleaner from 'app/redux/stateCleaner';
import { changeRPCNodeToDefault } from 'app/utils/RPCNode';
import xhr from 'axios/index';
import {
    safeConsoleTime,
    safeConsoleTimeEnd,
} from '../../server/utils/TimingUtils';

export async function callBridge(method, params, pre = 'bridge.') {
    //console.log('call bridge');
    //console.log("Method: ", method);
    //console.log("Params: ", JSON.stringify(params).substring(0, 200));
    //console.log("Pre: ", pre);

    return new Promise(function(resolve, reject) {
        api.call(pre + method, params, function(err, data) {
            if (err) {
                const output_err = {
                    msg: '~~ apii.calBridge error ~~',
                    method: method,
                    params: params,
                    err: err,
                };
                console.error(JSON.stringify(output_err));

                if (err.message === 'Network request failed') {
                    changeRPCNodeToDefault();
                }

                reject(err);
            } else resolve(data);
        });
    });
}

export const _list_temp = [];

export const _user_list = [];

export async function getStateAsync(
    url,
    observer,
    ssr = false,
    requestId = null
) {
    try {
        if (observer === undefined) observer = null;

        const { page, tag, sort, key } = parsePath(url);

        console.log('GSA', url, observer, ssr);
        let state = {
            accounts: {},
            community: {},
            content: {},
            discussion_idx: {},
            profiles: {},
        };

        // load `content` and `discussion_idx`
        if (page == 'posts' || page == 'account') {
            const timerLabel = `timing_loadPosts_${sort}_${tag}`;
            safeConsoleTime(timerLabel, requestId);
            let posts = await loadPosts(sort, tag, observer, ssr, requestId);
            safeConsoleTimeEnd(timerLabel, requestId);

            state['content'] = posts['content'];
            state['discussion_idx'] = posts['discussion_idx'];
        } else if (page == 'thread') {
            const timerLabel = `timing_loadThread_${key[0]}_${key[1]}`;
            safeConsoleTime(timerLabel, requestId);
            const posts = await loadThread(key[0], key[1], requestId);
            safeConsoleTimeEnd(timerLabel, requestId);
            state['content'] = posts['content'];
        } else {
            // no-op
        }

        // append `community` key
        if (tag && ifHive(tag)) {
            try {
                const timerLabel = `timing_get_community_${tag}`;
                safeConsoleTime(timerLabel, requestId);
                state['community'][tag] = await callBridge('get_community', {
                    name: tag,
                    observer: observer,
                });
                safeConsoleTimeEnd(timerLabel, requestId);
            } catch (e) {}
        }

        // for SSR, load profile on any profile page or discussion thread author
        const account =
            tag && tag[0] == '@'
                ? tag.slice(1)
                : page == 'thread' ? key[0].slice(1) : null;
        if (ssr && account) {
            // TODO: move to global reducer?
            const timerLabel = `timing_get_profile_${account}`;
            safeConsoleTime(timerLabel, requestId);
            const profile = await callBridge('get_profile', { account });
            safeConsoleTimeEnd(timerLabel, requestId);
            if (profile && profile['name']) {
                state['profiles'][account] = profile;
            }
        }

        if (ssr) {
            // append `topics` key
            safeConsoleTime('timing_get_trending_topics', requestId);
            state['topics'] = await callBridge('get_trending_topics', {
                limit: 12,
            });
            safeConsoleTimeEnd('timing_get_trending_topics', requestId);
        }

        safeConsoleTime('timing_stateCleaner', requestId);
        const cleansed = stateCleaner(state);
        safeConsoleTimeEnd('timing_stateCleaner', requestId);
        return cleansed;
    } catch (error) {
        console.error(
            JSON.stringify({
                msg: '~~ getStateAsync error ~~',
                error: error,
                requestId,
                url,
            })
        );

        if (error.message === 'Network request failed') {
            changeRPCNodeToDefault();
        }

        throw error;
    }
}

async function loadThread(account, permlink, requestId = null) {
    const author = account.slice(1);
    const timerLabel = `timing_get_discussion_${author}_${permlink}`;
    safeConsoleTime(timerLabel, requestId);
    const content = await callBridge('get_discussion', { author, permlink });
    safeConsoleTimeEnd(timerLabel, requestId);
    return { content };
}

async function loadPosts(sort, tag, observer, ssr, requestId = null) {
    const account = tag && tag[0] == '@' ? tag.slice(1) : null;

    let posts;
    if (account) {
        const timerLabel = `timing_get_account_posts_${account}_${sort}`;
        safeConsoleTime(timerLabel, requestId);
        const params = { sort, account, observer };
        posts = await callBridge('get_account_posts', params);
        safeConsoleTimeEnd(timerLabel, requestId);
    } else {
        const timerLabel = `timing_get_ranked_posts_${sort}_${tag}`;
        safeConsoleTime(timerLabel, requestId);
        const params = { sort, tag, observer };
        posts = await callBridge('get_ranked_posts', params);
        safeConsoleTimeEnd(timerLabel, requestId);
    }
    let content = {};
    let keys = [];
    for (var idx in posts) {
        const post = posts[idx];
        const key = post['author'] + '/' + post['permlink'];
        content[key] = post;
        keys.indexOf(key) == -1 && keys.push(key);
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
    const acct_tabs = [
        'blog',
        'feed',
        'posts',
        'comments',
        'replies',
        'payout',
    ];

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
    } else if (parts == 2 && part[0][0] == '@') {
        if (acct_tabs.includes(part[1])) {
            page = 'account';
            sort = part[1];
        } else {
            // settings, followers, notifications, etc (no-op)
        }
        tag = part[0];
    } else {
        // no-op URL
    }

    return { page, tag, sort, key };
}

export async function getDynamicGlobalProperties() {
    return await api.getDynamicGlobalPropertiesAsync();
}
