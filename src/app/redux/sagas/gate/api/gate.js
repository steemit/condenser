import { fork, take, call, put, cancel, select, actionChannel } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import golos from 'golos-js';
import { Client as WebSocket } from 'rpc-websockets';
import { normalize } from 'normalizr';

// import {
//   login, logout, addUser, removeUser, newMessage, sendMessage
// } from 'src/app/redux/actions';
import {
    GATE_SEND_MESSAGE,
    GATE_CONNECT,
    GATE_CONNECT_SUCCESS,
    GATE_AUTHORIZED,
    GATE_DISCONNECT,
} from 'src/app/redux/constants/gate';

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

function connect(gateServiceUrl) {
    const socket = new WebSocket(gateServiceUrl);
    return new Promise(resolve => {
        socket.on('open', () => resolve(socket));
    });
}

function* subscribe(socket) {
    const current = yield select(state => state.user.get('current'));
    const postingPrivateKey = current.getIn(['private_keys', 'posting_private']);
    const userName = current.get('username');

    return eventChannel(emit => {
        socket.on('sign', ([sign]) => {
            const transaction = makeFakeAuthTransaction({ userName, sign });
            const {
                signatures: [xsign],
            } = golos.auth.signTransaction(transaction, [postingPrivateKey]);

            socket
                .call('get', {
                    user: userName,
                    sign: xsign,
                })
                .then(() => {
                    socket.call('notify.subscribe', {});
                    emit({ type: GATE_AUTHORIZED });
                });
        });

        socket.on('notify.subscribe', data => {
            console.log(999, data)
        });

        return () => emit({ type: GATE_DISCONNECT });
    });
}

function* read(socket) {
    const channel = yield call(subscribe, socket);
    while (true) {
        const action = yield take(channel);
        yield put(action);
    }
}

function* write(socket, writeChannel) {
    // Wait for authorization
    yield take(GATE_AUTHORIZED);

    while (true) {
        const action = yield take(writeChannel);
        const {
            payload: {
                types: [requestType, successType, failureType],
                method,
                data,
                saga,
                schema,
            },
        } = action;

        const actionWith = data => ({ ...action, ...data });
        yield put(actionWith({ type: requestType }));
        try {
            let payload = yield call([socket, 'call'], method, data);
            // TODO: review
            if (saga) {
                yield call(saga, payload)
            }
            payload = schema ? normalize(payload, schema) : payload;
            yield put(actionWith({ type: successType, payload }));
        } catch (e) {
            yield put(actionWith({ type: failureType, error: e.message }));
        }
    }
}

function* handleIO(socket, writeChannel) {
    yield fork(write, socket, writeChannel);
    yield fork(read, socket);
}

function* flow() {
    const gateServiceUrl = yield select(state =>
        state.offchain.getIn(['config', 'gate_service_url'])
    );

    // Channel listen messages for writing
    const writeChannel = yield actionChannel(GATE_SEND_MESSAGE);

    while (true) {
        // Wait for user login
        yield take(`user/SET_USER`);

        yield put({ type: GATE_CONNECT });
        const socket = yield call(connect, gateServiceUrl);
        yield put({ type: GATE_CONNECT_SUCCESS });

        const task = yield fork(handleIO, socket, writeChannel);

        // Wait for user logout
        yield take(`user/LOGOUT`);

        yield cancel(task);
    }
}

export default function* rootSaga() {
    yield fork(flow);
}
