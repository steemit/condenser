import {take, call, put, select, fork, cancel} from 'redux-saga/effects';
import {SagaCancellationException} from 'redux-saga';
import user from 'app/redux/User'
import client from 'socketcluster-client';
import NotifyContent from 'app/components/elements/Notifications/NotifyContent'
//
const scOptions = {
  hostname: 'push.golos.io',
  secure: true,
  // port: 8000
};
//
let socket;
//
function socketEventIterator(channel) {
  let resolveNextValue, resolved;
  resolved = true;
  // const socket = client.create(options);
  const chan = socket.subscribe(channel);
  // fixme saga reloading on login
  // this subscribes twice causing event doubling
  chan.watch(
    event => {
      // console.log(`----------------------------------------- `, event)
      resolveNextValue(event);
      resolved = true;
    })
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
function* userChannelListener(channel) {
  try {
    const next = yield call(socketEventIterator, channel)
    // yield fork(logoutListener)
    while (true) {
      const action = yield call(next);
      // console.log(action)
      yield put({
        type: 'ADD_NOTIFICATION',
        payload: NotifyContent(action)
      })
    }
  } catch (error) {
    // the way redux-saga 0.9.5 catches an effect cancellation
    // or simply using `isCancelError(error)`
    if (error instanceof SagaCancellationException) {
      // clear everything here!
      socket.unsubscribe(channel)
      socket.destroy()
    }
  }
}
//
function initConnection(user) {
  console.log(`|||| channel requested for user `, user)
  console.log(`|||| initializing SCluster client ...`)
  socket = client.create(scOptions);
  return new Promise((resolve, reject) => {
    const onSocketConnect = e => {
      socket.off('connect', onSocketConnect)
      resolve(e)
    }
    const onSocketError = e => {
      socket.off('error', onSocketConnect)
      reject(e)
      return
    }
    socket.on('connect', onSocketConnect)
    socket.on('error', onSocketError)
  })
}
//
function* processLogout() {
  console.log(`||||||||||||||||||||||||||||||||||| LOGOUT`)
  yield socket.destroy();
  yield put(user.actions.notificationChannelDestroyed())
  console.log('|||| SCClient destroyed!')
}

// listen to logout only after successful login
function* logoutListener(chl) {
  yield take('user/LOGOUT'/*, processLogout*/);
  yield cancel(chl)
}
//
function* onUserLogin() {
  console.log(`||||||||||||||||||||||||||||||||||| STARTING CHANNEL LISTENER `)
  const currentUser = yield select(state => state.user.get('current'));
  const channelName = currentUser.get('username');
  if (channelName) {
    try {
      // {socketid: ..., ...}
      const response = yield call(initConnection, channelName)
      // socket successfully created - notify
      yield put(user.actions.notificationChannelCreated())
      //
      // console.log('|||| socket connected! ', response)
      // start tracking user logout
      const chListener = yield fork(userChannelListener, channelName)
      // listen to logout only after successful login
      yield fork(logoutListener, chListener)
      console.log('|||| channel listener started ...')
    } catch (e) {
      console.log('||||||||||| socket connection error! ', e)
    }
  }
}
//
export default {
  onUserLogin
}
