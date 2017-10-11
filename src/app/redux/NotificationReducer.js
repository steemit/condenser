import { Map, OrderedMap, Set } from 'immutable';
import { combineReducers } from 'redux';
import allTypes from 'app/components/elements/notification/type';

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
        case 'notification/UPDATE_SOME':
            return state.map((n, id) => {
                if (action.ids.indexOf(id) >= 0) {
                    return {
                        ...state.get(id),
                        ...action.updates,
                    };
                }
                return state.get(id);
            });
        default:
            return state;
    }
};


/**
 * Creates a reducer which provides a list of ids of all notifications which match the given filter.
 *
 * @param {Object} state
 * @return {Function} reducer
 */
export const createList = ({ prop, val }) => {
    return (state = Set(), action = { type: null }) => {
        switch (action.type) {
            case 'notification/RECEIVE_ALL':
                console.log('ben, If this is where the response from yo is processed, is this the best place to do snake_toCamel case transforms? And change notify_id, notify_type to id & notificationType respectively? Last, flatten .data into the root object.')
                return Set.fromKeys(apiToMap(action.payload).filter(n => (n[prop] === val)));
            case 'notification/APPEND_SOME':
                return state.union(Set.fromKeys(apiToMap(action.payload).filter(n => (n[prop] === val))));
            case 'notification/MARK_ALL_READ':
                return (prop === 'read' && val === 'true') ? Set() : state;
            case 'notification/MARK_ALL_SHOWN':
                return (prop === 'shown' && val === 'true') ? Set() : state;
            case 'notification/UPDATE_ONE':
                return (action.updates[prop] && action.updates[prop] === val) ? state.delete(action.id) : state;
            case 'notification/UPDATE_SOME':
                return action.ids.reduce((acc, updatedId) => {
                    if (action.updates[prop] && action.updates[prop] !== val) {
                        return acc.delete(updatedId);
                    }
                    return acc;
                }, state);
            default:
                return state;
        }
    };
};

const generateByTypeReducers = (types, listCreator) => {
    return types.reduce((acc, cur) => {
        return {
            ...acc,
            [cur]: listCreator({ prop: 'notificationType', val: cur }),
        };
    }, {});
};

const notificationReducer = combineReducers({
    byId,
    unread: createList({ prop: 'read', val: false}),
    unshown: createList({ prop: 'shown', val: false}),
    byType: combineReducers(generateByTypeReducers(allTypes, createList)),
});

export default notificationReducer;
