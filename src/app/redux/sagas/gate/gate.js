import { fork, take, call, put, cancel } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
// import {
//   login, logout, addUser, removeUser, newMessage, sendMessage
// } from './actions';
const WebSocket = require('rpc-websockets').Client

function connect(gateServiceUrl) {
  const socket = new WebSocket(gateServiceUrl);
  console.log(socket)
  return new Promise(resolve => {
    socket.onopen = () => {
      console.log('connected')
      resolve(socket)
    };
  });
}

function subscribe(socket) {
  return eventChannel(emit => {
    // socket.on('users.login', ({ username }) => {
    //   emit(addUser({ username }));
    // });
    // socket.on('users.logout', ({ username }) => {
    //   emit(removeUser({ username }));
    // });
    // socket.on('messages.new', ({ message }) => {
    //   emit(newMessage({ message }));
    // });
    // socket.on('disconnect', e => {
    //   // TODO: handle
    // });
    return () => {
      console.log('disconnected')
    };
  });
}

function* read(socket) {
  const channel = yield call(subscribe, socket);
  while (true) {
    let action = yield take(channel);
    console.log('read', action)
    yield put(action);
  }
}

function* write(socket) {
  while (true) {
    const { payload } = yield take(`gate/SEND_MESSAGE`);
    console.log('write', payload);
    socket.emit('message', payload);
  }
}

function* handleIO(socket) {
  yield fork(read, socket);
  yield fork(write, socket);
}

function* flow() {
  const gateServiceUrl = yield select(state => state.offchain.getIn(['config', 'gate_server_url']));

  while (true) {
    let { payload } = yield take(`user/SET_USER`);
    console.log('user/SET_USER', payload)
    const socket = yield call(connect, gateServiceUrl);
    // socket.emit('login', { username: payload.username });

    const task = yield fork(handleIO, socket);

    let action = yield take(`user/LOGOUT`);
    yield cancel(task);
    socket.emit('logout');
  }
}

export default function* rootSaga() {
  yield fork(flow);
}