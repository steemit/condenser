import {
    call,
    put,
    select,
    fork,
    takeLatest,
    takeEvery,
} from 'redux-saga/effects';
import { api } from '@steemit/steem-js';
import { loadFollows } from 'app/redux/FollowSaga';
import * as globalActions from './GlobalReducer';
import * as appActions from './AppReducer';
import * as userActions from 'app/redux/UserReducer';
import * as transactionActions from './TransactionReducer';
import constants from './constants';
import { fromJS, Map, Set } from 'immutable';
import { getStateAsync, callBridge } from 'app/utils/steemApi';

const REQUEST_DATA = 'fetchDataSaga/REQUEST_DATA';
const FETCH_STATE = 'fetchDataSaga/FETCH_STATE';
const GET_POST_HEADER = 'fetchDataSaga/GET_POST_HEADER';
const GET_COMMUNITY = 'fetchDataSaga/GET_COMMUNITY';
const LIST_COMMUNITIES = 'fetchDataSaga/LIST_COMMUNITIES';
const GET_SUBSCRIPTIONS = 'fetchDataSaga/GET_SUBSCRIPTIONS';
const GET_NOTICES = 'fetchDataSaga/GET_NOTICES';
const GET_FOLLOWERS = 'fetchDataSaga/GET_FOLLOWERS';
const UPDATE_FOLLPWERSLIST = 'fetchDataSaga/UPDATE_FOLLPWERSLIST';
const GET_ACCOUNT_NOTIFICATIONS = 'fetchDataSaga/GET_ACCOUNT_NOTIFICATIONS';
const GET_UNREAD_ACCOUNT_NOTIFICATIONS =
    'fetchDataSaga/GET_UNREAD_ACCOUNT_NOTIFICATIONS';
const MARK_NOTIFICATIONS_AS_READ = 'fetchDataSaga/MARK_NOTIFICATIONS_AS_READ';
const GET_REWARDS_DATA = 'fetchDataSaga/GET_REWARDS_DATA';

export const fetchDataWatches = [
    takeLatest(REQUEST_DATA, fetchData),
    takeLatest('@@router/LOCATION_CHANGE', fetchState),
    takeLatest(FETCH_STATE, fetchState),
    takeEvery('global/FETCH_JSON', fetchJson),
    takeEvery(GET_POST_HEADER, getPostHeader),
    takeEvery(GET_COMMUNITY, getCommunity),
    takeLatest(GET_SUBSCRIPTIONS, getSubscriptions),
    takeLatest(GET_NOTICES, getNotices),
    takeLatest(GET_FOLLOWERS, getFollowers),
    takeLatest(UPDATE_FOLLPWERSLIST, updateFollowersList),
    takeEvery(LIST_COMMUNITIES, listCommunities),
    takeEvery(GET_ACCOUNT_NOTIFICATIONS, getAccountNotifications),
    takeEvery(
        GET_UNREAD_ACCOUNT_NOTIFICATIONS,
        getUnreadAccountNotificationsSaga
    ),
    takeEvery(GET_REWARDS_DATA, getRewardsDataSaga),
    takeEvery(MARK_NOTIFICATIONS_AS_READ, markNotificationsAsReadSaga),
];

export function* getPostHeader(action) {
    const header = yield call(callBridge, 'get_post_header', action.payload);
    const { author, permlink } = action.payload;
    const key = author + '/' + permlink;
    yield put(globalActions.receivePostHeader({ [key]: header }));
}

