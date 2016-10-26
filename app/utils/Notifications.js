export const NTYPES = ['total', 'feed', 'reward', 'transfer', 'mention', 'follow', 'vote', 'comment_reply', 'post_reply', 'key_update', 'message'];

export function notificationsArrayToMap(data) {
    const notifications = data && data.length ? data : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    return notifications.reduce((result, n, i) => {
        result[NTYPES[i]] = n;
        return result;
    }, {});
}
