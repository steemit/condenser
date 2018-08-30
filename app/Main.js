import '@babel/register';
import '@babel/polyfill';
import 'whatwg-fetch';
import './assets/stylesheets/app.scss';
import plugins from 'app/utils/JsPlugins';
import { serverApiRecordEvent } from 'app/utils/ServerApiClient';
import Iso from 'iso';
import clientRender from 'app/clientRender';
import * as golos from 'golos-js';

// window.onerror = error => {
//     if (window.$STM_csrf) serverApiRecordEvent('client_error', error);
// };

function runApp(initialState) {
    const config = initialState.offchain.config
    golos.config.set('websocket', config.ws_connection_client)
    golos.config.set('chain_id', config.chain_id);
    window.$STM_Config = config;
    plugins(config);

    if (initialState.offchain.serverBusy) {
        window.$STM_ServerBusy = true;
    }
    if (initialState.offchain.csrf) {
        window.$STM_csrf = initialState.offchain.csrf;
        delete initialState.offchain.csrf;
    }

    try {
        clientRender(initialState)
    } catch (error) {
        console.error(error)
        serverApiRecordEvent('client_error', error)
    }
}

if (!window.Intl) {
    require.ensure(
        ['intl/dist/Intl'],
        (require) => {
            window.IntlPolyfill = window.Intl = require('intl/dist/Intl')
            require('intl/locale-data/jsonp/en-US.js')
            Iso.bootstrap(runApp)
        },
        'IntlBundle'
    )
} else {
    Iso.bootstrap(runApp)
}


