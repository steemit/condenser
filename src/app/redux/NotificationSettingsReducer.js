import { Map } from 'immutable';
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

const isSaving = (state = false, action = { type: null }) => {
    switch (action.type) {
        case 'notificationsettings/TOGGLE_GROUP':
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

const groups = (state = Map(), action = { type: null }) => {
    switch (action.type) {
        case 'notificationsettings/TOGGLE_GROUP':
            return state.setIn(
                [action.transport, 'notification_types', action.group],
                !state.getIn([action.transport, 'notification_types', action.group])
            );
        case 'notificationsettings/RECEIVE':
            return action.payload;
        default:
            return state;
    }
};

export default combineReducers({
    isFetching,
    isSaving,
    errorMsg,
    groups,
});