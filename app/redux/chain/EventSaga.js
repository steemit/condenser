import {call, put, select} from 'redux-saga/effects';
import client from 'socketcluster-client';
//
function socketEventIterator(channel) {
  let resolveNextValue, resolved;
  resolved = true;
  //
  const options = {
    port: 8000
  };
  const socket = client.create(options);
  const chan = socket.subscribe(channel);
  chan.watch(event => {
    resolveNextValue(event);
    resolved = true;
  });
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
export default function* channelListener() {
  const current = yield select(state => state.user.get('current'));
  const channel = current.get('username');
  const next = yield call(socketEventIterator, channel)
  while (true) {
    const payload = yield call(next)
    yield put({
      type: 'ADD_NOTIFICATION',
      payload: {
        key: "chain_" + Date.now(),
        message: `~~~~~~ ${payload.rand}`,
        dismissAfter: 1000
      }
    })
    console.log(payload)
  }
}
