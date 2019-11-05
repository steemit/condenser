import { put, takeEvery, call } from 'redux-saga/effects';
import axios from 'axios';
import * as reducer from 'app/redux/SearchReducer';

export const searchWatches = [takeEvery('search/SEARCH_DISPATCH', search)];

export function* search(action) {
    const searchParams = action.payload;
    yield put(reducer.searchPending({ pending: true }));
    try {
        const url = 'https://api.search.esteem.app/search';
        const fetchParams = {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                Authorization: 'SOME AUTH KEY HERE',
            },
            body: JSON.stringify({
                q: searchParams.category,
                sort: searchParams.order,
            }),
        };
        const searchResult = yield call(fetch, url, fetchParams);
        const searchJSON = yield call([searchResult, searchResult.json]);
        yield put(reducer.searchResult(searchJSON));
    } catch (error) {
        console.log('Search error', error);
        yield put(reducer.searchError({ error }));
    }
    yield put(reducer.searchPending({ pending: false }));
}
