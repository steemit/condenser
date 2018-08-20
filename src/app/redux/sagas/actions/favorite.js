import { call, put, all, select, takeEvery } from 'redux-saga/effects';
import { loadUserLazy } from 'src/app/helpers/users';

export function* watch() {
    yield takeEvery('FAVORITE/LOAD', loadFavorite);
    yield takeEvery('FAVORITE/TOGGLE', toggleFavorite);
}

function* loadFavorite() {
    const favorite = yield select(state => state.data.favorite);

    if (favorite.isLoading) {
        return;
    }

    yield put({ type: 'FAVORITE/LOADING_STARTED', payload: {} });

    const data = yield call(loadFavoriteList);

    const waits = [];

    for (let post of data.list) {
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
        type: 'FAVORITE/ADD_DATA',
        payload: data,
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
                ],
            });
        }, 1000);
    });
}
