import { take, put, call, apply, delay } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import JsonRPC from 'simple-jsonrpc-js';
import golos from 'golos-js';
// import { createWebSocketConnection } from './socketConnection'

const createWebSocketConnection = () => {
    const socket = new WebSocket('');
    const jrpc = new JsonRPC();
    socket.jrpc = jrpc;
    return socket;
};

// this function creates an event channel from a given socket
// Setup subscription to incoming `ping` events
function createSocketChannel(socket) {
    // `eventChannel` takes a subscriber function
    // the subscriber function takes an `emit` argument to put messages onto the channel
    console.log(5, socket);

    return eventChannel(emit => {
        //wait of call
        socket.jrpc.on('sign', function(sign) {
            const {
                signatures: [xsign],
            } = golos.auth.signTransaction(
                {
                    ref_block_num: 3367,
                    ref_block_prefix: 879276768,
                    expiration: '2018-07-06T14:52:24',
                    operations: [
                        [
                            'vote',
                            {
                                voter: 'format-x22',
                                author: 'test',
                                permlink: sign,
                                weight: 1,
                            },
                        ],
                    ],
                    extensions: [],
                },
                ['']
            );

            socket.jrpc.call('get', {
                user: 'format-x22',
                sign: xsign,
            }).then(() => {
                socket.jrpc.call('notify.subscribe')
                socket.jrpc.call('notify.history', {
                    type: 'vote'
                }).then((result) => {
                  console.log(100500, result)
                })
            });
        });

        socket.jrpc.on('notify.subscribe', (result) => {
          console.log(666, result)
        })

        socket.onmessage = (event) => {
            console.log(11, event);
            socket.jrpc.messageHandler(event.data);
        };

        socket.jrpc.toStream = function(msg) {
            console.log(500, msg);
            socket.send(msg);
        };

        socket.onerror = function(error) {
            emit(new Error('Error: ' + error.message));
        };

        socket.onclose = function(event) {
            if (event.wasClean) {
                console.info('Connection close was clean');
            } else {
                console.error('Connection suddenly close');
            }
            console.info('close code : ' + event.code + ' reason: ' + event.reason);
        };

        //usage
        //after connect
        socket.onopen = function() {
            //calls
            // jrpc.call('add', [2, 3]).then(function (result) {
            //   document.getElementsByClassName('paragraph')[0].innerHTML += 'add(2, 3) result: ' + result + '<br>';
            // });
            // jrpc.call('mul', { y: 3, x: 2 }).then(function (result) {
            //   document.getElementsByClassName('paragraph')[0].innerHTML += 'mul(2, 3) result: ' + result + '<br>';
            // });
            // jrpc.batch([
            //   { call: { method: "add", params: [5, 2] } },
            //   { call: { method: "mul", params: [100, 200] } },
            //   { call: { method: "create", params: { item: { foo: "bar" }, rewrite: true } } }
            // ]);
        };

        // the subscriber must return an unsubscribe function
        // this will be invoked when the saga calls `channel.close` method
        const unsubscribe = () => {};

        return unsubscribe;
    });
}

// reply with a `pong` message by invoking `socket.emit('pong')`
function* pong(socket) {
    yield delay(5000);
    yield apply(socket, socket.emit, ['pong']); // call `emit` as a method with `socket` as context
}

export function* watchOnPings() {
    const socket = yield call(createWebSocketConnection);
    const socketChannel = yield call(createSocketChannel, socket);
    console.log(1, socket);

    while (true) {
        try {
            // An error from socketChannel will cause the saga jump to the catch block
            const payload = yield take(socketChannel);
            yield put({ type: INCOMING_PONG_PAYLOAD, payload });
            yield fork(pong, socket);
        } catch (err) {
            console.error('socket error:', err);
            // socketChannel is still open in catch block
            // if we want end the socketChannel, we need close it explicitly
            // socketChannel.close()
        }
    }
}
