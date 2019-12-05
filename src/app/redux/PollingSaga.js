import { call, take, race } from 'redux-saga/effects';
import { delay } from 'redux-saga';

// Action constants
const START_POLLING = 'START_POLLING';
const STOP_POLLING = 'STOP_POLLING';

function* poll(action) {
    const params = { ...action.params };
    const stats = {
        isPolling: false,
        fetching: false,
        nextPollEta: null,
        retries: null,
        lastResponseStatus: null,
    };
    debugger;

    while (true) {
        // Start polling
        stats.isPolling = true;

        try {
            // Make the API call
            stats.fetching = true;
            params.onStatsChange(stats);
            debugger;
            const response = yield call(params.asyncFetch);
            stats.fetching = false;
            stats.nextPollEta = params.delay;
            const shouldContinue = params.callback(response, stats);

            // API call was successful
            if (shouldContinue) {
                stats.retries = 0;
                stats.lastResponseStatus = 'success';
                params.onStatsChange(stats);
            } else {
                params.onStatsChange(stats);
                throw new Error('Error while fetching data.');
            }

            for (let i = 1; i <= params.delay; ++i) {
                yield call(delay, 1000);
                stats.nextPollEta = params.delay - i;
                params.onStatsChange(stats);
            }
        } catch (e) {
            // API call was unsuccessful
            console.log(e);
            const shouldRetry =
                params.retryOnFailure &&
                stats.retries < params.stopAfterRetries;

            stats.fetching = false;
            stats.lastResponseStatus = 'error';
            stats.nextPollEta = shouldRetry ? params.retryAfter : null;
            params.onStatsChange(stats);
            params.callback(e, stats);

            if (shouldRetry) {
                // Update number of retries
                for (let i = 1; i <= params.retryAfter; ++i) {
                    yield call(delay, 1000);
                    stats.nextPollEta = params.retryAfter - i;
                    params.onStatsChange(stats);
                }

                ++stats.retries;
                yield put(startPolling(params));
            } else {
                stats.isPolling = false;
                params.onStatsChange(stats);
                yield put(stopPolling());
            }
        }
    }
}

export function* watchPollingTasks() {
    while (true) {
        const action = yield take(START_POLLING);
        yield race([call(poll, action), take(STOP_POLLING)]);
    }
}

export const startPolling = payload => ({
    type: START_POLLING,
    payload,
});
