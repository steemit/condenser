import {call, put, select} from 'redux-saga/effects';
import client from 'socketcluster-client';
import React from 'react'
import Userpic from 'app/components/elements/Userpic';
import { Link } from 'react-router';
import Icon from 'app/components/elements/Icon';


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
  //
  const {
    type,
    from,
    author,
    parent_permlink,
    text
  } = data;
  //
  const source = (type === 'transfer') ? from : (type === 'comment') ? author : `VOTER`;
  //
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
      paddingTop: `2px`,

      // background: `blue`,
      // height: `150px`,
      // width: `200px`,
      borderLeftColor: `#E0E0E0`,
      borderLeftStyle: `solid`,
      borderLeftWidth: 1,
      borderRightColor: `#E0E0E0`,
      borderRightStyle: `solid`,
      borderRightWidth: 1,

      marginLeft: `6px`,
      paddingLeft: `8px`,
      paddingRight: `8px`,
      display: `flex`,
      flexDirection: `column`,
      // justifyContent: `center`,
      // alignItems: `stretch`,
      // alignContent: `stretch`
    }}>
      <span style={{
        paddingTop: `0px`,
        // background: `yellow`,
        display: `flex`,
        alignItems: `flex-start`,
        flexGrow: 1,
        // className: "author",
        // itemProp: "author",
        itemType: "http://schema.org/Person"
      }}>

{/*<span style={{*/}
  {/*paddingTop: `1px`,*/}

{/*}}>*/}
        <Link to={'/@' + source}>
          <strong>
            {`@${source}`}
          </strong>
        </Link>

{/*</span>*/}

        {/*{type === 'comment' &&*/ <span style={{
          paddingLeft: `4px`
          // background: `yellow`,
          // className: "author",
          // itemProp: "author",
          // itemType: "http://schema.org/Person"
        }}>
          {`${text}`}
          </span>}

        </span>
      <span style={{
        // background: `green`,
        display: `flex`,
        alignItems: `center`,
        flexGrow: 1,
      }}>
        {type === 'transfer' && `5000000 руб.`/*text*/}
        {type === 'comment' && <span style={{
          paddingTop: `6px`,
          paddingBottom: `1px`,
          // background: `yellow`,
          // className: "author",
          // itemProp: "author",
          // itemType: "http://schema.org /Person"
        }}>
          {/*<Link to={'/@' + source}><strong>{`@ ${source}`}</strong></Link>*/}
          {`link-toooooooooooo-post`}
        </span>}
      </span>
    </div>
          <Icon name="cross" />

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
    //
    console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`)
    console.log(payload)
    //
    yield put({
      type: 'ADD_NOTIFICATION',
      payload: {
        action: ``,
        dismissAfter: 100000,
        key: "chain_" + Date.now(),
        message: draw(payload),
        activeBarStyle: {
          // padding: '4px',
        }
  }
    })
  }
}
