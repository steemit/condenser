import { api } from '@steemit/steem-js';

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
    fetch('/api/v1/login_account', request);
}

export function serverApiLogout() {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    const request = Object.assign({}, request_base, {
        body: JSON.stringify({ csrf: $STM_csrf }),
    });
    fetch('/api/v1/logout_account', request);
}

let last_call;
export function serverApiRecordEvent(type, val, rate_limit_ms = 5000) {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    if (last_call && new Date() - last_call < rate_limit_ms) return;
    last_call = new Date();
    const value = val && val.stack ? `${val.toString()} | ${val.stack}` : val;
    const request = Object.assign({}, request_base, {
        body: JSON.stringify({ csrf: $STM_csrf, type, value }),
    });
    fetch('/api/v1/record_event', request);
    api.call(
        'overseer.collect',
        { collection: 'event', metadata: { type, value } },
        error => {
            // if (error) console.warn('overseer error', error, error.data);
        }
    );
}

let last_page, last_views, last_page_promise;
export function recordPageView(page, ref, account) {
    if (last_page_promise && page === last_page) return last_page_promise;
    if (window.ga) {
        // virtual pageview
        window.ga('set', 'page', page);
        window.ga('send', 'pageview');
    }
    api.call('overseer.pageview', { page, referer: ref, account }, error => {
        // if (error) console.warn('overseer error', error, error.data);
    });
    if (!process.env.BROWSER || window.$STM_ServerBusy)
        return Promise.resolve(0);
    const request = Object.assign({}, request_base, {
        body: JSON.stringify({ csrf: $STM_csrf, page, ref }),
    });
    last_page_promise = fetch(`/api/v1/page_view`, request)
        .then(r => r.json())
        .then(res => {
            last_views = res.views;
            return last_views;
        });
    last_page = page;
    return last_page_promise;
}

export function saveCords(x, y) {
    const request = Object.assign({}, request_base, {
        body: JSON.stringify({ csrf: $STM_csrf, x: x, y: y }),
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
