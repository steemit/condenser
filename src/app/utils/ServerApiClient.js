/* eslint-disable no-undef */
/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unreachable */
/* eslint-disable arrow-parens */
import { api } from '@steemit/steem-js';
import { signData } from '@steemfans/auth-data';

const request_base = {
    method: 'post',
    mode: 'no-cors',
    credentials: 'same-origin',
    headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
    },
};

export function serverApiLogin(account, signatures) {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    const request = Object.assign({}, request_base, {
        body: JSON.stringify({ account, signatures, csrf: $STM_csrf }),
    });
    return fetch('/api/v1/login_account', request);
}

export function serverApiLogout() {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    const request = Object.assign({}, request_base, {
        body: JSON.stringify({ csrf: $STM_csrf }),
    });
    return fetch('/api/v1/logout_account', request);
}

let last_call;
export function serverApiRecordEvent(type, val, rate_limit_ms = 5000) {
    return;
    // if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    // if (last_call && new Date() - last_call < rate_limit_ms) return;
    // last_call = new Date();
    // const value = val && val.stack ? `${val.toString()} | ${val.stack}` : val;
    // if (typeof catchjs !== 'undefined') {
    //     catchjs.log(type, value);
    //     //} else if(process.env.NODE_ENV !== 'production') {
    //     //    console.log("Event>", type, value)
    // }
    // api.call(
    //     'overseer.collect',
    //     { collection: 'event', metadata: { type, value } },
    //     error => {
    //         if (error) console.warn('overseer error', error, error.data);
    //     }
    // );
}

export function recordRouteTag(trackingId, tag, params, isLogin = false) {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    let tags = {
        app: 'condenser',
        tag,
    };
    let fields = {
        trackingId,
    };
    switch (tag) {
        case 'post':
            fields = {
                trackingId,
                permlink: params.permlink,
            };
            break;
        case 'community_index':
            fields = {
                trackingId,
                community_name: params.community_name,
            };
            tags = {
                app: 'condenser',
                tag,
                sort: params.order,
            };
            break;
        case 'category':
            fields = {
                trackingId,
                category: params.category,
            };
            tags = {
                app: 'condenser',
                tag,
                sort: params.order,
                is_user_feed: params.is_user_feed,
                is_my_community: params.category === 'my',
            };
            break;
        case 'index':
            fields = {
                trackingId,
            };
            tags = {
                app: 'condenser',
                tag,
                sort: params.order,
            };
            break;
        case 'user_index':
            fields = {
                trackingId,
                username: params.username,
            };
            tags = {
                app: 'condenser',
                tag,
                section: params.section,
            };
            break;
    }
    tags['is_login'] = isLogin;
    api.call(
        'overseer.collect',
        [
            'custom',
            {
                measurement: 'route',
                fields,
                tags,
            },
        ],
        error => {
            if (error)
                console.warn('record route tag error', error, error.data);
        }
    );
}

export function userActionRecord(action, params) {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    let tags = {
        app: 'condenser',
        action_type: action,
    };
    let fields = {};
    switch (action) {
        case 'comment':
            tags = {
                app: 'condenser',
                action_type: action,
                is_edit: params.is_edit,
                payout_type: params.payout_type,
                comment_type: params.comment_type,
            };
            fields = {
                username: params.username,
            };
            break;
        case 'vote':
            tags = {
                app: 'condenser',
                action_type: action,
                vote_type: params.vote_type,
            };
            fields = {
                voter: params.voter,
                author: params.author,
                permlink: params.permlink,
                weight: params.weight,
            };
            break;
        case 'update_account':
            fields = {
                username: params.username,
            };
            break;
        case 'reblog':
            fields = {
                username: params.username,
                permlink: params.permlink,
                author: params.author,
            };
            break;
        case 'delete_comment':
            tags = {
                app: 'condenser',
                action_type: action,
                comment_type: params.comment_type,
            };
            fields = {
                username: params.username,
                permlink: params.permlink,
            };
            break;
    }
    api.call(
        'overseer.collect',
        [
            'custom',
            {
                measurement: 'user_action',
                fields,
                tags,
            },
        ],
        error => {
            if (error)
                console.warn('user action record error', error, error.data);
        }
    );
}

export function recordAdsView({ trackingId, adTag }) {
    api.call('overseer.collect', ['ad', { trackingId, adTag }], error => {
        if (error) console.warn('overseer error', error);
    });
}

export function recordActivityTracker({
    trackingId,
    activityTag,
    pathname,
    referrer,
}) {
    const data = {
        measurement: 'activity_tracker',
        tags: {
            activityTag,
            appType: 'condenser',
        },
        fields: {
            views: 1,
            trackingId,
            pathname,
            referrer,
            ua: navigator ? navigator.userAgent.toLowerCase() : null,
        },
    };
    api.call('overseer.collect', ['custom', data], error => {
        if (error) console.warn('overseer error:', data, error);
    });
}

let last_page, last_views, last_page_promise;
export function recordPageView(page, referer, account) {
    if (last_page_promise && page === last_page) return last_page_promise;

    if (!process.env.BROWSER) return Promise.resolve(0);
    if (window.ga) {
        // virtual pageview
        window.ga('set', 'page', page);
        window.ga('send', 'pageview');
    }
    // last_page_promise = api.callAsync('overseer.pageview', {
    //     page,
    //     referer,
    //     account,
    // });
    last_page = page;
    return last_page_promise;
}

export function saveCords(x, y) {
    const request = Object.assign({}, request_base, {
        body: JSON.stringify({ csrf: $STM_csrf, x, y }),
    });
    fetch('/api/v1/save_cords', request);
}

export function setUserPreferences(payload) {
    if (!process.env.BROWSER || window.$STM_ServerBusy)
        return Promise.resolve();
    const request = Object.assign({}, request_base, {
        body: JSON.stringify({ csrf: window.$STM_csrf, payload }),
    });
    return fetch('/api/v1/setUserPreferences', request);
}

export function isTosAccepted() {
    if (process.env.NODE_ENV !== 'production') {
        // TODO: remove this. endpoint in dev currently down.
        return true;
    }
    const request = Object.assign({}, request_base, {
        body: JSON.stringify({ csrf: window.$STM_csrf }),
    });
    return fetch('/api/v1/isTosAccepted', request).then(res => res.json());
}

export function acceptTos() {
    const request = Object.assign({}, request_base, {
        body: JSON.stringify({ csrf: window.$STM_csrf }),
    });
    return fetch('/api/v1/acceptTos', request);
}
export function conductSearch(req) {
    const bodyWithCSRF = {
        ...req.body,
        csrf: window.$STM_csrf,
    };
    const request = Object.assign({}, request_base, {
        body: JSON.stringify(bodyWithCSRF),
    });
    return fetch('/api/v1/search', request);
}

export function userSearch(req) {
    const bodyWithCSRF = {
        ...req.body,
        csrf: window.$STM_csrf,
    };
    const request = Object.assign({}, request_base, {
        body: JSON.stringify(bodyWithCSRF),
    });
    return fetch('/hive_accounts/_search', request);
}
