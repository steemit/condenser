import {Map, OrderedMap} from 'immutable';
import tt from 'counterpart';

const defaultState = Map({
    requests: {},
    loading: false,
    error: '',
    location: {},
    notifications: null,
    ignoredLoadingRequestCount: 0,
});

export default function reducer(state = defaultState, action) {
    if (action.type === '@@router/LOCATION_CHANGE') {
        return state.set('location', {pathname: action.payload.pathname});
    }
    if (action.type === 'CHAIN_API_ERROR') {
        //return state.set('error', action.error).set('loading', false);
        return state.set('error', action.error);
    }
    if (action.type === 'FETCH_DATA_BEGIN') {
        return state.set('loading', true);
    }
    if (action.type === 'FETCH_DATA_END') {
        return state.set('loading', false);
    }
    let res = state;
    if (action.type === 'ADD_NOTIFICATION') {
        const n = {
            action: tt('g.dismiss'),
            dismissAfter: 10000,
            ...action.payload
        };
        res = res.update('notifications', s => {
            return s ? s.set(n.key, n) : OrderedMap({[n.key]: n});
        });
    }
    if (action.type === 'REMOVE_NOTIFICATION') {
        res = res.update('notifications', s => s.delete(action.payload.key));
    }
    return res;
}
