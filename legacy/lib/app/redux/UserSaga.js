'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.userWatches = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _objectDestructuringEmpty2 = require('babel-runtime/helpers/objectDestructuringEmpty');

var _objectDestructuringEmpty3 = _interopRequireDefault(_objectDestructuringEmpty2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _immutable = require('immutable');

var _effects = require('redux-saga/effects');

var _steemJs = require('@steemit/steem-js');

var _ecc = require('@steemit/steem-js/lib/auth/ecc');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _AuthSaga = require('app/redux/AuthSaga');

var _SagaShared = require('app/redux/SagaShared');

var _UserReducer = require('app/redux/UserReducer');

var userActions = _interopRequireWildcard(_UserReducer);

var _AppReducer = require('app/redux/AppReducer');

var appActions = _interopRequireWildcard(_AppReducer);

var _GlobalReducer = require('app/redux/GlobalReducer');

var globalActions = _interopRequireWildcard(_GlobalReducer);

var _SteemKeychain = require('app/utils/SteemKeychain');

var _RPCNode = require('../utils/RPCNode');

var _UserUtil = require('app/utils/UserUtil');

var _reactRouter = require('react-router');

var _ServerApiClient = require('app/utils/ServerApiClient');

var _FollowSaga = require('app/redux/FollowSaga');

var _Translator = require('app/Translator');

var _DMCAUserList = require('app/utils/DMCAUserList');

var _DMCAUserList2 = _interopRequireDefault(_DMCAUserList);

var _tronApi = require('app/utils/tronApi');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = /*#__PURE__*/_regenerator2.default.mark(shouldShowLoginWarning),
    _marked2 = /*#__PURE__*/_regenerator2.default.mark(checkKeyType),
    _marked3 = /*#__PURE__*/_regenerator2.default.mark(usernamePasswordLogin),
    _marked4 = /*#__PURE__*/_regenerator2.default.mark(usernamePasswordLogin2),
    _marked5 = /*#__PURE__*/_regenerator2.default.mark(promptTosAcceptance),
    _marked6 = /*#__PURE__*/_regenerator2.default.mark(getFeatureFlags),
    _marked7 = /*#__PURE__*/_regenerator2.default.mark(saveLogin_localStorage),
    _marked8 = /*#__PURE__*/_regenerator2.default.mark(logout),
    _marked9 = /*#__PURE__*/_regenerator2.default.mark(loginError),
    _marked10 = /*#__PURE__*/_regenerator2.default.mark(lookupPreviousOwnerAuthority),
    _marked11 = /*#__PURE__*/_regenerator2.default.mark(uploadImage),
    _marked12 = /*#__PURE__*/_regenerator2.default.mark(updateTronPopupTipCount),
    _marked13 = /*#__PURE__*/_regenerator2.default.mark(updateTronAddr); /* eslint-disable generator-star-spacing */
/* eslint-disable no-shadow */
/* eslint-disable no-useless-return */
/* eslint-disable space-before-function-paren */
/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-empty-pattern */
/* eslint-disable require-yield */
/* eslint-disable prefer-rest-params */
/* eslint-disable no-else-return */
/* eslint-disable no-mixed-operators */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-unreachable */


var max_pop_window_count = 5;

var userWatches = exports.userWatches = [(0, _effects.takeLatest)('user/lookupPreviousOwnerAuthority', lookupPreviousOwnerAuthority), (0, _effects.takeLatest)(userActions.CHECK_KEY_TYPE, checkKeyType), (0, _effects.takeLatest)(userActions.USERNAME_PASSWORD_LOGIN, usernamePasswordLogin), (0, _effects.takeLatest)(userActions.SAVE_LOGIN, saveLogin_localStorage), (0, _effects.takeLatest)(userActions.LOGOUT, logout), (0, _effects.takeLatest)(userActions.LOGIN_ERROR, loginError), (0, _effects.takeLatest)(userActions.UPLOAD_IMAGE, uploadImage), (0, _effects.takeLatest)(userActions.HIDE_TRON_CREATE, updateTronPopupTipCount), (0, _effects.takeLatest)(userActions.UPDATE_TRON_ADDR, updateTronAddr), (0, _effects.takeLatest)(userActions.ACCEPT_TERMS, /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.prev = 0;
                    _context.next = 3;
                    return (0, _effects.call)(_ServerApiClient.acceptTos);

                case 3:
                    _context.next = 7;
                    break;

                case 5:
                    _context.prev = 5;
                    _context.t0 = _context['catch'](0);

                case 7:
                case 'end':
                    return _context.stop();
            }
        }
    }, _callee, this, [[0, 5]]);
})
// TODO: log error to server, conveyor is unavailable
)];

var strCmp = function strCmp(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
};

function effectiveVests(account) {
    var vests = parseFloat(account.get('vesting_shares'));
    var delegated = parseFloat(account.get('delegated_vesting_shares'));
    var received = parseFloat(account.get('received_vesting_shares'));
    return vests - delegated + received;
}

function shouldShowLoginWarning(_ref) {
    var username = _ref.username,
        password = _ref.password;
    var account, pubKey, postingPubKeys;
    return _regenerator2.default.wrap(function shouldShowLoginWarning$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    _context2.prev = 0;

                    if (_steemJs.auth.isWif(password)) {
                        _context2.next = 11;
                        break;
                    }

                    _context2.next = 4;
                    return _steemJs.api.getAccountsAsync([username]);

                case 4:
                    account = _context2.sent[0];

                    if (account) {
                        _context2.next = 8;
                        break;
                    }

                    console.error('shouldShowLoginWarning - account not found');
                    return _context2.abrupt('return', false);

                case 8:
                    pubKey = _ecc.PrivateKey.fromSeed(username + 'posting' + password).toPublicKey().toString();
                    postingPubKeys = account.posting.key_auths[0];
                    return _context2.abrupt('return', postingPubKeys.includes(pubKey));

                case 11:
                    _context2.next = 17;
                    break;

                case 13:
                    _context2.prev = 13;
                    _context2.t0 = _context2['catch'](0);

                    console.error('~~ Saga shouldShowLoginWarning error ~~>');

                    (0, _RPCNode.changeRPCNodeToDefault)();

                case 17:
                    return _context2.abrupt('return', false);

                case 18:
                case 'end':
                    return _context2.stop();
            }
        }
    }, _marked, this, [[0, 13]]);
}

