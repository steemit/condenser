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
    applyRouterMiddleware,
    browserHistory,
} from 'react-router';
import { Provider } from 'react-redux';
import RootRoute from 'app/RootRoute';
import * as appActions from 'app/redux/AppReducer';
import { createStore, applyMiddleware, compose } from 'redux';
import { useScroll } from 'react-router-scroll';
import createSagaMiddleware from 'redux-saga';
import { syncHistoryWithStore } from 'react-router-redux';
import rootReducer from 'app/redux/RootReducer';
import { fetchDataWatches } from 'app/redux/FetchDataSaga';
import { marketWatches } from 'app/redux/MarketSaga';
import { sharedWatches } from 'app/redux/SagaShared';
import { userWatches } from 'app/redux/UserSaga';
import { authWatches } from 'app/redux/AuthSaga';
import { transactionWatches } from 'app/redux/TransactionSaga';
import { component as NotFound } from 'app/components/pages/NotFound';
import extractMeta from 'app/utils/ExtractMeta';
import Translator from 'app/Translator';
import { routeRegex } from 'app/ResolveRoute';
import { contentStats } from 'app/utils/StateFunctions';
import ScrollBehavior from 'scroll-behavior';

import { api } from '@steemit/steem-js';

let get_state_perf,
    get_content_perf = false;
if (process.env.OFFLINE_SSR_TEST) {
    const testDataDir = process.env.OFFLINE_SSR_TEST_DATA_DIR || 'api_mockdata';
    let uri = `${__dirname}/../../`;
    get_state_perf = require(uri + testDataDir + '/get_state');
    get_content_perf = require(uri + testDataDir + '/get_content');
}

const calcOffsetRoot = startEl => {
    let offset = 0;
    let el = startEl;
    while (el) {
        offset += el.offsetTop;
        el = el.offsetParent;
    }
    return offset;
};

//BEGIN: SCROLL CODE
/**
 * The maximum number of times to attempt scrolling to the target element/y position
 * (total seconds of attempted scrolling is given by (SCROLL_TOP_TRIES * SCROLL_TOP_DELAY_MS)/1000 )
 * @type {number}
 */
const SCROLL_TOP_TRIES = 50;
/**
 * The number of milliseconds to delay between scroll attempts
 * (total seconds of attempted scrolling is given by (SCROLL_TOP_TRIES * SCROLL_TOP_DELAY_MS)/1000 )
 * @type {number}
 */
const SCROLL_TOP_DELAY_MS = 100;
/**
 * The size of the vertical gap between the bottom of the fixed header and the top of the scrolled-to element.
 * @type {number}
 */
const SCROLL_TOP_EXTRA_PIXEL_OFFSET = 3;
/**
 * number of pixels the document can move in the 'wrong' direction (opposite of intended scroll) this covers accidental scroll movements by users.
 * @type {number}
 */
const SCROLL_FUDGE_PIXELS = 10;
/**
 * if document is being scrolled up this is set for prevDocumentInfo && documentInfo
 * @type {string}
 */
const SCROLL_DIRECTION_UP = 'up';
/**
 * if document is being scrolled down this is set for prevDocumentInfo && documentInfo
 * @type {string}
 */
const SCROLL_DIRECTION_DOWN = 'down';

/**
 * If an element with this id is present, the page does not want us to detect navigation history direction (clicking links/forward button or back button)
 * @type {string}
 */
const DISABLE_ROUTER_HISTORY_NAV_DIRECTION_EL_ID =
    'disable_router_nav_history_direction_check';

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
        scrollTarget: calcOffsetRoot(el) + topOffset,
        direction: prevDocumentInfo.direction,
    };
    let doScroll = false;
    //for both SCROLL_DIRECTION_DOWN, SCROLL_DIRECTION_UP
    //We scroll if the document has 1. not been deliberately scrolled, AND 2. we have not passed our target scroll,
    //NOR has the document changed in a meaningful way since we last looked at it
    if (prevDocumentInfo.direction === SCROLL_DIRECTION_DOWN) {
        doScroll =
            prevDocumentInfo.scrollTop <=
                documentInfo.scrollTop + SCROLL_FUDGE_PIXELS &&
            (documentInfo.scrollTop < documentInfo.scrollTarget ||
                prevDocumentInfo.scrollTarget < documentInfo.scrollTarget ||
                prevDocumentInfo.scrollHeight < documentInfo.scrollHeight);
    } else if (prevDocumentInfo.direction === SCROLL_DIRECTION_UP) {
        doScroll =
            prevDocumentInfo.scrollTop >=
                documentInfo.scrollTop - SCROLL_FUDGE_PIXELS &&
            (documentInfo.scrollTop > documentInfo.scrollTarget ||
                prevDocumentInfo.scrollTarget > documentInfo.scrollTarget ||
                prevDocumentInfo.scrollHeight > documentInfo.scrollHeight);
    }

    if (doScroll) {
        window.scrollTo(0, documentInfo.scrollTarget);
        if (triesRemaining > 0) {
            scrollTopTimeout = setTimeout(
                () =>
                    scrollTop(el, topOffset, documentInfo, triesRemaining - 1),
                SCROLL_TOP_DELAY_MS
            );
        }
    }
};

