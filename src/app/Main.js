/* eslint-disable no-multi-assign */
/* eslint-disable no-unused-vars */
/* eslint-disable space-before-function-paren */
/* eslint-disable no-fallthrough */
/* eslint-disable arrow-parens */
import 'babel-core/register';
import 'babel-polyfill';
import 'whatwg-fetch';
import store from 'store';
import Iso from 'iso';
import * as steem from '@steemit/steem-js';
// import { VIEW_MODE_WHISTLE, PARAM_VIEW_MODE } from 'shared/constants';
import frontendLogger from 'app/utils/FrontendLogger';
import plugins from 'app/utils/JsPlugins';
import { clientRender } from 'shared/UniversalRender';
import { serverApiRecordEvent } from 'app/utils/ServerApiClient';
import { determineViewMode, determineActivityTag } from 'app/utils/Links';
import ActivityTracker from 'app/utils/ActivityTracker';
import ConsoleExports from './utils/ConsoleExports';
import './assets/stylesheets/app.scss';

window.addEventListener('error', frontendLogger);

const CMD_LOG_T = 'log-t';
const CMD_LOG_TOGGLE = 'log-toggle';
const CMD_LOG_O = 'log-on';

try {
    if (process.env.NODE_ENV === 'development') {
        // Adds some object refs to the global window object
        ConsoleExports.init(window);
    }
} catch (e) {
    console.error('console_export', e);
}

function runApp(initial_state) {
    console.log('Initial state', initial_state);

    const konami = {
        code: 'xyzzy',
        enabled: false,
    };
    const buff = konami.code.split('');
    const cmd = command => {
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

    const enableKonami = () => {
        if (!window.s) {
            console.log('The cupie doll is yours.');
            window.s = command => {
                return cmd.call(this, command);
            };
        }
    };

    window.onunhandledrejection = function(evt) {
        console.error('unhandled rejection', evt ? evt.toString() : '<null>');
    };

    window.document.body.onkeypress = e => {
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

    const config = initial_state.offchain.config;

    const steemSelectedRpc = localStorage.getItem('steemSelectedRpc');

    if (steemSelectedRpc) {
        localStorage.setItem(
            'steemSelectedRpc',
            config.steemd_connection_client
        );
    }

    steem.api.setOptions({
        url: steemSelectedRpc || config.steemd_connection_client,
        retry: true,
        useAppbaseApi: !!config.steemd_use_appbase,
    });
    steem.config.set('address_prefix', config.address_prefix);
    steem.config.set('chain_id', config.chain_id);
    window.$STM_Config = config;
    plugins(config);
    if (initial_state.offchain.serverBusy) {
        window.$STM_ServerBusy = true;
    }
    if (initial_state.offchain.csrf) {
        window.$STM_csrf = initial_state.offchain.csrf;
        delete initial_state.offchain.csrf;
    }

    initial_state.app.viewMode = determineViewMode(window.location.search);

    window.activityTag = initial_state.app.activityTag;
    const currentActivityTag = determineActivityTag(window.location.hash);
    if (currentActivityTag !== false) {
        ActivityTracker(currentActivityTag, initial_state.app.trackingId);
        console.log('activityTag:', currentActivityTag);
    }

    const locale = store.get('language');
    if (locale) initial_state.user.locale = locale;
    initial_state.user.maybeLoggedIn = !!store.get('autopost2');
    if (initial_state.user.maybeLoggedIn) {
        const username = new Buffer(store.get('autopost2'), 'hex')
            .toString()
            .split('\t')[0];
        initial_state.user.current = {
            username,
        };
    }

    const location = `${window.location.pathname}${window.location.search}${
        window.location.hash
    }`;

    try {
        clientRender(initial_state);
    } catch (error) {
        console.error('render_error', error);
        serverApiRecordEvent('client_error', error);
    }
}

if (!window.Intl) {
    require.ensure(
        ['intl/dist/Intl'],
        require => {
            window.IntlPolyfill = window.Intl = require('intl/dist/Intl');
            require('intl/locale-data/jsonp/en-US.js');
            require('intl/locale-data/jsonp/es.js');
            require('intl/locale-data/jsonp/ru.js');
            require('intl/locale-data/jsonp/fr.js');
            require('intl/locale-data/jsonp/it.js');
            require('intl/locale-data/jsonp/ko.js');
            require('intl/locale-data/jsonp/ja.js');
            Iso.bootstrap(runApp);
        },
        'IntlBundle'
    );
} else {
    Iso.bootstrap(runApp);
}