/**
    @arg {object} action.username - Unless a WIF is provided, this is hashed
        with the password and key_type to create private keys.
    @arg {object} action.password - Password or WIF private key. A WIF becomes
        the posting key, a password can create all three key_types: active,
        owner, posting keys.
*/
function checkKeyType(action) {
    return _regenerator2.default.wrap(function checkKeyType$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    _context3.next = 2;
                    return (0, _effects.call)(shouldShowLoginWarning, action.payload);

                case 2:
                    if (!_context3.sent) {
                        _context3.next = 7;
                        break;
                    }

                    _context3.next = 5;
                    return (0, _effects.put)(userActions.showLoginWarning(action.payload));

                case 5:
                    _context3.next = 9;
                    break;

                case 7:
                    _context3.next = 9;
                    return (0, _effects.put)(userActions.usernamePasswordLogin(action.payload));

                case 9:
                case 'end':
                    return _context3.stop();
            }
        }
    }, _marked2, this);
}

/**
    @arg {object} action.username - Unless a WIF is provided, this is hashed
        with the password and key_type to create private keys.
    @arg {object} action.password - Password or WIF private key. A WIF becomes
        the posting key, a password can create all three key_types: active,
        owner, posting keys.
*/
function usernamePasswordLogin(action) {
    var current, username;
    return _regenerator2.default.wrap(function usernamePasswordLogin$(_context4) {
        while (1) {
            switch (_context4.prev = _context4.next) {
                case 0:
                    // This is a great place to mess with session-related user state (:
                    // If the user hasn't previously hidden the announcement in this session,
                    // or if the user's browser does not support session storage,
                    // show the announcement.
                    if (typeof sessionStorage === 'undefined' || typeof sessionStorage !== 'undefined' && sessionStorage.getItem('hideAnnouncement') !== 'true') {}
                    // Uncomment to re-enable announcment
                    // TODO: use config to enable/disable
                    //yield put(userActions.showAnnouncement());


                    // Sets 'loading' while the login is taking place. The key generation can
                    // take a while on slow computers.
                    _context4.next = 3;
                    return (0, _effects.call)(usernamePasswordLogin2, action.payload);

                case 3:
                    _context4.next = 5;
                    return (0, _effects.select)(function (state) {
                        return state.user.get('current');
                    });

                case 5:
                    current = _context4.sent;
                    username = current ? current.get('username') : null;

                    if (!username) {
                        _context4.next = 12;
                        break;
                    }

                    _context4.next = 10;
                    return (0, _effects.fork)(_FollowSaga.loadFollows, 'getFollowingAsync', username, 'blog');

                case 10:
                    _context4.next = 12;
                    return (0, _effects.fork)(_FollowSaga.loadFollows, 'getFollowingAsync', username, 'ignore');

                case 12:
                case 'end':
                    return _context4.stop();
            }
        }
    }, _marked3, this);
}

var clean = function clean(value) {
    return value == null || value === '' || /null|undefined/.test(value) ? undefined : value;
};

