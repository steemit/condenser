import {
    call,
    put,
    select,
    fork,
    takeLatest,
    takeEvery,
} from 'redux-saga/effects';
import { api } from '@steemit/steem-js';
import { loadFollows, fetchFollowCount } from 'app/redux/FollowSaga';
import { getContent } from 'app/redux/SagaShared';
import * as globalActions from './GlobalReducer';
import * as appActions from './AppReducer';
import constants from './constants';
import { fromJS, Map, Set } from 'immutable';
import { getStateAsync, callBridge } from 'app/utils/steemApi';

const REQUEST_DATA = 'fetchDataSaga/REQUEST_DATA';
const GET_CONTENT = 'fetchDataSaga/GET_CONTENT';
const FETCH_STATE = 'fetchDataSaga/FETCH_STATE';

export const fetchDataWatches = [
    takeLatest(REQUEST_DATA, fetchData),
    takeEvery(GET_CONTENT, getContentCaller),
    takeLatest('@@router/LOCATION_CHANGE', fetchState),
    takeLatest(FETCH_STATE, fetchState),
    takeEvery('global/FETCH_JSON', fetchJson),
];

export function* getContentCaller(action) {
    yield getContent(action.payload);
}

let is_initial_state = true;
export function* fetchState(location_change_action) {
    const { pathname } = location_change_action.payload;
    const m = pathname.match(/^\/@([a-z0-9\.-]+)/);
    if (m && m.length === 2) {
        const username = m[1];
        yield fork(fetchFollowCount, username);
        yield fork(loadFollows, 'getFollowersAsync', username, 'blog');
        yield fork(loadFollows, 'getFollowingAsync', username, 'blog');
    }

    // `ignore_fetch` case should only trigger on initial page load. No need to call
    // fetchState immediately after loading fresh state from the server. Details: #593
    const server_location = yield select(state =>
        state.offchain.get('server_location')
    );
    const ignore_fetch = pathname === server_location && is_initial_state;

    if (ignore_fetch) {
        return;
    }
    is_initial_state = false;
    if (
        process.env.BROWSER &&
        window &&
        window.optimize &&
        window.optimize.isInitialized
    ) {
        window.optimize.refreshAll({ refresh: false });
    }
    const url = pathname;

    yield put(appActions.fetchDataBegin());
    try {
        let username = null;
        if (process.env.BROWSER) {
            [username] = yield select(state => [
                state.user.getIn(['current', 'username']),
            ]);
        }
        const state = yield call(getStateAsync, url, username);
        yield put(globalActions.receiveState(state));
        yield call(syncSpecialPosts);
    } catch (error) {
        console.error('~~ Saga fetchState error ~~>', url, error);
        yield put(appActions.steemApiError(error.message));
    }

    yield put(appActions.fetchDataEnd());
}

function* syncSpecialPosts() {
    // Bail if we're rendering serverside since there is no localStorage
    if (!process.env.BROWSER) return null;

    // Get special posts from the store.
    const specialPosts = yield select(state =>
        state.offchain.get('special_posts')
    );

    // Mark seen featured posts.
    const seenFeaturedPosts = specialPosts.get('featured_posts').map(post => {
        const id = `${post.get('author')}/${post.get('permlink')}`;
        return post.set(
            'seen',
            localStorage.getItem(`featured-post-seen:${id}`) === 'true'
        );
    });

    // Mark seen promoted posts.
    const seenPromotedPosts = specialPosts.get('promoted_posts').map(post => {
        const id = `${post.get('author')}/${post.get('permlink')}`;
        return post.set(
            'seen',
            localStorage.getItem(`promoted-post-seen:${id}`) === 'true'
        );
    });

    // Look up seen post URLs.
    yield put(
        globalActions.syncSpecialPosts({
            featuredPosts: seenFeaturedPosts,
            promotedPosts: seenPromotedPosts,
        })
    );

    // Mark all featured posts as seen.
    specialPosts.get('featured_posts').forEach(post => {
        const id = `${post.get('author')}/${post.get('permlink')}`;
        localStorage.setItem(`featured-post-seen:${id}`, 'true');
    });

    // Mark all promoted posts as seen.
    specialPosts.get('promoted_posts').forEach(post => {
        const id = `${post.get('author')}/${post.get('permlink')}`;
        localStorage.setItem(`promoted-post-seen:${id}`, 'true');
    });
}

