import {call, put, select} from 'redux-saga/effects';
import client from 'socketcluster-client';
import NotificationContent from 'app/components/elements/NotificationContent'

// this should not exist after sagas restart fixing
let started = false;
let count = 0;
//
//
//
function socketEventIterator(channel) {
  let resolveNextValue, resolved;
  resolved = true;
  //
  const options = {
    host: '78.47.87.101:8000',
    // port: 8000
  };
  const socket = client.create(options);
  const chan = socket.subscribe(channel);
  // todo !!!!!!!! this is a motherfucking saga reloading on transfer for example
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


  //
  export default function* channelListener() {
    console.log(`++++++++++++++++++++++++++++++++++++++++++++++ ))))))))))))))))))))))))`)
    const current = yield select(state => state.user.get('current'));
    const channel = current.get('username');
    const next = yield call(socketEventIterator, channel)
    while (true) {
      const payload = yield call(next)
      // yield count++;
      // yield console.log(`@@@@@@@@@ `, count)
      //
      console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`)
      console.log(payload)
      //
        yield put({
          type: 'ADD_NOTIFICATION',
          payload: {
            action: ``,
            dismissAfter: 5000,
            key: "chain_" + Date.now(),
            message: NotificationContent(payload),
            activeBarStyle: {
              // padding: '4px',
            }
          }
        })
      }
    // }
  }
