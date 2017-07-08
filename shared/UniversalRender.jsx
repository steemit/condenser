/* eslint react/display-name: 0 */
/* eslint space-before-function-paren:0 */
// https://github.com/eslint/eslint/issues/4442
import Iso from 'iso';
import React from 'react';
import { render } from 'react-dom';
import { renderToString } from 'react-dom/server';
import { Router, RouterContext, match, applyRouterMiddleware } from 'react-router';
import { api } from 'golos-js';
import { Provider } from 'react-redux';
import RootRoute from 'app/RootRoute';
import {createStore, applyMiddleware, compose} from 'redux';
import { browserHistory } from 'react-router';
import useScroll from 'react-router-scroll';
import createSagaMiddleware from 'redux-saga';
import { syncHistoryWithStore } from 'react-router-redux';
import rootReducer from 'app/redux/RootReducer';
import {fetchDataWatches} from 'app/redux/FetchDataSaga';
import {marketWatches} from 'app/redux/MarketSaga';
import {assetsWatches} from 'app/redux/AssetsSaga';
import {sharedWatches} from 'app/redux/SagaShared';
import {userWatches} from 'app/redux/UserSaga';
import {authWatches} from 'app/redux/AuthSaga';
import {transactionWatches} from 'app/redux/TransactionSaga';
import PollDataSaga from 'app/redux/PollDataSaga';
import {component as NotFound} from 'app/components/pages/NotFound';
import extractMeta from 'app/utils/ExtractMeta';
import {serverApiRecordEvent} from 'app/utils/ServerApiClient';
import Translator from 'app/Translator';
import {notificationsArrayToMap} from 'app/utils/Notifications';
import {routeRegex} from "app/ResolveRoute";
import {contentStats} from 'app/utils/StateFunctions'
import {APP_NAME, IGNORE_TAGS, PUBLIC_API, SEO_TITLE} from 'app/client_config';
import constants from 'app/redux/constants';

const sagaMiddleware = createSagaMiddleware(
    ...userWatches, // keep first to remove keys early when a page change happens
    ...fetchDataWatches,
    ...sharedWatches,
    ...authWatches,
    ...transactionWatches,
    ...marketWatches,
    ...assetsWatches
);

let middleware;

