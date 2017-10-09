const YO = '/yo';

/**
 * Re-formats API response a little bit.
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

export function fetchAllNotifications(username) {
    return fetch(YO, {
        method: 'post',
        //mode: 'no-cors',
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
                test: true,
                notify_type: 'vote',
                //username,
                username: 'test_user', // Todo: for dev only! Do not merge if present!
            },
        }),
    }).then(r => r.json()).then(res => {
        if (res.result.length > 0) {
            return normalize(res.result);
        }
    });
}

export function fetchSomeNotifications(username, since) {
    // todo, when we figure out the yo api
    return fetchAllNotifications(username);
}