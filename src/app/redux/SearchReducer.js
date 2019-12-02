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
            const { pending } = payload;
            return state.setIn(['pending'], pending);
        }
        case SEARCH_ERROR: {
            const { error } = payload;
            return state.setIn(['error'], error);
        }
        case SEARCH_RESULT: {
            const { hits, results, scroll_id, append } = payload;

            const posts = List(
                results.map(post => {
                    post.created = post.created_at;
                    post.author_reputation = post.author_rep;
                    post.stats = { total_votes: post.total_votes };
                    return fromJS(post);
                })
            );

            let newState = {};
            if (!append) {
                newState = state
                    .set('result', posts)
                    .set('scrollId', scroll_id);
            } else {
                // If append is true. need to process results and append them to previous result
                const updatedResults = state.get('result').concat(posts);
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
