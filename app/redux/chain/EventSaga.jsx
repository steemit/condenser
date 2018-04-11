import {call, put, select} from 'redux-saga/effects';
import client from 'socketcluster-client';
import NotificationContent from 'app/components/elements/NotificationContent'
import React from 'react'
import Icon from 'app/components/elements/Icon';


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
    hostname: 'push.golos.io',
    secure: true,
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
  function cross() {
    const result = require(`app/assets/icons/cross.svg`);
    return <span className="NotificationContent__action"
        dangerouslySetInnerHTML={{__html: result}} />
  }
  //
  export default function* channelListener() {
    console.log(`++++++++++++++++++++++++++++++++++++++++++++++ ))))))))))))))))))))))))`)
    const current = yield select(state => state.user.get('current'));
    const channel = current.get('username');
    const next = yield call(socketEventIterator, channel)
    while (true) {
      const payload = yield call(next)
        yield put({
          type: 'ADD_NOTIFICATION',
          payload: {
            action: <span style={{
              // fixme
              paddingTop: '3px',
              paddingLeft: '11px',
              paddingRight: '14px',
              display: 'flex',
              height: '100%',
              alignItems: 'center',

            }}>
              {cross()}
            </span>,
            actionStyle: {
              // display: 'table-cell',
              // verticalAlign: 'middle',
              padding: '0px',
              marginLeft: '0px',
              // color: 'blue',
              font: '.75rem normal Roboto, sans-serif',
              lineHeight: '1rem',
              letterSpacing: '.125ex',
              textTransform: 'uppercase',
              borderRadius: '0px',
              cursor: 'pointer'
            },
            dismissAfter: 300000,
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
