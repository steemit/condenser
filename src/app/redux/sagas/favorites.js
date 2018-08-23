import { call, put, all, select, takeEvery } from 'redux-saga/effects';
import { loadUserLazy } from 'src/app/helpers/users';
import {
    FAVORITES_COMPLETE_PAGE_LOADING,
    FAVORITES_LOAD,
    FAVORITES_TOGGLE,
    FAVORITES_LOAD_NEXT_PAGE,
    FAVORITES_LOADING_STARTED,
    FAVORITES_SET_DATA,
    FAVORITES_SET_PAGE_LOADING,
} from '../constants/favorites';

const PAGE_SIZE = 20;

export default function* watch() {
    yield takeEvery(FAVORITES_LOAD, loadFavorites);
    yield takeEvery(FAVORITES_TOGGLE, toggleFavorite);
    yield takeEvery(FAVORITES_LOAD_NEXT_PAGE, loadFavoritesNextPage);
}

function* loadFavorites() {
    const favorites = yield select(state => state.data.favorites);

    if (favorites.isLoading) {
        return;
    }

    yield put({ type: FAVORITES_LOADING_STARTED, payload: {} });

    const data = yield call(loadFavoritesList);

    const isPageLoading = yield select(state => state.data.favorites.isPageLoading);

    yield put({
        type: FAVORITES_SET_DATA,
        payload: {
            list: data.list,
        },
    });

    if (isPageLoading) {
        yield loadFavoriteContent();
    }
}

function* loadFavoritesNextPage() {
    const favorites = yield select(state => state.data.favorites);

    if (
        favorites.isPageLoading ||
        (favorites.showList && favorites.list.size <= favorites.showList.size)
    ) {
        return;
    }

    yield put({ type: FAVORITES_SET_PAGE_LOADING, payload: {} });

    if (favorites.isLoaded) {
        yield loadFavoriteContent();
    }
}

function* loadFavoriteContent() {
    const favorites = yield select(state => state.data.favorites);

    const links = favorites.list.slice(0, favorites.pages * PAGE_SIZE).toJS();

    const waits = [];

    for (let post of links) {
        const global = yield select(state => state.global);
        const postData = global.getIn(['content', post]);

        if (!postData) {
            const [author, permLink] = post.split('/');

            let resolve;
            let reject;

            const promise = new Promise((_resolve, _reject) => {
                resolve = _resolve;
                reject = _reject;
            });

            yield put({
                type: 'GET_CONTENT',
                payload: {
                    author,
                    permlink: permLink,
                    resolve,
                    reject,
                },
            });

            waits.push(
                promise.then(data => {
                    loadUserLazy(data.author);
                })
            );
        }
    }

    yield all(waits);

    yield put({
        type: FAVORITES_COMPLETE_PAGE_LOADING,
        payload: {
            list: links,
        },
    });
}

function* toggleFavorite({ payload }) {
    console.log('CALL API TOGGLE FAVORITE', payload);
}

function loadFavoritesList() {
    // Stub
    return Promise.resolve([]);
}
