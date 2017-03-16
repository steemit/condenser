import {takeLatest, takeEvery} from 'redux-saga';
import {call, put, select, fork} from 'redux-saga/effects';
import {loadFollows, fetchFollowCount} from 'app/redux/FollowSaga';
import {getContent} from 'app/redux/SagaShared';
import Apis from 'shared/api_client/ApiInstances';
import GlobalReducer from './GlobalReducer';
import constants from './constants';
import {fromJS, Map} from 'immutable'
import {IGNORE_TAGS, PUBLIC_API} from 'config/client_config';
import store from 'store';

export const fetchDataWatches = [watchLocationChange, watchDataRequests, watchApiRequests, watchFetchJsonRequests, watchFetchState, watchGetContent];

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
        yield fork(loadFollows, "get_followers", username, 'blog')
        yield fork(loadFollows, "get_following", username, 'blog')
    }

    // `ignore_fetch` case should only trigger on initial page load. No need to call
    // fetchState immediately after loading fresh state from the server. Details: #593
    const server_location = yield select(state => state.offchain.get('server_location'));
    const ignore_fetch = (pathname === server_location && is_initial_state)
    is_initial_state = false;
    if(ignore_fetch) return;

    let url = `${pathname}`;
    if (url === '/') url = 'trending';
    // Replace /curation-rewards and /author-rewards with /transfers for UserProfile
    // to resolve data correctly
    if (url.indexOf("/curation-rewards") !== -1) url = url.replace("/curation-rewards", "/transfers");
    if (url.indexOf("/author-rewards") !== -1) url = url.replace("/author-rewards", "/transfers");

    try {
        const db_api = Apis.instance().db_api;

        // const _state = yield call([db_api, db_api.exec], 'get_state', [url]);
        // ################################################################################
        let _state = {};

        // if empty or equal '/''
        if (!url || typeof url !== 'string' || !url.length || url === '/') url = 'trending';
        // remove / from start
        if (url[0] === '/') url = url.substr(1)
        // get parts of current url
        const parts = url.split('/')
        // create tag
        const tag = parts[1]

        // TODO fix bread ration
        if (parts[0][0] === '@') {
          _state = yield call([db_api, db_api.exec], 'get_state', [url]);
        }
        else {
          const dynamic_global_properties = yield call([db_api, db_api.exec], 'get_dynamic_global_properties', [])
          const feed_history              = yield call([db_api, db_api.exec], 'get_feed_history', []);
          const witness_schedule          = yield call([db_api, db_api.exec], 'get_witness_schedule', [])

          _state.current_route = parts[0];
          _state.props = dynamic_global_properties;
          _state.category_idx = { "active": [], "recent": [], "best": [] };
          _state.categories = {};
          _state.tags = {};
          _state.content = {};
          _state.accounts = {};
          _state.pow_queue = [];
          _state.witnesses = {};
          _state.discussion_idx = {};
          _state.witness_schedule = witness_schedule;
          _state.feed_price = feed_history.current_median_history; // { "base":"1.000 GBG", "quote":"1.895 GOLOS" },

          // by default trending tags limit=50, but if we in '/tags/' path then limit = 250
          let tags_limit = 50;
          if (parts[0] == "tags") {
            tags_limit = 250
          }
          const trending_tags = yield call([db_api, db_api.exec], 'get_trending_tags', ['',`${tags_limit}`]);

          if (parts[0][0] === '@') {
            const uname = parts[0].substr(1)
            accounts[uname] = yield call([db_api, db_api.exec], 'get_accounts', [uname]);

            // FETSH part 2
            switch (parts[1]) {
              case 'transfers':
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
            //
          }
          else if ([ 'trending', 'trending30', 'promoted', 'responses', 'hot', 'votes', 'cashout', 'active', 'created', 'recent' ].indexOf(parts[0]) >= 0) {
            const args = [{
              tag: tag,
              limit: constants.FETCH_DATA_BATCH_SIZE,
              truncate_body: '1024'
            }]
            let select_tags = store.get('select_tags');
            if (!tag && select_tags && select_tags.length) {
              args[0].select_tags = select_tags
              // args[0].select_metadata_tags = select_tags;
            }
            else {
              args[0].filter_tags = IGNORE_TAGS
              // args[0].filter_metadata_tags = IGNORE_TAGS;
            }
            const discussions = yield call([db_api, db_api.exec], PUBLIC_API[parts[0]][0], args);
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
            _state.discussion_idx = { "": discussion_idxes }
            accounts = yield call([db_api, db_api.exec], 'get_accounts', [accounts]);
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
            _state.content[key].active_votes = yield call([db_api, db_api.exec], 'get_active_votes', [_state.content[key].author, _state.content[key].permlink]);
        }
        // ################################################################################

        yield put(GlobalReducer.actions.receiveState(_state));
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
    args = [{
      tag: category,
      limit: constants.FETCH_DATA_BATCH_SIZE,
      start_author: author,
      start_permlink: permlink
    }];
    let select_tags = store.get('select_tags');
    if (select_tags && select_tags.length) {
      args[0].select_tags = select_tags;
      args[0].select_metadata_tags = select_tags;
    }
    else {
      args[0].filter_tags = IGNORE_TAGS
      args[0].filter_metadata_tags = IGNORE_TAGS;
    }
    if (order === 'trending') {
        call_name = 'get_discussions_by_trending';
    } else if (order === 'trending30') {
        call_name = 'get_discussions_by_trending30';
    } else if (order === 'promoted') {
        call_name = 'get_discussions_by_promoted';
    } else if( order === 'active' ) {
        call_name = 'get_discussions_by_active';
    } else if( order === 'cashout' ) {
        call_name = 'get_discussions_by_cashout';
    } else if( order === 'updated' ) {
        call_name = 'get_discussions_by_active';
    } else if( order === 'created' || order === 'recent' ) {
        call_name = 'get_discussions_by_created';
    } else if( order === 'by_replies' ) {
        call_name = 'get_replies_by_last_update';
        args = [author, permlink, constants.FETCH_DATA_BATCH_SIZE];
    } else if( order === 'responses' ) {
        call_name = 'get_discussions_by_children';
    } else if( order === 'votes' ) {
        call_name = 'get_discussions_by_votes';
    } else if( order === 'hot' ) {
        call_name = 'get_discussions_by_hot';
    } else if( order === 'by_feed' ) { // https://github.com/steemit/steem/issues/249
        call_name = 'get_discussions_by_feed';
        args[0].tag = accountname;
    } else if( order === 'by_author' ) {
        call_name = 'get_discussions_by_blog';
        args[0].tag = accountname;
    } else if( order === 'by_comments' ) {
        call_name = 'get_discussions_by_comments';
        delete args[0].tag
    } else {
        call_name = 'get_discussions_by_active';
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
