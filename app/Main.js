import 'babel-core/register';
import 'babel-polyfill';
import 'whatwg-fetch';
import './assets/stylesheets/app.scss';

import Iso from 'iso';
import universalRender from 'shared/UniversalRender';
import ConsoleExports from './utils/ConsoleExports';
import {serverApiRecordEvent} from 'app/utils/ServerApiClient';
import {logoutStorageHandler} from 'app/redux/UserSaga'

window.onerror = error => {
    serverApiRecordEvent('client_error', error);
};

if(process.env.BROWSER) {
    // You must trigger a storage event from another tab or window..
    window.addEventListener('storage', logoutStorageHandler, false)
}

Iso.bootstrap(initial_state => {
    console.log('Initial state', initial_state);
    window.$STM_Config = initial_state.offchain.config;
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
});

try {
    if(process.env.NODE_ENV === 'development') {
        // Adds some object refs to the global window object
        ConsoleExports.init(window)
    }
} catch (e) {
    console.error(e)
}
