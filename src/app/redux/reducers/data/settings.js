import { fromJS, Map } from 'immutable';
import { pick } from 'ramda';
import {
    SETTING_GET_OPTIONS_SUCCESS,

    SETTING_SET_OPTIONS,
    SETTING_SET_OPTIONS_SUCCESS,
} from 'src/app/redux/constants/settings';

const initialState = new Map()

const setSettingsOptionsFromMeta = (state, meta) => {
    return state.withMutations(state => {
        const data = pick(['notify', 'push', 'basic', 'mail'], meta);
        for (let key in data) {
            state.set(key, fromJS(data[key]));
        }
    });
};

export default function(state = initialState, { type, payload, error, meta }) {
    switch (type) {

        case SETTING_GET_OPTIONS_SUCCESS:
            return fromJS(payload);

        case SETTING_SET_OPTIONS:
            return setSettingsOptionsFromMeta(state, meta);

        // update options with new values from action
        case SETTING_SET_OPTIONS_SUCCESS:
            return setSettingsOptionsFromMeta(state, meta);

        default:
            return state;
    }
}
