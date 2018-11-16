export function hasCompatibleKeychain() {
    return (
        window.steem_keychain &&
        window.steem_keychain.signBuffer &&
        window.steem_keychain.broadcast
    );
}
