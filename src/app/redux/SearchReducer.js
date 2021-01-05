import { Map, List, fromJS } from 'immutable';

const SEARCH_DISPATCH = 'search/SEARCH_DISPATCH';
const SEARCH_PENDING = 'search/SEARCH_PENDING';
const SEARCH_ERROR = 'search/SEARCH_ERROR';
const SEARCH_RESULT = 'search/SEARCH_RESULT';
const SEARCH_RESET = 'search/SEARCH_RESET';
const SEARCH_DEPTH = 'search/SEARCH_DEPTH';
const SEARCH_SORT = 'search/SEARCH_SORT';

const defaultSearchState = Map({
    pending: false,
    error: false,
    scrollId: false,
    result: List([]),
    depth: 0,
    sort: 'created_at',
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
        case SEARCH_RESET: {
            return state.setIn(['result'], List([]));
        }
        case SEARCH_DEPTH: {
            return state.setIn(['depth'], payload);
        }
        case SEARCH_SORT: {
            return state.setIn(['sort'], payload);
        }
        case SEARCH_RESULT: {
            const { hits, _scroll_id, append } = payload;
            const results = hits.hits;
            const scroll_id = _scroll_id;
            const posts = List(
                results.map(post => {
                    const updatedPost = { ...post._source };
                    updatedPost.created = post._source.created_at;
                    updatedPost.author_reputation = post._source.author_rep;
                    updatedPost.stats = {
                        total_votes: post._source.total_votes,
                    };
                    return fromJS(updatedPost);
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

export const searchReset = payload => ({
    type: SEARCH_RESET,
    payload,
});

export const searchDepth = payload => ({
    type: SEARCH_DEPTH,
    payload,
});

export const searchSort = payload => ({
    type: SEARCH_SORT,
    payload,
});
