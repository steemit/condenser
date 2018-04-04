import {takeLatest, takeEvery} from 'redux-saga';
import {call, put, select, fork} from 'redux-saga/effects';
import {loadFollows, fetchFollowCount} from 'app/redux/FollowSaga';
import {getContent} from 'app/redux/SagaShared';
import GlobalReducer from './GlobalReducer';
import constants from './constants';
import {fromJS, Map} from 'immutable'
import { DEBT_TOKEN_SHORT, DEFAULT_CURRENCY, IGNORE_TAGS, PUBLIC_API, SELECT_TAGS_KEY } from 'app/client_config';
import cookie from "react-cookie";
import {api} from 'golos-js';
// import * as api from 'app/utils/APIWrapper'

export const fetchDataWatches = [
    watchLocationChange,
    watchDataRequests,
    watchFetchJsonRequests,
    watchFetchState,
    watchGetContent,
    watchFetchExchangeRates
];

export function* watchGetContent() {
    yield* takeEvery('GET_CONTENT', getContentCaller);
}

export function* getContentCaller(action) {
    yield getContent(action.payload);
}

export function* watchLocationChange() {
    yield* takeLatest('@@router/LOCATION_CHANGE', fetchState);
}

export function* watchFetchState() {
    yield* takeLatest('FETCH_STATE', fetchState);
}

