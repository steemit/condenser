import { isLoggedIn, extractLoginData } from 'app/utils/UserUtil';

/**
 *
 * @returns {boolean}
 */
export function hasCompatibleKeychain() {
    return (
        window.steem_keychain &&
        window.steem_keychain.requestSignBuffer &&
        window.steem_keychain.requestBroadcast &&
        window.steem_keychain.requestSignedCall
    );
}

/**
 *
 * @returns {boolean}
 */
export function isLoggedInWithKeychain() {
    if (!isLoggedIn()) {
        return false;
    }
    const data = localStorage.getItem('autopost2');
    const [
        username,
        password,
        memoWif,
        login_owner_pubkey,
        login_with_keychain,
    ] = extractLoginData(data);
    return !!login_with_keychain;
}
