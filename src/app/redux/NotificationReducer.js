import { Map, OrderedMap, Set } from 'immutable';
import { combineReducers } from 'redux';

/**
 * Normalizes API payload.
 *
 * @param {Array} payload each value must have property `id`
 *
 * @return {Map}
 */
function apiToMap(payload) {
    return Map(Object.assign(...payload.map(d => ({ [d.id]: d }))));
}

/**
 * Provides a list of ids of all relevant notifications.
 *
 * @param {OrderedMap} state
 * @param {Object} action
 */
export const byId = (state = OrderedMap(), action = { type: null }) => {
    switch (action.type) {
        case 'notification/RECEIVE_ALL':
            return apiToMap(action.payload).sortBy(n => n.created).reverse();
        case 'notification/APPEND_SOME':
            return state.merge(apiToMap(action.payload)).sortBy(n => n.created).reverse();
        case 'notification/MARK_ALL_READ':
            return state.map(n => {
                return {
                    ...n,
                    read: true,
                };
            });
        case 'notification/UPDATE_ONE':
            return state.set(action.id, {
                ...state.get(action.id),
                ...action.updates,
            });
        default:
            return state;
    }
};

/**
 * Provides a list of ids of all unread notifications.
 *
 * @param {Set} state
 * @param {Object} action
 */
export const unread = (state = Set(), action = { type: null }) => {
    switch (action.type) {
        case 'notification/RECEIVE_ALL':
            return Set.fromKeys(apiToMap(action.payload).filter(n => !n.read));
        case 'notification/APPEND_SOME':
            return state.union(Set.fromKeys(apiToMap(action.payload).filter(n => !n.read)));
        case 'notification/MARK_ALL_READ':
            return Set();
        case 'notification/UPDATE_ONE':
            return (action.updates.read && action.updates.read === true) ? state.delete(action.id) : state;
        default:
            return state;
    }
};

/**
 * Provides a key-value store of all unshown notifications.
 *
 * @param {Map} state
 * @param {Object} action
 */
export const unshown = (state = Set(), action = { type: null }) => {
    switch (action.type) {
        case 'notification/RECEIVE_ALL':
            return Set.fromKeys(apiToMap(action.payload).filter(n => !n.shown));
        case 'notification/APPEND_SOME':
            return state.union(Set.fromKeys(apiToMap(action.payload).filter(n => !n.shown)));
        case 'notification/MARK_ALL_SHOWN':
            return Set();
        case 'notification/UPDATE_ONE':
            return (action.updates.shown && action.updates.shown === true) ? state.delete(action.id) : state;
        default:
            return state;
    }
};

const notificationReducer = combineReducers({
    byId,
    unread,
    unshown,
});

export default notificationReducer;