let is_initial_state = true;
export function* fetchState(location_change_action) {
    const {pathname} = location_change_action.payload;
    const m = pathname.match(/^\/@([a-z0-9\.-]+)/)
    if(m && m.length === 2) {
        const username = m[1]
        yield fork(fetchFollowCount, username)
        yield fork(loadFollows, "getFollowersAsync", username, 'blog')
        yield fork(loadFollows, "getFollowingAsync", username, 'blog')
    }

    // `ignore_fetch` case should only trigger on initial page load. No need to call
    // fetchState immediately after loading fresh state from the server. Details: #593
    const server_location = yield select(state => state.offchain.get('server_location'))
    const ignore_fetch = (pathname === server_location && is_initial_state)
    is_initial_state = false
    if(ignore_fetch) return

    let url = `${pathname}`
    if (url === '/') url = 'trending'
    // Replace /curation-rewards and /author-rewards with /transfers for UserProfile to resolve data correctly
    if (url.indexOf("/curation-rewards") !== -1) url = url.replace("/curation-rewards", "/transfers")
    if (url.indexOf("/author-rewards") !== -1) url = url.replace("/author-rewards", "/transfers")

    try {
        if (!url || typeof url !== 'string' || !url.length || url === '/') url = 'trending'
        if (url[0] === '/') url = url.substr(1)
        const parts = url.split('/')
        const tag = typeof parts[1] !== "undefined" ? parts[1] : ''

        const state = {}
        state.current_route = location
        state.content = {}
        state.accounts = {}

        let accounts = new Set()

        if (parts[0][0] === '@') {
            const uname = parts[0].substr(1)
            const [ account ] = yield call([api, api.getAccountsAsync], [uname])
            state.accounts[uname] = account
            
            if (account) {
                state.accounts[uname].tags_usage = yield call([api, api.getTagsUsedByAuthorAsync], uname)
                state.accounts[uname].guest_bloggers = yield call([api, api.getBlogAuthorsAsync], uname)

                switch (parts[1]) {
                    case 'transfers':
                        const history = yield call([api, api.getAccountHistoryAsync], uname, -1, 1000)
                        account.transfer_history = []
                        account.other_history = []
                        
                        history.forEach(operation => {
                            switch (operation[1].op[0]) {
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
                                    state.accounts[uname].transfer_history.push(operation)
                                break

                                default:
                                    state.accounts[uname].other_history.push(operation)
                            }
                        })
                    break

                    case 'recent-replies':
                        const replies = yield call([api, api.getRepliesByLastUpdateAsync], uname, '', 50)
                        state.accounts[uname].recent_replies = []

                        replies.forEach(reply => {
                            const link = `${reply.author}/${reply.permlink}`
                            state.content[link] = reply
                            state.accounts[uname].recent_replies.push(link)
                        })
                    break

                    case 'posts':
                    case 'comments':
                        const comments = yield call([api, api.getDiscussionsByCommentsAsync], { start_author: uname, limit: 20 })
                        state.accounts[uname].comments = []

                        comments.forEach(comment => {
                            const link = `${comment.author}/${comment.permlink}`
                            state.content[link] = comment
                            state.accounts[uname].comments.push(link)
                        })
                    break

                    case 'feed':
                        const feedEntries = yield call([api, api.getFeedEntriesAsync], uname, 0, 20)
                        state.accounts[uname].feed = []

                        for (let key in feedEntries) {
                            const { author, permlink } = feedEntries[key]
                            const link = `${author}/${permlink}`
                            state.accounts[uname].feed.push(link)
                            state.content[link] = yield call([api, api.getContentAsync], author, permlink)
                            
                            if (feedEntries[key].reblog_by.length > 0) {
                                state.content[link].first_reblogged_by = feedEntries[key].reblog_by[0]
                                state.content[link].reblogged_by = feedEntries[key].reblog_by
                                state.content[link].first_reblogged_on = feedEntries[key].reblog_on
                            }
                        }
                    break

                    case 'blog':
                    default:
                        const blogEntries = yield call([api, api.getBlogEntriesAsync], uname, 0, 20)
                        state.accounts[uname].blog = []

                        for (let key in blogEntries) {
                            const { author, permlink } = blogEntries[key]
                            const link = `${author}/${permlink}`

                            state.content[link] = yield call([api, api.getContentAsync], author, permlink)
                            state.accounts[uname].blog.push(link)
                        
                            if (blogEntries[key].reblog_on !== '1970-01-01T00:00:00') {
                                state.content[link].first_reblogged_on = blogEntries[key].reblog_on
                            }
                        }
                    break
                }
            }

        } else if (parts.length === 3 && parts[1].length > 0 && parts[1][0] == '@') {
            const account = parts[1].substr(1)
            const category = parts[0]
            const permlink = parts[2]
    
            const curl = `${account}/${permlink}`
            state.content[curl] = yield call([api, api.getContentAsync], account, permlink)
            accounts.add(account)

            const replies =  yield call([api, api.getAllContentRepliesAsync], account, permlink)
            
            for (let key in replies) {
                let reply = replies[key]
                const link = `${reply.author}/${reply.permlink}`

                accounts.add(reply.author)
 
                state.content[link] = reply
                if (reply.parent_permlink === permlink) {
                    state.content[curl].replies.push(link)
                }
            }

        } else if (parts[0] === 'witnesses' || parts[0] === '~witnesses') {
            state.witnesses = {};
            const witnesses =  yield call([api, api.getWitnessesByVoteAsync], '', 100)

            witnesses.forEach( witness => {
                state.witnesses[witness.owner] = witness
            })

        } else if ([
            'trending',
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
        ].includes(parts[0])) {

            yield call(fetchData, {payload: { order: parts[0], category : tag }})

        } else if (parts[0] == 'tags') {
            const trending_tags = yield call([api, api.getTrendingTagsAsync], '', parts[0] == 'tags' ? '250' : '50')
            trending_tags.forEach (tag => tags[tag.name] = tag)
            state.tags = tags
        }

        if (accounts.size > 0) {
            const acc = yield call([api, api.getAccountsAsync], Array.from(accounts))
            for (let i in acc) {
                state.accounts[ acc[i].name ] = acc[i]
            }
        }

        yield put(GlobalReducer.actions.receiveState(state))
    } catch (error) {
        console.error('~~ Saga fetchState error ~~>', url, error);
        yield put({type: 'global/FETCHING_STATE', payload: false});
        yield put({type: 'global/CHAIN_API_ERROR', error: error.message});
    }
}

export function* watchDataRequests() {
    yield* takeLatest('REQUEST_DATA', fetchData);
}

