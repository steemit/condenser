'use strict';

require('babel-core/register');

require('babel-polyfill');

require('whatwg-fetch');

var _store = require('store');

var _store2 = _interopRequireDefault(_store);

var _iso = require('iso');

var _iso2 = _interopRequireDefault(_iso);

var _steemJs = require('@steemit/steem-js');

var steem = _interopRequireWildcard(_steemJs);

var _FrontendLogger = require('app/utils/FrontendLogger');

var _FrontendLogger2 = _interopRequireDefault(_FrontendLogger);

var _UniversalRender = require('shared/UniversalRender');

var _ServerApiClient = require('app/utils/ServerApiClient');

var _Links = require('app/utils/Links');

var _ActivityTracker = require('app/utils/ActivityTracker');

var _ActivityTracker2 = _interopRequireDefault(_ActivityTracker);

var _ConsoleExports = require('./utils/ConsoleExports');

var _ConsoleExports2 = _interopRequireDefault(_ConsoleExports);

require('./assets/stylesheets/app.scss');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import plugins from 'app/utils/JsPlugins';
window.addEventListener('error', _FrontendLogger2.default);
// import { VIEW_MODE_WHISTLE, PARAM_VIEW_MODE } from 'shared/constants';
/* eslint-disable no-multi-assign */
/* eslint-disable no-unused-vars */
/* eslint-disable space-before-function-paren */
/* eslint-disable no-fallthrough */
/* eslint-disable arrow-parens */


var CMD_LOG_T = 'log-t';
var CMD_LOG_TOGGLE = 'log-toggle';
var CMD_LOG_O = 'log-on';

try {
    if (process.env.NODE_ENV === 'development') {
        // Adds some object refs to the global window object
        _ConsoleExports2.default.init(window);
    }
} catch (e) {
    console.error('console_export', e);
}

function runApp(initial_state) {
    var _this = this;

    console.log('Initial state', initial_state);

    var konami = {
        code: 'xyzzy',
        enabled: false
    };
    var buff = konami.code.split('');
    var cmd = function cmd(command) {
        console.log('got command:' + command);
        switch (command) {
            case CMD_LOG_O:
                konami.enabled = false;
            case CMD_LOG_TOGGLE:
            case CMD_LOG_T:
                konami.enabled = !konami.enabled;
                if (konami.enabled) {
                    steem.api.setOptions({ logger: console });
                } else {
                    steem.api.setOptions({ logger: false });
                }
                return 'api logging ' + konami.enabled;
            default:
                return 'That command is not supported.';
        }
        //return 'done';
    };

    var enableKonami = function enableKonami() {
        if (!window.s) {
            console.log('The cupie doll is yours.');
            window.s = function (command) {
                return cmd.call(_this, command);
            };
        }
    };

    window.onunhandledrejection = function (evt) {
        console.error('unhandled rejection', evt ? evt.toString() : '<null>');
    };

    window.document.body.onkeypress = function (e) {
        buff.shift();
        buff.push(e.key);
        if (buff.join('') === konami.code) {
            enableKonami();
            cmd(CMD_LOG_T);
        }
    };

    if (window.location.hash.indexOf('#' + konami.code) === 0) {
        enableKonami();
        cmd(CMD_LOG_O);
    }

    var config = initial_state.offchain.config;

    var steemSelectedRpc = localStorage.getItem('steemSelectedRpc');

    if (!steemSelectedRpc) {
        localStorage.setItem('steemSelectedRpc', config.steemd_connection_client);
    }

    steem.api.setOptions({
        url: steemSelectedRpc || config.steemd_connection_client,
        retry: true,
        useAppbaseApi: !!config.steemd_use_appbase
    });
    steem.config.set('address_prefix', config.address_prefix);
    steem.config.set('chain_id', config.chain_id);
    window.$STM_Config = config;
    // plugins(config);
    if (initial_state.offchain.serverBusy) {
        window.$STM_ServerBusy = true;
    }
    if (initial_state.offchain.csrf) {
        window.$STM_csrf = initial_state.offchain.csrf;
        delete initial_state.offchain.csrf;
    }

    initial_state.app.viewMode = (0, _Links.determineViewMode)(window.location.search);

    window.activityTag = initial_state.app.activityTag;
    var currentActivityTag = (0, _Links.determineActivityTag)(window.location.hash);
    if (currentActivityTag !== false) {
        (0, _ActivityTracker2.default)(currentActivityTag, initial_state.app.trackingId);
        console.log('activityTag:', currentActivityTag);
    }

    var locale = _store2.default.get('language');
    if (locale) initial_state.user.locale = locale;
    initial_state.user.maybeLoggedIn = !!_store2.default.get('autopost2');
    if (initial_state.user.maybeLoggedIn) {
        var username = new Buffer(_store2.default.get('autopost2'), 'hex').toString().split('\t')[0];
        initial_state.user.current = {
            username: username
        };
    }

    var location = '' + window.location.pathname + window.location.search + window.location.hash;

    try {
        (0, _UniversalRender.clientRender)(initial_state);
    } catch (error) {
        console.error('render_error', error);
        (0, _ServerApiClient.serverApiRecordEvent)('client_error', error);
    }
}

if (!window.Intl) {
    require.ensure(['intl/dist/Intl'], function (require) {
        window.IntlPolyfill = window.Intl = require('intl/dist/Intl');
        require('intl/locale-data/jsonp/en-US.js');
        require('intl/locale-data/jsonp/es.js');
        require('intl/locale-data/jsonp/ru.js');
        require('intl/locale-data/jsonp/fr.js');
        require('intl/locale-data/jsonp/it.js');
        require('intl/locale-data/jsonp/ko.js');
        require('intl/locale-data/jsonp/ja.js');
        _iso2.default.bootstrap(runApp);
    }, 'IntlBundle');
} else {
    _iso2.default.bootstrap(runApp);
}