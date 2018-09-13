import { takeEvery, put } from 'redux-saga/effects';
import throttle from 'lodash/throttle';
import { dispatch } from 'app/clientRender';

import { GATE_SEND_MESSAGE } from '../constants/gate';
import {
    RATES_GET_HISTORICAL,
    RATES_GET_HISTORICAL_REQUEST,
    RATES_GET_HISTORICAL_SUCCESS,
    RATES_GET_HISTORICAL_ERROR,
    RATES_GET_ACTUAL,
    RATES_GET_ACTUAL_REQUEST,
    RATES_GET_ACTUAL_SUCCESS,
    RATES_GET_ACTUAL_ERROR,
} from '../constants/rates';

const queue = new Set();
const loading = new Set();

export default function* watch() {
    yield takeEvery(RATES_GET_HISTORICAL, loadHistorical);
    yield takeEvery(RATES_GET_ACTUAL, loadActual);
}

function* loadHistorical({ payload }) {
    if (!process.env.BROWSER) {
        return;
    }

    const { date } = payload;

    if (!queue.has(date) && !loading.has(date)) {
        queue.add(date);

        startLoadingLazy();
    }
}

function startLoading() {
    const load = Array.from(queue);

    for (let date of queue) {
        loading.add(date);
    }

    queue.clear();

    dispatch({
        type: GATE_SEND_MESSAGE,
        payload: {
            method: 'rates.getHistoricalMulti',
            types: [
                RATES_GET_HISTORICAL_REQUEST,
                RATES_GET_HISTORICAL_SUCCESS,
                RATES_GET_HISTORICAL_ERROR,
            ],
            data: {
                dates: load,
            },
        },
    });
}

const startLoadingLazy = throttle(startLoading, 150, { leading: false });

function* loadActual() {
    yield put({
        type: GATE_SEND_MESSAGE,
        payload: {
            method: 'rates.getActual',
            types: [RATES_GET_ACTUAL_REQUEST, RATES_GET_ACTUAL_SUCCESS, RATES_GET_ACTUAL_ERROR],
            data: {},
        },
    });
}
