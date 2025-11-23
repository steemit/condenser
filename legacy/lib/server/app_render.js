'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var appRender = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(ctx) {
        var locales = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var resolvedAssets = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        var store, userPreferences, locale, _supportedLocales, localeIsSupported, login_challenge, offchain, adSwipe, tronAds, googleAds, cookieConsent, initial_state, _ref2, body, title, statusCode, meta, redirectUrl, assets, assets_filename, props, error, redirect, pathname, search;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        ctx.state.requestTimer.startTimer('appRender_ms');
                        store = {};
                        // This is the part of SSR where we make session-specific changes:

                        _context.prev = 2;
                        userPreferences = {};

                        if (ctx.session.user_prefs) {
                            try {
                                userPreferences = JSON.parse(ctx.session.user_prefs);
                            } catch (err) {
                                console.error('cannot parse user preferences:', ctx.session.uid, err);
                            }
                        }
                        // remove this block code, if we need zh language package.
                        if (userPreferences.locale == 'zh') {
                            userPreferences.locale = undefined;
                        }
                        if (!userPreferences.locale) {
                            locale = ctx.getLocaleFromHeader();

                            if (locale) locale = locale.substring(0, 2);
                            _supportedLocales = locales ? locales : (0, _misc.getSupportedLocales)();
                            localeIsSupported = _supportedLocales.find(function (l) {
                                return l === locale;
                            });

                            if (!localeIsSupported) locale = 'en';
                            userPreferences.locale = locale;
                        }
                        login_challenge = ctx.session.login_challenge;

                        if (!login_challenge) {
                            login_challenge = _secureRandom2.default.randomBuffer(16).toString('hex');
                            ctx.session.login_challenge = login_challenge;
                        }
                        _context.t0 = ctx.csrf;
                        _context.t1 = ctx.session.new_visit;
                        _context.t2 = $STM_Config;
                        _context.next = 14;
                        return ctx.app.specialPostsPromise;

                    case 14:
                        _context.t3 = _context.sent;
                        _context.t4 = login_challenge;
                        offchain = {
                            csrf: _context.t0,
                            new_visit: _context.t1,
                            config: _context.t2,
                            special_posts: _context.t3,
                            login_challenge: _context.t4
                        };
                        adSwipe = {
                            enabled: _config2.default.adswipe_enabled === 'true'
                        };
                        tronAds = {
                            enabled: _config2.default.tronads_enabled === 'true',
                            env: _config2.default.tronads_env == 2 ? 2 : 1,
                            is_mock: _config2.default.tronads_env == 2 ? 0 : 1,
                            sidebar_ad_pid: _config2.default.tronads_sidebar_ad_pid,
                            content_pc_ad_pid: _config2.default.tronads_content_pc_ad_pid,
                            content_mobile_ad_pid: _config2.default.tronads_content_mobile_ad_pid
                        };
                        googleAds = {
                            enabled: _config2.default.google_ad_enabled === 'true',
                            test: !!_config2.default.google_ad_test,
                            client: _config2.default.google_ad_client,
                            adSlots: _config2.default.google_ad_slots,
                            gptEnabled: !!_config2.default.gpt_enabled,
                            gptBidding: _config2.default.gpt_bidding,
                            gptBasicSlots: _config2.default.gpt_basic_slots,
                            gptCategorySlots: _config2.default.gpt_category_slots,
                            gptBiddingSlots: _config2.default.gpt_bidding_slots,
                            gptBannedTags: _config2.default.gpt_banned_tags,
                            videoAdsEnabled: !!_config2.default.video_ads_enabled
                        };
                        cookieConsent = {
                            enabled: !!_config2.default.cookie_consent_enabled,
                            api_key: _config2.default.cookie_consent_api_key
                        };
                        // ... and that's the end of user-session-related SSR

                        initial_state = {
                            app: {
                                viewMode: (0, _Links.determineViewMode)(ctx.request.search),
                                adSwipe: adSwipe,
                                tronAds: tronAds,
                                googleAds: googleAds,
                                env: process.env.NODE_ENV,
                                walletUrl: _config2.default.wallet_url,
                                steemMarket: ctx.steemMarketData,
                                tronPrice: ctx.tronPriceData,
                                trackingId: ctx.session.uid,
                                tron_host: _config2.default.get('tron_create_node'),
                                tron_reward_switch: 'off',
                                vests_per_trx: null,
                                unbind_tip_limit: 5,
                                frontend_has_rendered: false,
                                activityTag: _config2.default.activity_tag !== '' ? _config2.default.activity_tag.split(',') : [],
                                image_host: _config2.default.get('img_proxy_prefix') ? _config2.default.get('img_proxy_prefix') : 'https://steemitimages.com/',
                                site_domain: _config2.default.get('site_domain') ? _config2.default.get('site_domain') : 'steemit.com'
                            }
                        };
                        _context.next = 24;
                        return (0, _UniversalRender.serverRender)(ctx.request.url, initial_state, _serverError2.default, userPreferences, offchain, ctx.state.requestTimer);

                    case 24:
                        _ref2 = _context.sent;
                        body = _ref2.body;
                        title = _ref2.title;
                        statusCode = _ref2.statusCode;
                        meta = _ref2.meta;
                        redirectUrl = _ref2.redirectUrl;

                        if (!redirectUrl) {
                            _context.next = 35;
                            break;
                        }

                        console.log('Redirecting to', redirectUrl);
                        ctx.status = 302;
                        ctx.redirect(redirectUrl);
                        return _context.abrupt('return');

                    case 35:
                        assets = void 0;
                        // If resolvedAssets argument parameter is falsey we infer that we are in
                        // development mode and therefore resolve the assets on each render.

                        if (!resolvedAssets) {
                            // Assets name are found in `webpack-stats` file
                            assets_filename = ROOT + '/tmp/webpack-stats-dev.json';

                            assets = require(assets_filename);
                            delete require.cache[require.resolve(assets_filename)];
                        } else {
                            assets = resolvedAssets;
                        }
                        props = {
                            body: body,
                            assets: assets,
                            title: title,
                            meta: meta,
                            google_analytics_id: _config2.default.google_analytics_id,
                            csp_nonce: ctx.session.cspNonce
                        };

                        ctx.status = statusCode;
                        ctx.body = '<!DOCTYPE html>' + (0, _server.renderToString)(_react2.default.createElement(_serverHtml2.default, props));
                        _context.next = 50;
                        break;

                    case 42:
                        _context.prev = 42;
                        _context.t5 = _context['catch'](2);

                        // Render 500 error page from server
                        console.error('AppRender error', _context.t5, redirect);
                        error = _context.t5.error, redirect = _context.t5.redirect;

                        if (!error) {
                            _context.next = 48;
                            break;
                        }

                        throw error;

                    case 48:

                        // Handle component `onEnter` transition
                        if (redirect) {
                            pathname = redirect.pathname, search = redirect.search;

                            ctx.redirect(pathname + search);
                        }

                        throw _context.t5;

                    case 50:

                        ctx.state.requestTimer.stopTimer('appRender_ms');

                    case 51:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[2, 42]]);
    }));

    return function appRender(_x) {
        return _ref.apply(this, arguments);
    };
}();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _server = require('react-dom/server');

var _constants = require('../shared/constants');

var _serverHtml = require('./server-html');

var _serverHtml2 = _interopRequireDefault(_serverHtml);

var _UniversalRender = require('../shared/UniversalRender');

var _secureRandom = require('secure-random');

var _secureRandom2 = _interopRequireDefault(_secureRandom);

var _serverError = require('server/server-error');

var _serverError2 = _interopRequireDefault(_serverError);

var _Links = require('../app/utils/Links');

var _misc = require('./utils/misc');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = require('path');
var ROOT = path.join(__dirname, '../..');
var DB_RECONNECT_TIMEOUT = process.env.NODE_ENV === 'development' ? 1000 * 60 * 60 : 1000 * 60 * 10;

var supportedLocales = (0, _misc.getSupportedLocales)();

appRender.dbStatus = { ok: true };
module.exports = appRender;