export function* fetchData(action) {
    const {order, author, permlink, accountname, keys} = action.payload;
    let {category} = action.payload;
    if( !category ) category = "";
    category = category.toLowerCase();

    let call_name, args;
    args = [{
      limit: constants.FETCH_DATA_BATCH_SIZE,
      truncate_body: constants.FETCH_DATA_TRUNCATE_BODY,
      start_author: author,
      start_permlink: permlink
    }];
    if (category.length) {
      args[0].select_tags = [category];
    } else {
      let select_tags = cookie.load(SELECT_TAGS_KEY);
      if (select_tags && select_tags.length) {
        args[0].select_tags = select_tags;
        category = select_tags.sort().join('/')
      }
      else {
        args[0].filter_tags = IGNORE_TAGS
      }
    }

    yield put({type: 'global/FETCHING_DATA', payload: {order, category}});

    if (order === 'trending') {
        call_name = 'getDiscussionsByTrendingAsync';
    } else if (order === 'promoted') {
        call_name = 'getDiscussionsByPromotedAsync';
    } else if( order === 'active' ) {
        call_name = 'getDiscussionsByActiveAsync';
    } else if( order === 'cashout' ) {
        call_name = 'getDiscussionsByCashoutAsync';
    } else if( order === 'payout' ) {
        call_name = 'getPostDiscussionsByPayoutAsync';
    } else if( order === 'payout_comments' ) {
        call_name = 'getCommentDiscussionsByPayoutAsync';
    } else if( order === 'updated' ) {
        call_name = 'getDiscussionsByActiveAsync';
    } else if( order === 'created' || order === 'recent' ) {
        call_name = 'getDiscussionsByCreatedAsync';
    } else if( order === 'by_replies' ) {
        call_name = 'getRepliesByLastUpdateAsync';
        args = [author, permlink, constants.FETCH_DATA_BATCH_SIZE];
    } else if( order === 'responses' ) {
        call_name = 'getDiscussionsByChildrenAsync';
    } else if( order === 'votes' ) {
        call_name = 'getDiscussionsByVotesAsync';
    } else if( order === 'hot' ) {
        call_name = 'getDiscussionsByHotAsync';
    } else if( order === 'by_feed' ) { // https://github.com/steemit/steem/issues/249
        call_name = 'getDiscussionsByFeedAsync';
        delete args[0].select_tags
        args[0].select_authors = [accountname];
    } else if( order === 'by_author' ) {
        call_name = 'getDiscussionsByBlogAsync';
        delete args[0].select_tags
        args[0].select_authors = [accountname];
    } else if( order === 'by_comments' ) {
        call_name = 'getDiscussionsByCommentsAsync';
    } else {
        call_name = 'getDiscussionsByActiveAsync';
    }
    try {
        const data = yield call([api, api[call_name]], ...args);
        yield put(GlobalReducer.actions.receiveData({data, order, category, author, permlink, accountname, keys}));
    } catch (error) {
        console.error('~~ Saga fetchData error ~~>', call_name, args, error);
        yield put({type: 'global/CHAIN_API_ERROR', error: error.message});
    }
}

// export function* watchMetaRequests() {
//     yield* takeLatest('global/REQUEST_META', fetchMeta);
// }
// export function* fetchMeta({payload: {id, link}}) {
//     try {
//         const metaArray = yield call(() => new Promise((resolve, reject) => {
//             function reqListener() {
//                 const resp = JSON.parse(this.responseText)
//                 if (resp.error) {
//                     reject(resp.error)
//                     return
//                 }
//                 resolve(resp)
//             }
//             const oReq = new XMLHttpRequest()
//             oReq.addEventListener('load', reqListener)
//             oReq.open('GET', '/http_metadata/' + link)
//             oReq.send()
//         }))
//         const {title, metaTags} = metaArray
//         let meta = {title}
//         for (let i = 0; i < metaTags.length; i++) {
//             const [name, content] = metaTags[i]
//             meta[name] = content
//         }
//         // http://postimg.org/image/kbefrpbe9/
//         meta = {
//             link,
//             card: meta['twitter:card'],
//             site: meta['twitter:site'], // @username tribbute
//             title: meta['twitter:title'],
//             description: meta['twitter:description'],
//             image: meta['twitter:image'],
//             alt: meta['twitter:alt'],
//         }
//         if(!meta.image) {
//             meta.image = meta['twitter:image:src']
//         }
//         yield put(GlobalReducer.actions.receiveMeta({id, meta}))
//     } catch(error) {
//         yield put(GlobalReducer.actions.receiveMeta({id, meta: {error}}))
//     }
// }

