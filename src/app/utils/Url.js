let store = false;

export const setStore = (theStore) => {
    if(!store) {
        store = theStore;
        window.theStore = theStore;
    } else {
        throw Error("Routes.setStore - store has already been set.");
    }
}


export const urlNotifications = (filter) => {
    try {
        return '/@' + store.getState().user.getIn(['current', 'username']) + '/notifications' + ((filter)? '/' + filter : '');
    } catch (e) {
        //eslint-disable-line
    }
    return '';
}

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

export const urlProfile = (userName) => {
    console.log('urlProfile', store.getState().user.toJS())
    return '/@' + ((userName)? userName : store.getState().user.getIn(['current', 'username']));
}

export const urlProfileSettings = (userName) => {
    return '/@' + ((userName)? userName : store.getState().user.getIn(['current', 'username'])) + '/settings';
}

const Url = {
    comment: urlComment,
    notifications: urlNotifications,
    profile: urlProfile,
    profileSettings: urlProfileSettings
}

export default Url
