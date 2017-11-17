/* eslint react/display-name: 0 */
/* eslint space-before-function-paren:0 */
// https://github.com/eslint/eslint/issues/4442
import Iso from 'iso';
import React from 'react';
import { render } from 'react-dom';
import { renderToString } from 'react-dom/server';
import { Router, RouterContext, match, applyRouterMiddleware, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import RootRoute from 'app/RootRoute';
import {createStore, applyMiddleware, compose} from 'redux';
import { useScroll } from 'react-router-scroll';
import createSagaMiddleware from 'redux-saga';
import { syncHistoryWithStore } from 'react-router-redux';
import { Map, fromJS } from 'immutable';
import rootReducer from 'app/redux/RootReducer';
import {fetchDataWatches} from 'app/redux/FetchDataSaga';
import {marketWatches} from 'app/redux/MarketSaga';
import {sharedWatches} from 'app/redux/SagaShared';
import {userWatches} from 'app/redux/UserSaga';
import {authWatches} from 'app/redux/AuthSaga';
import {transactionWatches} from 'app/redux/TransactionSaga';
import PollDataSaga from 'app/redux/PollDataSaga';
import {component as NotFound} from 'app/components/pages/NotFound';
import extractMeta from 'app/utils/ExtractMeta';
import Translator from 'app/Translator';
import {notificationsArrayToMap} from 'app/utils/Notifications';
import {routeRegex} from "app/ResolveRoute";
import {contentStats} from 'app/utils/StateFunctions';
import ScrollBehavior from 'scroll-behavior';

import {api} from 'steem';


const calcOffsetRoot = (startEl) => {
    let offset = 0;
    let el = startEl;
    while(el) {
        offset += el.offsetTop;
        el = el.offsetParent;
    }
    return offset;
};

//BEGIN: SCROLL CODE
const SCROLL_TOP_TRIES = 100;
const SCROLL_TOP_DELAY_MS = 50;
const SCROLL_TOP_EXTRA_PIXEL_OFFSET = 3;

let scrollTopTimeout = null;

/**
 * raison d'être: support hash link navigation into slow-to-render page sections.
 *
 * @param {htmlElement} el - the element to which we wish to scroll
 * @param {number} topOffset - number of pixels to add to the scroll. (would be a negative number if fixed header)
 * @param {Object} prevDocumentInfo -
 *          .scrollHeight {number} - document.body.scrollHeight
 *          .scrollTop {number} - ~document.scrollingElement.scrollTop
 *          .scrollTarget {number} - the previously calculated scroll target
 * @param {number} triesRemaining - number of attempts remaining
 */
const scrollTop = (el, topOffset, prevDocumentInfo, triesRemaining) => {
    const documentInfo = {
        scrollHeight: document.body.scrollHeight,
        scrollTop: Math.ceil(document.scrollingElement.scrollTop),
        scrollTarget: calcOffsetRoot(el) + topOffset
    };

    if(documentInfo.scrollTop < documentInfo.scrollTarget
        || prevDocumentInfo.scrollTarget < documentInfo.scrollTarget
        || prevDocumentInfo.scrollHeight < documentInfo.scrollHeight) {
        window.scrollTo(0, documentInfo.scrollTarget);
        if(triesRemaining > 0) {
            scrollTopTimeout = setTimeout(() => scrollTop(el, topOffset, documentInfo, (triesRemaining-1)), SCROLL_TOP_DELAY_MS);
        }
    }
}

/**
 * raison d'être: on hash link navigation, calculate the appropriate y-scroll with a fixed position top menu
 */
class OffsetScrollBehavior extends ScrollBehavior {
    scrollToTarget(element, target) {
        clearTimeout(scrollTopTimeout);
        const el = (typeof target === 'string') ? document.getElementById(target) : false;
        if(el) {
            const header = document.getElementsByTagName('header')[0]; //this dimension ideally would be pulled from a scss file.
            const topOffset = (((header)? header.offsetHeight : 0) + SCROLL_TOP_EXTRA_PIXEL_OFFSET) * (-1);
            const documentInfo = {
                scrollHeight: document.body.scrollHeight,
                scrollTop: Math.ceil(document.scrollingElement.scrollTop),
                scrollTarget: 0
            };
            scrollTop(el, topOffset, documentInfo, SCROLL_TOP_TRIES);
        } else {
            super.scrollToTarget(element, target);
        }
    }
}
//END: SCROLL CODE

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
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // eslint-disable-line no-underscore-dangle
    middleware = composeEnhancers(
        applyMiddleware(sagaMiddleware)
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

async function universalRender({ location, initial_state, offchain, ErrorPage, tarantool, userPreferences }) {
    let error, redirect, renderProps;
    try {
        [error, redirect, renderProps] = await runRouter(location, RootRoute);
    } catch (e) {
        console.error('Routing error:', e.toString(), location);
        return {
            title: 'Routing error - Steemit',
            statusCode: 500,
            body: renderToString(ErrorPage ? <ErrorPage /> : <span>Routing error</span>)
        };
    }
    if (error || !renderProps) {
        // debug('error')('Router error', error);
        return {
            title: 'Page Not Found - Steemit',
            statusCode: 404,
            body: renderToString(<NotFound />)
        };
    }

    if (process.env.BROWSER) {
        const store = createStore(rootReducer, fromJS(initial_state), middleware);
        sagaMiddleware.run(PollDataSaga).done
            .then(() => console.log('PollDataSaga is finished'))
            .catch(err => console.log('PollDataSaga is finished with error', err));

        const history = syncHistoryWithStore(browserHistory, store, {
            selectLocationState: state => state.get('routing').toJS(),
        });

        const scroll = useScroll({
            createScrollBehavior: config => new OffsetScrollBehavior(config),
            shouldUpdateScroll: (prevLocation, {location}) => { // eslint-disable-line no-shadow
                //we want to navigate to the corresponding id=<hash> element on 'PUSH' navigation (prev null + POP is a new window url nav ~= 'PUSH')
                if(location.hash) {
                    if((prevLocation === null && location.action === 'POP')
                        || (location.action === 'PUSH')
                    ) {
                        return location.hash;
                    }
                }
                return true;
            }
        });

        if (process.env.NODE_ENV === 'production') {
            console.log('%c%s', 'color: red; background: yellow; font-size: 24px;', 'WARNING!');
            console.log('%c%s', 'color: black; font-size: 16px;', 'This is a developer console, you must read and understand anything you paste or type here or you could compromise your account and your private keys.');
        }
        return render(
            <Provider store={store}>
                    <Translator>
                <Router
                    routes={RootRoute}
                    history={history}
                    onError={onRouterError}
                    render={applyRouterMiddleware(scroll)} />
                    </Translator>
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

        onchain = await api.getStateAsync(url);

        if (Object.getOwnPropertyNames(onchain.accounts).length === 0 && (url.match(routeRegex.UserProfile1) || url.match(routeRegex.UserProfile3))) { // protect for invalid account
            return {
                title: 'User Not Found - Steemit',
                statusCode: 404,
                body: renderToString(<NotFound />)
            };
        }

        // If we are not loading a post, truncate state data to bring response size down.
        if (!url.match(routeRegex.Post)) {
            for (var key in onchain.content) {
                //onchain.content[key]['body'] = onchain.content[key]['body'].substring(0, 1024) // TODO: can be removed. will be handled by steemd
                // Count some stats then remove voting data. But keep current user's votes. (#1040)
                onchain.content[key]['stats'] = contentStats(onchain.content[key])
                onchain.content[key]['active_votes'] = onchain.content[key]['active_votes'].filter(vote => vote.voter === offchain.account)
            }
        }

        if (!url.match(routeRegex.PostsIndex) && !url.match(routeRegex.UserProfile1) && !url.match(routeRegex.UserProfile2) && url.match(routeRegex.PostNoCategory)) {
            const params = url.substr(2, url.length - 1).split("/");
            const content = await api.getContentAsync(params[0], params[1]);
            if (content.author && content.permlink) { // valid short post url
                onchain.content[url.substr(2, url.length - 1)] = content;
            } else { // protect on invalid user pages (i.e /user/transferss)
                return {
                    title: 'Page Not Found - Steemit',
                    statusCode: 404,
                    body: renderToString(<NotFound />)
                };
            }
        }
        // Calculate signup bonus
        const fee = parseFloat($STM_Config.registrar_fee.split(' ')[0]),
              {base, quote} = onchain.feed_price,
              feed = parseFloat(base.split(' ')[0]) / parseFloat(quote.split(' ')[0]);
        const sd = fee * feed;
        let sdDisp;
        if (sd < 1.0) {
            sdDisp = '¢' + parseInt(sd * 100);
        } else {
            const sdInt = parseInt(sd), sdDec = (sd - sdInt);
            sdDisp = '$' + sdInt + (sdInt < 5 && sdDec >= 0.5 ? '.50' : '');
        }

        offchain.signup_bonus = sdDisp;
        offchain.server_location = location;
        server_store = createStore(rootReducer, Map({ global: onchain, offchain }));
        server_store.dispatch({type: '@@router/LOCATION_CHANGE', payload: {pathname: location}});
        server_store.dispatch({type: 'SET_USER_PREFERENCES', payload: userPreferences});
        if (offchain.account) {
            try {
                const notifications = await tarantool.select('notifications', 0, 1, 0, 'eq', offchain.account);
                server_store.dispatch({type: 'UPDATE_NOTIFICOUNTERS', payload: notificationsArrayToMap(notifications)});
            } catch(e) {
                console.warn('WARNING! cannot retrieve notifications from tarantool in universalRender:', e.message);
            }
        }
    } catch (e) {
        // Ensure 404 page when username not found
        if (location.match(routeRegex.UserProfile1)) {
            console.error('User/not found: ', location);
            return {
                title: 'Page Not Found - Steemit',
                statusCode: 404,
                body: renderToString(<NotFound />)
            };
        // Ensure error page on state exception
        } else {
            const msg = (e.toString && e.toString()) || e.message || e;
            const stack_trace = e.stack || '[no stack]';
            console.error('State/store error: ', msg, stack_trace);
            return {
                title: 'Server error - Steemit',
                statusCode: 500,
                body: renderToString(<ErrorPage />)
            };
        }
    }

    let app, status, meta;
    try {
        app = renderToString(
            <Provider store={server_store}>
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

    return {
        title: 'Steemit',
        titleBase: 'Steemit - ',
        meta,
        statusCode: status,
        body: Iso.render(app, server_store.getState())
    };
}

export default universalRender;
