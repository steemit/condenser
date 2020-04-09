import { put, takeEvery, call } from 'redux-saga/effects';
import * as reducer from 'app/redux/SearchReducer';
import { conductSearch } from 'app/utils/ServerApiClient';

export const searchWatches = [takeEvery('search/SEARCH_DISPATCH', search)];

export function* search(action) {
    const { q, s, scroll_id } = action.payload;
    const append = action.payload.scroll_id ? true : false;
    yield put(reducer.searchPending({ pending: true }));
    const luceneQuery = {
        term: {
            searchable: {
                value: q,
                boost: 1.0,
            },
        },
    };
    try {
        const requestParams = {
            body: {
                searchQuery: {
                    size: 30,
                    query: luceneQuery,
                },
            },
        };
        if (scroll_id) {
            requestParams.body.scrollQuery = {
                scroll: '1m',
                scroll_id,
            };
        }
        const searchResponse = yield call(conductSearch, requestParams);
        const searchJSON = yield call([searchResponse, searchResponse.json]);
        yield put(reducer.searchResult({ ...searchJSON, append }));
    } catch (error) {
        console.log('Search error', error);
        yield put(reducer.searchError({ error }));
    }
    yield put(reducer.searchPending({ pending: false }));
}