function usernamePasswordLogin2(_ref2) {
    var username = _ref2.username,
        password = _ref2.password,
        useKeychain = _ref2.useKeychain,
        saveLogin = _ref2.saveLogin,
        operationType = _ref2.operationType,
        afterLoginRedirectToWelcome = _ref2.afterLoginRedirectToWelcome;

    var user, loginType, justLoggedIn, feedURL, autopost, memoWif, login_owner_pubkey, login_wif_owner_pubkey, login_with_keychain, data, _extractLoginData, _extractLoginData2, offchain_account, userProvidedRole, _username$split, _username$split2, pathname, isRole, account, private_keys, private_key, authority, hasActiveAuth, hasOwnerAuth, accountName, fullAuths, owner_pub_key, generated_type, owner_pubkey, active_pubkey, posting_pubkey, memo_pubkey, offchainData, serverAccount, challengeString, signatures, challenge, buf, bufSha, _response, sign, response, body, unbindTipLimit;

    return _regenerator2.default.wrap(function usernamePasswordLogin2$(_context5) {
        while (1) {
            switch (_context5.prev = _context5.next) {
                case 0:
                    _context5.next = 2;
                    return (0, _effects.select)(function (state) {
                        return state.user;
                    });

                case 2:
                    user = _context5.sent;
                    loginType = user.get('login_type');
                    justLoggedIn = loginType === 'basic';

                    console.log('Login type:', loginType, 'Just logged in?', justLoggedIn, 'username:', username);

                    // login, using saved password
                    feedURL = false;
                    autopost = void 0, memoWif = void 0, login_owner_pubkey = void 0, login_wif_owner_pubkey = void 0, login_with_keychain = void 0;

                    if (!username && !password) {
                        data = localStorage.getItem('autopost2');

                        if (data) {
                            // auto-login with a low security key (like a posting key)
                            autopost = true; // must use semi-colon
                            // The 'password' in this case must be the posting private wif .. See setItme('autopost')
                            _extractLoginData = (0, _UserUtil.extractLoginData)(data);
                            _extractLoginData2 = (0, _slicedToArray3.default)(_extractLoginData, 5);
                            username = _extractLoginData2[0];
                            password = _extractLoginData2[1];
                            memoWif = _extractLoginData2[2];
                            login_owner_pubkey = _extractLoginData2[3];
                            login_with_keychain = _extractLoginData2[4];

                            memoWif = clean(memoWif);
                            login_owner_pubkey = clean(login_owner_pubkey);
                        }
                    }
                    // no saved password

                    if (!(!username || !(password || useKeychain || login_with_keychain))) {
                        _context5.next = 16;
                        break;
                    }

                    console.log('No saved password');
                    _context5.next = 13;
                    return (0, _effects.select)(function (state) {
                        return state.offchain.get('account');
                    });

                case 13:
                    offchain_account = _context5.sent;

                    if (offchain_account) (0, _ServerApiClient.serverApiLogout)();
                    return _context5.abrupt('return');

                case 16:
                    userProvidedRole = void 0; // login via:  username/owner

                    if (username.indexOf('/') > -1) {
                        _username$split = username.split('/');
                        // "alice/active" will login only with Alices active key

                        _username$split2 = (0, _slicedToArray3.default)(_username$split, 2);
                        username = _username$split2[0];
                        userProvidedRole = _username$split2[1];
                    }

                    _context5.next = 20;
                    return (0, _effects.select)(function (state) {
                        return state.global.get('pathname');
                    });

                case 20:
                    pathname = _context5.sent;

                    isRole = function isRole(role, fn) {
                        return !userProvidedRole || role === userProvidedRole ? fn() : undefined;
                    };

                    _context5.next = 24;
                    return (0, _effects.call)(_SagaShared.getAccount, username, true);

                case 24:
                    account = _context5.sent;

                    if (account) {
                        _context5.next = 30;
                        break;
                    }

                    console.log('No account');
                    _context5.next = 29;
                    return (0, _effects.put)(userActions.loginError({ error: 'Username does not exist' }));

                case 29:
                    return _context5.abrupt('return');

                case 30:
                    if (!(username && _DMCAUserList2.default.includes(username))) {
                        _context5.next = 35;
                        break;
                    }

                    console.log('DMCA list');
                    _context5.next = 34;
                    return (0, _effects.put)(userActions.loginError({ error: (0, _Translator.translate)('terms_violation') }));

                case 34:
                    return _context5.abrupt('return');

                case 35:
                    if (!login_with_keychain) {
                        _context5.next = 40;
                        break;
                    }

                    console.log('Logged in using steem keychain');
                    _context5.next = 39;
                    return (0, _effects.put)(userActions.setUser({
                        username: username,
                        login_with_keychain: true,
                        effective_vests: effectiveVests(account),
                        tip_count: account.get('tip_count'),
                        tron_addr: account.get('tron_addr'),
                        tron_balance: account.get('tron_balance'),
                        pending_claim_tron_reward: account.get('pending_claim_tron_reward')
                    }));

                case 39:
                    return _context5.abrupt('return');

                case 40:
                    private_keys = void 0;

                    if (useKeychain) {
                        _context5.next = 109;
                        break;
                    }

                    try {
                        private_key = _ecc.PrivateKey.fromWif(password);

                        login_wif_owner_pubkey = private_key.toPublicKey().toString();
                        private_keys = (0, _immutable.fromJS)({
                            owner_private: isRole('owner', function () {
                                return private_key;
                            }),
                            posting_private: isRole('posting', function () {
                                return private_key;
                            }),
                            active_private: isRole('active', function () {
                                return private_key;
                            }),
                            memo_private: private_key
                        });
                    } catch (e) {
                        // Password (non wif)
                        login_owner_pubkey = _ecc.PrivateKey.fromSeed(username + 'owner' + password).toPublicKey().toString();
                        private_keys = (0, _immutable.fromJS)({
                            posting_private: isRole('posting', function () {
                                return _ecc.PrivateKey.fromSeed(username + 'posting' + password);
                            }),
                            active_private: isRole('active', function () {
                                return _ecc.PrivateKey.fromSeed(username + 'active' + password);
                            }),
                            memo_private: _ecc.PrivateKey.fromSeed(username + 'memo' + password)
                        });
                    }
                    if (memoWif) private_keys = private_keys.set('memo_private', _ecc.PrivateKey.fromWif(memoWif));

                    _context5.next = 46;
                    return (0, _effects.call)(_AuthSaga.accountAuthLookup, {
                        payload: {
                            account: account,
                            private_keys: private_keys,
                            login_owner_pubkey: login_owner_pubkey
                        }
                    });

                case 46:
                    _context5.next = 48;
                    return (0, _effects.select)(function (state) {
                        return state.user.getIn(['authority', username]);
                    });

                case 48:
                    authority = _context5.sent;
                    hasActiveAuth = authority.get('active') === 'full';

                    if (!hasActiveAuth) {
                        _context5.next = 55;
                        break;
                    }

                    console.log('Rejecting due to detected active auth');
                    _context5.next = 54;
                    return (0, _effects.put)(userActions.loginError({ error: 'active_login_blocked' }));

                case 54:
                    return _context5.abrupt('return');

                case 55:
                    hasOwnerAuth = authority.get('owner') === 'full';

                    if (!hasOwnerAuth) {
                        _context5.next = 61;
                        break;
                    }

                    console.log('Rejecting due to detected owner auth');
                    _context5.next = 60;
                    return (0, _effects.put)(userActions.loginError({ error: 'owner_login_blocked' }));

                case 60:
                    return _context5.abrupt('return');

                case 61:
                    accountName = account.get('name');

                    authority = authority.set('active', 'none');
                    _context5.next = 65;
                    return (0, _effects.put)(userActions.setAuthority({ accountName: accountName, auth: authority }));

                case 65:
                    fullAuths = authority.reduce(function (r, auth, type) {
                        return auth === 'full' ? r.add(type) : r;
                    }, (0, _immutable.Set)());

                    if (fullAuths.size) {
                        _context5.next = 89;
                        break;
                    }

                    console.log('No full auths');
                    _context5.next = 70;
                    return (0, _effects.put)(userActions.hideLoginWarning());

                case 70:
                    localStorage.removeItem('autopost2');
                    owner_pub_key = account.getIn(['owner', 'key_auths', 0, 0]);

                    if (!(login_owner_pubkey === owner_pub_key || login_wif_owner_pubkey === owner_pub_key)) {
                        _context5.next = 78;
                        break;
                    }

                    _context5.next = 75;
                    return (0, _effects.put)(userActions.loginError({ error: 'owner_login_blocked' }));

                case 75:
                    return _context5.abrupt('return');

                case 78:
                    if (!hasActiveAuth) {
                        _context5.next = 84;
                        break;
                    }

                    _context5.next = 81;
                    return (0, _effects.put)(userActions.loginError({ error: 'active_login_blocked' }));

                case 81:
                    return _context5.abrupt('return');

                case 84:
                    generated_type = password[0] === 'P' && password.length > 40;

                    (0, _ServerApiClient.serverApiRecordEvent)('login_attempt', (0, _stringify2.default)({
                        name: username,
                        login_owner_pubkey: login_owner_pubkey,
                        owner_pub_key: owner_pub_key,
                        generated_type: generated_type
                    }));
                    _context5.next = 88;
                    return (0, _effects.put)(userActions.loginError({ error: 'Incorrect Password' }));

                case 88:
                    return _context5.abrupt('return');

                case 89:
                    if (authority.get('posting') !== 'full') private_keys = private_keys.remove('posting_private');
                    if (authority.get('active') !== 'full') private_keys = private_keys.remove('active_private');

                    owner_pubkey = account.getIn(['owner', 'key_auths', 0, 0]);
                    active_pubkey = account.getIn(['active', 'key_auths', 0, 0]);
                    posting_pubkey = account.getIn(['posting', 'key_auths', 0, 0]);
                    memo_pubkey = private_keys.has('memo_private') ? private_keys.get('memo_private').toPublicKey().toString() : null;


                    if (account.get('memo_key') !== memo_pubkey || memo_pubkey === owner_pubkey || memo_pubkey === active_pubkey)
                        // provided password did not yield memo key, or matched active/owner
                        private_keys = private_keys.remove('memo_private');

                    if (!(posting_pubkey === owner_pubkey || posting_pubkey === active_pubkey)) {
                        _context5.next = 101;
                        break;
                    }

                    _context5.next = 99;
                    return (0, _effects.put)(userActions.loginError({
                        error: 'This login gives owner or active permissions and should not be used here.  Please provide a posting only login.'
                    }));

                case 99:
                    localStorage.removeItem('autopost2');
                    return _context5.abrupt('return');

                case 101:
                    if (username) feedURL = '/@' + username + '/feed';

                    // If user is signing operation by operaion and has no saved login, don't save to RAM

                    if (!(!operationType || saveLogin)) {
                        _context5.next = 107;
                        break;
                    }

                    _context5.next = 105;
                    return (0, _effects.put)(userActions.setUser({
                        username: username,
                        private_keys: private_keys,
                        login_owner_pubkey: login_owner_pubkey,
                        effective_vests: effectiveVests(account),
                        tip_count: account.get('tip_count'),
                        tron_addr: account.get('tron_addr'),
                        tron_balance: account.get('tron_balance'),
                        pending_claim_tron_reward: account.get('pending_claim_tron_reward')
                    }));

                case 105:
                    _context5.next = 109;
                    break;

                case 107:
                    _context5.next = 109;
                    return (0, _effects.put)(userActions.setUser({
                        username: username,
                        private_keys: private_keys, // TODO: this is a temp way
                        login_owner_pubkey: login_owner_pubkey, // TODO: this is a temp way
                        effective_vests: effectiveVests(account),
                        tip_count: account.get('tip_count'),
                        tron_addr: account.get('tron_addr'),
                        tron_balance: account.get('tron_balance'),
                        pending_claim_tron_reward: account.get('pending_claim_tron_reward')
                    }));

                case 109:
                    _context5.prev = 109;
                    _context5.next = 112;
                    return (0, _effects.select)(function (state) {
                        return state.offchain;
                    });

                case 112:
                    offchainData = _context5.sent;
                    serverAccount = offchainData.get('account');
                    challengeString = offchainData.get('login_challenge');

                    if (!(!serverAccount && challengeString)) {
                        _context5.next = 149;
                        break;
                    }

                    console.log('No server account, but challenge string');
                    signatures = {};
                    challenge = { token: challengeString };
                    buf = (0, _stringify2.default)(challenge, null, 0);
                    bufSha = _ecc.hash.sha256(buf);

                    if (!useKeychain) {
                        _context5.next = 137;
                        break;
                    }

                    _context5.next = 124;
                    return new _promise2.default(function (resolve) {
                        window.steem_keychain.requestSignBuffer(username, buf, 'Posting', function (response) {
                            resolve(response);
                        });
                    });

                case 124:
                    _response = _context5.sent;

                    if (!_response.success) {
                        _context5.next = 129;
                        break;
                    }

                    signatures.posting = _response.result;
                    _context5.next = 132;
                    break;

                case 129:
                    _context5.next = 131;
                    return (0, _effects.put)(userActions.loginError({ error: _response.message }));

                case 131:
                    return _context5.abrupt('return');

                case 132:
                    feedURL = '/@' + username + '/feed';
                    _context5.next = 135;
                    return (0, _effects.put)(userActions.setUser({
                        username: username,
                        login_with_keychain: true,
                        effective_vests: effectiveVests(account),
                        tip_count: account.get('tip_count'),
                        tron_addr: account.get('tron_addr'),
                        tron_balance: account.get('tron_balance'),
                        pending_claim_tron_reward: account.get('pending_claim_tron_reward')
                    }));

                case 135:
                    _context5.next = 139;
                    break;

                case 137:
                    sign = function sign(role, d) {
                        console.log('Sign before');
                        if (!d) return;
                        console.log('Sign after');
                        var sig = _ecc.Signature.signBufferSha256(bufSha, d);
                        signatures[role] = sig.toHex();
                    };

                    sign('posting', private_keys.get('posting_private'));
                    // sign('active', private_keys.get('active_private'))

                case 139:

                    console.log('Logging in as', username);
                    _context5.next = 142;
                    return (0, _ServerApiClient.serverApiLogin)(username, signatures);

                case 142:
                    response = _context5.sent;
                    _context5.next = 145;
                    return response.json();

                case 145:
                    body = _context5.sent;

                    if (!(body.status != undefined && body.status == 'ok')) {
                        _context5.next = 149;
                        break;
                    }

                    _context5.next = 149;
                    return (0, _effects.put)(userActions.setUser({
                        username: username,
                        pass_auth: true,
                        tip_count: account.get('tip_count'),
                        tron_addr: account.get('tron_addr'),
                        tron_balance: account.get('tron_balance'),
                        pending_claim_tron_reward: account.get('pending_claim_tron_reward')
                    }));

                case 149:
                    _context5.next = 154;
                    break;

                case 151:
                    _context5.prev = 151;
                    _context5.t0 = _context5['catch'](109);

                    // Does not need to be fatal
                    console.error('Server Login Error', _context5.t0);

                case 154:
                    if (!(!autopost && saveLogin)) {
                        _context5.next = 157;
                        break;
                    }

                    _context5.next = 157;
                    return (0, _effects.put)(userActions.saveLogin());

                case 157:
                    if (!(useKeychain || private_keys.get('posting_private'))) {
                        _context5.next = 160;
                        break;
                    }

                    _context5.next = 160;
                    return (0, _effects.fork)(getFeatureFlags, username, useKeychain ? null : private_keys.get('posting_private').toString());

                case 160:
                    _context5.next = 162;
                    return (0, _effects.fork)(promptTosAcceptance, username);

                case 162:
                    _context5.next = 164;
                    return (0, _effects.select)(function (state) {
                        return state.app.get('unbind_tip_limit');
                    });

                case 164:
                    unbindTipLimit = _context5.sent;

                    if (!(account.has('tron_addr') && account.get('tron_addr') === '' && account.has('tip_count') && account.get('tip_count') < unbindTipLimit)) {
                        _context5.next = 168;
                        break;
                    }

                    _context5.next = 168;
                    return (0, _effects.put)(userActions.showTronCreate());

                case 168:

                    // Redirect user to the appropriate page after login.
                    if (afterLoginRedirectToWelcome) {
                        console.log('Redirecting to welcome page');
                        _reactRouter.browserHistory.push('/welcome');
                    } else if (feedURL && document.location.pathname === '/login.html') {
                        _reactRouter.browserHistory.push('/trending/my');
                    } else if (feedURL && document.location.pathname === '/') {
                        //browserHistory.push(feedURL);
                        _reactRouter.browserHistory.push('/trending/my');
                    }

                case 169:
                case 'end':
                    return _context5.stop();
            }
        }
    }, _marked4, this, [[109, 151]]);
}

