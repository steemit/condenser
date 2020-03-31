import { Map, List, fromJS } from 'immutable';

const COMMUNITY_SEARCH_DISPATCH = 'communitySearch/COMMUNITY_SEARCH_DISPATCH';
const COMMUNITY_SEARCH_PENDING = 'communitySearch/COMMUNITY_SEARCH_PENDING';
const COMMUNITY_SEARCH_ERROR = 'communitySearch/COMMUNITY_SEARCH_ERROR';
const COMMUNITY_SEARCH_RESULT = 'communitySearch/COMMUNITY_SEARCH_RESULT';

const defaultCommunitySearchState = Map({
    pending: false,
    error: false,
    result: List([]),
});

export default function reducer(state = defaultCommunitySearchState, action) {
    const payload = action.payload;

    switch (action.type) {
        // Has a saga watcher.
        case COMMUNITY_SEARCH_DISPATCH: {
            return state;
        }
        case COMMUNITY_SEARCH_PENDING: {
            const { pending } = payload;
            return state.setIn(['pending'], pending);
        }
        case COMMUNITY_SEARCH_ERROR: {
            const { error } = payload;
            return state.setIn(['error'], error);
        }
        case COMMUNITY_SEARCH_RESULT: {
            // TODO: format / parse the search result and put it into state
            return state;
        }
        default:
            return state;
    }
}

export const communitySearch = payload => ({
    type: COMMUNITY_SEARCH_DISPATCH,
    payload,
});
export const communitySearchPending = payload => ({
    type: COMMUNITY_SEARCH_PENDING,
    payload,
});
export const communitySearchError = payload => ({
    type: COMMUNITY_SEARCH_PENDING,
    payload,
});

export const communitySearchResult = payload => ({
    type: COMMUNITY_SEARCH_RESULT,
    payload,
});