/**
 * Custom scrolling behavior needed because we have chunky page loads and a fixed header.
 */
class OffsetScrollBehavior extends ScrollBehavior {
    /**
     * Raison d'être: on hash link navigation, assemble the needed info and pass it to scrollTop()
     * In cases where we're scrolling to a pixel offset, adjust the offset for the current header, and punt to default behavior.
     */
    scrollToTarget(element, target) {
        clearTimeout(scrollTopTimeout); //it's likely this will be called multiple times in succession, so clear and existing scrolling.
        const header = document.getElementsByTagName('header')[0]; //this dimension ideally would be pulled from a scss file.
        let topOffset = SCROLL_TOP_EXTRA_PIXEL_OFFSET * -1;
        if (header) {
            topOffset += header.offsetHeight * -1;
        }
        const newTarget = []; //x coordinate
        let el = false;
        if (typeof target === 'string') {
            el = document.getElementById(target.substr(1));
            if (!el) {
                el = document.getElementById(target);
            }
        } else {
            newTarget.push(target[0]);
            if (target[1] + topOffset > 0) {
                newTarget.push(target[1] + topOffset);
            } else {
                newTarget.push(0);
            }
        }

        if (el) {
            const documentInfo = {
                scrollHeight: document.body.scrollHeight,
                scrollTop: Math.ceil(document.scrollingElement.scrollTop),
                scrollTarget: calcOffsetRoot(el) + topOffset,
            };
            documentInfo.direction =
                documentInfo.scrollTop < documentInfo.scrollTarget
                    ? SCROLL_DIRECTION_DOWN
                    : SCROLL_DIRECTION_UP;
            scrollTop(el, topOffset, documentInfo, SCROLL_TOP_TRIES); //this function does the actual work of scrolling.
        } else {
            super.scrollToTarget(element, newTarget);
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
    const composeEnhancers =
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // eslint-disable-line no-underscore-dangle
    middleware = composeEnhancers(applyMiddleware(sagaMiddleware));
} else {
    middleware = applyMiddleware(sagaMiddleware);
}

const runRouter = (location, routes) => {
    return new Promise(resolve =>
        match({ routes, location }, (...args) => resolve(args))
    );
};

const onRouterError = error => {
    console.error('onRouterError', error);
};

/**
 *
 * @param {*} location
 * @param {*} initialState
 * @param {*} ErrorPage
 * @param {*} userPreferences
 * @param {*} offchain
 * @param {RequestTimer} requestTimer
 * @returns promise
 */
export async function serverRender(
    location,
    initialState,
    ErrorPage,
    userPreferences,
    offchain,
    requestTimer
) {
    let error, redirect, renderProps;

    try {
        [error, redirect, renderProps] = await runRouter(location, RootRoute);
    } catch (e) {
        console.error('Routing error:', e.toString(), location);
        return {
            title: 'Routing error - Steemit',
            statusCode: 500,
            body: renderToString(
                ErrorPage ? <ErrorPage /> : <span>Routing error</span>
            ),
        };
    }

    if (error || !renderProps) {
        // debug('error')('Router error', error);
        return {
            title: 'Page Not Found - Steemit',
            statusCode: 404,
            body: renderToString(<NotFound />),
        };
    }

    let server_store, onchain;
    try {
        const url = getUrlFromLocation(location);

        requestTimer.startTimer('apiGetState_ms');
        onchain = await apiGetState(url);
        requestTimer.stopTimer('apiGetState_ms');

        // If a user profile URL is requested but no profile information is
        // included in the API response, return User Not Found.
        if (
            Object.getOwnPropertyNames(onchain.accounts).length === 0 &&
            (url.match(routeRegex.UserProfile1) ||
                url.match(routeRegex.UserProfile3))
        ) {
            // protect for invalid account
            return {
                title: 'User Not Found - Steemit',
                statusCode: 404,
                body: renderToString(<NotFound />),
            };
        }

        // If we are not loading a post, truncate state data to bring response size down.
        if (!url.match(routeRegex.Post)) {
            for (var key in onchain.content) {
                //onchain.content[key]['body'] = onchain.content[key]['body'].substring(0, 1024) // TODO: can be removed. will be handled by steemd
                // Count some stats then remove voting data. But keep current user's votes. (#1040)
                onchain.content[key]['stats'] = contentStats(
                    onchain.content[key]
                );
                onchain.content[key]['active_votes'] = null;
            }
        }

        // Are we loading an un-category-aliased post?
        if (
            !url.match(routeRegex.PostsIndex) &&
            !url.match(routeRegex.UserProfile1) &&
            !url.match(routeRegex.UserProfile2) &&
            url.match(routeRegex.PostNoCategory)
        ) {
            const params = url.substr(2, url.length - 1).split('/');
            let content;
            if (process.env.OFFLINE_SSR_TEST) {
                content = get_content_perf;
            } else {
                content = await api.getContentAsync(params[0], params[1]);
            }
            if (content.author && content.permlink) {
                // valid short post url
                onchain.content[url.substr(2, url.length - 1)] = content;
            } else {
                // protect on invalid user pages (i.e /user/transferss)
                return {
                    title: 'Page Not Found - Steemit',
                    statusCode: 404,
                    body: renderToString(<NotFound />),
                };
            }
        }

        server_store = createStore(rootReducer, {
            app: initialState.app,
            global: onchain,
            offchain,
        });
        server_store.dispatch({
            type: '@@router/LOCATION_CHANGE',
            payload: { pathname: location },
        });
        server_store.dispatch(appActions.setUserPreferences(userPreferences));
    } catch (e) {
        // Ensure 404 page when username not found
        if (location.match(routeRegex.UserProfile1)) {
            console.error('User/not found: ', location);
            return {
                title: 'Page Not Found - Steemit',
                statusCode: 404,
                body: renderToString(<NotFound />),
            };
            // Ensure error page on state exception
        } else {
            const msg = (e.toString && e.toString()) || e.message || e;
            const stack_trace = e.stack || '[no stack]';
            console.error('State/store error: ', msg, stack_trace);
            return {
                title: 'Server error - Steemit',
                statusCode: 500,
                body: renderToString(<ErrorPage />),
            };
        }
    }

    let app, status, meta;
    try {
        requestTimer.startTimer('ssr_ms');
        app = renderToString(
            <Provider store={server_store}>
                <Translator>
                    <RouterContext {...renderProps} />
                </Translator>
            </Provider>
        );
        requestTimer.stopTimer('ssr_ms');
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
        body: Iso.render(app, server_store.getState()),
    };
}

/**
 * dependencies:
 * middleware
 * browserHistory
 * useScroll
 * OffsetScrollBehavior
 * location
 *
 * @param {*} initialState
 */
export function clientRender(initialState) {
    const store = createStore(rootReducer, initialState, middleware);

    const history = syncHistoryWithStore(browserHistory, store);

    /**
     * When to scroll - on hash link navigation determine if the page should scroll to that element (forward nav, or ignore nav direction)
     */
    const scroll = useScroll({
        createScrollBehavior: config => new OffsetScrollBehavior(config), //information assembler for has scrolling.
        shouldUpdateScroll: (prevLocation, { location }) => {
            // eslint-disable-line no-shadow
            //if there is a hash, we may want to scroll to it
            if (location.hash) {
                //if disableNavDirectionCheck exists, we want to always navigate to the hash (the page is telling us that's desired behavior based on the element's existence
                const disableNavDirectionCheck = document.getElementById(
                    DISABLE_ROUTER_HISTORY_NAV_DIRECTION_EL_ID
                );
                //we want to navigate to the corresponding id=<hash> element on 'PUSH' navigation (prev null + POP is a new window url nav ~= 'PUSH')
                if (
                    disableNavDirectionCheck ||
                    (prevLocation === null && location.action === 'POP') ||
                    location.action === 'PUSH'
                ) {
                    return location.hash;
                }
            }
            return true;
        },
    });

    if (process.env.NODE_ENV === 'production') {
        console.log(
            '%c%s',
            'color: red; background: yellow; font-size: 24px;',
            'WARNING!'
        );
        console.log(
            '%c%s',
            'color: black; font-size: 16px;',
            'This is a developer console, you must read and understand anything you paste or type here or you could compromise your account and your private keys.'
        );
    }

    return render(
        <Provider store={store}>
            <Translator>
                <Router
                    routes={RootRoute}
                    history={history}
                    onError={onRouterError}
                    render={applyRouterMiddleware(scroll)}
                />
            </Translator>
        </Provider>,
        document.getElementById('content')
    );
}

/**
 * Do some pre-state-fetch url rewriting.
 *
 * @param {string} location
 * @returns {string}
 */
function getUrlFromLocation(location) {
    let url = location === '/' ? 'trending' : location;
    // Replace /curation-rewards and /author-rewards with /transfers for UserProfile
    // to resolve data correctly
    if (url.indexOf('/curation-rewards') !== -1)
        url = url.replace(/\/curation-rewards$/, '/transfers');
    if (url.indexOf('/author-rewards') !== -1)
        url = url.replace(/\/author-rewards$/, '/transfers');

    return url;
}

async function apiGetState(url) {
    let offchain;

    if (process.env.OFFLINE_SSR_TEST) {
        offchain = get_state_perf;
    }

    offchain = await api.getStateAsync(url);

    return offchain;
}
