import { Map, OrderedMap, Set } from 'immutable';
import { combineReducers } from 'redux';
import { filters } from 'app/components/notifications/Notification/type';

// Action constants
export const RECEIVE_ALL = 'notification/RECEIVE_ALL'; // watched by saga also
const RECEIVE_ALL_ERROR = 'notification/RECEIVE_ALL_ERROR';
export const APPEND_SOME = 'notification/APPEND_SOME'; // watched by saga also
const APPEND_SOME_ERROR = 'notification/APPEND_SOME_ERROR';
const UPDATE_ONE = 'notification/UPDATE_ONE';
const UPDATE_SOME = 'notification/UPDATE_SOME';
const SENT_UPDATES = 'notification/SENT_UPDATES';
const SENT_UPDATES_ERROR = 'notification/SENT_UPDATES_ERROR';
const SET_LAST_FETCH_BEFORE_COUNT = 'notification/SET_LAST_FETCH_BEFORE_COUNT';
// Saga-related
export const FETCH_SOME = 'notification/FETCH_SOME';
export const FETCH_SOME_ERROR = 'notification/FETCH_SOME_ERROR';
export const FETCH_ALL = 'notification/FETCH_ALL';

/**
 * Normalizes API payload.
 *
 * @param {Array} payload each value must have property `id`
 *
 * @return {Map}
 */
function apiToMap(payload) {
    if (!payload || payload.length === 0) return Map();

    return Map(Object.assign(...payload.map(d => ({ [d.notify_id]: d }))));
}

/**
 * Provides a list of ids of all relevant notifications.
 *
 * @param {OrderedMap} state
 * @param {Object} action
 */
export const byId = (state = OrderedMap(), action = { type: null }) => {
    switch (action.type) {
        case RECEIVE_ALL:
            return apiToMap(action.payload)
                .sortBy(n => n.created)
                .reverse();
        case APPEND_SOME:
            return state
                .merge(apiToMap(action.payload))
                .sortBy(n => n.created)
                .reverse();
        case UPDATE_ONE:
            return state.set(action.id, {
                ...state.get(action.id),
                ...action.updates,
            });
        case UPDATE_SOME:
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
            case UPDATE_ONE:
                return updateMatchesList(action.updates, prop, val)
                    ? state.add(action.id)
                    : state;
            case UPDATE_SOME:
                return updateMatchesList(action.updates, prop, val)
                    ? state.union(Set(action.ids))
                    : state;
            case SENT_UPDATES:
                return updateMatchesList(action.updates, prop, val)
                    ? Set()
                    : state;
            default:
                return state;
        }
    };
};

/**
 * Is an incoming update event relevant to our list?
 */
function updateMatchesList(actionUpdates, prop, val) {
    return prop in actionUpdates && actionUpdates[prop] === val;
}

/**
 * Creates a reducer which provides a list of ids of all notifications which match the given filter.
 *
 * @param {Object} criterium
 * @param {String} criterium.prop prop with this name...
 * @param {?} ceiterium.val ... should match exactly this value
 * @return {Function} reducer
 */
