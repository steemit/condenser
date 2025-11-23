'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.default = useGeneralApi;

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

var _koaBody = require('koa-body');

var _koaBody2 = _interopRequireDefault(_koaBody);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _misc = require('server/utils/misc');

var _coBody = require('co-body');

var _coBody2 = _interopRequireDefault(_coBody);

var _mixpanel = require('mixpanel');

var _mixpanel2 = _interopRequireDefault(_mixpanel);

var _ecc = require('@steemit/steem-js/lib/auth/ecc');

var _steemJs = require('@steemit/steem-js');

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ACCEPTED_TOS_TAG = 'accepted_tos_20180614'; /*global $STM_Config */


var walletApiURI = $STM_Config.wallet_url + '/api/v1/tron';

var mixpanel = _config2.default.get('mixpanel') ? _mixpanel2.default.init(_config2.default.get('mixpanel')) : null;

var _stringval = function _stringval(v) {
    return typeof v === 'string' ? v : (0, _stringify2.default)(v);
};

var _parse = function _parse(params) {
    if (typeof params === 'string') {
        try {
            return JSON.parse(params);
        } catch (error) {
            console.error('json_parse', error, params);
            return {};
        }
    } else {
        return params;
    }
};

function logRequest(path, ctx, extra) {
    var d = { ip: (0, _misc.getRemoteIp)(ctx.req) };
    if (ctx.session) {
        if (ctx.session.user) {
            d.user = ctx.session.user;
        }
        if (ctx.session.uid) {
            d.uid = ctx.session.uid;
        }
        if (ctx.session.a) {
            d.account = ctx.session.a;
        }
    }
    if (extra) {
        (0, _keys2.default)(extra).forEach(function (k) {
            var nk = d[k] ? '_' + k : k;
            d[nk] = extra[k];
        });
    }
    var info = (0, _keys2.default)(d).map(function (k) {
        return k + '=' + _stringval(d[k]);
    }).join(' ');
    console.log('-- /' + path + ' --> ' + info);
}

