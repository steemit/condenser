import { fromJS } from 'immutable';
import {
    GATE_CONNECT,
    GATE_CONNECT_SUCCESS,
    GATE_CONNECT_ERROR,
    GATE_AUTHORIZED,
    GATE_DISCONNECT,
} from 'src/app/redux/constants/gate';

const initialState = fromJS({
    connecting: false,
    connected: false,
    authorized: false,
    error: '',
});

export default function(state = initialState, { type, payload, error }) {
    switch (type) {
        case GATE_CONNECT:
            return initialState.set('connecting', true);

        case GATE_CONNECT_SUCCESS:
            return initialState.set('connected', true);
             
        case GATE_CONNECT_ERROR:
            return initialState.set('error', error);

        case GATE_AUTHORIZED:
            return initialState.set('authorized', true)

        case GATE_DISCONNECT:
            return initialState;

        default:
            return state;
    }
}
