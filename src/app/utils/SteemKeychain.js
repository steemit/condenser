export function hasCompatibleKeychain() {
    return (
        window.steem_keychain &&
        window.steem_keychain.requestSignBuffer &&
        window.steem_keychain.requestBroadcast &&
        window.steem_keychain.requestSignedCall
    );
}
