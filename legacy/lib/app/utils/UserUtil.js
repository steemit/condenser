'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 *
 * @returns {boolean}
 */
var isLoggedIn = exports.isLoggedIn = function isLoggedIn() {
    return typeof localStorage !== 'undefined' && !!localStorage.getItem('autopost2');
};

/**
 *
 * @returns {string}
 */
var packLoginData = exports.packLoginData = function packLoginData(username, password, memoWif, login_owner_pubkey, login_with_keychain) {
    return new Buffer(username + '\t' + password + '\t' + (memoWif || '') + '\t' + (login_owner_pubkey || '') + '\t' + (login_with_keychain || '')).toString('hex');
};

/**
 *
 * @returns {array} [username, password, memoWif, login_owner_pubkey, login_with_keychain]
 */
var extractLoginData = exports.extractLoginData = function extractLoginData(data) {
    return new Buffer(data, 'hex').toString().split('\t');
};

exports.default = {
    isLoggedIn: isLoggedIn,
    extractLoginData: extractLoginData
};