/**
 * Request account data for a set of usernames.
 *
 * @todo batch the put()s
 *
 * @param {Iterable} usernames
 */
function* getAccounts(usernames) {
    const accounts = yield call([api, api.getAccountsAsync], usernames);
    yield put(globalActions.receiveAccounts({ accounts }));
}

export function* fetchData(action) {
    const { order, author, permlink, accountname, postFilter } = action.payload;
    let { category } = action.payload;
    if (!category) category = '';
    category = category.toLowerCase();

    const account_sorts = {
        by_replies: 'replies',
        by_feed: 'feed',
        by_author: 'blog',
        by_comments: 'comments',
    };

    yield put(globalActions.fetchingData({ order, category }));
    let call_name, args;
    if (order in account_sorts) {
        call_name = 'get_account_posts';
        args = {
            sort: account_sorts[order],
            account: accountname,
            limit: constants.FETCH_DATA_BATCH_SIZE,
            start_author: author,
            start_permlink: permlink,
        };
    } else {
        call_name = 'get_ranked_posts';
        args = {
            sort: order,
            tag: category,
            limit: constants.FETCH_DATA_BATCH_SIZE,
            start_author: author,
            start_permlink: permlink,
        };
    }

    yield put(appActions.fetchDataBegin());
    try {
        let fetched = 0;
        let endOfData = false;
        let fetchLimitReached = false;
        let fetchDone = false;
        let batch = 0;
        while (!fetchDone) {
            const data = yield call(callBridge, call_name, args);

            endOfData = data.length < constants.FETCH_DATA_BATCH_SIZE;

            batch++;
            fetchLimitReached = batch >= constants.MAX_BATCHES;

            if (data.length > 0) {
                const lastValue = data[data.length - 1];
                args.start_author = lastValue.author;
                args.start_permlink = lastValue.permlink;
            }

            // Still return all data but only count ones matching the filter.
            // Rely on UI to actually hide the posts.
            fetched += postFilter
                ? data.filter(postFilter).length
                : data.length;

            fetchDone =
                endOfData ||
                fetchLimitReached ||
                fetched >= constants.FETCH_DATA_BATCH_SIZE;

            yield put(
                globalActions.receiveData({
                    data,
                    order,
                    category,
                    author,
                    accountname,
                    fetching: !fetchDone,
                    endOfData,
                })
            );
        }
    } catch (error) {
        console.error('~~ Saga fetchData error ~~>', call_name, args, error);
        yield put(appActions.steemApiError(error.message));
    }
    yield put(appActions.fetchDataEnd());
}

/**
    @arg {string} id unique key for result global['fetchJson_' + id]
    @arg {string} url
    @arg {object} body (for JSON.stringify)
*/
function* fetchJson({
    payload: { id, url, body, successCallback, skipLoading = false },
}) {
    try {
        const payload = {
            method: body ? 'POST' : 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        };
        let result = yield skipLoading
            ? fetch(url, payload)
            : call(fetch, url, payload);
        result = yield result.json();
        if (successCallback) result = successCallback(result);
        yield put(globalActions.fetchJsonResult({ id, result }));
    } catch (error) {
        console.error('fetchJson', error);
        yield put(globalActions.fetchJsonResult({ id, error }));
    }
}

// Action creators
export const actions = {
    requestData: payload => ({
        type: REQUEST_DATA,
        payload,
    }),

    getContent: payload => ({
        type: GET_CONTENT,
        payload,
    }),

    fetchState: payload => ({
        type: FETCH_STATE,
        payload,
    }),
};
