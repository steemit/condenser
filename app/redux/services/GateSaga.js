import { take, takeLatest, put, call, fork, apply, delay } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import golos from 'golos-js';
import { createWebSocketConnection } from './socketConnection';

const makeFakeAuthTransaction = ({ userName, sign }) => ({
    ref_block_num: 3367,
    ref_block_prefix: 879276768,
    expiration: '2018-07-06T14:52:24',
    operations: [
        [
            'vote',
            {
                voter: userName,
                author: 'test',
                permlink: sign,
                weight: 1,
            },
        ],
    ],
    extensions: [],
});

// this function creates an event channel from a given socket
// Setup subscription to incoming `ping` events
function createSocketChannel(socket, currentUser) {
    // `eventChannel` takes a subscriber function
    // the subscriber function takes an `emit` argument to put messages onto the channel

    const postingPrivateKey = currentUser.getIn(['private_keys', 'posting_private']);
    const userName = currentUser.get('username');

    const rand = Math.random();

    return eventChannel(emit => {
        //wait of call
        socket.jrpc.on('sign', (sign) => {
            const transaction = makeFakeAuthTransaction({ userName, sign });
            const {
                signatures: [xsign],
            } = golos.auth.signTransaction(transaction, [postingPrivateKey]);

            socket.jrpc
                .call('get', {
                    user: userName,
                    sign: xsign,
                })
                .then(() => {
                    socket.jrpc.call('notify.subscribe');

                    socket.jrpc
                        .call('notify.history', {
                            types: ['transfer', 'subscribe'],
                        })
                        .then(result => {
                            console.log(1, result);
                            emit(result);
                        });
                });
        });

        socket.jrpc.on('notify.subscribe', result => {
            console.log(rand, 2, result);
            emit(result);
        });

        socket.jrpc.on('notify.history', result => {
            console.log(rand, 'notify.history', result);
            emit(result);
        });

        socket.onmessage = event => {
            console.log(rand, 3, event);
            socket.jrpc.messageHandler(event.data);
        };

        socket.jrpc.toStream = (msg) => {
            console.log(rand, 4, msg);
            socket.send(msg);
        };

        socket.onerror = (error) => {
            console.log(rand, 5, error);
            emit(new Error('Error: ' + error.message));
        };

        socket.onclose = (event) => {
            console.log(rand, 6, event);
            if (event.wasClean) {
                console.info('Connection close was clean');
            } else {
                console.error('Connection suddenly close');
            }
            console.info('close code : ' + event.code + ' reason: ' + event.reason);
        };

        //usage
        //after connect
        // socket.onopen = () => {
        //     //calls
        //     // jrpc.call('add', [2, 3]).then(function (result) {
        //     //   document.getElementsByClassName('paragraph')[0].innerHTML += 'add(2, 3) result: ' + result + '<br>';
        //     // });
        //     // jrpc.call('mul', { y: 3, x: 2 }).then(function (result) {
        //     //   document.getElementsByClassName('paragraph')[0].innerHTML += 'mul(2, 3) result: ' + result + '<br>';
        //     // });
        //     // jrpc.batch([
        //     //   { call: { method: "add", params: [5, 2] } },
        //     //   { call: { method: "mul", params: [100, 200] } },
        //     //   { call: { method: "create", params: { item: { foo: "bar" }, rewrite: true } } }
        //     // ]);
        // };

        // the subscriber must return an unsubscribe function
        // this will be invoked when the saga calls `channel.close` method
        const unsubscribe = () => {
            console.log(rand, 7, 'unsubscribe')
            socket.close();
        };

        return unsubscribe;
    });
}

// reply with a `pong` message by invoking `socket.emit('pong')`
// function* pong(socket) {
//     yield delay(5000);
//     yield apply(socket, socket.emit, ['pong']); // call `emit` as a method with `socket` as context
// }

function* logoutListener(socketChannel) {
    yield takeLatest('user/LOGOUT', function* (socketChannel) {
        yield socketChannel.close();
    }, socketChannel);
}

export function* watchOnPings(currentUser) {
    const socket = yield call(createWebSocketConnection);
    const socketChannel = yield call(createSocketChannel, socket, currentUser);
    console.log(1, socket);

    while (true) {
        try {
            // An error from socketChannel will cause the saga jump to the catch block
            const payload = yield take(socketChannel);
            console.log('payload', payload);
            yield put({ type: 'INCOMING_PONG_PAYLOAD', payload });
            //yield fork(pong, socket);
            yield fork(logoutListener, socketChannel);
        } catch (err) {
            console.error('socket error:', err);
            // socketChannel is still open in catch block
            // if we want end the socketChannel, we need close it explicitly
            // socketChannel.close()
        }
    }
}
