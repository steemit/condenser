import { fork } from 'redux-saga/effects'
import { fetchDataWatches } from 'app/redux/sagas/fetchData';
import { marketWatches } from 'app/redux/sagas/market';
import { sharedWatches } from 'app/redux/sagas/shared';
import { userWatches } from 'app/redux/sagas/user';
import { authWatches } from 'app/redux/sagas/auth';
import favoritesWatch from 'src/app/redux/sagas/favorites';
import pinnedPostsWatch from 'src/app/redux/sagas/pinnedPosts';
import { transactionWatches } from 'app/redux/sagas/transaction';
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
  yield fork(favoritesWatch)
  yield fork(pinnedPostsWatch)
}
