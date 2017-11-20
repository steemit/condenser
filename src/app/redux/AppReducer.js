import {Map, OrderedMap} from 'immutable';
import tt from 'counterpart';

const defaultState = Map({
    requests: {},
    loading: false,
    error: '',
    location: {},
    notifications: null,
    ignoredLoadingRequestCount: 0,
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
        receive: 0
    }),
    user_preferences: Map({
        locale: null,
        nsfwPref: 'warn',
        nightmode: false,
        blogmode: false,
        currency: 'USD'
    }),
});

export default function reducer(state = defaultState, action) {
    switch (action.type) {
        case '@@router/LOCATION_CHANGE':
            return state.set('location', {pathname: action.payload.pathname});
        case 'STEEM_API_ERROR':
            return state.set('error', action.error).set('loading', false);
        case 'FETCH_DATA_BEGIN':
            return state.set('loading', true);
        case 'FETCH_DATA_END':
            return state.set('loading', false);
        case 'ADD_NOTIFICATION': {
            const n = {
                action: tt('g.dismiss'),
                dismissAfter: 10000,
                ...action.payload
            };
            return state.update('notifications', (s) => {
                return s ? s.set(n.key, n) : OrderedMap({[n.key]: n});
            });
        }
        case 'REMOVE_NOTIFICATION':
            return state.update('notifications', s => s.delete(action.payload.key));
        case 'UPDATE_NOTIFICOUNTERS' && action.payload: {
            const nc = action.payload;
            if (nc.follow > 0) {
                nc.total -= nc.follow;
                nc.follow = 0;
            }
            return state.set('notificounters', Map(nc));
        }
        case 'SET_USER_PREFERENCES':
            return state.set('user_preferences', Map(action.payload));
        case 'TOGGLE_NIGHTMODE':
            return state.setIn(['user_preferences', 'nightmode'], !state.getIn(['user_preferences', 'nightmode']));
        case 'TOGGLE_BLOGMODE':
            return state.setIn(['user_preferences', 'blogmode'], !state.getIn(['user_preferences', 'blogmode']));
        default:
            return state;
    }
}
