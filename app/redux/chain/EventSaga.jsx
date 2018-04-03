import {call, put, select} from 'redux-saga/effects';
import client from 'socketcluster-client';
import React from 'react'
import Userpic from 'app/components/elements/Userpic';
import { Link } from 'react-router';


// this should not exist after sagas restart fixing
let started = false;
//
//
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
  // todo !!!!!!!! this is a motherfucking saga reloading on transfer for example
  // this subscribes twice causing event doubling
  if (!started) {
    chan.watch(
      event => {
        console.log(`----------------------------------------- `, event)
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
const draw = (data) => {
  console.log(`^^^^^^^^^^^^^^^^^^^^^^^^^^ `, data)

  const {type, from, text} = data;

  return <div style={{
    background: `white`,
    width: `100%`,
    height: `100%`,
    display: `flex`
  }}>
    <div style={{
      // background: `red`,
      display: `flex`,
      alignItems: `center`
    }}>
      <Userpic account={from} />
    </div>
    <div style={{
      // background: `blue`,
      // height: `150px`,
      // width: `200px`,
      borderLeftColor: `#E0E0E0`,
      borderLeftStyle: `solid`,
      borderLeftWidth: 1,
      marginLeft: `6px`,
      paddingLeft: `6px`,
      display: `flex`,
      flexDirection: `column`,
      // justifyContent: `center`,
      // alignItems: `stretch`,
      // alignContent: `stretch`
    }}>
      <span style={{
        // background: `yellow`,
        display: `flex`,
        alignItems: `center`,
        flexGrow: 1,
        className: "author",
        itemProp: "author",
        itemType: "http://schema.org/Person"
      }}>
        <Link to={'/@' + from}><strong>{`@${from}`}</strong></Link>
      </span>
      <span style={{
        // background: `green`,
        display: `flex`,
        alignItems: `center`,
        flexGrow: 1,
      }}>
        {text}
      </span>
    </div>
  </div>
}
//
export default function* channelListener() {
  console.log(`++++++++++++++++++++++++++++++++++++++++++++++ ))))))))))))))))))))))))`)
  const current = yield select(state => state.user.get('current'));
  const channel = current.get('username');
  const next = yield call(socketEventIterator, channel)
  while (true) {
    const payload = yield call(next)
    const {type, from, text} = payload;
    //
    console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`)
    console.log(payload)
    //
    yield put({
      type: 'ADD_NOTIFICATION',
      payload: {
        dismissAfter: 10000,
        key: "chain_" + Date.now(),
        message: draw(payload),
        action: ``,
        activeBarStyle: {
          // padding: '4px',
        }
  }
    })
  }
}
