import { currentUsername } from './User';
import proxifyUrl from './ProxifyUrl'; //we want to move proxify into this file.

export const urlProxify = proxifyUrl;


/**
 * generate the url for a comment. If childComment is provided, generates a url to child comment.
 * @param comment
 * @param childComment
 * @returns {string}
 */
export const urlComment = (comment, childComment) => {
    const urlSegments = [''];
    try {
        urlSegments.push(comment.category, '@' + comment.author, comment.permlink);
        if (childComment) {
            urlSegments.push('#@' + childComment.author, childComment.permlink);
        }
    } catch (e) {
        //eslint-disable-line
    }
    return urlSegments.join('/');
}

/**
 * generate a notifications url for the current user.
 * @param userName
 * @returns {*}
 */
export const urlNotifications = (filter) => {
    try {
        return '/' + currentUsername() + '/notifications' + ((filter)? '/' + filter : '');
    } catch (e) {
        //eslint-disable-line
    }
    return '';
}

/**
 * generate a profile url. If userName is not provided, generate a profile url for the current user.
 * @param userName
 * @returns {*}
 */
export const urlProfile = (userName) => {
    if(userName) {
        return '/' + userName;
    }

    const uName = currentUsername();

    if(uName) {
        return '/' + uName;
    }
    return null;
}

/**
 * generate a user settings url. If userName is not provided, generate a user settings url for the current user.
 * @param userName
 * @returns {*}
 */
export const urlProfileSettings = (userName) => {
    return '/' + ((userName)? userName : currentUsername()) + '/settings';
}

const Url = {
    comment: urlComment,
    notifications: urlNotifications,
    profile: urlProfile,
    profileSettings: urlProfileSettings,
    proxify: urlProxify
}

export default Url;
