/**
 * This file replicates and extends the contents of User.js in branches new-url-scheme && notifications-ui.
 * Additions here need to be added to ./User.js when those are merged. Imports should pull that file, and this one should be deleted.
 */


let store = false;
const MSG_STORE_NOT_SET = 'store is not set';

export const setStore = (theStore) => {
    if(!store) {
        store = theStore;
    } else {
        throw Error("Routes.setStore - store has already been set.");
    }
}

/**
 * returns the current user's username *if* there is one.
 *
 * later can be modified to return full user object if passed *true* for 1st argument
 * @returns {boolean}
 */
export const currentUser = () => {
    if (store) {
        const state = store.getState();
        if (state.user) {
            const current = state.user.getIn(['current']);
            if (current) {
                return current;
            }
        }
    } else {
        console.warn(MSG_STORE_NOT_SET);
    }
    return false;
}
/**
 * returns the current user's username *if* there is one.
 *
 * later can be modified to return full user object if passed *true* for 1st argument
 * @returns {boolean}
 */
export const currentUsername = () => {
    if (store) {
        const state = store.getState();
        if (state.user) {
            const uName = state.user.getIn(['current', 'username']);
            if (uName) {
                return uName;
            }
        }
    } else {
        console.warn(MSG_STORE_NOT_SET);
    }
    return false;
}

export const isOwnAccount = (username) => {
    return (username === currentUsername());
}

/**
 *
 * @returns {boolean}
 */
export const isLoggedIn = () => typeof localStorage !== 'undefined' && !!localStorage.getItem('autopost2');
