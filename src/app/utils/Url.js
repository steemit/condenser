import { currentUsername } from './User';
import proxifyUrl from './ProxifyUrl'; //we want to move proxify into this file.

let store = false;

export const setStore = theStore => {
    if (!store) {
        store = theStore;
    } else {
        throw Error('Routes.setStore - store has already been set.');
    }
};

export const urlProxify = proxifyUrl;

export const urlNotifications = filter => {
    try {
        return (
            '/@' +
            currentUsername() +
            '/notifications' +
            (filter ? '/' + filter : '')
        );
    } catch (e) {
        //eslint-disable-line
    }
    return '';
};

export const urlComment = (comment, childComment) => {
    const urlSegments = [''];
    try {
        urlSegments.push(
            comment.category,
            '@' + comment.author,
            comment.permlink
        );
        if (childComment) {
            urlSegments.push('#@' + childComment.author, childComment.permlink);
        }
    } catch (e) {
        //eslint-disable-line
    }
    return urlSegments.join('/');
};

export const urlProfile = userName => {
    if (userName) {
        return '/@' + userName;
    }

    const uName = currentUsername();

    if (uName) {
        return '/@' + uName;
    }
    return null;
};

export const urlProfileSettings = userName => {
    return '/@' + (userName ? userName : currentUsername()) + '/settings';
};

const Url = {
    comment: urlComment,
    notifications: urlNotifications,
    profile: urlProfile,
    profileSettings: urlProfileSettings,
    proxify: urlProxify,
};

export default Url;