let is_initial_state = true;
export function* fetchState(location_change_action) {
    const { pathname } = location_change_action.payload;
    const m = pathname.match(/^\/@([a-z0-9\.-]+)(\/notifications)?/);
    if (m && m.length >= 2) {
        const username = m[1];
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
        const state = yield call(getStateAsync, url, username, false);
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

/**
 * Request all communities
 * @param {}
 */
export function* listCommunities(action) {
    const { observer, query, sort } = action.payload;
    try {
        const communities = yield call(callBridge, 'list_communities', {
            observer,
            query,
            sort,
        });
        // if (communities.length > 0) {
        yield put(
            globalActions.receiveCommunities(
                communities.length > 0 ? communities : []
            )
        );
        // }
    } catch (error) {
        console.log('Error requesting communities:', error);
    }
}

/**
 * Request data for given community
 * @param {string} name of community
 */
export function* getCommunity(action) {
    if (!action.payload) throw 'no community specified';

    const currentUser = yield select(state => state.user.get('current'));
    const currentUsername = currentUser && currentUser.get('username');

    // TODO: If no current user is logged in, skip the observer param.
    const community = yield call(callBridge, 'get_community', {
        name: action.payload,
        observer: currentUsername,
    });

    // TODO: Handle error state
    if (community.name)
        yield put(
            globalActions.receiveCommunity({
                [community.name]: { ...community },
            })
        );
}

/**
 * Request all user subscriptions
 * @param {string} name of account
 */
export function* getSubscriptions(action) {
    if (!action.payload) throw 'no account specified';
    yield put(globalActions.loadingSubscriptions(true));
    try {
        const subscriptions = yield call(callBridge, 'list_all_subscriptions', {
            account: action.payload,
        });
        yield put(
            globalActions.receiveSubscriptions({
                subscriptions,
                username: action.payload,
            })
        );
    } catch (error) {
        console.log('Error Fetching Account Subscriptions: ', error);
    }
    yield put(globalActions.loadingSubscriptions(false));
}

/**
 * Request Notices
 * @param {string} name of account
 */
export function* getNotices(action) {
    try {
        const notices = yield call(
            callBridge,
            'get_notices',
            {
                limit: 1,
            },
            'turtle.'
        );
        yield put(globalActions.receiveNotices(notices));
    } catch (error) {
        console.log('Error Fetching get_notices: ', error);
    }
}

/**
 * Request Notices
 * @param {string} name of account
 */
export function* getFollowers(action) {
    console.log(action.payload);
    const { title, accountname, currentPage, per_page } = action.payload;
    try {
        const list = yield call(
            callBridge,
            title === 'Followers'
                ? 'get_followers_by_page'
                : 'get_following_by_page',
            [accountname, currentPage, per_page, 'blog'],
            'condenser_api.'
        );
        console.log(list);
        yield put(globalActions.receiveFollowersList(list));
    } catch (error) {
        console.log('Error Fetching receiveFollowersList: ', error);
    }
}

export function* updateFollowersList(list) {
    console.log(list);
    try {
        yield put(globalActions.receiveFollowersList([]));
    } catch (error) {
        console.log('Error Fetching updateFollowersList: ', error);
    }
}

/**
 * Request notifications for given account
 * @param {object} payload containing:
 *   - account (string)
 *   - last_id (string), optional, for pagination
 *   - limit (int), optional, defualt is 100
 */
export function* getAccountNotifications(action) {
    if (!action.payload) throw 'no account specified';
    yield put(globalActions.notificationsLoading(true));
    try {
        const notifications = yield call(
            callBridge,
            'account_notifications',
            action.payload
        );

        if (notifications && notifications.error) {
            console.error(
                '~~ Saga getAccountNotifications error ~~>',
                notifications.error
            );
            yield put(appActions.steemApiError(notifications.error.message));
        } else {
            const limit = action.payload.limit ? action.payload.limit : 100;
            const isLastPage = notifications.length < action.payload.limit;
            yield put(
                globalActions.receiveNotifications({
                    name: action.payload.account,
                    notifications,
                    isLastPage,
                })
            );
        }
    } catch (error) {
        console.error('~~ Saga getAccountNotifications error ~~>', error);
        yield put(appActions.steemApiError(error.message));
    }
    yield put(globalActions.notificationsLoading(false));
}

/**
 * Request unread notifications for given account
 * @param {object} payload containing:
 *   - account (string)
 */

export function* getUnreadAccountNotificationsSaga(action) {
    if (!action.payload) throw 'no account specified';
    yield put(globalActions.notificationsLoading(true));
    try {
        const unreadNotifications = yield call(
            callBridge,
            'unread_notifications',
            action.payload
        );
        if (unreadNotifications && unreadNotifications.error) {
            console.error(
                '~~ Saga getUnreadAccountNotifications error ~~>',
                unreadNotifications.error
            );
            yield put(
                appActions.steemApiError(unreadNotifications.error.message)
            );
        } else {
            yield put(
                globalActions.receiveUnreadNotifications({
                    name: action.payload.account,
                    unreadNotifications,
                })
            );
        }
    } catch (error) {
        console.error('~~ Saga getUnreadAccountNotifications error ~~>', error);
        yield put(appActions.steemApiError(error.message));
    }
    yield put(globalActions.notificationsLoading(false));
}

export function* markNotificationsAsReadSaga(action) {
    const { timeNow, username, successCallback } = action.payload;
    const ops = ['setLastRead', { date: timeNow }];
    yield put(globalActions.notificationsLoading(true));
    try {
        yield put(
            transactionActions.broadcastOperation({
                type: 'custom_json',
                operation: {
                    id: 'notify',
                    required_posting_auths: [username],
                    json: JSON.stringify(ops),
                },
                successCallback: () => {
                    successCallback(username, timeNow);
                },
                errorCallback: () => {
                    console.log(
                        'There was an error marking notifications as read!'
                    );
                    globalActions.notificationsLoading(false);
                },
            })
        );
    } catch (error) {
        yield put(globalActions.notificationsLoading(false));
    }
}

export function* fetchData(action) {
    // TODO: postFilter unused
    const { order, author, permlink, postFilter, observer } = action.payload;
    let { category } = action.payload;
    if (!category) category = '';

    yield put(globalActions.fetchingData({ order, category }));
    let call_name, args;
    if (category[0] == '@') {
        call_name = 'get_account_posts';
        args = {
            sort: order,
            account: category.slice(1),
            limit: constants.FETCH_DATA_BATCH_SIZE,
            start_author: author,
            start_permlink: permlink,
            observer,
        };
    } else {
        call_name = 'get_ranked_posts';
        args = {
            sort: order,
            tag: category,
            limit: constants.FETCH_DATA_BATCH_SIZE,
            start_author: author,
            start_permlink: permlink,
            observer,
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
export function* getRewardsDataSaga(action) {
    yield put(appActions.fetchDataBegin());
    try {
        const rewards = yield call(callBridge, 'get_payout_stats', {});
        if (rewards && rewards.error) {
            console.error(
                '~~ Saga getRewardsDataSaga error ~~>',
                rewards.error
            );
            yield put(appActions.steemApiError(rewards.error.message));
        } else {
            yield put(globalActions.receiveRewards({ rewards }));
        }
    } catch (error) {
        console.error('~~ Saga getRewardsDataSaga error ~~>', error);
        yield put(appActions.steemApiError(error.message));
    }
    yield put(appActions.fetchDataEnd());
}

// Action creators
export const actions = {
    listCommunities: payload => ({
        type: LIST_COMMUNITIES,
        payload,
    }),

    getCommunity: payload => {
        return {
            type: GET_COMMUNITY,
            payload,
        };
    },

    getSubscriptions: payload => ({
        type: GET_SUBSCRIPTIONS,
        payload,
    }),

    getNotices: payload => ({
        type: GET_NOTICES,
        payload,
    }),

    getFollowers: payload => ({
        type: GET_FOLLOWERS,
        payload,
    }),

    updateFollowersList: payload => ({
        type: UPDATE_FOLLPWERSLIST,
        payload,
    }),

    getAccountNotifications: payload => ({
        type: GET_ACCOUNT_NOTIFICATIONS,
        payload,
    }),

    getUnreadAccountNotifications: payload => ({
        type: GET_UNREAD_ACCOUNT_NOTIFICATIONS,
        payload,
    }),

    markNotificationsAsRead: payload => ({
        type: MARK_NOTIFICATIONS_AS_READ,
        payload,
    }),

    requestData: payload => ({
        type: REQUEST_DATA,
        payload,
    }),

    getPostHeader: payload => ({
        type: GET_POST_HEADER,
        payload,
    }),

    fetchState: payload => ({
        type: FETCH_STATE,
        payload,
    }),

    getRewardsData: payload => ({
        type: GET_REWARDS_DATA,
        payload,
    }),
};
