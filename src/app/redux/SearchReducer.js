import { Map, List, fromJS } from 'immutable';

const SEARCH_DISPATCH = 'search/SEARCH_DISPATCH';
const SEARCH_PENDING = 'search/SEARCH_PENDING';
const SEARCH_ERROR = 'search/SEARCH_ERROR';
const SEARCH_RESULT = 'search/SEARCH_RESULT';

const defaultSearchState = Map({
    pending: false,
    error: false,
    scrollId: false,
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
            return state.setIn([search, 'pending'], pending);
        }
        case SEARCH_ERROR: {
            const { search, error } = payload;
            return state.setIn([search, 'error'], error);
        }
        case SEARCH_RESULT: {
            const { hits, results, scroll_id, append } = payload;
            let newState = {};
            if (!append) {
                newState = state
                    .setIn(['result'], new List(results))
                    .setIn(['scrollId'], scroll_id);
            } else {
                // If append is true. need to process results and append them to previous result
                const updatedResults = state
                    .get('result')
                    .toJS()
                    .concat(results);
                newState = state
                    .setIn(['result'], new List(updatedResults))
                    .setIn(['scrollId'], scroll_id);
            }
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
