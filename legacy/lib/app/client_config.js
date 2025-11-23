'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
// sometimes it's impossible to use html tags to style coin name, hence usage of _UPPERCASE modifier
var APP_NAME = exports.APP_NAME = 'Steemit';
// sometimes APP_NAME is written in non-latin characters, but they are needed for technical purposes
// ie. "Голос" > "Golos"
var APP_NAME_LATIN = exports.APP_NAME_LATIN = 'Steemit';
var APP_NAME_UPPERCASE = exports.APP_NAME_UPPERCASE = 'STEEMIT';
var APP_ICON = exports.APP_ICON = 'steem';
// FIXME figure out best way to do this on both client and server from env
// vars. client should read $STM_Config, server should read config package.
var APP_URL = exports.APP_URL = 'https://steemit.com';
var APP_DOMAIN = exports.APP_DOMAIN = 'steemit.com';
var LIQUID_TOKEN = exports.LIQUID_TOKEN = 'Steem';
// sometimes it's impossible to use html tags to style coin name, hence usage of _UPPERCASE modifier
var LIQUID_TOKEN_UPPERCASE = exports.LIQUID_TOKEN_UPPERCASE = 'STEEM';
var VESTING_TOKEN = exports.VESTING_TOKEN = 'STEEM POWER';
var INVEST_TOKEN_UPPERCASE = exports.INVEST_TOKEN_UPPERCASE = 'STEEM POWER';
var INVEST_TOKEN_SHORT = exports.INVEST_TOKEN_SHORT = 'SP';
var INVEST_TRON_SHORT = exports.INVEST_TRON_SHORT = 'TRX';
var DEBT_TOKEN = exports.DEBT_TOKEN = 'STEEM DOLLAR';
var DEBT_TOKENS = exports.DEBT_TOKENS = 'STEEM DOLLARS';
var CURRENCY_SIGN = exports.CURRENCY_SIGN = '$';
var WIKI_URL = exports.WIKI_URL = ''; // https://wiki.golos.io/
var LANDING_PAGE_URL = exports.LANDING_PAGE_URL = 'https://steem.io/';
var TERMS_OF_SERVICE_URL = exports.TERMS_OF_SERVICE_URL = 'https://' + APP_DOMAIN + '/tos.html';
var PRIVACY_POLICY_URL = exports.PRIVACY_POLICY_URL = 'https://' + APP_DOMAIN + '/privacy.html';
var WHITEPAPER_URL = exports.WHITEPAPER_URL = 'https://steem.io/SteemWhitePaper.pdf';

// these are dealing with asset types, not displaying to client, rather sending data over websocket
var LIQUID_TICKER = exports.LIQUID_TICKER = 'STEEM';
var VEST_TICKER = exports.VEST_TICKER = 'VESTS';
var DEBT_TICKER = exports.DEBT_TICKER = 'SBD';
var DEBT_TOKEN_SHORT = exports.DEBT_TOKEN_SHORT = 'SBD';

// application settings
var DEFAULT_LANGUAGE = exports.DEFAULT_LANGUAGE = 'en'; // used on application internationalization bootstrap
var DEFAULT_CURRENCY = exports.DEFAULT_CURRENCY = 'USD';
var ALLOWED_CURRENCIES = exports.ALLOWED_CURRENCIES = ['USD'];

// meta info
var TWITTER_HANDLE = exports.TWITTER_HANDLE = '@steemit';
var SHARE_IMAGE = exports.SHARE_IMAGE = 'https://' + APP_DOMAIN + '/images/steemit-share.png';
var TWITTER_SHARE_IMAGE = exports.TWITTER_SHARE_IMAGE = 'https://' + APP_DOMAIN + '/images/steemit-twshare.png';
var SITE_DESCRIPTION = exports.SITE_DESCRIPTION = 'Steemit is a social media platform where everyone gets paid for ' + 'creating and curating content. It leverages a robust digital points system, called Steem, that ' + 'supports real value for digital rewards through market price discovery and liquidity';

// various
var SUPPORT_EMAIL = exports.SUPPORT_EMAIL = 'support@' + APP_DOMAIN;