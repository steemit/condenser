import { Map } from 'immutable';
import types, { settingsInitFalse } from 'app/components/elements/notification/type';

//const YO = '/yo';
//const YO = 'https://yo.steemitdev.com';
const YO = 'https://api.steemitdev.com';

/**
 * Re-formats API notifications response a little bit.
 *
 * @param {Array} res
 *
 * @return {Array}
 */
function normalize(res) {
    return res.map(n => ({
        ...n,
        id: n.notify_id.toString(),
        shown: n.seen,
        notificationType: n.notify_type,
        item: n.data.item,
    }));
}

/**
 * Cleans up settings from Yo.
 *
 * @param {Object} settings payload from api
 * @return {Object}
 */
function normalizeSettings(res) {
    const typesToDefaultAsDisabled = settingsInitFalse;
    const defaultTypes = types.reduce((acc, t) => {
        return {
            ...acc,
            [t]: typesToDefaultAsDisabled.indexOf(t) < 0,
        };
    }, {});

    const defaultSettings = [
        'website', // TODO: get channels from api or something?
        'sms',
        'email',
    ].map(c => ({
        channelName: c,
        types: defaultTypes,
    }))

    const mapped = Map(Object.assign(...defaultSettings.map(s => ({ [s.channelName]: s }))));

    return {
        notificationsettings: mapped.merge(Map(res)),
    };
}

export function fetchAllNotifications(username) {
    return fetch(YO, {
        method: 'post',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'yo.get_notifications',
            params: {
                test: true, // Todo: for dev only! Do not merge if present!
                notify_type: 'vote', // Todo: for dev only! Do not merge if present!
                //username, // Todo: for dev only! Do not merge if present!
                username: 'test_user', // Todo: for dev only! Do not merge if present!
            },
        }),
    })
    .then(r => r.json()).then(res => {
        if (res.result && res.result.length > 0) {
            return normalize(res.result);
        }
        return []; // empty...?
    })
    .catch(error => {
        return { error };
    });
}

/**
 *
 * @param {String} username
 * @param {String} [before] created prior to timestamp, formatted like 2017-10-12T21:25:06.964364
 * @param {String} [after] modified after timestamp, formatted like 2017-10-12T21:25:06.964364
 * @param {String[]} types only these notification types
 *
 */
export function fetchSomeNotifications({username, before, after, types }) { // Todo: filter by types once api allows for it
    const beforeOrAfterParams = {};
    if (after) beforeOrAfterParams.modified_after = after;
    if (before) beforeOrAfterParams.created_before = before;

    return fetch(YO, {
        method: 'post',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'yo.get_notifications',
            params: {
                test: true, // Todo: for dev only! Do not merge if present!
                notify_type: 'vote', // Todo: for dev only! Do not merge if present!
                //username, // Todo: for dev only! Do not merge if present!
                username: 'test_user', // Todo: for dev only! Do not merge if present!
                ...beforeOrAfterParams,
            },
        }),
    }).then(r => r.json()).then(res => {
        if (res.result && res.result.length > 0) {
            return normalize(res.result);
        }
        return [];
    })
    .catch(error => {
        return { error };
    });
}

export function markAsRead(ids) {
    return fetch(YO, {
        method: 'post',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'yo.mark_read',
            params: {
                test: true, // Todo: for dev only! Do not merge if present!
                ids: ids.map(id => parseInt(id, 10)),
            },
        }),
    }).then(r => r.json()).then(res => {
        if (res.result && res.result.length > 0) {
            return normalize(res.result);
        }
        return [];
    })
    .catch(error => {
        return { error };
    });
}

export function markAsShown(ids) {
    return fetch(YO, {
        method: 'post',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'yo.mark_seen',
            params: {
                test: true, // Todo: for dev only! Do not merge if present!
                ids,
            },
        }),
    }).then(r => r.json()).then(res => {
        if (res.result && res.result.length > 0) {
            return normalize(res.result);
        }
        return [];
    })
    .catch(error => {
        return { error };
    });
}

/**
 *
 * @param {*} username
 * @return {Map|Object} if error, object w/ error prop
 */
export function getNotificationSettings(username) {
    return Promise.resolve(normalizeSettings({
        foo: 'bar',
    }));
}

/**
 *
 * @param {*} username
 * @param {*} settings
 * @return {Map|Object} if error, object w/ error prop
 */
export function saveNotificationSettings(username, settings) {
    return Promise.resolve(normalizeSettings({
        foo: 'bar',
    }));
}