function promptTosAcceptance(username) {
    var accepted;
    return _regenerator2.default.wrap(function promptTosAcceptance$(_context6) {
        while (1) {
            switch (_context6.prev = _context6.next) {
                case 0:
                    _context6.prev = 0;
                    _context6.next = 3;
                    return (0, _effects.call)(_ServerApiClient.isTosAccepted, username);

                case 3:
                    accepted = _context6.sent;

                    if (accepted) {
                        _context6.next = 7;
                        break;
                    }

                    _context6.next = 7;
                    return (0, _effects.put)(userActions.showTerms());

                case 7:
                    _context6.next = 11;
                    break;

                case 9:
                    _context6.prev = 9;
                    _context6.t0 = _context6['catch'](0);

                case 11:
                case 'end':
                    return _context6.stop();
            }
        }
    }, _marked5, this, [[0, 9]]);
}

function getFeatureFlags(username, posting_private) {
    var flags;
    return _regenerator2.default.wrap(function getFeatureFlags$(_context7) {
        while (1) {
            switch (_context7.prev = _context7.next) {
                case 0:
                    return _context7.abrupt('return');

                case 6:
                    flags = _context7.sent;
                    _context7.next = 12;
                    break;

                case 9:
                    _context7.next = 11;
                    return (0, _effects.call)([_steemJs.api, _steemJs.api.signedCallAsync], 'conveyor.get_feature_flags', { account: username }, username, posting_private);

                case 11:
                    flags = _context7.sent;

                case 12:
                    _context7.next = 14;
                    return (0, _effects.put)(appActions.receiveFeatureFlags(flags));

                case 14:
                    _context7.next = 18;
                    break;

                case 16:
                    _context7.prev = 16;
                    _context7.t0 = _context7['catch'](1);

                case 18:
                case 'end':
                    return _context7.stop();
            }
        }
    }, _marked6, this, [[1, 16]]);
}

