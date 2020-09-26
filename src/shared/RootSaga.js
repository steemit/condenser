import { all } from 'redux-saga/effects';
import { globalWatches } from 'app/redux/GlobalSaga';
import { fetchDataWatches } from 'app/redux/FetchDataSaga';
import { sharedWatches } from 'app/redux/SagaShared';
import { userWatches } from 'app/redux/UserSaga';
import { authWatches } from 'app/redux/AuthSaga';
import { transactionWatches } from 'app/redux/TransactionSaga';
import { communityWatches } from 'app/redux/CommunitySaga';
import { userProfilesWatches } from 'app/redux/UserProfilesSaga';
import { searchWatches } from 'app/redux/SearchSaga';
import { watchPollingTasks } from 'app/redux/PollingSaga';

export default function* rootSaga() {
    yield all([
        ...userWatches, // keep first to remove keys early when a page change happens
        ...globalWatches,
        ...fetchDataWatches,
        ...sharedWatches,
        ...authWatches,
        ...transactionWatches,
        ...communityWatches,
        ...userProfilesWatches,
        ...searchWatches,
        watchPollingTasks(),
    ]);
}