export const createList = ({ prop, val }) => (
    state = Set(),
    action = { type: null }
) => {
    switch (action.type) {
        case RECEIVE_ALL:
            return Set.fromKeys(
                apiToMap(action.payload).filter(n => n[prop] === val)
            );
        case APPEND_SOME:
            return state.union(
                Set.fromKeys(
                    apiToMap(action.payload).filter(n => n[prop] === val)
                )
            );
        case UPDATE_ONE:
            if (!updateMatchesList(action.updates, prop, val)) {
                return state.delete(action.id);
            }
            if (updateMatchesList(action.updates, prop, val)) {
                return state.add(action.id);
            }
            return state;
        case UPDATE_SOME:
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

/**
 * Creates a reducer which provides a list of ids of all notifications which match the given filter.
 *
 * @param {String[]} filtertypes only include notif ids with these types
 * @return {Function} reducer
 */
export const createMultiTypeList = filtertypes => (
    state = Set(),
    action = { type: null }
) => {
    switch (action.type) {
        case RECEIVE_ALL:
            return Set.fromKeys(
                apiToMap(action.payload).filter(
                    n => filtertypes.indexOf(n.notificationType) > -1
                )
            );
        case APPEND_SOME:
            return state.union(
                Set.fromKeys(
                    apiToMap(action.payload).filter(
                        n => filtertypes.indexOf(n.notificationType) > -1
                    )
                )
            );
        default:
            return state;
    }
};

const generateUserfacingTypesReducers = (filtermap, listCreator) =>
    Object.keys(filtermap).reduce(
        (acc, cur) => ({
            ...acc,
            [cur]: listCreator(filtermap[cur]),
        }),
        {}
    );

const isFetching = (state = false, action = { type: null }) => {
    switch (action.type) {
        case FETCH_SOME:
        case FETCH_ALL:
            return true;
        case APPEND_SOME:
        case RECEIVE_ALL:
            return false;
        default:
            return state;
    }
};

const isFetchingBefore = (state = false, action = { type: null }) => {
    switch (action.type) {
        case FETCH_SOME:
            if (action.direction === 'before') return true;
            return state;
        case APPEND_SOME:
            return false;
        default:
            return state;
    }
};

const errorMsg = (state = null, action = { type: null }) => {
    switch (action.type) {
        case APPEND_SOME:
        case RECEIVE_ALL:
            return null;
        case APPEND_SOME_ERROR:
        case RECEIVE_ALL_ERROR:
        case SENT_UPDATES_ERROR:
            return action.msg;
        default:
            return state;
    }
};

export const allIds = (state = Set(), action = { type: null }) => {
    switch (action.type) {
        case RECEIVE_ALL:
            return Set.fromKeys(apiToMap(action.payload));
        case APPEND_SOME:
            return state.union(Set.fromKeys(apiToMap(action.payload)));
        default:
            return state;
    }
};

export default combineReducers({
    byId,
    allIds,
    idsReadPending: createUpdatedList({ prop: 'read', val: true }),
    idsUnreadPending: createUpdatedList({ prop: 'read', val: false }),
    idsShownPending: createUpdatedList({ prop: 'shown', val: true }),
    unread: createList({ prop: 'read', val: false }),
    unshown: createList({ prop: 'shown', val: false }),
    byUserFacingType: combineReducers(
        generateUserfacingTypesReducers(filters, createMultiTypeList)
    ),
    isFetching,
    isFetchingBefore,
    errorMsg,
    lastFetchBeforeCount: (state = Map(), action = { type: null }) => {
        switch (action.type) {
            case SET_LAST_FETCH_BEFORE_COUNT:
                return state.set(action.types, action.count);
            default:
                return state;
        }
    },
});

// Action creators
export const receiveAll = payload => ({
    type: RECEIVE_ALL,
    payload,
});

export const appendSome = payload => ({
    type: APPEND_SOME,
    payload,
});

export const updateOne = (id, updates) => ({
    type: UPDATE_ONE,
    id,
    updates,
});

export const updateSome = (ids, updates) => ({
    type: UPDATE_SOME,
    ids,
    updates,
});

export const sentUpdates = updates => ({
    type: SENT_UPDATES,
    updates,
});

export const sentUpdatesError = msg => ({
    type: SENT_UPDATES_ERROR,
    msg,
});

export const fetchSome = (direction, types) => ({
    type: FETCH_SOME,
    direction,
    types,
});

export const fetchSomeError = msg => ({
    type: FETCH_SOME_ERROR,
    msg,
});

export const fetchAll = () => ({
    type: FETCH_ALL,
});

export const appendSomeError = msg => ({
    type: APPEND_SOME_ERROR,
    msg,
});

export const receiveAllError = msg => ({
    type: RECEIVE_ALL_ERROR,
    msg,
});

export const setLastFetchBeforeCount = (types, count) => ({
    type: SET_LAST_FETCH_BEFORE_COUNT,
    types,
    count,
});

// Selectors
export const selectors = {
    getNotificationsById: state => state.notification.byId,
    getIdsReadPending: state => state.notification.idsReadPending,
    getIdsUnreadPending: state => state.notification.idsUnreadPending,
    getIdsShownPending: state => state.notification.idsShownPending,
};
