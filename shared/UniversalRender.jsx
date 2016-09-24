/* eslint react/display-name: 0 */
/* eslint space-before-function-paren:0 */
// https://github.com/eslint/eslint/issues/4442
import Iso from 'iso';
import React from 'react';
import { render } from 'react-dom';
import { renderToString } from 'react-dom/server';
import { Router, RouterContext, match, applyRouterMiddleware } from 'react-router';
import Apis from './api_client/ApiInstances';
import { Provider } from 'react-redux';
import RootRoute from 'app/RootRoute';
import ErrorPage from 'server/server-error';
import {createStore, applyMiddleware, compose} from 'redux';
import { browserHistory } from 'react-router';
//import useScroll from 'scroll-behavior/lib/useStandardScroll';
import useScroll from 'react-router-scroll';
import createSagaMiddleware from 'redux-saga';
import { syncHistoryWithStore } from 'react-router-redux';
import rootReducer from 'app/redux/RootReducer';
// import DevTools from 'app/redux/DevTools';
import {fetchDataWatches} from 'app/redux/FetchDataSaga';
import {marketWatches} from 'app/redux/MarketSaga';
import {sharedWatches} from 'app/redux/SagaShared';
import {userWatches} from 'app/redux/UserSaga';
import {authWatches} from 'app/redux/AuthSaga';
import {transactionWatches} from 'app/redux/TransactionSaga';
import PollDataSaga from 'app/redux/PollDataSaga';
import {component as NotFound} from 'app/components/pages/NotFound';
import extractMeta from 'app/utils/ExtractMeta';
import {serverApiRecordEvent} from 'app/utils/ServerApiClient';

const sagaMiddleware = createSagaMiddleware(
    ...userWatches, // keep first to remove keys early when a page change happens
    ...fetchDataWatches,
    ...sharedWatches,
    ...authWatches,
    ...transactionWatches,
    ...marketWatches
);

let middleware;

if (process.env.BROWSER && process.env.NODE_ENV === 'development') {
    middleware = compose(
        applyMiddleware(sagaMiddleware)
        // DevTools.instrument()
    );
} else {
    middleware = applyMiddleware(sagaMiddleware);
}

const runRouter = (location, routes) => {
    return new Promise((resolve) =>
        match({routes, location}, (...args) => resolve(args)));
};

const onRouterError = (error) => {
    console.error('onRouterError', error);
};

async function universalRender({ location, initial_state, offchain }) {
    let error, redirect, renderProps;
    try {
        [error, redirect, renderProps] = await runRouter(location, RootRoute);
    } catch (e) {
        console.error('Router error:', e.toString(), location);
        return {
            title: 'Server error (500) - Steemit',
            statusCode: 500,
            body: renderToString(<ErrorPage />)
        };
    }
    if (error || !renderProps) {
        // debug('error')('Router error', error);
        return {
            title: 'Page Not Found (404) - Steemit',
            statusCode: 404,
            body: renderToString(<NotFound />)
        };
    }

    if (process.env.BROWSER) {
        const store = createStore(rootReducer, initial_state, middleware);
        sagaMiddleware.run(PollDataSaga).done
            .then(() => console.log('PollDataSaga is finished'))
            .catch(err => console.log('PollDataSaga is finished with error', err));
        const ws_connection_status_cb = status => {
            store.dispatch({type: 'WS_CONNECTION_STATUS', payload: {status}});
        };
        const ws_request_status_cb = payload => {
            store.dispatch({type: 'RPC_REQUEST_STATUS', payload});
        };
        try {
            await Apis.instance(ws_connection_status_cb, ws_request_status_cb).init();
        } catch (e) {
            console.error('Api init error: ', e);
            if (e.toString && e.toString().match(/ReferenceError.+WebSocket/)) {
                const message = 'Warning! This browser does not support web sockets communication, some elements of the website may not be displayed properly. Please upgrade your browser.';
                store.dispatch({type: 'ADD_NOTIFICATION', payload: {key: 'websocket', message}});
            } else {
                serverApiRecordEvent('client_error', e);
            }
        }
        const history = syncHistoryWithStore(browserHistory, store);
        // const scrollHistory = useScroll(() => history)();

        window.store = {
            getState: () => {debugger}
        }
        // Bump transaction (for live UI testing).. Put 0 in now (no effect),
        // to enable browser's autocomplete and help prevent typos.
        window.bump = parseInt(localStorage.getItem('bump') || 0);
        const scroll = useScroll((prevLocation, newLocation) => {
            return !newLocation.location.hash;
            return !prevLocation || prevLocation.location.pathname !== newLocation.location.pathname;
        });
        if (process.env.NODE_ENV === 'production') {
            console.log('%c%s','color: red; background: yellow; font-size: 24px;', 'WARNING!');
            console.log('%c%s','color: black; font-size: 16px;', 'This is a developer console, you must read and understand anything you paste or type here or you could compromise your account and your private keys.');
        }
        return render(
            <Provider store={store}>
                <Router
                    routes={RootRoute}
                    history={history}
                    onError={onRouterError}
                    render={applyRouterMiddleware(scroll)} />
            </Provider>,
            document.getElementById('content')
        );
    }

    // below is only executed on the server
    let server_store, onchain;
    try {
        let url = location === '/' ? 'trending' : location;
        // Replace /curation-rewards and /author-rewards with /transfers for UserProfile
        // to resolve data correctly
        if (url.indexOf('/curation-rewards') !== -1) url = url.replace(/\/curation-rewards$/, '/transfers');
        if (url.indexOf('/author-rewards') !== -1) url = url.replace(/\/author-rewards$/, '/transfers');

        onchain = await Apis.instance().db_api.exec('get_state', [url]);

        // Calculate signup bonus
        const fee = parseFloat($STM_Config.registrar_fee.split(' ')[0]),
              {base, quote} = onchain.feed_price,
              feed = parseFloat(base.split(' ')[0]) / parseFloat(quote.split(' ')[0]);
        const sd = fee * feed,
              sdInt = parseInt(sd),
              sdDec = (sd - sdInt),
              sdDisp = '$' + sdInt + (sdInt < 5 && sdDec >= 0.5 ? '.50' : '');

        offchain.signup_bonus = sdDisp;
        offchain.server_location = location;
        server_store = createStore(rootReducer, { global: onchain, offchain});
        server_store.dispatch({type: '@@router/LOCATION_CHANGE', payload: {pathname: location}});
    } catch (e) {
        const msg = (e.toString && e.toString()) || e.message || e;
        const stack_trace = e.stack || '[no stack]';
        console.error('State/store error: ', msg, stack_trace);
        return {
            title: 'Server error (500) - Steemit',
            statusCode: 500,
            body: renderToString(<ErrorPage />)
        };
    }

    let app, status, meta;
    try {
        app = renderToString(
            <Provider store={server_store}>
                <RouterContext { ...renderProps } />
            </Provider>
        );
        meta = extractMeta(onchain, renderProps.params);
        status = 200;
    } catch (re) {
        console.error('Rendering error: ', re, re.stack);
        app = renderToString(<ErrorPage />);
        status = 500;
    }

    return {
        title: 'Steemit',
        titleBase: 'Steemit - ',
        meta,
        statusCode: status,
        body: Iso.render(app, server_store.getState())
    };
}

export default universalRender;
