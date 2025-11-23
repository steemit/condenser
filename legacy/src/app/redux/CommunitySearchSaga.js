import { put, takeEvery, call } from 'redux-saga/effects';
import * as reducer from 'app/redux/CommunitySearchReducer';

export const searchWatches = [
    takeEvery('communitySearch/COMMUNITY_SEARCH_DISPATCH', communitySearchSaga),
];

export function* communitySearchSaga(action) {
    // const { q, s, scroll_id } = action.payload;
    yield put(reducer.communitySearchPending({ pending: true }));
    try {
        // TODO: Search Call goes here, waiting on API endpoint
        //yield put(reducer.searchResult({ , append }));
    } catch (error) {
        console.log('Search error', error);
        yield put(reducer.communitySearchError({ error }));
    }
    yield put(reducer.communitySearchPending({ pending: false }));
}
