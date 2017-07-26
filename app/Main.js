import 'babel-core/register';
import 'babel-polyfill';
import 'whatwg-fetch';
import './assets/stylesheets/app.scss';
import plugins from 'app/utils/JsPlugins';
import Iso from 'iso';
import universalRender from 'shared/UniversalRender';
import ConsoleExports from './utils/ConsoleExports';
import {serverApiRecordEvent} from 'app/utils/ServerApiClient';
import * as steem from 'steem';

window.onerror = error => {
    if (window.$STM_csrf) serverApiRecordEvent('client_error', error);
};

try {
    if(process.env.NODE_ENV === 'development') {
        // Adds some object refs to the global window object
        ConsoleExports.init(window)
    }
} catch (e) {
    console.error(e)
}

function runApp(initial_state) {
    console.log('Initial state', initial_state);
    const config = initial_state.offchain.config
    steem.config.set('websocket', config.ws_connection_client);
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

    const location = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    universalRender({history, location, initial_state})
    .catch(error => {
        console.error(error);
        serverApiRecordEvent('client_error', error);
    });
}

if (!window.Intl) {
    require.ensure(['intl/dist/Intl'], (require) => {
        window.IntlPolyfill = window.Intl = require('intl/dist/Intl')
        require('intl/locale-data/jsonp/en-US.js')
        Iso.bootstrap(runApp);
    }, "IntlBundle");
}
else {
    Iso.bootstrap(runApp);
}