function saveLogin_localStorage() {
    var _ref3, _ref4, username, private_keys, login_owner_pubkey, login_with_keychain, posting_private, account, postingPubkey, memoKey, memoWif, postingPrivateWif, data;

    return _regenerator2.default.wrap(function saveLogin_localStorage$(_context8) {
        while (1) {
            switch (_context8.prev = _context8.next) {
                case 0:
                    if (process.env.BROWSER) {
                        _context8.next = 3;
                        break;
                    }

                    console.error('Non-browser environment, skipping localstorage');
                    return _context8.abrupt('return');

                case 3:
                    localStorage.removeItem('autopost2');
                    _context8.next = 6;
                    return (0, _effects.select)(function (state) {
                        return [state.user.getIn(['current', 'username']), state.user.getIn(['current', 'private_keys']), state.user.getIn(['current', 'login_owner_pubkey']), state.user.getIn(['current', 'login_with_keychain'])];
                    });

                case 6:
                    _ref3 = _context8.sent;
                    _ref4 = (0, _slicedToArray3.default)(_ref3, 4);
                    username = _ref4[0];
                    private_keys = _ref4[1];
                    login_owner_pubkey = _ref4[2];
                    login_with_keychain = _ref4[3];

                    if (username) {
                        _context8.next = 15;
                        break;
                    }

                    console.error('Not logged in');
                    return _context8.abrupt('return');

                case 15:
                    // Save the lowest security key
                    posting_private = private_keys && private_keys.get('posting_private');

                    if (!(!login_with_keychain && !posting_private)) {
                        _context8.next = 19;
                        break;
                    }

                    console.error('No posting key to save?');
                    return _context8.abrupt('return');

                case 19:
                    _context8.next = 21;
                    return (0, _effects.select)(function (state) {
                        return state.global.getIn(['accounts', username]);
                    });

                case 21:
                    account = _context8.sent;

                    if (account) {
                        _context8.next = 25;
                        break;
                    }

                    console.error('Missing global.accounts[' + username + ']');
                    return _context8.abrupt('return');

                case 25:
                    postingPubkey = posting_private ? posting_private.toPublicKey().toString() : 'none';
                    _context8.prev = 26;

                    account.getIn(['active', 'key_auths']).forEach(function (auth) {
                        if (auth.get(0) === postingPubkey) throw 'Login will not be saved, posting key is the same as active key';
                    });
                    account.getIn(['owner', 'key_auths']).forEach(function (auth) {
                        if (auth.get(0) === postingPubkey) throw 'Login will not be saved, posting key is the same as owner key';
                    });
                    _context8.next = 35;
                    break;

                case 31:
                    _context8.prev = 31;
                    _context8.t0 = _context8['catch'](26);

                    console.error('login_auth_err', _context8.t0);
                    return _context8.abrupt('return');

                case 35:
                    memoKey = private_keys ? private_keys.get('memo_private') : null;
                    memoWif = memoKey && memoKey.toWif();
                    postingPrivateWif = posting_private ? posting_private.toWif() : 'none';
                    data = (0, _UserUtil.packLoginData)(username, postingPrivateWif, memoWif, login_owner_pubkey, login_with_keychain);
                    // autopost is a auto login for a low security key (like the posting key)

                    localStorage.setItem('autopost2', data);

                case 40:
                case 'end':
                    return _context8.stop();
            }
        }
    }, _marked7, this, [[26, 31]]);
}

