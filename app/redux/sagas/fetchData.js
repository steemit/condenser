import { call, put, select, fork, cancelled, takeLatest, takeEvery } from 'redux-saga/effects';
import {loadFollows, fetchFollowCount} from 'app/redux/sagas/follow';
import {getContent} from 'app/redux/sagas/shared';
import GlobalReducer from './../GlobalReducer';
import constants from './../constants';
import { reveseTag } from 'app/utils/tags';
import { IGNORE_TAGS, PUBLIC_API, SELECT_TAGS_KEY, ACCOUNT_OPERATIONS } from 'app/client_config';
import cookie from "react-cookie";
import {api} from 'golos-js';
import { processBlog } from 'shared/state';
import { RATES_GET_ACTUAL } from 'src/app/redux/constants/rates';

const FETCH_MOST_RECENT = -1;
const DEFAULT_ACCOUNT_HISTORY_LIMIT = 500;

export function* fetchDataWatches () {
    yield fork(watchLocationChange);
    yield fork(watchDataRequests);
    yield fork(watchFetchJsonRequests);
    yield fork(watchFetchState);
    yield fork(watchGetContent);
    yield fork(watchFetchVestingDelegations);
}

function* watchGetContent() {
    yield takeEvery('GET_CONTENT', getContentCaller);
}

function* getContentCaller(action) {
    yield getContent(action.payload);
}

function* watchLocationChange() {
    yield takeLatest('@@router/LOCATION_CHANGE', fetchState);
}

function* watchFetchState() {
    yield takeLatest('FETCH_STATE', fetchState);
}

