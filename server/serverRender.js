import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import Iso from 'iso';
import { RouterContext, match } from 'react-router';
import { api } from 'golos-js';
import RootRoute from 'app/RootRoute';
import { APP_NAME, IGNORE_TAGS, SEO_TITLE } from 'app/client_config';
import NotFound from 'app/components/pages/NotFound';
import getState from 'app/utils/StateBuilder';
import { routeRegex } from 'app/ResolveRoute';
import { contentStats, calcVotesStats } from 'app/utils/StateFunctions';
import rootReducer from 'app/redux/reducers';
import Translator from 'app/Translator';
import extractMeta from 'app/utils/ExtractMeta';

export default async function serverRender({ location, offchain, ErrorPage, settings, rates }) {
    let error, redirect, renderProps;

    try {
        [error, redirect, renderProps] = await runRouter(location, RootRoute);
    } catch (e) {
        console.error('Routing error:', e.toString(), location);
        return {
            title: 'Routing error - ' + APP_NAME,
            statusCode: 500,
            body: renderToString(ErrorPage ? <ErrorPage /> : <span>Routing error</span>),
        };
    }
    if (error || !renderProps) {
        // debug('error')('Router error', error);
        return {
            title: 'Page Not Found - ' + APP_NAME,
            statusCode: 404,
            body: renderToString(<NotFound.component />),
        };
    }

    // below is only executed on the server
    let serverStore, onchain;
    try {
        let url = location === '/' ? 'trending' : location;
        // Replace /curation-rewards and /author-rewards with /transfers for UserProfile to resolve data correctly
        if (url.indexOf('/curation-rewards') !== -1)
            url = url.replace(/\/curation-rewards$/, '/transfers');
        if (url.indexOf('/author-rewards') !== -1)
            url = url.replace(/\/author-rewards$/, '/transfers');

        const options = { IGNORE_TAGS };

        onchain = await getState(api, url, options, offchain, rates);

        // protect for invalid account
        if (
            Object.getOwnPropertyNames(onchain.accounts).length === 0 &&
            (location.match(routeRegex.UserProfile1) || location.match(routeRegex.UserProfile3))
        ) {
            return {
                title: 'User Not Found - ' + APP_NAME,
                statusCode: 404,
                body: renderToString(<NotFound.component />),
            };
        }

        // If we are not loading a post, truncate state data to bring response size down.
        if (!url.match(routeRegex.Post)) {
            for (let key in onchain.content) {
                const post = onchain.content[key];
                //onchain.content[key]['body'] = onchain.content[key]['body'].substring(0, 1024) // TODO: can be removed. will be handled by steemd
                // Count some stats then remove voting data. But keep current user's votes. (#1040)
                post.stats = contentStats(post);
                post.votesSummary = calcVotesStats(post['active_votes'], offchain.account);
                post['active_votes'] = post['active_votes'].filter(
                    vote => vote.voter === offchain.account
                );
            }
        }

        if (
            !url.match(routeRegex.PostsIndex) &&
            !url.match(routeRegex.UserProfile1) &&
            !url.match(routeRegex.UserProfile2) &&
            url.match(routeRegex.PostNoCategory)
        ) {
            const params = url.substr(2, url.length - 1).split('/');
            const content = await api.getContentAsync(params[0], params[1], undefined);
            if (content.author && content.permlink) {
                // valid short post url
                onchain.content[url.substr(2, url.length - 1)] = content;
            } else {
                // protect on invalid user pages (i.e /user/transferss)
                return {
                    title: 'Page Not Found - ' + APP_NAME,
                    statusCode: 404,
                    body: renderToString(<NotFound.component />),
                };
            }
        }

        offchain.server_location = location;
        const initialState = {
            global: onchain,
            offchain,
        };
        if (settings) initialState.data = { settings };
        serverStore = createStore(rootReducer, initialState);
        serverStore.dispatch({ type: '@@router/LOCATION_CHANGE', payload: { pathname: location } });
    } catch (e) {
        // Ensure 404 page when username not found
        if (location.match(routeRegex.UserProfile1)) {
            console.error('User/not found: ', location);
            return {
                title: 'Page Not Found - ' + APP_NAME,
                statusCode: 404,
                body: renderToString(<NotFound.component />),
            };
            // Ensure error page on state exception
        } else {
            const msg = (e.toString && e.toString()) || e.message || e;
            const stack_trace = e.stack || '[no stack]';
            console.error('State/store error: ', msg, stack_trace);
            return {
                title: 'Server error - ' + APP_NAME,
                statusCode: 500,
                body: renderToString(<ErrorPage />),
            };
        }
    }

    let app, status, meta;
    try {
        app = renderToString(
            <Provider store={serverStore}>
                <Translator>
                    <RouterContext {...renderProps} />
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

function runRouter(location, routes) {
    return new Promise(resolve => match({ routes, location }, (...args) => resolve(args)));
}
