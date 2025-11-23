'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.authWatches = exports.postingOps = undefined;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

exports.accountAuthLookup = accountAuthLookup;
exports.threshold = threshold;
exports.findSigningKey = findSigningKey;

var _effects = require('redux-saga/effects');

var _immutable = require('immutable');

var _steemJs = require('@steemit/steem-js');

var _ecc = require('@steemit/steem-js/lib/auth/ecc');

var _SagaShared = require('app/redux/SagaShared');

var _UserReducer = require('app/redux/UserReducer');

var userActions = _interopRequireWildcard(_UserReducer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = /*#__PURE__*/_regenerator2.default.mark(accountAuthLookup),
    _marked2 = /*#__PURE__*/_regenerator2.default.mark(authorityLookup),
    _marked3 = /*#__PURE__*/_regenerator2.default.mark(authStr),
    _marked4 = /*#__PURE__*/_regenerator2.default.mark(threshold),
    _marked5 = /*#__PURE__*/_regenerator2.default.mark(findSigningKey);

// operations that require only posting authority
var postingOps = exports.postingOps = (0, _immutable.Set)('vote, comment, delete_comment, custom_json, claim_reward_balance, account_update2'.trim().split(/,\s*/));

var authWatches = exports.authWatches = [(0, _effects.takeEvery)('user/ACCOUNT_AUTH_LOOKUP', accountAuthLookup)];

function accountAuthLookup(_ref) {
    var _ref$payload = _ref.payload,
        account = _ref$payload.account,
        private_keys = _ref$payload.private_keys,
        login_owner_pubkey = _ref$payload.login_owner_pubkey;
    var stateUser, keys, toPub, posting, active, owner, memo, auth, accountName, pub_keys_used;
    return _regenerator2.default.wrap(function accountAuthLookup$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    account = (0, _immutable.fromJS)(account);
                    private_keys = (0, _immutable.fromJS)(private_keys);
                    // console.log('accountAuthLookup', account.name)
                    _context.next = 4;
                    return (0, _effects.select)(function (state) {
                        return state.user;
                    });

                case 4:
                    stateUser = _context.sent;
                    keys = void 0;

                    if (private_keys) keys = private_keys;else keys = stateUser.getIn(['current', 'private_keys']);

                    if (!(!keys || !keys.has('posting_private'))) {
                        _context.next = 9;
                        break;
                    }

                    return _context.abrupt('return');

                case 9:
                    toPub = function toPub(k) {
                        return k ? k.toPublicKey().toString() : '-';
                    };

                    posting = keys.get('posting_private');
                    active = keys.get('active_private');
                    owner = keys.get('active_private');
                    memo = keys.get('memo_private');

                    if (!posting) {
                        _context.next = 20;
                        break;
                    }

                    _context.next = 17;
                    return authorityLookup({
                        pubkeys: (0, _immutable.Set)([toPub(posting)]),
                        authority: account.get('posting'),
                        authType: 'posting'
                    });

                case 17:
                    _context.t0 = _context.sent;
                    _context.next = 21;
                    break;

                case 20:
                    _context.t0 = 'none';

                case 21:
                    _context.t1 = _context.t0;

                    if (!active) {
                        _context.next = 28;
                        break;
                    }

                    _context.next = 25;
                    return authorityLookup({
                        pubkeys: (0, _immutable.Set)([toPub(active)]),
                        authority: account.get('active'),
                        authType: 'active'
                    });

                case 25:
                    _context.t2 = _context.sent;
                    _context.next = 29;
                    break;

                case 28:
                    _context.t2 = 'none';

                case 29:
                    _context.t3 = _context.t2;

                    if (!owner) {
                        _context.next = 36;
                        break;
                    }

                    _context.next = 33;
                    return authorityLookup({
                        pubkeys: (0, _immutable.Set)([toPub(active)]),
                        authority: account.get('owner'),
                        authType: 'owner'
                    });

                case 33:
                    _context.t4 = _context.sent;
                    _context.next = 37;
                    break;

                case 36:
                    _context.t4 = 'none';

                case 37:
                    _context.t5 = _context.t4;
                    _context.t6 = account.get('memo_key') === toPub(memo) ? 'full' : 'none';
                    auth = {
                        posting: _context.t1,
                        active: _context.t3,
                        owner: _context.t5,
                        memo: _context.t6
                    };
                    accountName = account.get('name');
                    pub_keys_used = {
                        posting: toPub(posting),
                        active: toPub(active),
                        owner: login_owner_pubkey
                    };
                    _context.next = 44;
                    return (0, _effects.put)(userActions.setAuthority({ accountName: accountName, auth: auth, pub_keys_used: pub_keys_used }));

                case 44:
                case 'end':
                    return _context.stop();
            }
        }
    }, _marked, this);
}

