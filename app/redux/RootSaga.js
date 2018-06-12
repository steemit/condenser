import { all, fork } from 'redux-saga/effects'
import { fetchDataWatches } from 'app/redux/FetchDataSaga';
import { marketWatches } from 'app/redux/MarketSaga';
import { sharedWatches } from 'app/redux/SagaShared';
import { userWatches } from 'app/redux/UserSaga';
import { authWatches } from 'app/redux/AuthSaga';
import { transactionWatches } from 'app/redux/TransactionSaga';
import PollDataSaga from 'app/redux/PollDataSaga';


export default function* rootSaga() {
  yield all([
    ...userWatches, // keep first to remove keys early when a page change happens
    PollDataSaga,
    ...fetchDataWatches,
    ...sharedWatches,
    ...authWatches,
    ...transactionWatches,
    ...marketWatches,
  ])
}