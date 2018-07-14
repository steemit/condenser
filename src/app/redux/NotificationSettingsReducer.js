import { Map } from 'immutable';
import { combineReducers } from 'redux';

// Action constants
export const FETCH = 'notificationsettings/FETCH'; // watched by saga
export const UPDATE = 'notificationsettings/UPDATE'; // watched by saga
const RECEIVE = 'notificationsettings/RECEIVE';
const RECEIVE_ERROR = 'notificationsettings/RECEIVE_ERROR';
export const TOGGLE_GROUP = 'notificationsettings/TOGGLE_GROUP'; // watched by saga

const isFetching = (state = false, action = { type: null }) => {
    switch (action.type) {
        case FETCH:
            return true;
        case RECEIVE:
            return false;
        default:
            return state;
    }
};

const isSaving = (state = false, action = { type: null }) => {
    switch (action.type) {
        case TOGGLE_GROUP:
            return true;
        case RECEIVE:
            return false;
        default:
            return state;
    }
};

const errorMsg = (state = '', action = { type: null }) => {
    switch (action.type) {
        case RECEIVE:
            return '';
        case RECEIVE_ERROR:
            return 'oops problem'; // TODO: error msg
        default:
            return state;
    }
};

const groups = (state = Map(), action = { type: null }) => {
    switch (action.type) {
        case TOGGLE_GROUP:
            return state.setIn(
                [action.transport, 'notification_types', action.group],
                !state.getIn([
                    action.transport,
                    'notification_types',
                    action.group,
                ])
            );
        case RECEIVE:
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

// Action creators
export const fetch = () => ({
    type: FETCH,
});

export const update = () => ({
    type: UPDATE,
});

export const receive = payload => ({
    type: RECEIVE,
    payload,
});

export const receiveError = () => ({
    type: RECEIVE_ERROR,
    // TODO: error msg
});

export const toggleGroup = (transport, group) => ({
    type: TOGGLE_GROUP,
    transport,
    group,
});
