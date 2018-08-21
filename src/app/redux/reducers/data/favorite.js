import { Set, List } from 'immutable';

import {
    FAVORITE_COMPLETE_PAGE_LOADING,
    FAVORITE_TOGGLE,
    FAVORITE_LOADING_STARTED,
    FAVORITE_SET_DATA,
    FAVORITE_SET_PAGE_LOADING,
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
        case FAVORITE_LOADING_STARTED:
            return {
                ...state,
                isLoading: true,
            };
        case FAVORITE_SET_DATA:
            return {
                ...state,
                isLoading: false,
                isLoaded: true,
                list: List(payload.list),
                set: Set(payload.list),
            };
        case FAVORITE_SET_PAGE_LOADING:
            return {
                ...state,
                pages: state.pages + 1,
                isPageLoading: true,
            };
        case FAVORITE_COMPLETE_PAGE_LOADING:
            return {
                ...state,
                showList: List(payload.list),
                isPageLoading: false,
            };
        case FAVORITE_TOGGLE:
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
