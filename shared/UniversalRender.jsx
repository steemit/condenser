/* eslint react/display-name: 0 */
/* eslint space-before-function-paren:0 */
// https://github.com/eslint/eslint/issues/4442
import Iso from 'iso';
import React from 'react';
import { render } from 'react-dom';
import { renderToString } from 'react-dom/server';
import {
    Router,
    RouterContext,
    match,
    applyRouterMiddleware
} from 'react-router';
import * as api from 'app/utils/APIWrapper'
import { Provider } from 'react-redux';
import RootRoute from 'app/RootRoute';
import {createStore, applyMiddleware, compose} from 'redux';
import { browserHistory } from 'react-router';
import { useScroll } from 'react-router-scroll';
import createSagaMiddleware from 'redux-saga';
import { syncHistoryWithStore } from 'react-router-redux';
import rootReducer from 'app/redux/RootReducer';
import rootSaga from 'app/redux/RootSaga';
import {component as NotFound} from 'app/components/pages/NotFound';
import extractMeta from 'app/utils/ExtractMeta';
import Translator from 'app/Translator';
import getState from 'app/utils/StateBuilder';
import {routeRegex} from "app/ResolveRoute";
import { contentStats, calcVotesStats } from 'app/utils/StateFunctions'
import {APP_NAME, IGNORE_TAGS, SEO_TITLE} from 'app/client_config';

const runRouter = (location, routes) => {
    return new Promise((resolve) =>
        match({routes, location}, (...args) => resolve(args)));
};

const onRouterError = (error) => {
    console.error('onRouterError', error);
};

export async function serverRender({
    location,
    offchain,
    ErrorPage,
}) {
    let error, redirect, renderProps;

    try {
        [error, redirect, renderProps] = await runRouter(location, RootRoute);
    } catch (e) {
        console.error('Routing error:', e.toString(), location);
        return {
            title: 'Routing error - ' + APP_NAME,
            statusCode: 500,
            body: renderToString(ErrorPage ? <ErrorPage /> : <span>Routing error</span>)
        };
    }
    if (error || !renderProps) {
        // debug('error')('Router error', error);
        return {
            title: 'Page Not Found - ' + APP_NAME,
            statusCode: 404,
            body: renderToString(<NotFound />)
        };
    }

    // below is only executed on the server
    let serverStore, onchain;
    try {
        let url = location === '/' ? 'trending' : location;
        // Replace /curation-rewards and /author-rewards with /transfers for UserProfile to resolve data correctly
        if (url.indexOf('/curation-rewards') !== -1) url = url.replace(/\/curation-rewards$/, '/transfers');
        if (url.indexOf('/author-rewards') !== -1) url = url.replace(/\/author-rewards$/, '/transfers');

        const options = { IGNORE_TAGS }

        onchain = await getState(api, url, options, offchain)

         // protect for invalid account
        if (Object.getOwnPropertyNames(onchain.accounts).length === 0 && (location.match(routeRegex.UserProfile1) || location.match(routeRegex.UserProfile3))) {
            return {
                title: 'User Not Found - ' + APP_NAME,
                statusCode: 404,
                body: renderToString(<NotFound />)
            };
        }

        // If we are not loading a post, truncate state data to bring response size down.
        if (!url.match(routeRegex.Post)) {
            for (let key in onchain.content) {
                const post = onchain.content[key];
                //onchain.content[key]['body'] = onchain.content[key]['body'].substring(0, 1024) // TODO: can be removed. will be handled by steemd
                // Count some stats then remove voting data. But keep current user's votes. (#1040)
                post.stats = contentStats(post)
                post.votesSummary = calcVotesStats(post['active_votes'], offchain.account);
                post['active_votes'] = post['active_votes'].filter(vote => vote.voter === offchain.account)
            }
        }

        if (!url.match(routeRegex.PostsIndex) && !url.match(routeRegex.UserProfile1) && !url.match(routeRegex.UserProfile2) && url.match(routeRegex.PostNoCategory)) {
            const params = url.substr(2, url.length - 1).split("/");
            const content = await api.getContent(params[0], params[1]);
            if (content.author && content.permlink) { // valid short post url
                onchain.content[url.substr(2, url.length - 1)] = content;
            } else { // protect on invalid user pages (i.e /user/transferss)
                return {
                    title: 'Page Not Found - ' + APP_NAME,
                    statusCode: 404,
                    body: renderToString(<NotFound />)
                };
            }
        }
        // Calculate signup bonus
        const fee = parseFloat($STM_Config.registrar_fee.split(' ')[0]),
              {base, quote} = onchain.feed_price,
              feed = parseFloat(base.split(' ')[0]) / parseFloat(quote.split(' ')[0]);
        const sd = fee * feed,
              sdInt = parseInt(sd),
              sdDec = (sd - sdInt),
              sdDisp = sdInt + (sdInt < 5 && sdDec >= 0.5 ? '.50' : '');

        offchain.signup_bonus = sdDisp;
        offchain.server_location = location;
        serverStore = createStore(rootReducer, { global: onchain, offchain});
        serverStore.dispatch({type: '@@router/LOCATION_CHANGE', payload: {pathname: location}});
    } catch (e) {
        // Ensure 404 page when username not found
        if (location.match(routeRegex.UserProfile1)) {
            console.error('User/not found: ', location);
            return {
                title: 'Page Not Found - ' + APP_NAME,
                statusCode: 404,
                body: renderToString(<NotFound />)
            };
        // Ensure error page on state exception
        } else {
            const msg = (e.toString && e.toString()) || e.message || e;
            const stack_trace = e.stack || '[no stack]';
            console.error('State/store error: ', msg, stack_trace);
            return {
                title: 'Server error - ' + APP_NAME,
                statusCode: 500,
                body: renderToString(<ErrorPage />)
            };
        }
    }

    let app, status, meta;
    try {
        app = renderToString(
            <Provider store={serverStore}>
                <Translator>
                    <RouterContext { ...renderProps } />
                </Translator>
            </Provider>
        );
        meta = extractMeta(onchain, renderProps.params);
        status = 200;
    } catch (re) {
        console.error('Rendering error: ', re, re.stack);
        app = renderToString(<ErrorPage />);
        status = 500;
    }

    const body = Iso.render(app, serverStore.getState());

    return {
        title: SEO_TITLE,
        titleBase: SEO_TITLE + ' - ',
        meta,
        statusCode: status,
        body,
    };
}

