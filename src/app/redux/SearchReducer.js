import { Map, List, fromJS } from 'immutable';

const SEARCH_DISPATCH = 'search/SEARCH_DISPATCH';
const SEARCH_PENDING = 'search/SEARCH_PENDING';
const SEARCH_ERROR = 'search/SEARCH_ERROR';
const SEARCH_RESULT = 'search/SEARCH_RESULT';

const defaultSearchState = Map({
    pending: false,
    error: false,
    result: List([]),
});

export default function reducer(state = defaultSearchState, action) {
    const payload = action.payload;

    switch (action.type) {
        // Has a saga watcher.
        case SEARCH_DISPATCH: {
            return state;
        }
        case SEARCH_PENDING: {
            const { search, pending } = payload;
            state.setIn([search, 'pending'], pending);
            return state;
        }
        case SEARCH_ERROR: {
            const { search, error } = payload;
            state.setIn([search, 'error'], error);
            return state;
        }
        case SEARCH_RESULT: {
            const { results } = payload;
            console.log('results: ', results);
            console.log('state before: ', state.toJS());
            const newState = state.setIn(['result'], new List(results));
            console.log('state after: ', newState.toJS());
            return newState;
        }
        default:
            return state;
    }
}

export const search = payload => ({
    type: SEARCH_DISPATCH,
    payload,
});
export const searchPending = payload => ({
    type: SEARCH_PENDING,
    payload,
});
export const searchError = payload => ({
    type: SEARCH_PENDING,
    payload,
});

export const searchResult = payload => ({
    type: SEARCH_RESULT,
    payload,
});
