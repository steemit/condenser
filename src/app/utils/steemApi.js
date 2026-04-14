import { api } from '@steemit/steem-js';
import { ifHive } from 'app/utils/Community';
import stateCleaner from 'app/redux/stateCleaner';
import { changeRPCNodeToDefault } from 'app/utils/RPCNode';
import xhr from 'axios/index';
import {
    safeConsoleTime,
    safeConsoleTimeEnd,
} from '../../server/utils/TimingUtils';

let _apiCache = null;

export function setApiCache(cache) {
    _apiCache = cache;
}
// Steem username validation regex: 3-16 chars, starts with lowercase letter
const VALID_USERNAME_REGEX = /^[a-z][a-z0-9.-]{2,15}$/;

// Methods that require account parameter validation
const ACCOUNT_METHODS = ['get_account_posts', 'get_profile', 'get_followers', 'get_following'];

/**
 * Validate username format
 * @param {string} username - username to validate
 * @returns {boolean} - is valid
 */
function isValidUsername(username) {
    if (!username || typeof username !== 'string') {
        return false;
    }
    return VALID_USERNAME_REGEX.test(username);
}

/**
 * Check if method needs account validation
 * @param {string} method - API method name
 * @param {object} params - params object
 * @returns {boolean} - needs validation
 */
function shouldValidateAccount(method, params) {
    if (!ACCOUNT_METHODS.includes(method)) {
        return false;
    }
    return params && (params.account || params.author);
}

/**
 * Get account name from params
 * @param {object} params - params object
 * @returns {string|null} - account name or null
 */
function getAccountFromParams(params) {
    if (!params) return null;
    return params.account || params.author || null;
}


export async function callBridge(method, params, pre = 'bridge.') {
    // Pre-validate account parameter
    if (shouldValidateAccount(method, params)) {
        const account = getAccountFromParams(params);
        if (account && !isValidUsername(account)) {
            console.log('[callBridge] Skip invalid username: ' + account + ', method: ' + method);
            // Return appropriate empty result based on method type
            if (method === 'get_account_posts') {
                return Promise.resolve([]);
            } else if (method === 'get_profile') {
                return Promise.resolve(null);
            } else if (method === 'get_followers' || method === 'get_following') {
                return Promise.resolve([]);
            }
            return Promise.resolve(null);
        }
    }

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

async function callBridgeCached(method, params) {
    if (!_apiCache) {
        return callBridge(method, params);
    }
    return _apiCache.getOrFetch(method, params, () =>
        callBridge(method, params)
    );
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

        // Parallel fetch for community, profile, and trending topics
        const parallelTasks = [];

        // append `community` key
        if (tag && ifHive(tag)) {
            parallelTasks.push(
                (async () => {
                    safeConsoleTime(`timing_get_community_${tag}`, requestId);
                    try {
                        const data = await callBridgeCached('get_community', {
                            name: tag,
                            observer,
                        });
                        if (data) state['community'][tag] = data;
                    } catch (e) {
                    } finally {
                        safeConsoleTimeEnd(
                            `timing_get_community_${tag}`,
                            requestId
                        );
                    }
                })()
            );
        }

        // for SSR, load profile on any profile page or discussion thread author
        const account =
            tag && tag[0] == '@'
                ? tag.slice(1)
                : page == 'thread' ? key[0].slice(1) : null;
        if (ssr && account) {
            parallelTasks.push(
                (async () => {
                    safeConsoleTime(`timing_get_profile_${account}`, requestId);
                    try {
                        const profile = await callBridgeCached('get_profile', {
                            account,
                        });
                        if (profile && profile['name']) {
                            state['profiles'][account] = profile;
                        }
                    } catch (error) {
                        console.error(
                            JSON.stringify({
                                msg: '~~ get_profile callBridge error ~~',
                                account,
                                error: error.message || error,
                                requestId,
                            })
                        );
                    } finally {
                        safeConsoleTimeEnd(
                            `timing_get_profile_${account}`,
                            requestId
                        );
                    }
                })()
            );
        }

        if (ssr) {
            parallelTasks.push(
                (async () => {
                    safeConsoleTime('timing_get_trending_topics', requestId);
                    try {
                        const data = await callBridgeCached(
                            'get_trending_topics',
                            { limit: 12 }
                        );
                        state['topics'] = data || [];
                    } catch (error) {
                        console.error(
                            JSON.stringify({
                                msg:
                                    '~~ get_trending_topics callBridge error ~~',
                                error: error.message || error,
                                requestId,
                            })
                        );
                        state['topics'] = [];
                    } finally {
                        safeConsoleTimeEnd(
                            'timing_get_trending_topics',
                            requestId
                        );
                    }
                })()
            );
        }

        if (parallelTasks.length > 0) {
            safeConsoleTime('timing_parallelFetch', requestId);
            await Promise.all(parallelTasks);
            safeConsoleTimeEnd('timing_parallelFetch', requestId);
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
    let content;
    try {
        if (_apiCache) {
            content = await _apiCache.getOrFetch(
                'get_discussion',
                { author, permlink },
                () => callBridge('get_discussion', { author, permlink })
            );
        } else {
            content = await callBridge('get_discussion', { author, permlink });
        }
    } catch (error) {
        console.error(
            JSON.stringify({
                msg: '~~ loadThread callBridge error ~~',
                method: 'get_discussion',
                params: { author, permlink },
                error: error.message || error,
                requestId,
            })
        );
        content = {};
    }
    return { content };
}

async function loadPosts(sort, tag, observer, ssr, requestId = null) {
    const account = tag && tag[0] == '@' ? tag.slice(1) : null;

    let posts;
    try {
        if (account) {
            const params = { sort, account, observer };
            if (_apiCache) {
                posts = await _apiCache.getOrFetch(
                    'get_account_posts',
                    params,
                    () => callBridge('get_account_posts', params)
                );
            } else {
                posts = await callBridge('get_account_posts', params);
            }
        } else {
            const params = { sort, tag, observer };
            if (_apiCache) {
                posts = await _apiCache.getOrFetch(
                    'get_ranked_posts',
                    params,
                    () => callBridge('get_ranked_posts', params)
                );
            } else {
                posts = await callBridge('get_ranked_posts', params);
            }
        }
    } catch (error) {
        console.error(
            JSON.stringify({
                msg: '~~ loadPosts callBridge error ~~',
                method: account ? 'get_account_posts' : 'get_ranked_posts',
                params: account
                    ? { sort, account, observer }
                    : { sort, tag, observer },
                error: error.message || error,
                requestId,
            })
        );
        posts = [];
    }

    if (!Array.isArray(posts)) {
        posts = [];
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