/**
    @arg {object} data
    @arg {object} data.authority Immutable Map blockchain authority
    @arg {object} data.pubkeys Immutable Set public key strings
    @return {string} full, partial, none
*/
function authorityLookup(_ref2) {
    var pubkeys = _ref2.pubkeys,
        authority = _ref2.authority,
        authType = _ref2.authType;
    return _regenerator2.default.wrap(function authorityLookup$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    _context2.next = 2;
                    return (0, _effects.call)(authStr, { pubkeys: pubkeys, authority: authority, authType: authType });

                case 2:
                    return _context2.abrupt('return', _context2.sent);

                case 3:
                case 'end':
                    return _context2.stop();
            }
        }
    }, _marked2, this);
}

function authStr(_ref3) {
    var pubkeys = _ref3.pubkeys,
        authority = _ref3.authority,
        authType = _ref3.authType,
        _ref3$recurse = _ref3.recurse,
        recurse = _ref3$recurse === undefined ? 1 : _ref3$recurse;
    var t, r;
    return _regenerator2.default.wrap(function authStr$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    _context3.next = 2;
                    return (0, _effects.call)(threshold, { pubkeys: pubkeys, authority: authority, authType: authType, recurse: recurse });

                case 2:
                    t = _context3.sent;
                    r = authority.get('weight_threshold');
                    return _context3.abrupt('return', t >= r ? 'full' : t > 0 ? 'partial' : 'none');

                case 5:
                case 'end':
                    return _context3.stop();
            }
        }
    }, _marked3, this);
}

function threshold(_ref4) {
    var pubkeys = _ref4.pubkeys,
        authority = _ref4.authority,
        authType = _ref4.authType,
        _ref4$recurse = _ref4.recurse,
        recurse = _ref4$recurse === undefined ? 1 : _ref4$recurse;
    var t, account_auths, aaNames, aaAccounts, aaThreshes, i, aaAccount, auth, aaThresh;
    return _regenerator2.default.wrap(function threshold$(_context4) {
        while (1) {
            switch (_context4.prev = _context4.next) {
                case 0:
                    if (pubkeys.size) {
                        _context4.next = 2;
                        break;
                    }

                    return _context4.abrupt('return', 0);

                case 2:
                    t = pubkeyThreshold({ pubkeys: pubkeys, authority: authority });
                    account_auths = authority.get('account_auths');
                    aaNames = account_auths.map(function (v) {
                        return v.get(0);
                    }, (0, _immutable.List)());

                    if (!aaNames.size) {
                        _context4.next = 22;
                        break;
                    }

                    _context4.next = 8;
                    return _steemJs.api.getAccountsAsync(aaNames);

                case 8:
                    aaAccounts = _context4.sent;
                    aaThreshes = account_auths.map(function (v) {
                        return v.get(1);
                    }, (0, _immutable.List)());
                    i = 0;

                case 11:
                    if (!(i < aaAccounts.size)) {
                        _context4.next = 22;
                        break;
                    }

                    aaAccount = aaAccounts.get(i);

                    t += pubkeyThreshold({
                        authority: aaAccount.get(authType),
                        pubkeys: pubkeys
                    });

                    if (!(recurse <= 2)) {
                        _context4.next = 19;
                        break;
                    }

                    _context4.next = 17;
                    return (0, _effects.call)(authStr, {
                        authority: aaAccount,
                        pubkeys: pubkeys,
                        recurse: ++recurse
                    });

                case 17:
                    auth = _context4.sent;

                    if (auth === 'full') {
                        aaThresh = aaThreshes.get(i);

                        t += aaThresh;
                    }

                case 19:
                    i++;
                    _context4.next = 11;
                    break;

                case 22:
                    return _context4.abrupt('return', t);

                case 23:
                case 'end':
                    return _context4.stop();
            }
        }
    }, _marked4, this);
}

function pubkeyThreshold(_ref5) {
    var pubkeys = _ref5.pubkeys,
        authority = _ref5.authority;

    var available = 0;
    var key_auths = authority.get('key_auths');
    key_auths.forEach(function (k) {
        if (pubkeys.has(k.get(0))) {
            available += k.get(1);
        }
    });
    return available;
}

