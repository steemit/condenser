import axios from 'axios';
import * as appActions from 'app/redux/AppReducer';
import { put, select, takeLatest } from 'redux-saga/effects';

export const appWatches = [
    takeLatest(appActions.REFRESH_WEATHER, refreshWeather),
];

function* refreshWeather() {
    console.info('AppSaga.refreshWeather');

    const weatherEndpoint = yield select(state =>
        state.app.get('weatherEndpoint')
    );
    const response = yield axios({
        url: weatherEndpoint,
    });

    yield put(appActions.refreshedWeather(response.data));
}
