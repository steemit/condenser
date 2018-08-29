import { fromJS } from 'immutable';
import {
    NOTIFICATION_GET_HISTORY,
    NOTIFICATION_GET_HISTORY_SUCCESS,
    NOTIFICATION_GET_HISTORY_ERROR,
} from 'src/app/redux/constants/notifications';

const initialState = fromJS({
    isFetching: false,
    error: null,
});

export default function(state = initialState, { type, payload, error }) {
    switch (type) {
        case NOTIFICATION_GET_HISTORY:
            return initialState.set('isFetching', true);

        case NOTIFICATION_GET_HISTORY_SUCCESS:
            return initialState;

        case NOTIFICATION_GET_HISTORY_ERROR:
            return initialState.set('error', error);

        default:
            return state;
    }
}
