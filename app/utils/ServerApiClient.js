import {NTYPES, notificationsArrayToMap} from 'app/utils/Notifications';

const request_base = {
    method: 'post',
    mode: 'no-cors',
    credentials: 'same-origin',
    headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
    }
};

export function serverApiLogin(account, signatures) {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    const request = Object.assign({}, request_base, {body: JSON.stringify({account, signatures, csrf: $STM_csrf})});
    fetch('/api/v1/login_account', request);
}

export function serverApiLogout() {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    const request = Object.assign({}, request_base, {body: JSON.stringify({csrf: $STM_csrf})});
    fetch('/api/v1/logout_account', request);
}

let last_call;
export function serverApiRecordEvent(type, val, rate_limit_ms = 5000) {
    console.log('-- serverApiRecordEvent -->', type, val, rate_limit_ms);
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    if (last_call && (new Date() - last_call) < rate_limit_ms) return;
    last_call = new Date();
    const value = val && val.stack ? `${val.toString()} | ${val.stack}` : val;
    const request = Object.assign({}, request_base, {body: JSON.stringify({csrf: $STM_csrf, type, value})});
    fetch('/api/v1/record_event', request);
}

export function getNotifications(account) {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return Promise.resolve(null);
    const request = Object.assign({}, request_base, {method: 'get'});
    return fetch(`/api/v1/notifications/${account}`, request).then(r => r.json()).then(res => {
        return notificationsArrayToMap(res);
});
}

export function markNotificationRead(account, fields) {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return Promise.resolve(null);
    const request = Object.assign({}, request_base, {method: 'put', mode: 'cors'});
    const field_nums_str = fields.map(f => NTYPES.indexOf(f)).join('-');
    return fetch(`/api/v1/notifications/${account}/${field_nums_str}`, request).then(r => r.json()).then(res => {
        return notificationsArrayToMap(res);
});
}

let last_page, last_views, last_page_promise;
export function recordPageView(page, ref) {
    if (last_page_promise && page === last_page) return last_page_promise;
    if (window.ga) { // virtual pageview
        window.ga('set', 'page', page);
        window.ga('send', 'pageview');
    }
    if (!process.env.BROWSER || window.$STM_ServerBusy) return Promise.resolve(0);
    const request = Object.assign({}, request_base, {body: JSON.stringify({csrf: $STM_csrf, page, ref})});
    last_page_promise = fetch(`/api/v1/page_view`, request).then(r => r.json()).then(res => {
        last_views = res.views;
    return last_views;
});
    last_page = page;
    return last_page_promise;
}

export function webPushRegister(account, webpush_params) {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    const request = Object.assign({}, request_base, {body: JSON.stringify({csrf: $STM_csrf, account, webpush_params})});
    fetch('/api/v1/notifications/register', request);
}

export function sendConfirmEmail(account) {
    const request = Object.assign({}, request_base, {body: JSON.stringify({csrf: $STM_csrf, account})});
    fetch('/api/v1/notifications/send_confirm', request);
}

if (process.env.BROWSER) {
    window.getNotifications = getNotifications;
    window.markNotificationRead = markNotificationRead;
}
