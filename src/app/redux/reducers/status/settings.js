import { fromJS } from 'immutable';
import {
    SETTING_GET_OPTIONS,
    SETTING_GET_OPTIONS_SUCCESS,
    SETTING_GET_OPTIONS_ERROR,

    SETTING_SET_OPTIONS,
    SETTING_SET_OPTIONS_SUCCESS,
    SETTING_SET_OPTIONS_ERROR,
} from 'src/app/redux/constants/settings';

const initialState = fromJS({
    error: null,
    isFetching: false,
    isChanging: false,
});

export default function(state = initialState, { type, payload, error, meta }) {
    switch (type) {
        case SETTING_GET_OPTIONS:
            return initialState.set('isFetching', true);

        case SETTING_GET_OPTIONS_SUCCESS:
            return initialState;

        case SETTING_GET_OPTIONS_ERROR:
            return initialState.set('error', error);

        case SETTING_SET_OPTIONS:
            return state
                .set('isChanging', true);

        case SETTING_SET_OPTIONS_SUCCESS:
            return state
                .set('isChanging', false);

        case SETTING_SET_OPTIONS_ERROR:
            return state.set('isChanging', false).set('error', error);

        default:
            return state;
    }
}