let is_initial_state = true;
function* fetchState(action) {
    const { pathname } = action.payload;

    let url = pathname;

    if (!url || url === '/') {
        url = 'trending';
    }

    if (url.startsWith('/')) {
        url = url.substr(1);
    }

    const profileMatch = url.match(/^@([a-z0-9\.-]+)(?:\/([^\/?#]+))?/);

    if (profileMatch) {
        const username = profileMatch[1];

        yield fork(fetchFollowCount, username);
        yield fork(loadFollows, 'getFollowersAsync', username, 'blog');
        yield fork(loadFollows, 'getFollowingAsync', username, 'blog');

        if (profileMatch[2] === 'transfers') {
            yield fork(fetchTransfers, username, FETCH_MOST_RECENT, DEFAULT_ACCOUNT_HISTORY_LIMIT);
            yield fork(fetchRewards, username, FETCH_MOST_RECENT, DEFAULT_ACCOUNT_HISTORY_LIMIT);
        }
    }

    // `ignoreFetch` case should only trigger on initial page load. No need to call
    // fetchState immediately after loading fresh state from the server. Details: #593
    const server_location = yield select(state => state.offchain.get('server_location'))
    const ignoreFetch = (pathname === server_location && is_initial_state)
    is_initial_state = false

    if (ignoreFetch) {
        return;
    }

    yield put({ type: 'FETCH_DATA_BEGIN' });
    yield put({ type: RATES_GET_ACTUAL });

    try {
        const parts = url.split('/')
        const state = {}
        state.current_route = location
        state.content = {}
        state.accounts = {}

        const accounts = new Set()

        if (parts[0][0] === '@') {
            const uname = parts[0].substr(1)
            const [ account ] = yield call([api, api.getAccountsAsync], [uname])
            state.accounts[uname] = account

            if (account) {
                account.tags_usage = yield call([api, api.getTagsUsedByAuthorAsync], uname)
                account.guest_bloggers = yield call([api, api.getBlogAuthorsAsync], uname)

                switch (parts[1]) {
                    case 'transfers':
                        // Загрузка данных происходит выше (безусловно, до ignoreFetch выхода).
                        break

                    case 'recent-replies':
                        const replies = yield call([api, api.getRepliesByLastUpdateAsync], uname, '', 50, constants.DEFAULT_VOTE_LIMIT)
                        account.recent_replies = []

                        replies.forEach(reply => {
                            const link = `${reply.author}/${reply.permlink}`
                            state.content[link] = reply
                            account.recent_replies.push(link)
                        })
                    break

                    case 'posts':
                    case 'comments':
                        const comments = yield call([api, api.getDiscussionsByCommentsAsync], { start_author: uname, limit: 20 })
                        account.comments = []

                        comments.forEach(comment => {
                            const link = `${comment.author}/${comment.permlink}`
                            state.content[link] = comment
                            account.comments.push(link)
                        })
                    break

                    case 'feed':
                        const feedEntries = yield call([api, api.getFeedEntriesAsync], uname, 0, 20)
                        account.feed = []

                        for (let key in feedEntries) {
                            const { author, permlink } = feedEntries[key]
                            const link = `${author}/${permlink}`
                            account.feed.push(link)
                            state.content[link] = yield call([api, api.getContentAsync], author, permlink, constants.DEFAULT_VOTE_LIMIT)

                            if (feedEntries[key].reblog_by.length > 0) {
                                state.content[link].first_reblogged_by = feedEntries[key].reblog_by[0]
                                state.content[link].reblogged_by = feedEntries[key].reblog_by
                                state.content[link].first_reblogged_on = feedEntries[key].reblog_on
                            }
                        }
                    break

                    case 'blog':
                    default:
                        yield processBlog(state, {
                            uname,
                            voteLimit: constants.DEFAULT_VOTE_LIMIT,
                        });
                    break
                }
            }

        } else if (parts.length === 3 && parts[1].length > 0 && parts[1][0] === '@') {
            const account = parts[1].substr(1)
            const category = parts[0]
            const permlink = parts[2]

            const curl = `${account}/${permlink}`
            state.content[curl] = yield call([api, api.getContentAsync], account, permlink, constants.DEFAULT_VOTE_LIMIT)
            accounts.add(account)

            const replies =  yield call([api, api.getAllContentRepliesAsync], account, permlink, constants.DEFAULT_VOTE_LIMIT)

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

        } else if (Object.keys(PUBLIC_API).includes(parts[0])) {
            const tag = parts[1] == null ? '' : parts[1];

            yield call(fetchData, {payload: { order: parts[0], category : tag }})

        } else if (parts[0] == 'tags') {
            const tags = {}
            const trending_tags = yield call([api, api.getTrendingTagsAsync], '', 250)
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
        yield put({type: 'FETCH_DATA_END'})
    } catch (error) {
        console.error('~~ Saga fetchState error ~~>', url, error);
        yield put({type: 'global/FETCHING_STATE', payload: false});
        yield put({type: 'global/CHAIN_API_ERROR', payload: false, error: error.message});

        if (!(yield cancelled())) {
            yield put({type: 'FETCH_DATA_END'})
        }
    }
}

export function* fetchTransfers(account, from, limit) {
    try {
        const transfers = yield call([api, api.getAccountHistoryAsync], account, from, limit, {
            select_ops: ACCOUNT_OPERATIONS,
        });
        yield put(GlobalReducer.actions.receiveTransfers({ account, transfers }));
    } catch (error) {
        console.log(error);
    }
}

export function* fetchRewards(account, from, limit, type) {
    const selectedRewards = type ? [type] : ['author_reward', 'curation_reward'];

    try {
        const rewards = yield call([api, api.getAccountHistoryAsync], account, from, limit, {
            select_ops: selectedRewards
        });
        yield put(GlobalReducer.actions.receiveRewards({ account, rewards }));
    } catch (error) {
        console.log(error);
    }
}

export function* watchDataRequests() {
    yield takeLatest('REQUEST_DATA', fetchData);
}

function* fetchData(action) {
    const {
        order,
        author,
        permlink,
        accountname,
        keys
    } = action.payload;
    let { category } = action.payload;

    if( !category ) category = "";
    category = category.toLowerCase();

    let call_name, args;
    args = [
        {
            limit: constants.FETCH_DATA_BATCH_SIZE,
            truncate_body: constants.FETCH_DATA_TRUNCATE_BODY,
            start_author: author,
            start_permlink: permlink
        }
    ];
    if (category.length) {
        const reversed = reveseTag(category)
        reversed
            ? args[0].select_tags = [ category, reversed ]
            : args[0].select_tags = [ category ]
    } else {
        let select_tags = cookie.load(SELECT_TAGS_KEY);
        if (select_tags && select_tags.length) {
            let selectTags = []

            select_tags.forEach( t => {
                const reversed = reveseTag(t)
                reversed
                ? selectTags = [ ...selectTags, t, reversed ]
                : selectTags = [ ...selectTags, t, ]

            })
            args[0].select_tags = selectTags;
            category = select_tags.sort().join('/')
        } else {
            args[0].filter_tags = IGNORE_TAGS
        }
    }

    yield put({ type: 'global/FETCHING_DATA', payload: { order, category } });

    if (order === 'trending') {
        call_name = PUBLIC_API.trending;
    } else if (order === 'promoted') {
        call_name = PUBLIC_API.promoted;
    } else if( order === 'active' /*|| order === 'updated'*/) {
        call_name = PUBLIC_API.active;
    } else if( order === 'cashout' ) {
        call_name = PUBLIC_API.cashout;
    } else if( order === 'payout' ) {
        call_name = PUBLIC_API.payout;
    } else if( order === 'created' || order === 'recent' ) {
        call_name = PUBLIC_API.created;
    } else if( order === 'responses' ) {
        call_name = PUBLIC_API.responses;
    } else if( order === 'votes' ) {
        call_name = PUBLIC_API.votes;
    } else if( order === 'hot' ) {
        call_name = PUBLIC_API.hot;
    } else if( order === 'by_feed' ) {
        call_name = 'getDiscussionsByFeedAsync';
        delete args[0].select_tags
        args[0].select_authors = [accountname];
    } else if (order === 'by_author') {
        call_name = 'getDiscussionsByBlogAsync';
        delete args[0].select_tags;
        args[0].select_authors = [accountname];
    } else if (order === 'by_comments') {
        delete args[0].select_tags;
        call_name = 'getDiscussionsByCommentsAsync';
    } else if( order === 'by_replies' ) {
        call_name = 'getRepliesByLastUpdateAsync';
        args = [author, permlink, constants.FETCH_DATA_BATCH_SIZE, constants.DEFAULT_VOTE_LIMIT];
    } else {
        call_name = PUBLIC_API.active;
    }

    yield put({ type: 'FETCH_DATA_BEGIN' });

    try {
        const data = yield call([api, api[call_name]], ...args);
        yield put(
            GlobalReducer.actions.receiveData({
                data,
                order,
                category,
                author,
                permlink,
                accountname,
                keys,
            })
        );
        yield put({ type: 'FETCH_DATA_END' });
    } catch (error) {
        console.error('~~ Saga fetchData error ~~>', call_name, args, error);
        yield put({ type: 'global/CHAIN_API_ERROR', payload: false, error: error.message });

        if (!(yield cancelled())) {
            yield put({ type: 'FETCH_DATA_END' });
        }
    }
}

function* watchFetchJsonRequests() {
    yield takeEvery('global/FETCH_JSON', fetchJson);
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

export function* watchFetchVestingDelegations() {
    yield takeLatest('global/FETCH_VESTING_DELEGATIONS', fetchVestingDelegations)
}

function* fetchVestingDelegations({ payload: { account, type } }) {
    const r = yield call([ api, api.getVestingDelegationsAsync ], account, '', 100, type)

    const vesting_delegations = {}
    for (let v in r) {
        vesting_delegations[ type === 'delegated' ? r[v].delegatee : r[v].delegator ] = r[v]
    }

    yield put(GlobalReducer.actions.receiveAccountVestingDelegations({ account, type, vesting_delegations }))
}