function logout(action) {
    var payload,
        logoutType,
        _args9 = arguments;
    return _regenerator2.default.wrap(function logout$(_context9) {
        while (1) {
            switch (_context9.prev = _context9.next) {
                case 0:
                    payload = (action || {}).payload || {};
                    logoutType = payload.type || 'default';

                    console.log('Logging out', _args9, 'logout type', logoutType);

                    // Just in case it is still showing
                    _context9.next = 5;
                    return (0, _effects.put)(userActions.saveLoginConfirm(false));

                case 5:

                    if (process.env.BROWSER) {
                        localStorage.removeItem('autopost2');
                    }

                    _context9.next = 8;
                    return (0, _ServerApiClient.serverApiLogout)();

                case 8:
                case 'end':
                    return _context9.stop();
            }
        }
    }, _marked8, this);
}

function loginError(_ref5) {
    return _regenerator2.default.wrap(function loginError$(_context10) {
        while (1) {
            switch (_context10.prev = _context10.next) {
                case 0:
                    (0, _objectDestructuringEmpty3.default)(_ref5.payload);

                    (0, _ServerApiClient.serverApiLogout)();

                case 2:
                case 'end':
                    return _context10.stop();
            }
        }
    }, _marked9, this);
}

/**
    If the owner key was changed after the login owner key, this function will
    find the next owner key history record after the change and store it under
    user.previous_owner_authority.
*/
function lookupPreviousOwnerAuthority(_ref6) {
    var current, login_owner_pubkey, username, key_auths, owner_history, previous_owner_authority;
    return _regenerator2.default.wrap(function lookupPreviousOwnerAuthority$(_context11) {
        while (1) {
            switch (_context11.prev = _context11.next) {
                case 0:
                    (0, _objectDestructuringEmpty3.default)(_ref6.payload);
                    _context11.next = 3;
                    return (0, _effects.select)(function (state) {
                        return state.user.getIn(['current']);
                    });

                case 3:
                    current = _context11.sent;

                    if (current) {
                        _context11.next = 6;
                        break;
                    }

                    return _context11.abrupt('return');

                case 6:
                    login_owner_pubkey = current.get('login_owner_pubkey');

                    if (login_owner_pubkey) {
                        _context11.next = 9;
                        break;
                    }

                    return _context11.abrupt('return');

                case 9:
                    username = current.get('username');
                    _context11.next = 12;
                    return (0, _effects.select)(function (state) {
                        return state.global.getIn(['accounts', username, 'owner', 'key_auths']);
                    });

                case 12:
                    key_auths = _context11.sent;

                    if (!(key_auths && key_auths.find(function (key) {
                        return key.get(0) === login_owner_pubkey;
                    }))) {
                        _context11.next = 15;
                        break;
                    }

                    return _context11.abrupt('return');

                case 15:
                    _context11.t0 = _immutable.fromJS;
                    _context11.next = 18;
                    return (0, _effects.call)([_steemJs.api, _steemJs.api.getOwnerHistoryAsync], username);

                case 18:
                    _context11.t1 = _context11.sent;
                    owner_history = (0, _context11.t0)(_context11.t1);

                    if (!(owner_history.count() === 0)) {
                        _context11.next = 22;
                        break;
                    }

                    return _context11.abrupt('return');

                case 22:
                    owner_history = owner_history.sort(function (b, a) {
                        // Sort decending
                        var aa = a.get('last_valid_time');
                        var bb = b.get('last_valid_time');
                        return aa < bb ? -1 : aa > bb ? 1 : 0;
                    });
                    previous_owner_authority = owner_history.find(function (o) {
                        var auth = o.get('previous_owner_authority');
                        var weight_threshold = auth.get('weight_threshold');
                        var key3 = auth.get('key_auths').find(function (key2) {
                            return key2.get(0) === login_owner_pubkey && key2.get(1) >= weight_threshold;
                        });
                        return key3 ? auth : null;
                    });

                    if (previous_owner_authority) {
                        _context11.next = 27;
                        break;
                    }

                    console.log('UserSaga ---> Login owner does not match owner history');
                    return _context11.abrupt('return');

                case 27:
                    _context11.next = 29;
                    return (0, _effects.put)(userActions.setUser({ previous_owner_authority: previous_owner_authority }));

                case 29:
                case 'end':
                    return _context11.stop();
            }
        }
    }, _marked10, this);
}

