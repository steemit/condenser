import { fromJS } from 'immutable';
import {
    NOTIFY_GET_HISTORY,
    NOTIFY_GET_HISTORY_SUCCESS,
    NOTIFY_GET_HISTORY_ERROR,
} from 'src/app/redux/constants/notifies';

const initialState = fromJS({
    isFetching: false,
    error: null,
});

export default function(state = initialState, { type, payload, error }) {
    switch (type) {
        case NOTIFY_GET_HISTORY:
            return initialState.set('isFetching', true);

        case NOTIFY_GET_HISTORY_SUCCESS:
            return initialState;

        case NOTIFY_GET_HISTORY_ERROR:
            return initialState.set('error', error);

        default:
            return state;
    }
}
