import {call, put, select, fork} from 'redux-saga/effects';
import {takeLatest} from 'redux-saga';
import client from 'socketcluster-client';
import NotifyContent from 'app/components/elements/Notifications/NotifyContent'
// import user from "../User";
import {serverApiLogout} from "../../utils/ServerApiClient";
// this should not exist after sagas restart fixing
let started = false;
//
const scOptions = {
  hostname: 'push.golos.io',
  secure: true,
  // port: 8000
};
//
let socket;
// const chan = socket.subscribe(channel);

//
function socketEventIterator(channel) {
  let resolveNextValue, resolved;
  resolved = true;
  //
  const options = {
    hostname: 'push.golos.io',
    secure: true,
    // port: 8000
  };
  const socket = client.create(options);
  const chan = socket.subscribe(channel);
  // fixme saga reloading on login
  // this subscribes twice causing event doubling
  if (!started) {
    chan.watch(
      event => {
        // console.log(`----------------------------------------- `, event)
        resolveNextValue(event);
        resolved = true;
      })
    started = true
  }
  //
  return () => {
    if (!resolved) {
      throw new Error('Iterator can be used by only one agent.');
    }
    //
    resolved = false;
    //
    return new Promise((resolve) => {
      resolveNextValue = resolve;
    });
  };
}
//
function* userChannelListener() {
  console.log('<<<---------------------------------------------- listening to push.golos.io ...')
  const current = yield select(state => state.user.get('current'));
  const channel = current.get('username');
  const next = yield call(socketEventIterator, channel)
  yield fork(logoutListener)
  while (true) {
    const action = yield call(next);
    console.log(action)
    yield put({
      type: 'ADD_NOTIFICATION',
      payload: NotifyContent(action)
    })
  }
}
//
function initConnection(user) {
  console.log(`|||| channel requested for user `, user)
  console.log(`|||| initializing SCluster client ...`)
  socket = client.create(scOptions);
}
//
function* onUserLogin() {
  yield console.log(`||||||||||||||||||||||||||||||||||| STARTING CHANNEL LISTENER `)
  const current = yield select(state => state.user.get('current'));
  const channelName = current.get('username');
  if (channelName) {
    yield call(initConnection, channelName)
  }
}
//
function* processLogout() {
  yield console.log(`||||||||||||||||||||||||||||||||||| LOGOUT`)
}
// listen to logout only since login
function* logoutListener() {
  yield* takeLatest('user/LOGOUT', processLogout);
}
//
export default {
  onUserLogin
}
