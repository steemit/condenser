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
    if (!payload || payload.length === 0) return Map();

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

const createUpdatedList = ({ prop, val }) => {
    return (state = Set(), action = { type: null }) => {
        switch (action.type) {
            case 'notification/UPDATE_ONE':
                return updateMatchesList(action.updates, prop, val) ? state.add(action.id) : state;
            case 'notification/UPDATE_SOME':
                return updateMatchesList(action.updates, prop, val) ? state.union(Set(action.ids)) : state;
            case 'notification/SENT_UPDATES':
                return updateMatchesList(action.updates, prop, val) ? Set() : state;
            default:
                return state;
        }
    };
}

/**
 * Is an incoming update event relevant to our list?
 */
function updateMatchesList(actionUpdates, prop, val) {
    return prop in actionUpdates && actionUpdates[prop] === val;
}

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
                return Set.fromKeys(apiToMap(action.payload).filter(n => (n[prop] === val)));
            case 'notification/APPEND_SOME':
                return state.union(Set.fromKeys(apiToMap(action.payload).filter(n => (n[prop] === val))));
            case 'notification/UPDATE_ONE':
                if (!updateMatchesList(action.updates, prop, val)) {
                    return state.delete(action.id);
                }
                if (updateMatchesList(action.updates, prop, val)) {
                    return state.add(action.id);
                }
                return state;
            case 'notification/UPDATE_SOME':
                return action.ids.reduce((acc, updatedId) => {
                    if (!updateMatchesList(action.updates, prop, val)) {
                        return acc.delete(updatedId);
                    }
                    if (updateMatchesList(action.updates, prop, val)) {
                        return acc.add(updatedId);
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

const isFetching = (state = false, action = { type: null }) => {
    switch (action.type) {
        case 'notification/FETCH_SOME':
        case 'notification/FETCH_ALL':
            return true;
        case 'notification/APPEND_SOME':
        case 'notification/RECEIVE_ALL':
            return false;
        default:
            return state;
    }
};

const isFetchingBefore = (state = false, action = { type: null }) => {
    switch (action.type) {
        case 'notification/FETCH_SOME':
            if (action.direction === 'before')
                return true;
            return state;
        case 'notification/APPEND_SOME':
            return false;
        default:
            return state;
    }
};

const errorMsg = (state = null, action = { type: null }) => {
    switch (action.type) {
        case 'notification/APPEND_SOME':
        case 'notification/RECEIVE_ALL':
            return null;
        case 'notification/APPEND_SOME_ERROR':
        case 'notification/RECEIVE_ALL_ERROR':
            return action.msg;
        default:
            return state;
    }
};

const notificationReducer = combineReducers({
    byId,
    idsReadPending: createUpdatedList({ prop: 'read', val: true }),
    idsShownPending: createUpdatedList({ prop: 'shown', val: true }),
    unread: createList({ prop: 'read', val: false }),
    unshown: createList({ prop: 'shown', val: false }),
    byType: combineReducers(generateByTypeReducers(allTypes, createList)),
    isFetching,
    isFetchingBefore,
    errorMsg,
});

export default notificationReducer;
