import { Set, List } from 'immutable';
import {
    FAVORITES_COMPLETE_PAGE_LOADING,
    FAVORITES_LOADING_STARTED,
    FAVORITES_SET_DATA,
    FAVORITES_SET_PAGE_LOADING,
    FAVORITES_TOGGLE_REQUEST_SUCCESS,
} from '../../constants/favorites';

export const PAGE_SIZE = 20;

const initialState = {
    isLoading: false,
    isLoaded: false,
    list: List(),
    set: Set(),
    showList: null,
    pages: 0,
    isPageLoading: false,
};

export default function(state = initialState, { type, payload, meta }) {
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
        case FAVORITES_TOGGLE_REQUEST_SUCCESS:
            if (!state.isLoading) {
                let list;
                let showList;

                if (meta.isAdd) {
                    list = state.list.push(meta.link);

                    // Если мы на последней странице просмотра
                    if (Math.ceil(state.list.size / PAGE_SIZE) === state.pages) {
                        showList = state.showList.push(meta.link);
                    } else {
                        showList = state.showList;
                    }

                } else {
                    list = state.list.filter(link => link !== meta.link);
                    showList = state.showList.filter(link => link !== meta.link);
                }

                return {
                    ...state,
                    list,
                    showList,
                    set: Set(list),
                };
            }
            break;
    }

    return state;
}