export function* watchFetchJsonRequests() {
    yield* takeEvery('global/FETCH_JSON', fetchJson);
}

/**
    @arg {string} id unique key for result global['fetchJson_' + id]
    @arg {string} url
    @arg {object} body (for JSON.stringify)
*/
function* fetchJson({payload: {id, url, body, successCallback, skipLoading = false}}) {
    try {
        const payload = {
            method: body ? 'POST' : 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : undefined
        }
        yield put({type: 'global/FETCHING_JSON', payload: true});
        let result = yield skipLoading ? fetch(url, payload) : call(fetch, url, payload)
        result = yield result.json()
        if (successCallback) result = successCallback(result)
        yield put({type: 'global/FETCHING_JSON', payload: false});
        yield put(GlobalReducer.actions.fetchJsonResult({id, result}))
    } catch(error) {
        console.error('fetchJson', error)
        yield put({type: 'global/FETCHING_JSON', payload: false});
        yield put(GlobalReducer.actions.fetchJsonResult({id, error}))
    }
}

export function* watchFetchExchangeRates() {
    yield* takeEvery('global/FETCH_EXCHANGE_RATES', fetchExchangeRates);
}

export function* fetchExchangeRates() {
  const fourHours = 1000 * 60 * 60 * 4;

  try {
    const created = localStorage.getItem('xchange.created') || 0;

    let pickedCurrency = localStorage.getItem('xchange.picked') || DEFAULT_CURRENCY;
    if (pickedCurrency.localeCompare(DEBT_TOKEN_SHORT) == 0) {
      pickedCurrency = DEFAULT_CURRENCY;
    }
    if (Date.now() - created < fourHours) {
      return;
    }
    // xchange rates are outdated or not exists
    console.log('xChange rates are outdated or not exists, fetching...')

    yield put({type: 'global/FETCHING_JSON', payload: true});

    let result = yield call(fetch, '/api/v1/rates/');
    result = yield result.json();

    if (result.error) {
      console.log('~~ Saga fetchExchangeRates error ~~>', '[0] The result is undefined.');
      storeExchangeValues();
      yield put({type: 'global/FETCHING_XCHANGE', payload: false});
      return;
    }
    if (
      typeof result === 'object' &&
      typeof result.rates === 'object' &&
      typeof result.rates.XAU === 'number' &&
      typeof result.rates[pickedCurrency] === 'number'
    ) {
      // store result into localstorage
      storeExchangeValues(Date.now(), 1/result.rates.XAU, result.rates[pickedCurrency], pickedCurrency);
    }
    else {
      console.log('~~ Saga fetchExchangeRates error ~~>', 'The result is undefined.');
      storeExchangeValues();
    }
    yield put({type: 'global/FETCHING_XCHANGE', payload: false});
  }
  catch(error) {
    // set default values
    storeExchangeValues();
    console.error('~~ Saga fetchExchangeRates error ~~>', error);
    yield put({type: 'global/FETCHING_XCHANGE', payload: false});
  }
}

function storeExchangeValues(created, gold, pair, picked) {
  localStorage.setItem('xchange.created', created || 0);
  localStorage.setItem('xchange.gold', gold || 1);
  localStorage.setItem('xchange.pair', pair || 1);
  localStorage.setItem('xchange.picked', picked || DEBT_TOKEN_SHORT);
}
