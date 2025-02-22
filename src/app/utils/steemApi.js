import { api } from '@steemit/steem-js';
import { ifHive } from 'app/utils/Community';
import stateCleaner from 'app/redux/stateCleaner';
import { changeRPCNodeToDefault } from 'app/utils/RPCNode';
import xhr from 'axios/index';

export async function callBridge(method, params, pre = 'bridge.') {
    //console.log('call bridge');
    //console.log("Method: ", method);
    //console.log("Params: ", JSON.stringify(params).substring(0, 200));
    //console.log("Pre: ", pre);

    return new Promise(function(resolve, reject) {
        api.call(pre + method, params, function(err, data) {
            if (err) {
                console.error(
                    '~~ apii.calBridge error ~~',
                    method + ' ~~> ' + err
                );

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

export async function getStateAsync(url, observer, ssr = false) {
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
            let posts = await loadPosts(sort, tag, observer, ssr);

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
            try {
                state['community'][tag] = await callBridge('get_community', {
                    name: tag,
                    observer: observer,
                });
            } catch (e) {}
        }

        // for SSR, load profile on any profile page or discussion thread author
        const account =
            tag && tag[0] == '@'
                ? tag.slice(1)
                : page == 'thread' ? key[0].slice(1) : null;
        if (ssr && account) {
            // TODO: move to global reducer?
            const profile = await callBridge('get_profile', { account });
            if (profile && profile['name']) {
                state['profiles'][account] = profile;
            }
        }

        if (ssr) {
            // append `topics` key
            state['topics'] = await callBridge('get_trending_topics', {
                limit: 12,
            });
        }

        const cleansed = stateCleaner(state);
        return cleansed;
    } catch (error) {
        console.error('~~ getStateAsync error ~~~>', error);

        if (error.message === 'Network request failed') {
            changeRPCNodeToDefault();
        }

        throw error;
    }
}

async function loadThread(account, permlink) {
    const author = account.slice(1);
    const content = await callBridge('get_discussion', { author, permlink });
    return { content };
}

async function loadPosts(sort, tag, observer, ssr) {
    const account = tag && tag[0] == '@' ? tag.slice(1) : null;

    let posts;
    if (account) {
        const params = { sort, account, observer };
        posts = await callBridge('get_account_posts', params);
    } else {
        const params = { sort, tag, observer };
        posts = await callBridge('get_ranked_posts', params);
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