function findSigningKey(_ref6) {
    var opType = _ref6.opType,
        username = _ref6.username,
        password = _ref6.password;

    var authTypes, currentUser, currentUsername, private_keys, account, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, authType, private_key, pubkey, pubkeys, authority, auth;

    return _regenerator2.default.wrap(function findSigningKey$(_context5) {
        while (1) {
            switch (_context5.prev = _context5.next) {
                case 0:
                    authTypes = void 0;

                    if (postingOps.has(opType)) authTypes = 'posting, active';else authTypes = 'active, owner';
                    authTypes = authTypes.split(', ');

                    _context5.next = 5;
                    return (0, _effects.select)(function (state) {
                        return state.user.get('current');
                    });

                case 5:
                    currentUser = _context5.sent;
                    currentUsername = currentUser && currentUser.get('username');


                    username = username || currentUsername;

                    if (username) {
                        _context5.next = 10;
                        break;
                    }

                    return _context5.abrupt('return', null);

                case 10:

                    if (username.indexOf('/') > -1) {
                        // "alice/active" will login only with Alices active key
                        username = username.split('/')[0];
                    }

                    private_keys = currentUsername === username ? currentUser.get('private_keys') : (0, _immutable.Map)();
                    _context5.next = 14;
                    return (0, _effects.call)(_SagaShared.getAccount, username);

                case 14:
                    account = _context5.sent;

                    if (account) {
                        _context5.next = 17;
                        break;
                    }

                    throw new Error('Account not found');

                case 17:
                    _iteratorNormalCompletion = true;
                    _didIteratorError = false;
                    _iteratorError = undefined;
                    _context5.prev = 20;
                    _iterator = (0, _getIterator3.default)(authTypes);

                case 22:
                    if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                        _context5.next = 38;
                        break;
                    }

                    authType = _step.value;
                    private_key = void 0;

                    if (password) {
                        try {
                            private_key = _ecc.PrivateKey.fromWif(password);
                        } catch (e) {
                            private_key = _ecc.PrivateKey.fromSeed(username + authType + password);
                        }
                    } else {
                        if (private_keys) private_key = private_keys.get(authType + '_private');
                    }

                    if (!private_key) {
                        _context5.next = 35;
                        break;
                    }

                    pubkey = private_key.toPublicKey().toString();
                    pubkeys = (0, _immutable.Set)([pubkey]);
                    authority = account.get(authType);
                    _context5.next = 32;
                    return (0, _effects.call)(authorityLookup, {
                        pubkeys: pubkeys,
                        authority: authority,
                        authType: authType
                    });

                case 32:
                    auth = _context5.sent;

                    if (!(auth === 'full')) {
                        _context5.next = 35;
                        break;
                    }

                    return _context5.abrupt('return', private_key);

                case 35:
                    _iteratorNormalCompletion = true;
                    _context5.next = 22;
                    break;

                case 38:
                    _context5.next = 44;
                    break;

                case 40:
                    _context5.prev = 40;
                    _context5.t0 = _context5['catch'](20);
                    _didIteratorError = true;
                    _iteratorError = _context5.t0;

                case 44:
                    _context5.prev = 44;
                    _context5.prev = 45;

                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }

                case 47:
                    _context5.prev = 47;

                    if (!_didIteratorError) {
                        _context5.next = 50;
                        break;
                    }

                    throw _iteratorError;

                case 50:
                    return _context5.finish(47);

                case 51:
                    return _context5.finish(44);

                case 52:
                    return _context5.abrupt('return', null);

                case 53:
                case 'end':
                    return _context5.stop();
            }
        }
    }, _marked5, this, [[20, 40, 44, 52], [45,, 47, 51]]);
}

// function isPostingOnlyKey(pubkey, account) {
//     // TODO Support account auths
//     // yield put(g.actions.authLookup({account, pubkeys: pubkey})
//     // authorityLookup({pubkeys, authority: Map(account.posting), authType: 'posting'})
//     for (const p of account.posting.key_auths) {
//         if (pubkey === p[0]) {
//             if (account.active.account_auths.length || account.owner.account_auths.length) {
//                 console.log('UserSaga, skipping save password, account_auths are not yet supported.')
//                 return false
//             }
//             for (const a of account.active.key_auths)
//                 if (pubkey === a[0]) return false
//             for (const a of account.owner.key_auths)
//                 if (pubkey === a[0]) return false
//             return true
//         }
//     }
//     return false
// }