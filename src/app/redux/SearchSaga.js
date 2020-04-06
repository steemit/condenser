import { put, takeEvery, call } from 'redux-saga/effects';
import * as reducer from 'app/redux/SearchReducer';
import { conductSearch } from 'app/utils/ServerApiClient';

export const searchWatches = [takeEvery('search/SEARCH_DISPATCH', search)];

export function* search(action) {
    const { q, s, scroll_id } = action.payload;
    const append = action.payload.scroll_id ? true : false;
    yield put(reducer.searchPending({ pending: true }));
    // https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html
    const lucerneQuery = {
        query_string: { query: q, default_field: 'searchable' },
    };
    try {
        const requestParams = {
            body: {
                size: 200,
                query: lucerneQuery,
            },
        };
        const searchResponse = yield call(conductSearch, requestParams);
        const searchJSON = yield call([searchResponse, searchResponse.json]);
        yield put(reducer.searchResult({ ...searchJSON, append }));
    } catch (error) {
        console.log('Search error', error);
        yield put(reducer.searchError({ error }));
    }
    yield put(reducer.searchPending({ pending: false }));
}
