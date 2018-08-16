import { all, fork } from 'redux-saga/effects'
import { fetchDataWatches } from 'app/redux/FetchDataSaga';
import { marketWatches } from 'app/redux/MarketSaga';
import { sharedWatches } from 'app/redux/SagaShared';
import { userWatches } from 'app/redux/UserSaga';
import { authWatches } from 'app/redux/AuthSaga';
import { transactionWatches } from 'app/redux/TransactionSaga';
import gateWatches from 'src/app/redux/sagas/gate';
import notificationsOnlineWatches from 'src/app/redux/sagas/notificationsOnline';


export default function* rootSaga() {
  yield fork(userWatches);
  yield fork(fetchDataWatches)
  yield fork(sharedWatches)
  yield fork(authWatches)
  yield fork(transactionWatches)
  yield fork(marketWatches)
  yield fork(gateWatches)
  yield fork(notificationsOnlineWatches)
}