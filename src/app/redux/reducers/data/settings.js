import { fromJS, Map } from 'immutable';
import { pick } from 'ramda';
import {
    SETTING_GET_OPTIONS_SUCCESS,

    SETTING_SET_OPTIONS,
    SETTING_SET_OPTIONS_SUCCESS,
} from 'src/app/redux/constants/settings';
import { DEFAULT_LANGUAGE, DEFAULT_CURRENCY } from 'app/client_config'

const initialState = fromJS({
    basic: {
        rounding: 0,
        selfVote: false,
        nsfw: 'warn',
        lang: DEFAULT_LANGUAGE,
        currency: DEFAULT_CURRENCY,
        award: 0,
    }
});

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

        case SETTING_SET_OPTIONS_SUCCESS:
            return setSettingsOptionsFromMeta(state, meta);

        default:
            return state;
    }
}
