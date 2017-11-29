export const NTYPES = ['total', 'feed', 'reward', 'send', 'mention', 'follow', 'vote', 'comment_reply', 'post_reply', 'account_update', 'message', 'receive'];

export function notificationsArrayToMap(data) {
    const notifications = data && data.length ? (data.length === 1 ? data[0].slice(1) : data) : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    return notifications.reduce((result, n, i) => {
        result[NTYPES[i]] = n;
        return result;
    }, {});
}