function uploadImage(_ref7) {
    var _ref7$payload = _ref7.payload,
        file = _ref7$payload.file,
        dataUrl = _ref7$payload.dataUrl,
        _ref7$payload$filenam = _ref7$payload.filename,
        filename = _ref7$payload$filenam === undefined ? 'image.txt' : _ref7$payload$filenam,
        progress = _ref7$payload.progress;

    var _progress, stateUser, username, keychainLogin, d, data, dataBs64, reader, commaIdx, prefix, buf, bufSha, formData, sig, response, postUrl, xhr;

    return _regenerator2.default.wrap(function uploadImage$(_context12) {
        while (1) {
            switch (_context12.prev = _context12.next) {
                case 0:
                    _progress = progress;

                    progress = function progress(msg) {
                        _progress(msg);
                    };

                    _context12.next = 4;
                    return (0, _effects.select)(function (state) {
                        return state.user;
                    });

                case 4:
                    stateUser = _context12.sent;
                    username = stateUser.getIn(['current', 'username']);
                    keychainLogin = (0, _SteemKeychain.isLoggedInWithKeychain)();
                    d = stateUser.getIn(['current', 'private_keys', 'posting_private']);

                    if (username) {
                        _context12.next = 11;
                        break;
                    }

                    progress({ error: 'Please login first.' });
                    return _context12.abrupt('return');

                case 11:
                    if (keychainLogin || d) {
                        _context12.next = 14;
                        break;
                    }

                    progress({ error: 'Login with your posting key' });
                    return _context12.abrupt('return');

                case 14:
                    if (!(!file && !dataUrl)) {
                        _context12.next = 17;
                        break;
                    }

                    console.error('uploadImage required: file or dataUrl');
                    return _context12.abrupt('return');

                case 17:
                    data = void 0, dataBs64 = void 0;

                    if (!file) {
                        _context12.next = 25;
                        break;
                    }

                    // drag and drop
                    reader = new FileReader();
                    _context12.next = 22;
                    return new _promise2.default(function (resolve) {
                        reader.addEventListener('load', function () {
                            var result = new Buffer(reader.result, 'binary');
                            resolve(result);
                        });
                        reader.readAsBinaryString(file);
                    });

                case 22:
                    data = _context12.sent;
                    _context12.next = 28;
                    break;

                case 25:
                    // recover from preview
                    commaIdx = dataUrl.indexOf(',');

                    dataBs64 = dataUrl.substring(commaIdx + 1);
                    data = new Buffer(dataBs64, 'base64');

                case 28:

                    // The challenge needs to be prefixed with a constant (both on the server and checked on the client) to make sure the server can't easily make the client sign a transaction doing something else.
                    prefix = new Buffer('ImageSigningChallenge');
                    buf = Buffer.concat([prefix, data]);
                    bufSha = _ecc.hash.sha256(buf);
                    formData = new FormData();

                    if (file) {
                        formData.append('file', file);
                    } else {
                        // formData.append('file', file, filename) <- Failed to add filename=xxx to Content-Disposition
                        // Can't easily make this look like a file so this relies on the server supporting: filename and filebinary
                        formData.append('filename', filename);
                        formData.append('filebase64', dataBs64);
                    }

                    sig = void 0;

                    if (!keychainLogin) {
                        _context12.next = 46;
                        break;
                    }

                    _context12.next = 37;
                    return new _promise2.default(function (resolve) {
                        window.steem_keychain.requestSignBuffer(username, (0, _stringify2.default)(buf), 'Posting', function (response) {
                            resolve(response);
                        });
                    });

                case 37:
                    response = _context12.sent;

                    if (!response.success) {
                        _context12.next = 42;
                        break;
                    }

                    sig = response.result;
                    _context12.next = 44;
                    break;

                case 42:
                    progress({ error: response.message });
                    return _context12.abrupt('return');

                case 44:
                    _context12.next = 47;
                    break;

                case 46:
                    sig = _ecc.Signature.signBufferSha256(bufSha, d).toHex();

                case 47:
                    postUrl = $STM_Config.upload_image + '/' + username + '/' + sig;

                    console.log(postUrl);
                    xhr = new XMLHttpRequest();

                    xhr.open('POST', postUrl);
                    xhr.onload = function () {
                        console.log(xhr.status, xhr.responseText);
                        if (xhr.status === 200) {
                            try {
                                var res = JSON.parse(xhr.responseText);
                                var error = res.error;

                                if (error) {
                                    console.error('upload_error', error, xhr.responseText);
                                    progress({ error: 'Error: ' + error });
                                    return;
                                }

                                var url = res.url;

                                progress({ url: url });
                            } catch (e) {
                                console.error('upload_error2', 'not json', e, xhr.responseText);
                                progress({ error: 'Error: response not JSON' });
                                return;
                            }
                        } else {
                            console.error('upload_error3', xhr.status, xhr.statusText);
                            progress({ error: 'Error: ' + xhr.status + ': ' + xhr.statusText });
                            console.log('888333777');
                            return;
                        }
                    };
                    xhr.onerror = function (error) {
                        console.error('xhr', filename, error);
                        progress({ error: 'Unable to contact the server.' });
                    };
                    xhr.upload.onprogress = function (event) {
                        if (event.lengthComputable) {
                            var percent = Math.round(event.loaded / event.total * 100);
                            progress({ message: 'Uploading ' + percent + '%' });
                        }
                    };
                    xhr.send(formData);

                case 55:
                case 'end':
                    return _context12.stop();
            }
        }
    }, _marked11, this);
}

/**
 *
 */