let store = null;

export function getStoreState() {
    if (!store) {
        throw new Error('NO_STORE');
    }

    return store.getState();
}

export function clientRender(initialState) {
    let monitor;
    let sagaMiddleware;
    let middleware;

    let sagaDev;

    if (process.env.NODE_ENV === 'development') {
        sagaDev = require('redux-saga-devtools');

        monitor = sagaDev.createSagaMonitor();
        sagaMiddleware = createSagaMiddleware({ sagaMonitor: monitor });
        const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
        middleware = composeEnhancers(
            applyMiddleware(sagaMiddleware)
        );
    } else {
        sagaMiddleware = createSagaMiddleware();
        middleware = applyMiddleware(sagaMiddleware);
    }
    
    store = createStore(rootReducer, initialState, middleware);
    sagaMiddleware.run(rootSaga)

    const history = syncHistoryWithStore(browserHistory, store);

    // Bump transaction (for live UI testing).. Put 0 in now (no effect),
    // to enable browser's autocomplete and help prevent typos.
    window.bump = parseInt(localStorage.getItem('bump') || 0);
    const scroll = useScroll((prevLocation, { location }) => {
        if (location.hash || location.action === 'POP') return false;
        return !prevLocation || prevLocation.location.pathname !== location.pathname;
    });

    const Wrapper =
        process.env.NODE_ENV !== 'production' && localStorage['react.strict']
            ? React.StrictMode
            : React.Fragment;

    return render(
        <Wrapper>
            <Provider store={store}>
                <Translator>
                    <Router
                        routes={RootRoute}
                        history={history}
                        onError={onRouterError}
                        render={applyRouterMiddleware(scroll)}
                    />
                </Translator>
            </Provider>
            {monitor && sagaDev && <sagaDev.DockableSagaView monitor={monitor} />}
        </Wrapper>,
        document.getElementById('content')
    );
}
