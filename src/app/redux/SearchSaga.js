import { put, takeEvery, call } from 'redux-saga/effects';
import * as reducer from 'app/redux/SearchReducer';
import { conductSearch, userSearch } from 'app/utils/ServerApiClient';

export const searchWatches = [takeEvery('search/SEARCH_DISPATCH', search)];

export function* search(action) {
    const { q, s, scroll_id, depth, sort } = action.payload;
    const append = action.payload.scroll_id ? true : false;
    yield put(reducer.searchPending({ pending: true }));
    // const luceneQuery = {
    //     term: {
    //         searchable: {
    //             value: q,
    //             boost: 1.0,
    //         },
    //     },
    // };
    const luceneQuery = {
        match_phrase: {
            searchable: {
                query: q,
                slop: 3,
            },
        },
    };

    const userQuery = {
        wildcard: {
            name: {
                value: `${q}*`,
            },
        },
    };

    try {
        const requestParams = {
            body: {
                searchQuery: {
                    size: 30,
                },
                depth: depth,
            },
        };
        if (depth < 2) {
            requestParams.body.searchQuery.query = luceneQuery;
            requestParams.body.searchQuery.sort = {
                [sort]: {
                    order: 'desc',
                },
            };
        } else {
            requestParams.body.searchQuery.query = userQuery;
        }
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

export function* searchReset(action) {
    yield put(reducer.searchReset());
}

export function* searchUser(action) {
    const searchUserResponse = yield call(userSearch, {});
}
