import { Set, List } from 'immutable';

import {
    FAVORITES_COMPLETE_PAGE_LOADING,
    FAVORITES_TOGGLE,
    FAVORITES_LOADING_STARTED,
    FAVORITES_SET_DATA,
    FAVORITES_SET_PAGE_LOADING,
} from '../../constants/favorites';

export default function(state, { type, payload }) {
    if (!state) {
        state = {
            isLoading: false,
            isLoaded: false,
            list: List(),
            set: Set(),
            showList: null,
            pages: 0,
            isPageLoading: false,
        };
    }

    switch (type) {
        case FAVORITES_LOADING_STARTED:
            return {
                ...state,
                isLoading: true,
            };
        case FAVORITES_SET_DATA:
            return {
                ...state,
                isLoading: false,
                isLoaded: true,
                list: List(payload.list),
                set: Set(payload.list),
            };
        case FAVORITES_SET_PAGE_LOADING:
            return {
                ...state,
                pages: state.pages + 1,
                isPageLoading: true,
            };
        case FAVORITES_COMPLETE_PAGE_LOADING:
            return {
                ...state,
                showList: List(payload.list),
                isPageLoading: false,
            };
        case FAVORITES_TOGGLE:
            if (!state.isLoading) {
                let list;

                if (payload.isAdd) {
                    list = state.list.push(payload.link);
                } else {
                    list = state.list.filter(link => link !== payload.link);
                }

                return {
                    ...state,
                    list,
                    set: Set(list),
                };
            }
    }

    return state;
}
