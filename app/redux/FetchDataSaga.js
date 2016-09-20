import {takeLatest, takeEvery} from 'redux-saga';
import {call, put, select, fork} from 'redux-saga/effects';
import {loadFollows} from 'app/redux/FollowSaga';
import Apis from 'shared/api_client/ApiInstances';
import GlobalReducer from './GlobalReducer';
import constants from './constants';
import {fromJS, Map} from 'immutable'

export const fetchDataWatches = [watchLocationChange, watchDataRequests, watchApiRequests, watchFetchJsonRequests, watchFetchState];

export function* watchDataRequests() {
    yield* takeLatest('REQUEST_DATA', fetchData);
}

export function* fetchState(location_change_action) {
    const {pathname} = location_change_action.payload;
    const m = pathname.match(/@([a-z0-9\.-]+)/)
    if(m && m.length === 2) {
        const username = m[1]
        const hasFollows = yield select(state => state.global.hasIn(['follow', 'get_followers', username]))
        if(!hasFollows) {
            yield fork(loadFollows, "get_followers", username, 'blog')
            yield fork(loadFollows, "get_following", username, 'blog')
        }
    }
    const server_location = yield select(state => state.offchain.get('server_location'));
    if (pathname === server_location) return;

    // virtual pageview
    const {ga} = window
    if(ga) {
        ga('set', 'page', pathname);
        ga('send', 'pageview');
    }

    let url = `${pathname}`;
    if (url === '/') url = 'trending';
    // Replace /curation-rewards and /author-rewards with /transfers for UserProfile
    // to resolve data correctly
    if (url.indexOf("/curation-rewards") !== -1) url = url.replace("/curation-rewards", "/transfers");
    if (url.indexOf("/author-rewards") !== -1) url = url.replace("/author-rewards", "/transfers");

    try {
        const db_api = Apis.instance().db_api;
        const state = yield call([db_api, db_api.exec], 'get_state', [url]);
        yield put(GlobalReducer.actions.receiveState(state));
    } catch (error) {
        console.error('~~ Saga fetchState error ~~>', url, error);
        yield put({type: 'global/STEEM_API_ERROR', error: error.message});
    }
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
        call_name = 'get_discussions_by_trending';
        args = [
        { tag: category,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if (order === 'trending30') {
        call_name = 'get_discussions_by_trending30';
        args = [
        { tag: category,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if (order === 'promoted') {
        call_name = 'get_discussions_by_promoted';
        args = [
        { tag: category,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if( order === 'active' ) {
        call_name = 'get_discussions_by_active';
        args = [
        { tag: category,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if( order === 'cashout' ) {
        call_name = 'get_discussions_by_cashout';
        args = [
        { tag: category,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if( order === 'updated' ) {
        call_name = 'get_discussions_by_active';
        args = [
        { tag: category,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if( order === 'created' || order === 'recent' ) {
        call_name = 'get_discussions_by_created';
        args = [
        { tag: category,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if( order === 'responses' ) {
        call_name = 'get_discussions_by_children';
        args = [
        { tag: category,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if( order === 'votes' ) {
        call_name = 'get_discussions_by_votes';
        args = [
        { tag: category,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if( order === 'hot' ) {
        call_name = 'get_discussions_by_hot';
        args = [
        { tag: category,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if( order === 'by_feed' ) { // https://github.com/steemit/steem/issues/249
        call_name = 'get_discussions_by_feed';
        args = [
        { tag: accountname,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else if( order === 'by_author' ) {
        call_name = 'get_discussions_by_blog';
        args = [
        { tag: accountname,
          limit: constants.FETCH_DATA_BATCH_SIZE,
          start_author: author,
          start_permlink: permlink}];
    } else {
        call_name = 'get_discussions_by_active';
        args = [{
            tag: category,
            limit: constants.FETCH_DATA_BATCH_SIZE,
            start_author: author,
            start_permlink: permlink}];
    }
    try {
        const db_api = Apis.instance().db_api;
        const data = yield call([db_api, db_api.exec], call_name, args);
        yield put(GlobalReducer.actions.receiveData({data, order, category, author, permlink, accountname}));
    } catch (error) {
        console.error('~~ Saga fetchData error ~~>', call_name, args, error);
        yield put({type: 'global/STEEM_API_ERROR', error: error.message});
    }
}

export function* watchApiRequests() {
    yield* takeEvery('global/FETCH_API', fetchApi);
}
export function* fetchApi({payload: {exec, key, reducer, skipLoading = false}}) {
    const [api, method, ...args] = exec
    try {
        const apiInst = Apis.instance()[api];
        yield put(GlobalReducer.actions.update({key, notSet: Map(),
            updater: m => m.mergeDeep({loading: true})
        }))
        const value = yield skipLoading ? apiInst.exec(method, args) :
            call([apiInst, apiInst.exec], method, args)
        let v = fromJS(value)
        if(reducer) v = v.reduce(...reducer)
        yield put(GlobalReducer.actions.update({key, notSet: Map(),
            updater: m => m.mergeDeep({result: v, error: null, loading: false})
        }))
    } catch (error) {
        console.error('~~ Saga fetchApi error ~~>', method, args, error);
        yield put(GlobalReducer.actions.set({key, value: {error, result: undefined, loading: false}}))
    }
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
        yield put(GlobalReducer.actions.receiveMeta({id, meta}))
    } catch(error) {
        yield put(GlobalReducer.actions.receiveMeta({id, meta: {error}}))
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
        yield put(GlobalReducer.actions.fetchJsonResult({id, result}))
    } catch(error) {
        console.error('fetchJson', error)
        yield put(GlobalReducer.actions.fetchJsonResult({id, error}))
    }
}
