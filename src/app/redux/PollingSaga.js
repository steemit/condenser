import { put, call, take, race } from 'redux-saga/effects';
import { delay } from 'redux-saga';

const START_POLLING = 'START_POLLING';
const STOP_POLLING = 'STOP_POLLING';

function* poll(action) {
    const params = { ...action.payload };
    while (true) {
        try {
            yield put(params.pollAction(params.pollPayload));
            yield call(delay, params.delay);
        } catch (e) {
            // If there's an error, polling will stop.
            yield put(stopPolling());
        }
    }
}

export function* watchPollingTasks() {
    while (true) {
        const action = yield take(START_POLLING);
        yield race([call(poll, action), take(STOP_POLLING)]);
    }
}

export const startPolling = payload => {
    return {
        type: START_POLLING,
        payload,
    };
};

export const stopPolling = payload => {
    return {
        type: STOP_POLLING,
        payload,
    };
};