function updateTronPopupTipCount() {
    var current, username, tip_count, private_keys, privateKeyType, authType, data;
    return _regenerator2.default.wrap(function updateTronPopupTipCount$(_context13) {
        while (1) {
            switch (_context13.prev = _context13.next) {
                case 0:
                    _context13.next = 2;
                    return (0, _effects.select)(function (state) {
                        return state.user.get('current');
                    });

                case 2:
                    current = _context13.sent;
                    username = current.get('username');
                    tip_count = current.get('tip_count');
                    private_keys = current.get('private_keys');

                    if (!(tip_count === undefined || private_keys === undefined)) {
                        _context13.next = 8;
                        break;
                    }

                    return _context13.abrupt('return');

                case 8:

                    // charge that which level private key we own.
                    privateKeyType = null;

                    if (private_keys.has('posting_private')) privateKeyType = 'posting_private';
                    if (private_keys.has('memo_private')) privateKeyType = 'memo_private';

                    if (!(privateKeyType === null)) {
                        _context13.next = 14;
                        break;
                    }

                    console.log('there is no private key in browser cache.');
                    return _context13.abrupt('return');

                case 14:
                    authType = void 0;
                    _context13.t0 = privateKeyType;
                    _context13.next = _context13.t0 === 'active_private' ? 18 : _context13.t0 === 'posting_private' ? 20 : _context13.t0 === 'owner_private' ? 22 : _context13.t0 === 'memo_private' ? 24 : 26;
                    break;

                case 18:
                    authType = 'active';
                    return _context13.abrupt('break', 27);

                case 20:
                    authType = 'posting';
                    return _context13.abrupt('break', 27);

                case 22:
                    authType = 'owner';
                    return _context13.abrupt('break', 27);

                case 24:
                    authType = 'memo';
                    return _context13.abrupt('break', 27);

                case 26:
                    throw Error('unexpected auth type.');

                case 27:
                    data = {
                        username: username,
                        auth_type: authType,
                        tip_count: tip_count + 1
                    };
                    _context13.next = 30;
                    return (0, _effects.put)(userActions.setUser({
                        tip_count: tip_count + 1,
                        tip_count_lock: true // prevent tip popup multi times
                    }));

                case 30:

                    // let updateTronUser executes in next event loop
                    setTimeout(function () {
                        return (0, _ServerApiClient.updateTronUser)(data, private_keys.get(privateKeyType).toWif());
                    });

                case 31:
                case 'end':
                    return _context13.stop();
            }
        }
    }, _marked12, this);
}

function updateTronAddr() {
    var _ref8, _ref9, username, private_keys, privateKeyType, tronAccount, tronPrivKey, tronPubKey, data, result, state, tronInfo;

    return _regenerator2.default.wrap(function updateTronAddr$(_context14) {
        while (1) {
            switch (_context14.prev = _context14.next) {
                case 0:
                    _context14.next = 2;
                    return (0, _effects.select)(function (state) {
                        return [state.user.getIn(['current', 'username']), state.user.getIn(['current', 'private_keys'])];
                    });

                case 2:
                    _ref8 = _context14.sent;
                    _ref9 = (0, _slicedToArray3.default)(_ref8, 2);
                    username = _ref9[0];
                    private_keys = _ref9[1];


                    // charge that which level private key we own.
                    privateKeyType = null;

                    if (private_keys && private_keys.has('active_private')) privateKeyType = 'active_private';
                    if (private_keys && private_keys.has('posting_private')) privateKeyType = 'posting_private';

                    if (!(privateKeyType === null)) {
                        _context14.next = 14;
                        break;
                    }

                    console.log('there is no private key in browser cache.');
                    _context14.next = 13;
                    return (0, _effects.put)(appActions.setTronErrMsg((0, _counterpart2.default)('loginform_jsx.there_is_no_private_key_in_browser_cache')));

                case 13:
                    return _context14.abrupt('return');

                case 14:
                    _context14.next = 16;
                    return (0, _tronApi.createTronAccount)();

                case 16:
                    tronAccount = _context14.sent;

                    if (!(tronAccount === null || tronAccount.address === undefined || tronAccount.address.base58 === undefined)) {
                        _context14.next = 21;
                        break;
                    }

                    _context14.next = 20;
                    return (0, _effects.put)(appActions.setTronErrMsg((0, _counterpart2.default)('userwallet_jsx.create_trx_failed')));

                case 20:
                    return _context14.abrupt('return');

                case 21:
                    tronPrivKey = tronAccount.privateKey;
                    tronPubKey = tronAccount.address.base58;

                    // update steem user's tron_addr

                    data = {
                        username: username,
                        auth_type: privateKeyType === 'active_private' ? 'active' : 'posting',
                        tron_addr: tronPubKey,
                        from: 'condenser'
                    };
                    _context14.next = 26;
                    return (0, _ServerApiClient.updateTronUser)(data, private_keys.get(privateKeyType).toWif());

                case 26:
                    result = _context14.sent;

                    if (!(result.error !== undefined)) {
                        _context14.next = 31;
                        break;
                    }

                    _context14.next = 30;
                    return (0, _effects.put)(appActions.setTronErrMsg((0, _counterpart2.default)('tron_err_msg.' + result.error)));

                case 30:
                    return _context14.abrupt('return');

                case 31:
                    _context14.next = 33;
                    return (0, _effects.put)(userActions.setUser({
                        tron_addr: tronPubKey,
                        tron_private_key: tronPrivKey
                    }));

                case 33:

                    // update current route user's state
                    state = {
                        accounts: {}
                    };

                    state.accounts[username] = {};
                    _context14.next = 37;
                    return (0, _effects.call)(_ServerApiClient.checkTronUser, username);

                case 37:
                    tronInfo = _context14.sent;

                    (0, _keys2.default)(tronInfo).forEach(function (k) {
                        state.accounts[username][k] = tronInfo[k];
                    });
                    _context14.next = 41;
                    return (0, _effects.put)(globalActions.receiveState(state));

                case 41:
                case 'end':
                    return _context14.stop();
            }
        }
    }, _marked13, this);
}