import { call, put, all, select, takeEvery } from 'redux-saga/effects';
import { loadUserLazy } from 'src/app/helpers/users';
import {
    FAVORITE_COMPLETE_PAGE_LOADING,
    FAVORITE_LOAD,
    FAVORITE_TOGGLE,
    FAVORITE_LOAD_NEXT_PAGE,
    FAVORITE_LOADING_STARTED,
    FAVORITE_SET_DATA,
    FAVORITE_SET_PAGE_LOADING,
} from '../constants/favorites';

const PAGE_SIZE = 20;

export function* watch() {
    yield takeEvery(FAVORITE_LOAD, loadFavorite);
    yield takeEvery(FAVORITE_TOGGLE, toggleFavorite);
    yield takeEvery(FAVORITE_LOAD_NEXT_PAGE, loadFavoriteNextPage);
}

function* loadFavorite() {
    const favorite = yield select(state => state.data.favorite);

    if (favorite.isLoading) {
        return;
    }

    yield put({ type: FAVORITE_LOADING_STARTED, payload: {} });

    const data = yield call(loadFavoriteList);

    const isPageLoading = yield select(state => state.data.favorite.isPageLoading);

    yield put({
        type: FAVORITE_SET_DATA,
        payload: {
            list: data.list,
        },
    });

    if (isPageLoading) {
        yield loadFavoriteContent();
    }
}

function* loadFavoriteNextPage() {
    const favorite = yield select(state => state.data.favorite);

    if (
        favorite.isPageLoading ||
        (favorite.showList && favorite.list.size <= favorite.showList.size)
    ) {
        return;
    }

    yield put({ type: FAVORITE_SET_PAGE_LOADING, payload: {} });

    if (favorite.isLoaded) {
        yield loadFavoriteContent();
    }
}

function* loadFavoriteContent() {
    const favorite = yield select(state => state.data.favorite);

    const links = favorite.list.slice(0, favorite.pages * PAGE_SIZE).toJS();

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
        type: FAVORITE_COMPLETE_PAGE_LOADING,
        payload: {
            list: links,
        },
    });
}

function* toggleFavorite({ payload }) {
    console.log('CALL API TOGGLE FAVORITE', payload);
}

function loadFavoriteList() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                list: [
                    'ammo/edakukuruza',
                    'ksantoprotein/ksantoprotein-1534719525',
                    'vox-populi/ru-vp-top-izbrannye-publikaczii18082018',
                    'dartvader1987/kak-delat-golosovyye-zametki-na-iphone',
                    'poesie/ru-premxera-golosa-rubrika-audiokniga-rasskaz-yana-badevskogo-piktogrammy-chastx-6-ya',
                    'poesie/ru-poyeziya-golosa-rubrika-baijki-dlya-vzroslykh-rasskaz-viktora-markova-khuk-sleva-chastx-2-ya',
                    'fractal/fractal-res-jwildfire-660',
                    'cryptohook/sharing-economy-i-blokchein-proshai-uber',
                    'vox-populi/ru-vp-board-afisha-golosa-20-26-avgusta-2018',
                    'istfak/putx-voina-iz-czikla-rasskazy-o-voijne--glava-6-v-ozhidanii-',
                    'ms-boss/peru-strana-indeijczev-i-metisov',
                    'psk/pskpsk19082',
                    'kulebyaka/sorochonok',
                    'nikulinsb/rok-kalendarx-20-go-avgusta-1948-goda-rodilsya-robert-plant-vokalist-legendarnykh-led-zeppelin',
                    'nikulinsb/lyubovnyij-napitok-9-the-searchers-love-potion-number-9',
                    'chugoi/soczialxnyie-setizamenyaya-realxnuyu-zhiznx',
                    'kulturagolosa/programma-sodeistviya-druzhelyubiyu-vzaimovyruchke-i-tolerantnosti-otchet-za-19-08-2018',
                    'spinner/ru-svirepyij-khishchnik-na-okhote',
                    'elviento/street-vendors',
                    'psk/psk19081',
                    'vp-painting/ru-ogata-korin-odin-iz-krupneijshikh-khudozhnikov-srednevekovoij-yaponii',
                    'ammo/gigarama',
                ],
            });
        }, 1000);
    });
}
