import { GATE_SEND_MESSAGE } from 'src/app/redux/constants/gate';
import {
    SETTING_GET_OPTIONS,
    SETTING_GET_OPTIONS_SUCCESS,
    SETTING_GET_OPTIONS_ERROR,

    SETTING_SET_OPTIONS,
    SETTING_SET_OPTIONS_SUCCESS,
    SETTING_SET_OPTIONS_ERROR,
} from 'src/app/redux/constants/settings';

export function getSettingsOptions({ profile = 'web' } = {}) {
    return {
        type: GATE_SEND_MESSAGE,
        payload: {
            method: 'getOptions',
            types: [
                SETTING_GET_OPTIONS,
                SETTING_GET_OPTIONS_SUCCESS,
                SETTING_GET_OPTIONS_ERROR,
            ],
            data: { profile },
        },
        meta: { profile },
    };
}

export function setSettingsOptions({ profile = 'web', ...values } = {}) {
    return {
        type: GATE_SEND_MESSAGE,
        payload: {
            method: 'setOptions',
            types: [
                SETTING_SET_OPTIONS,
                SETTING_SET_OPTIONS_SUCCESS,
                SETTING_SET_OPTIONS_ERROR,
            ],
            data: { profile, ...values },
        },
        meta: { profile, ...values },
    };
}
