import { fromJS, Map } from 'immutable';
import { pick } from 'ramda';
import {
    SETTING_GET_OPTIONS,
    SETTING_GET_OPTIONS_SUCCESS,
    SETTING_GET_OPTIONS_ERROR,
    SETTING_SET_OPTIONS,
    SETTING_SET_OPTIONS_SUCCESS,
    SETTING_SET_OPTIONS_ERROR,
} from 'src/app/redux/constants/settings';

const initialState = fromJS({
    options: new Map(),
    error: null,
    isFetching: false,
    isChanging: false,
});

const setSettingsOptionsFromMeta = (options, meta) => {
    return options.withMutations(options => {
        const data = pick(['notify', 'push', 'basic', 'mail'], meta);
        for (let key in data) {
            options.set(key, fromJS(data[key]));
        }
    });
};

export default function(state = initialState, { type, payload, error, meta }) {
    switch (type) {
        case SETTING_GET_OPTIONS:
            return initialState.set('isFetching', true);

        case SETTING_GET_OPTIONS_SUCCESS:
            return initialState.set('options', fromJS(payload));

        case SETTING_GET_OPTIONS_ERROR:
            return initialState.set('error', error);

        case SETTING_SET_OPTIONS:
            return state
                .set('isChanging', true)
                .updateIn(['options'], options => setSettingsOptionsFromMeta(options, meta));

        // update options with new values from action
        case SETTING_SET_OPTIONS_SUCCESS:
            return state
                .set('isChanging', false)
                .updateIn(['options'], options => setSettingsOptionsFromMeta(options, meta));

        case SETTING_SET_OPTIONS_ERROR:
            return state.set('isChanging', false).set('error', error);

        default:
            return state;
    }
}
