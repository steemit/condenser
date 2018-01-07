import { Map, OrderedMap } from 'immutable';
import tt from 'counterpart';

// Action constants
export const appActions = {
    STEEM_API_ERROR: 'app/STEEM_API_ERROR',
    FETCH_DATA_BEGIN: 'app/FETCH_DATA_BEGIN',
    FETCH_DATA_END: 'app/FETCH_DATA_END',
    ADD_NOTIFICATION: 'app/ADD_NOTIFICATION',
    REMOVE_NOTIFICATION: 'app/REMOVE_NOTIFICATION',
    UPDATE_NOTIFICOUNTERS: 'app/UPDATE_NOTIFICOUNTERS',
    SET_USER_PREFERENCES: 'app/SET_USER_PREFERENCES',
    TOGGLE_NIGHTMODE: 'app/TOGGLE_NIGHTMODE',
    TOGGLE_BLOGMODE: 'app/TOGGLE_BLOGMODE',
};

export const defaultState = Map({
    loading: false,
    error: '',
    location: {},
    notifications: null,
    notificounters: Map({
        total: 0,
        feed: 0,
        reward: 0,
        send: 0,
        mention: 0,
        follow: 0,
        vote: 0,
        reply: 0,
        account_update: 0,
        message: 0,
        receive: 0,
    }),
    user_preferences: Map({
        locale: null,
        nsfwPref: 'warn',
        nightmode: false,
        blogmode: false,
        currency: 'USD',
    }),
});

export default function reducer(state = defaultState, action = {}) {
    switch (action.type) {
        case '@@router/LOCATION_CHANGE':
            return state.set('location', { pathname: action.payload.pathname });
        case appActions.STEEM_API_ERROR:
            // Until we figure out how to better handle these errors, let em slide.
            // This action is the only part of the app that marks an error in state.app.error,
            // and the only part of the app which pays attn to this part of the state is in App.jsx.
            //return  state.set('error', action.error).set('loading', false);
            return state;
        case appActions.FETCH_DATA_BEGIN:
            return state.set('loading', true);
        case appActions.FETCH_DATA_END:
            return state.set('loading', false);
        case appActions.ADD_NOTIFICATION: {
            const n = {
                action: tt('g.dismiss'),
                dismissAfter: 10000,
                ...action.payload,
            };
            return state.update('notifications', s => {
                return s ? s.set(n.key, n) : OrderedMap({ [n.key]: n });
            });
        }
        case appActions.REMOVE_NOTIFICATION:
            return state.update('notifications', s =>
                s.delete(action.payload.key)
            );
        case appActions.UPDATE_NOTIFICOUNTERS: {
            if (action.payload) {
                const nc = action.payload;
                if (nc.follow > 0) {
                    nc.total -= nc.follow;
                    nc.follow = 0;
                }
                return state.set('notificounters', Map(nc));
            }
            return state;
        }
        case appActions.SET_USER_PREFERENCES:
            return state.set('user_preferences', Map(action.payload));
        case appActions.TOGGLE_NIGHTMODE:
            return state.setIn(
                ['user_preferences', 'nightmode'],
                !state.getIn(['user_preferences', 'nightmode'])
            );
        case appActions.TOGGLE_BLOGMODE:
            return state.setIn(
                ['user_preferences', 'blogmode'],
                !state.getIn(['user_preferences', 'blogmode'])
            );
        default:
            return state;
    }
}

export const steemApiError = error => ({
    type: appActions.STEEM_API_ERROR,
    error,
});

export const fetchDataBegin = () => ({
    type: appActions.FETCH_DATA_BEGIN,
});

export const fetchDataEnd = () => ({
    type: appActions.FETCH_DATA_END,
});

export const addNotification = payload => ({
    type: appActions.ADD_NOTIFICATION,
    payload,
});

export const removeNotification = payload => ({
    type: appActions.REMOVE_NOTIFICATION,
    payload,
});

export const updateNotificounters = payload => ({
    type: appActions.UPDATE_NOTIFICOUNTERS,
    payload,
});

export const setUserPreferences = payload => ({
    type: appActions.SET_USER_PREFERENCES,
    payload,
});

export const toggleNightmode = () => ({
    type: appActions.TOGGLE_NIGHTMODE,
});

export const toggleBlogmode = () => ({
    type: appActions.TOGGLE_BLOGMODE,
});
