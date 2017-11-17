import {takeLatest, takeEvery} from 'redux-saga';
import {call, put, select, fork} from 'redux-saga/effects';
import {loadFollows, fetchFollowCount} from 'app/redux/FollowSaga';
import {getContent} from 'app/redux/SagaShared';
import constants from './constants';
import {api} from 'steem';

export const fetchDataWatches = [watchLocationChange, watchDataRequests, watchFetchJsonRequests, watchFetchState, watchGetContent];

export function* watchDataRequests() {
    yield* takeLatest('REQUEST_DATA', fetchData);
}

export function* watchGetContent() {
    yield* takeEvery('GET_CONTENT', getContentCaller);
}

export function* getContentCaller(action) {
    yield getContent(action.payload);
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
    const server_location = yield select(state => state.getIn(['offchain', 'server_location']));
    const ignore_fetch = (pathname === server_location && is_initial_state)
    is_initial_state = false;
    if(ignore_fetch) return;

    let url = `${pathname}`;
    if (url === '/') url = 'trending';
    // Replace /curation-rewards and /author-rewards with /transfers for UserProfile
    // to resolve data correctly
    if (url.indexOf("/curation-rewards") !== -1) url = url.replace("/curation-rewards", "/transfers");
    if (url.indexOf("/author-rewards") !== -1) url = url.replace("/author-rewards", "/transfers");

    yield put({type: 'FETCH_DATA_BEGIN'});
    try {
        const state = yield call([api, api.getStateAsync], url)
        yield put({type: 'global/RECEIVE_STATE', payload: state});
    } catch (error) {
        console.error('~~ Saga fetchState error ~~>', url, error);
        yield put({type: 'global/STEEM_API_ERROR', error: error.message});
    }
    yield put({type: 'FETCH_DATA_END'});
}

export function* watchLocationChange() {
    yield* takeLatest('@@router/LOCATION_CHANGE', fetchState);
}

export function* watchFetchState() {
    yield* takeLatest('FETCH_STATE', fetchState);
}

export function* fetchData(action) {
    const {order, author, permlink, accountname} = action.payload;
    let {category} = action.payload;
    if( !category ) category = "";
    category = category.toLowerCase();

    yield put({type: 'global/FETCHING_DATA', payload: {order, category}});
    let call_name, args;
    if (order === 'trending') {
        call_name = 'getDiscussionsByTrendingAsync';
        args = [
        { tag: category,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if (order === 'trending30') {
        call_name = 'getDiscussionsByTrending30Async';
        args = [
        { tag: category,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if (order === 'promoted') {
        call_name = 'getDiscussionsByPromotedAsync';
        args = [
        { tag: category,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if( order === 'active' ) {
        call_name = 'getDiscussionsByActiveAsync';
        args = [
        { tag: category,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if( order === 'cashout' ) {
        call_name = 'getDiscussionsByCashoutAsync';
        args = [
        { tag: category,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if( order === 'payout' ) {
        call_name = 'getPostDiscussionsByPayout';
        args = [
        { tag: category,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if( order === 'payout_comments' ) {
        call_name = 'getCommentDiscussionsByPayout';
        args = [
        { tag: category,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if( order === 'updated' ) {
        call_name = 'getDiscussionsByActiveAsync';
        args = [
        { tag: category,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if( order === 'created' || order === 'recent' ) {
        call_name = 'getDiscussionsByCreatedAsync';
        args = [
        { tag: category,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if( order === 'by_replies' ) {
        call_name = 'getRepliesByLastUpdateAsync';
        args = [author, permlink, constants.FETCH_DATA_BATCH_SIZE];
    } else if( order === 'responses' ) {
        call_name = 'getDiscussionsByChildrenAsync';
        args = [
        { tag: category,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if( order === 'votes' ) {
        call_name = 'getDiscussionsByVotesAsync';
        args = [
        { tag: category,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if( order === 'hot' ) {
        call_name = 'getDiscussionsByHotAsync';
        args = [
        { tag: category,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if( order === 'by_feed' ) { // https://github.com/steemit/steem/issues/249
        call_name = 'getDiscussionsByFeedAsync';
        args = [
        { tag: accountname,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if( order === 'by_author' ) {
        call_name = 'getDiscussionsByBlogAsync';
        args = [
        { tag: accountname,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if( order === 'by_comments' ) {
        call_name = 'getDiscussionsByCommentsAsync';
        args = [
        { limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else {
        call_name = 'getDiscussionsByActiveAsync';
        args = [{
            tag: category,
            limit: constants.FETCH_DATA_BATCH_SIZE,
            start_author: author,
            start_permlink: permlink}];
    }
    yield put({type: 'FETCH_DATA_BEGIN'});
    try {
        const data = yield call([api, api[call_name]], ...args);
        yield put({type: 'global/RECEIVE_DATA', payload: {data, order, category, author, permlink, accountname}});
    } catch (error) {
        console.error('~~ Saga fetchData error ~~>', call_name, args, error);
        yield put({type: 'global/STEEM_API_ERROR', error: error.message});
    }
    yield put({type: 'FETCH_DATA_END'});
}

// export function* watchMetaRequests() {
//     yield* takeLatest('global/REQUEST_META', fetchMeta);
// }
export function* fetchMeta({payload: {id, link}}) {
    try {
        const metaArray = yield call(() => new Promise((resolve, reject) => {
            function reqListener() {
                const resp = JSON.parse(this.responseText)
                if (resp.error) {
                    reject(resp.error)
                    return
                }
                resolve(resp)
            }
            const oReq = new XMLHttpRequest()
            oReq.addEventListener('load', reqListener)
            oReq.open('GET', '/http_metadata/' + link)
            oReq.send()
        }))
        const {title, metaTags} = metaArray
        let meta = {title}
        for (let i = 0; i < metaTags.length; i++) {
            const [name, content] = metaTags[i]
            meta[name] = content
        }
        // http://postimg.org/image/kbefrpbe9/
        meta = {
            link,
            card: meta['twitter:card'],
            site: meta['twitter:site'], // @username tribbute
            title: meta['twitter:title'],
            description: meta['twitter:description'],
            image: meta['twitter:image'],
            alt: meta['twitter:alt'],
        }
        if(!meta.image) {
            meta.image = meta['twitter:image:src']
        }
        yield put({type: 'global/RECEIVE_META', payload: {id, meta}})
    } catch(error) {
        yield put({type: 'global/RECEIVE_META', payload: {id, meta: {error}}})
    }
}

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
        let result = yield skipLoading ? fetch(url, payload) : call(fetch, url, payload)
        result = yield result.json()
        if(successCallback) result = successCallback(result)
        yield put({type: 'global/FETCH_JSON_RESULT', payload: {id, result}})
    } catch(error) {
        console.error('fetchJson', error)
        yield put({type: 'global/FETCH_JSON_RESULT', payload: {id, error}})
    }
}
