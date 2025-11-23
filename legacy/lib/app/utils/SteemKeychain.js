'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

exports.hasCompatibleKeychain = hasCompatibleKeychain;
exports.isLoggedInWithKeychain = isLoggedInWithKeychain;

var _UserUtil = require('app/utils/UserUtil');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @returns {boolean}
 */
function hasCompatibleKeychain() {
    return window.steem_keychain && window.steem_keychain.requestSignBuffer && window.steem_keychain.requestBroadcast && window.steem_keychain.requestSignedCall;
}

/**
 *
 * @returns {boolean}
 */
function isLoggedInWithKeychain() {
    if (!(0, _UserUtil.isLoggedIn)()) {
        return false;
    }
    if (!hasCompatibleKeychain()) {
        // possible to log in w/ keychain, then disable plugin
        return false;
    }
    var data = localStorage.getItem('autopost2');

    var _extractLoginData = (0, _UserUtil.extractLoginData)(data),
        _extractLoginData2 = (0, _slicedToArray3.default)(_extractLoginData, 5),
        username = _extractLoginData2[0],
        password = _extractLoginData2[1],
        memoWif = _extractLoginData2[2],
        login_owner_pubkey = _extractLoginData2[3],
        login_with_keychain = _extractLoginData2[4];

    return !!login_with_keychain;
}