if (process.env.BROWSER && process.env.NODE_ENV === 'development') {
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
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

async function universalRender({ location, initial_state, offchain, ErrorPage, tarantool }) {
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

    if (process.env.BROWSER) {
        const store = createStore(rootReducer, initial_state, middleware);
        sagaMiddleware.run(PollDataSaga).done
            .then(() => console.log('PollDataSaga is finished'))
            .catch(err => console.log('PollDataSaga is finished with error', err));

        const history = syncHistoryWithStore(browserHistory, store);
        // const scrollHistory = useScroll(() => history)();

        window.store = {
            getState: () => {debugger}
        }
        // Bump transaction (for live UI testing).. Put 0 in now (no effect),
        // to enable browser's autocomplete and help prevent typos.
        window.bump = parseInt(localStorage.getItem('bump') || 0);
        const scroll = useScroll((prevLocation, {location}) => {
            if (location.hash || location.action === 'POP') return false;
            return !prevLocation || prevLocation.location.pathname !== location.pathname;
        });
        if (process.env.NODE_ENV === 'production') {
            // console.log('%c%s', 'color: red; background: yellow; font-size: 24px;', 'WARNING!');
            // console.log('%c%s', 'color: black; font-size: 16px;', 'This is a developer console, you must read and understand anything you paste or type here or you could compromise your account and your private keys.');
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

        // if empty or equal '/''
        if (!url || typeof url !== 'string' || !url.length || url === '/') url = 'trending';
        // remove / from start
        if (url[0] === '/') url = url.substr(1)
        // get parts of current url
        const parts = url.split('/')
        // create tag
        const tag = typeof parts[1] !== "undefined" ? parts[1] : ''

        // TODO fix bread ration IMPORTANT
        if (parts[0][0] === '@' || typeof parts[1] === 'string' && parts[1][0] === '@') {
          onchain = await api.getStateAsync(url);
        }
        else {
          const _state = {};
          const feed_history = await api.getFeedHistoryAsync();

          _state.current_route = url;
          _state.props = await api.getDynamicGlobalPropertiesAsync();
          _state.category_idx = { "active": [], "recent": [], "best": [] };
          _state.categories = {};
          _state.tags = {};
          _state.content = {};
          _state.accounts = {};
          _state.pow_queue = [];
          _state.witnesses = {};
          _state.discussion_idx = {};
          _state.witness_schedule = await api.getWitnessScheduleAsync();
          _state.feed_price = feed_history.current_median_history; // { "base":"1.000 GBG", "quote":"1.895 GOLOS" },

          _state.select_tags = [];
          // _state.filter_tags = [];

          // by default trending tags limit=50, but if we in '/tags/' path then limit = 250
          let tags_limit = 50;
          if (parts[0] == "tags") {
            tags_limit = 250
          }
          const trending_tags = await api.getTrendingTagsAsync('',`${tags_limit}`);

          if (parts[0][0] === '@') {
            const uname = parts[0].substr(1)
            _state.accounts[uname] = await api.getAccountsAsync([uname]);
            _state.accounts[uname].tags_usage = await api.getTagsUsedByAuthorAsync([uname]);

            // FETSH part 2
            switch (parts[1]) {
              case 'transfers':
                const history = await api.getAccountHistoryAsync(uname, -1, 1000);
                for (var key in history) {
                  switch (history[key][1].op) {
                    case 'transfer_to_vesting':
                    case 'withdraw_vesting':
                    case 'interest':
                    case 'transfer':
                    case 'liquidity_reward':
                    case 'author_reward':
                    case 'curation_reward':
                    case 'transfer_to_savings':
                    case 'transfer_from_savings':
                    case 'cancel_transfer_from_savings':
                    case 'escrow_transfer':
                    case 'escrow_approve':
                    case 'escrow_dispute':
                    case 'escrow_release':
                      _state.accounts[uname].transfer_history[history[key][0]] = history[key][1];
                    break;

                    case 'comment':
                      // eacnt.post_history[item.first] =  item.second;
                    break;

                    case 'limit_order_create':
                    case 'limit_order_cancel':
                    case 'fill_convert_request':
                    case 'fill_order':
                      // eacnt.market_history[item.first] =  item.second;
                    break;

                    case 'vote':
                    case 'account_witness_vote':
                    case 'account_witness_proxy':
                      // eacnt.vote_history[item.first] =  item.second;
                    break;

                    case 'account_create':
                    case 'account_update':
                    case 'witness_update':
                    case 'pow':
                    case 'custom':
                    default:
                      _state.accounts[uname].other_history[history[key][0]] = history[key][1];
                  }
                }
                break;

              case 'recent-replies':
                const replies = await api.getRepliesByLastUpdateAsync(uname, '', 50);
                _state.accounts[uname].recent_replies = []
                for (var key in replies) {
                  const reply_ref = replies[key].author + "/" + replies[key].permlink;
                  _state.content[reply_ref] = replies[key];
                  _state.accounts[uname].recent_replies.push(reply_ref);
                }
                break;

              case 'posts':
              case 'comments':
                break;

              case 'blog':
                break;

              case 'feed':
                break;

              // default:
            }
          }
          else if (parts[0] === 'witnesses' || parts[0] === '~witnesses') {
            const wits = await api[PUBLIC_API.witnesses[0]]('', 50);
            for (var key in wits) _state.witnesses[wits[key].owner] = wits[key];
          }
          else if ([
              'trending',
              'trending30',
              'promoted',
              'responses',
              'hot',
              'votes',
              'cashout',
              'payout',
              'payout_comments',
              'active',
              'created',
              'recent'
          ].indexOf(parts[0]) >= 0) {
            let args = {
              limit: constants.FETCH_DATA_BATCH_SIZE,
              truncate_body: constants.FETCH_DATA_TRUNCATE_BODY
            }

            if (typeof tag === 'string' && tag.length) {
              // args[0].tag = tag
              args.select_tags = [tag]
            }
            else {
              if (typeof offchain.select_tags === "object" && offchain.select_tags.length) {
                args.select_tags = _state.select_tags = offchain.select_tags;
              }
              else {
                args.filter_tags = _state.filter_tags = IGNORE_TAGS
              }
            }
            const discussions = await api[PUBLIC_API[parts[0]][0]](args);
            let accounts = []
            let discussion_idxes = {}
            discussion_idxes[ PUBLIC_API[parts[0]][1] ] = []
            for (var i in discussions) {
              const key = discussions[i].author + '/' + discussions[i].permlink;
              discussion_idxes[ PUBLIC_API[parts[0]][1] ].push(key);
              if (discussions[i].author && discussions[i].author.length)
                accounts.push(discussions[i].author);
              _state.content[key] = discussions[i];
            }
            const discussions_key = typeof tag === 'string' && tag.length ? tag : _state.select_tags.sort().join('/')
            _state.discussion_idx[discussions_key] = discussion_idxes;
            accounts = await api.getAccountsAsync(accounts);
            for (var i in accounts) {
              _state.accounts[ accounts[i].name ] = accounts[i]
            }
          }
          else if (parts[0] == "tags") {
            for (var i in trending_tags) {
              _state.tags[trending_tags[i].name] = trending_tags[i]
            }
          }
          else {
            // NOTHING
          }

          _state.tag_idx = { "trending": trending_tags.map(t => t.name) };

          for (var key in _state.content)
            _state.content[key].active_votes = await api.getActiveVotesAsync(_state.content[key].author, _state.content[key].permlink);

          onchain = _state
        }

        if (Object.getOwnPropertyNames(onchain.accounts).length === 0 && (url.match(routeRegex.UserProfile1) || url.match(routeRegex.UserProfile3))) { // protect for invalid account
            return {
                title: 'User Not Found - ' + APP_NAME,
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
        server_store = createStore(rootReducer, { global: onchain, offchain});
        server_store.dispatch({type: '@@router/LOCATION_CHANGE', payload: {pathname: location}});
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
        title: SEO_TITLE,
        titleBase: SEO_TITLE + ' - ',
        meta,
        statusCode: status,
        body: Iso.render(app, server_store.getState())
    };
}

export default universalRender;
