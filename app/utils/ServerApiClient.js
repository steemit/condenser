<<<<<<< HEAD

/**
    @return {string} parsable JSON login challenge.  A string is returned for accurate signing purposes.
*/
export function *serverApiLoginChallenge() {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return undefined;
    return yield fetch('/api/v1/login_challenge', {
        method: 'get',
        mode: 'no-cors',
        credentials: 'same-origin',
    })
    .then(r => r.text())
    .then(challengeString => {
        // challengeString should not be trusted.
        // Don't allow anything that could be a valid transaction.
        const challengeInConfig = $STM_Config.login_challenge_description

        // Make sure we have challenge description to validate
        if(!challengeInConfig || challengeInConfig.trim() === '')
            throw new Error('Missing required value: config.login_challenge_description')

        const o = JSON.parse(challengeString)
        const discriptionMatches = o.description === challengeInConfig
        if(!discriptionMatches)
            throw new Error(`Expecting login challenge '${challengeInConfig}', instead got '${o.login_challenge_description}'`)

        if(!o.token)
            throw new Error('Missing login challenge token')

        if(Object.keys(o).length !== 2)
            throw new Error('Login challenge object should have only two properties')

        return challengeString // return string for signing purposes
    })
}

export function serverApiLogin(account, signatures) {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    fetch('/api/v1/login_account', {
        method: 'post',
        mode: 'no-cors',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-type': 'application/json'
        },
        body: JSON.stringify({account, signatures, csrf: $STM_csrf})
    });
=======
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

export function serverApiLogin(account) {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    const request = Object.assign({}, request_base, {body: JSON.stringify({csrf: $STM_csrf, account})});
    fetch('/api/v1/login_account', request);
>>>>>>> develop
}

export function serverApiLogout() {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    const request = Object.assign({}, request_base, {body: JSON.stringify({csrf: $STM_csrf})});
    fetch('/api/v1/logout_account', request);
}

let last_call;
export function serverApiRecordEvent(type, val) {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    if (last_call && (new Date() - last_call < 5000)) return;
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

let last_page, last_views;
export function recordPageView(page, ref) {
    if (page === last_page) return Promise.resolve(last_views);
    if (window.ga) { // virtual pageview
        window.ga('set', 'page', page);
        window.ga('send', 'pageview');
    }
    if (!process.env.BROWSER || window.$STM_ServerBusy) return Promise.resolve(0);
    const request = Object.assign({}, request_base, {body: JSON.stringify({csrf: $STM_csrf, page, ref})});
    return fetch(`/api/v1/page_view`, request).then(r => r.json()).then(res => {
        last_page = page;
        last_views = res.views;
        return last_views;
    });
}

if (process.env.BROWSER) {
    window.getNotifications = getNotifications;
    window.markNotificationRead = markNotificationRead;
}