function useGeneralApi(app) {
    var router = (0, _koaRouter2.default)({ prefix: '/api/v1' });
    app.use(router.routes());
    var koaBody = (0, _koaBody2.default)();

    router.post('/login_account', koaBody, /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var _this = this;

        var params, _parse2, csrf, account, signatures, _ref, _ref2, chainAccount, auth, bufSha, verify, _chainAccount$posting, _chainAccount$posting2, _chainAccount$posting3, posting_pubkey, weight, weight_threshold, remote_ip;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        // if (rateLimitReq(this, this.req)) return;
                        params = this.request.body;
                        _parse2 = _parse(params), csrf = _parse2.csrf, account = _parse2.account, signatures = _parse2.signatures;

                        if ((0, _misc.checkCSRF)(this, csrf)) {
                            _context.next = 4;
                            break;
                        }

                        return _context.abrupt('return');

                    case 4:

                        logRequest('login_account', this, { account: account });
                        _context.prev = 5;

                        if (!signatures) {
                            _context.next = 17;
                            break;
                        }

                        if (this.session.login_challenge) {
                            _context.next = 11;
                            break;
                        }

                        console.error('/login_account missing this.session.login_challenge');
                        _context.next = 17;
                        break;

                    case 11:
                        _context.next = 13;
                        return _steemJs.api.getAccountsAsync([account]);

                    case 13:
                        _ref = _context.sent;
                        _ref2 = (0, _slicedToArray3.default)(_ref, 1);
                        chainAccount = _ref2[0];

                        if (!chainAccount) {
                            console.error('/login_account missing blockchain account', account);
                        } else {
                            auth = { posting: false };
                            bufSha = _ecc.hash.sha256((0, _stringify2.default)({ token: this.session.login_challenge }, null, 0));

                            verify = function verify(type, sigHex, pubkey, weight, weight_threshold) {
                                if (!sigHex) return;
                                if (weight !== 1 || weight_threshold !== 1) {
                                    console.error('/login_account login_challenge unsupported ' + type + ' auth configuration: ' + account);
                                } else {
                                    var sig = parseSig(sigHex);
                                    var public_key = _ecc.PublicKey.fromString(pubkey);
                                    var verified = sig.verifyHash(bufSha, public_key);
                                    if (!verified) {
                                        console.error('/login_account verification failed', _this.session.uid, account, pubkey);
                                    }
                                    auth[type] = verified;
                                }
                            };

                            _chainAccount$posting = chainAccount.posting, _chainAccount$posting2 = (0, _slicedToArray3.default)(_chainAccount$posting.key_auths, 1), _chainAccount$posting3 = (0, _slicedToArray3.default)(_chainAccount$posting2[0], 2), posting_pubkey = _chainAccount$posting3[0], weight = _chainAccount$posting3[1], weight_threshold = _chainAccount$posting.weight_threshold;

                            verify('posting', signatures.posting, posting_pubkey, weight, weight_threshold);
                            if (auth.posting) this.session.a = account;
                        }

                    case 17:
                        // login checkpoint
                        _steemJs.api.call('overseer.collect', ['custom', {
                            measurement: 'user_login',
                            tags: {
                                entry: 'condenser'
                            },
                            fields: {
                                username: account
                            }
                        }], function (error) {
                            if (error) console.warn('overseer error', error);
                        });

                        this.body = (0, _stringify2.default)({
                            status: 'ok'
                        });
                        remote_ip = (0, _misc.getRemoteIp)(this.req);

                        if (mixpanel) {
                            mixpanel.people.set(this.session.uid, {
                                ip: remote_ip,
                                $ip: remote_ip
                            });
                            mixpanel.people.increment(this.session.uid, 'Logins', 1);
                        }
                        _context.next = 28;
                        break;

                    case 23:
                        _context.prev = 23;
                        _context.t0 = _context['catch'](5);

                        console.error('Error in /login_account api call', this.session.uid, _context.t0.message);
                        this.body = (0, _stringify2.default)({
                            error: _context.t0.message
                        });
                        this.status = 500;

                    case 28:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[5, 23]]);
    }));

    router.post('/logout_account', koaBody, /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var params, _parse3, csrf;

        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        // if (rateLimitReq(this, this.req)) return; - logout maybe immediately followed with login_attempt event
                        params = this.request.body;
                        _parse3 = _parse(params), csrf = _parse3.csrf;

                        if ((0, _misc.checkCSRF)(this, csrf)) {
                            _context2.next = 4;
                            break;
                        }

                        return _context2.abrupt('return');

                    case 4:
                        logRequest('logout_account', this);
                        try {
                            this.session.a = null;
                            this.body = (0, _stringify2.default)({ status: 'ok' });
                        } catch (error) {
                            console.error('Error in /logout_account api call', this.session.uid, error);
                            this.body = (0, _stringify2.default)({ error: error.message });
                            this.status = 500;
                        }

                    case 6:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    router.post('/csp_violation', /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var params, csp_report, value;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        if (!(0, _misc.rateLimitReq)(this, this.req)) {
                            _context3.next = 2;
                            break;
                        }

                        return _context3.abrupt('return');

                    case 2:
                        params = void 0;
                        _context3.prev = 3;
                        _context3.next = 6;
                        return (0, _coBody2.default)(this);

                    case 6:
                        params = _context3.sent;
                        _context3.next = 12;
                        break;

                    case 9:
                        _context3.prev = 9;
                        _context3.t0 = _context3['catch'](3);

                        console.log('-- /csp_violation error -->', _context3.t0);

                    case 12:
                        if (params && params['csp-report']) {
                            csp_report = params['csp-report'];
                            value = csp_report['document-uri'] + ' : ' + csp_report['blocked-uri'];

                            console.log('-- /csp_violation -->', value, '--', this.req.headers['user-agent']);
                        } else {
                            console.log('-- /csp_violation [no csp-report] -->', params, '--', this.req.headers['user-agent']);
                        }
                        this.body = '';

                    case 14:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[3, 9]]);
    }));

    router.post('/setUserPreferences', koaBody, /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        var params, _parse4, csrf, payload, json;

        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        params = this.request.body;
                        _parse4 = _parse(params), csrf = _parse4.csrf, payload = _parse4.payload;

                        if ((0, _misc.checkCSRF)(this, csrf)) {
                            _context4.next = 4;
                            break;
                        }

                        return _context4.abrupt('return');

                    case 4:
                        console.log('-- /setUserPreferences -->', this.session.user, this.session.uid, payload);

                        if (this.session.a) {
                            _context4.next = 9;
                            break;
                        }

                        this.body = 'missing logged in account';
                        this.status = 500;
                        return _context4.abrupt('return');

                    case 9:
                        _context4.prev = 9;
                        json = (0, _stringify2.default)(payload);

                        if (!(json.length > 1024)) {
                            _context4.next = 13;
                            break;
                        }

                        throw new Error('the data is too long');

                    case 13:
                        this.session.user_prefs = json;
                        this.body = (0, _stringify2.default)({ status: 'ok' });
                        _context4.next = 22;
                        break;

                    case 17:
                        _context4.prev = 17;
                        _context4.t0 = _context4['catch'](9);

                        console.error('Error in /setUserPreferences api call', this.session.uid, _context4.t0);
                        this.body = (0, _stringify2.default)({ error: _context4.t0.message });
                        this.status = 500;

                    case 22:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this, [[9, 17]]);
    }));

    router.post('/isTosAccepted', koaBody, /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        var params, _parse5, csrf, res;

        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        params = this.request.body;
                        _parse5 = _parse(params), csrf = _parse5.csrf;

                        if ((0, _misc.checkCSRF)(this, csrf)) {
                            _context5.next = 4;
                            break;
                        }

                        return _context5.abrupt('return');

                    case 4:

                        this.body = '{}';
                        this.status = 200;

                        if (this.session.a) {
                            _context5.next = 10;
                            break;
                        }

                        this.body = 'missing username';
                        this.status = 500;
                        return _context5.abrupt('return');

                    case 10:
                        _context5.prev = 10;
                        _context5.next = 13;
                        return _steemJs.api.signedCallAsync('conveyor.get_tags_for_user', [this.session.a], _config2.default.get('conveyor_username'), _config2.default.get('conveyor_posting_wif'));

                    case 13:
                        res = _context5.sent;


                        this.body = (0, _stringify2.default)(res.includes(ACCEPTED_TOS_TAG));
                        _context5.next = 22;
                        break;

                    case 17:
                        _context5.prev = 17;
                        _context5.t0 = _context5['catch'](10);

                        console.error('Error in /isTosAccepted api call', this.session.a, _context5.t0);
                        this.body = (0, _stringify2.default)({ error: _context5.t0.message });
                        this.status = 500;

                    case 22:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this, [[10, 17]]);
    }));

    router.post('/acceptTos', koaBody, /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
        var params, _parse6, csrf;

        return _regenerator2.default.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        params = this.request.body;
                        _parse6 = _parse(params), csrf = _parse6.csrf;

                        if ((0, _misc.checkCSRF)(this, csrf)) {
                            _context6.next = 4;
                            break;
                        }

                        return _context6.abrupt('return');

                    case 4:
                        if (this.session.a) {
                            _context6.next = 8;
                            break;
                        }

                        this.body = 'missing logged in account';
                        this.status = 500;
                        return _context6.abrupt('return');

                    case 8:
                        _context6.prev = 8;
                        _context6.next = 11;
                        return _steemJs.api.signedCallAsync('conveyor.assign_tag', {
                            uid: this.session.a,
                            tag: ACCEPTED_TOS_TAG
                        }, _config2.default.get('conveyor_username'), _config2.default.get('conveyor_posting_wif'));

                    case 11:
                        this.body = (0, _stringify2.default)({ status: 'ok' });
                        _context6.next = 19;
                        break;

                    case 14:
                        _context6.prev = 14;
                        _context6.t0 = _context6['catch'](8);

                        console.error('Error in /acceptTos api call', this.session.uid, _context6.t0);
                        this.body = (0, _stringify2.default)({ error: _context6.t0.message });
                        this.status = 500;

                    case 19:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this, [[8, 14]]);
    }));
    router.post('/search', koaBody, /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
        var _ref3, csrf, params, elasticSearchService, searchEndpoint, searchPayload, req, searchResult, resultJson;

        return _regenerator2.default.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        _ref3 = typeof this.request.body === 'string' ? JSON.parse(this.request.body) : this.request.body, csrf = _ref3.csrf;

                        if ((0, _misc.checkCSRF)(this, csrf)) {
                            _context7.next = 3;
                            break;
                        }

                        return _context7.abrupt('return');

                    case 3:
                        _context7.prev = 3;
                        params = JSON.parse(this.request.body);
                        elasticSearchService = _config2.default.get('steem_elastic_search_endpoint');
                        searchEndpoint = null;

                        console.log(params.depth);
                        // 回复
                        if (params.depth === 1) {
                            searchEndpoint = elasticSearchService.concat('/hive_replies/_search?scroll=1m');
                        } else if (params.depth === 2) {
                            // 用户
                            searchEndpoint = elasticSearchService.concat('/hive_accounts/_search?scroll=1m');
                        } else {
                            // 帖子
                            searchEndpoint = elasticSearchService.concat('/hive_posts/_search?scroll=1m');
                        }

                        searchPayload = (0, _stringify2.default)(params.searchQuery);


                        if (params.scrollQuery) {
                            searchEndpoint = elasticSearchService.concat('/_search/scroll');
                            searchPayload = (0, _stringify2.default)(params.scrollQuery);
                        }

                        req = {
                            method: this.request.method,
                            headers: {
                                'Content-type': 'application/json'
                            },
                            body: searchPayload
                        };
                        _context7.next = 14;
                        return (0, _nodeFetch2.default)(searchEndpoint, req);

                    case 14:
                        searchResult = _context7.sent;
                        _context7.next = 17;
                        return searchResult.json();

                    case 17:
                        resultJson = _context7.sent;

                        this.body = (0, _stringify2.default)(resultJson);
                        this.status = 200;
                        _context7.next = 27;
                        break;

                    case 22:
                        _context7.prev = 22;
                        _context7.t0 = _context7['catch'](3);

                        console.error('Error in /search api call', this.session.uid, _context7.t0);
                        this.body = (0, _stringify2.default)({ error: _context7.t0.message });
                        this.status = 500;

                    case 27:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this, [[3, 22]]);
    }));
    router.get('/test_steem_market', /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
        var timepoints, data;
        return _regenerator2.default.wrap(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        timepoints = [{ timepoint: '2020-08-18T12:00:00Z', price_usd: '12250.0889773' }, { timepoint: '2020-08-18T13:00:00Z', price_usd: '12260.3148296' }, { timepoint: '2020-08-18T14:00:00Z', price_usd: '12167.8228289' }, { timepoint: '2020-08-18T15:00:00Z', price_usd: '12005.0074994' }, { timepoint: '2020-08-18T16:00:00Z', price_usd: '11986.8350721' }, { timepoint: '2020-08-18T17:00:00Z', price_usd: '12036.3091798' }, { timepoint: '2020-08-18T18:00:00Z', price_usd: '12028.9378102' }, { timepoint: '2020-08-18T19:00:00Z', price_usd: '12003.137178' }, { timepoint: '2020-08-18T20:00:00Z', price_usd: '12008.4364642' }, { timepoint: '2020-08-18T21:00:00Z', price_usd: '12023.6575825' }, { timepoint: '2020-08-18T22:00:00Z', price_usd: '12076.2749952' }, { timepoint: '2020-08-18T23:00:00Z', price_usd: '12067.4046651' }, { timepoint: '2020-08-19T00:00:00Z', price_usd: '11983.2200043' }, { timepoint: '2020-08-19T01:00:00Z', price_usd: '12006.2852368' }, { timepoint: '2020-08-19T02:00:00Z', price_usd: '11996.8557859' }, { timepoint: '2020-08-19T03:00:00Z', price_usd: '11953.2549565' }, { timepoint: '2020-08-19T04:00:00Z', price_usd: '11897.2228038' }, { timepoint: '2020-08-19T05:00:00Z', price_usd: '11809.8239793' }, { timepoint: '2020-08-19T06:00:00Z', price_usd: '11779.2416125' }, { timepoint: '2020-08-19T07:00:00Z', price_usd: '11751.5085188' }, { timepoint: '2020-08-19T08:00:00Z', price_usd: '11845.9507192' }, { timepoint: '2020-08-19T09:00:00Z', price_usd: '11833.3444898' }, { timepoint: '2020-08-19T10:00:00Z', price_usd: '11831.8872932' }, { timepoint: '2020-08-19T11:00:00Z', price_usd: '11817.9327232' }];
                        data = {
                            top_coins: [{
                                symbol: 'BTC',
                                name: 'Bitcoin',
                                timepoints: timepoints
                            }, {
                                symbol: 'ETH',
                                name: 'Ethereum',
                                timepoints: timepoints
                            }, {
                                symbol: 'XRP',
                                name: 'XRP',
                                timepoints: timepoints
                            }],
                            steem: {
                                symbol: 'STEEM',
                                name: 'Steem',
                                timepoints: timepoints
                            },
                            sbd: {
                                symbol: 'STEEM',
                                name: 'Steem',
                                timepoints: timepoints
                            },
                            tron: {
                                symbol: 'TRX',
                                name: 'Tron',
                                timepoints: timepoints
                            },
                            jst: {
                                symbol: 'JST',
                                name: 'JUST',
                                timepoints: timepoints
                            }
                        };

                        this.body = (0, _stringify2.default)(data);

                    case 3:
                    case 'end':
                        return _context8.stop();
                }
            }
        }, _callee8, this);
    }));
    router.get('/create_account', /*#__PURE__*/_regenerator2.default.mark(function _callee9() {
        var response, body;
        return _regenerator2.default.wrap(function _callee9$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        _context9.next = 2;
                        return (0, _nodeFetch2.default)(walletApiURI + '/create_account');

                    case 2:
                        response = _context9.sent;
                        _context9.next = 5;
                        return response.json();

                    case 5:
                        body = _context9.sent;

                        this.body = (0, _stringify2.default)(body);

                    case 7:
                    case 'end':
                        return _context9.stop();
                }
            }
        }, _callee9, this);
    }));

    router.get('/get_account', /*#__PURE__*/_regenerator2.default.mark(function _callee10() {
        var q, response, body;
        return _regenerator2.default.wrap(function _callee10$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        q = this.request.query;

                        if (q) {
                            _context10.next = 4;
                            break;
                        }

                        this.body = (0, _stringify2.default)({ error: 'need_params' });
                        return _context10.abrupt('return');

                    case 4:
                        _context10.next = 6;
                        return (0, _nodeFetch2.default)(walletApiURI + '/get_account?tron_address=' + q.tron_address);

                    case 6:
                        response = _context10.sent;
                        _context10.next = 9;
                        return response.json();

                    case 9:
                        body = _context10.sent;

                        this.body = (0, _stringify2.default)(body);

                    case 11:
                    case 'end':
                        return _context10.stop();
                }
            }
        }, _callee10, this);
    }));
    router.get('/get_config', /*#__PURE__*/_regenerator2.default.mark(function _callee11() {
        var q, response, body;
        return _regenerator2.default.wrap(function _callee11$(_context11) {
            while (1) {
                switch (_context11.prev = _context11.next) {
                    case 0:
                        q = this.request.query;

                        if (q) {
                            _context11.next = 4;
                            break;
                        }

                        this.body = (0, _stringify2.default)({ error: 'need_params' });
                        return _context11.abrupt('return');

                    case 4:
                        _context11.next = 6;
                        return (0, _nodeFetch2.default)(walletApiURI + '/get_config');

                    case 6:
                        response = _context11.sent;
                        _context11.next = 9;
                        return response.json();

                    case 9:
                        body = _context11.sent;

                        this.body = (0, _stringify2.default)(body);

                    case 11:
                    case 'end':
                        return _context11.stop();
                }
            }
        }, _callee11, this);
    }));
    router.get('/tron_user', /*#__PURE__*/_regenerator2.default.mark(function _callee12() {
        var q, response, body;
        return _regenerator2.default.wrap(function _callee12$(_context12) {
            while (1) {
                switch (_context12.prev = _context12.next) {
                    case 0:
                        q = this.request.query;

                        if (q) {
                            _context12.next = 4;
                            break;
                        }

                        this.body = (0, _stringify2.default)({ error: 'need_params' });
                        return _context12.abrupt('return');

                    case 4:
                        _context12.next = 6;
                        return (0, _nodeFetch2.default)(walletApiURI + '/tron_user?username=' + q.username);

                    case 6:
                        response = _context12.sent;
                        _context12.next = 9;
                        return response.json();

                    case 9:
                        body = _context12.sent;

                        this.body = (0, _stringify2.default)(body);

                    case 11:
                    case 'end':
                        return _context12.stop();
                }
            }
        }, _callee12, this);
    }));
    router.post('/tron_user', koaBody, /*#__PURE__*/_regenerator2.default.mark(function _callee13() {
        var data, request_base, request, response, body;
        return _regenerator2.default.wrap(function _callee13$(_context13) {
            while (1) {
                switch (_context13.prev = _context13.next) {
                    case 0:
                        data = typeof this.request.body === 'string' ? JSON.parse(this.request.body) : this.request.body;

                        if (!((typeof data === 'undefined' ? 'undefined' : (0, _typeof3.default)(data)) !== 'object')) {
                            _context13.next = 4;
                            break;
                        }

                        this.body = (0, _stringify2.default)({
                            error: 'valid_input_data'
                        });
                        return _context13.abrupt('return');

                    case 4:
                        if (!(data.username === undefined)) {
                            _context13.next = 7;
                            break;
                        }

                        this.body = (0, _stringify2.default)({
                            error: 'username_required'
                        });
                        return _context13.abrupt('return');

                    case 7:
                        request_base = {
                            method: 'post',
                            headers: {
                                Accept: 'application/json',
                                'Content-type': 'application/json'
                            }
                        };
                        request = (0, _assign2.default)({}, request_base, {
                            body: (0, _stringify2.default)(data)
                        });
                        _context13.next = 11;
                        return (0, _nodeFetch2.default)(walletApiURI + '/tron_user', request);

                    case 11:
                        response = _context13.sent;
                        _context13.next = 14;
                        return response.json();

                    case 14:
                        body = _context13.sent;

                        this.body = (0, _stringify2.default)(body);

                    case 16:
                    case 'end':
                        return _context13.stop();
                }
            }
        }, _callee13, this);
    }));
}

var parseSig = function parseSig(hexSig) {
    try {
        return _ecc.Signature.fromHex(hexSig);
    } catch (e) {
        return null;
    }
};