import { fromJS, Map } from 'immutable';
import { combineReducers } from 'redux';

const isFetching = (state = false, action = { type: null }) => {
    switch (action.type) {
        case 'notificationsettings/FETCH':
            return true;
        case 'notificationsettings/RECEIVE':
            return false;
        default:
            return state;
    }
};

const errorMsg = (state = '', action = { type: null }) => {
    switch (action.type) {
        case 'notificationsettings/RECEIVE':
            return '';
        case 'notificationsettings/RECEIVE_ERROR':
            return 'oops problem'; // todo: error msg
        default: return state;
    }
};

const settings = (state = Map(), action = { type: null }) => {
    switch (action.type) {
        case 'notificationsettings/TOGGLE_SETTING':
            return state.setIn(
                [action.channel, 'notification_types', action.setting],
                !state.getIn([action.channel, 'notification_types', action.setting])
            );
        case 'notificationsettings/RECEIVE':
            return fromJS(action.payload);
        default:
            return state;
    }
};

export default combineReducers({
    isFetching,
    errorMsg,
    settings,
});