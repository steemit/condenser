import {
    FAVORITES_TOGGLE,
    FAVORITES_LOAD_NEXT_PAGE,
    FAVORITES_REQUEST,
    FAVORITES_REQUEST_SUCCESS,
    FAVORITES_REQUEST_ERROR,
    FAVORITES_TOGGLE_REQUEST,
    FAVORITES_TOGGLE_REQUEST_SUCCESS,
    FAVORITES_TOGGLE_REQUEST_ERROR,
} from '../constants/favorites';
import { GATE_SEND_MESSAGE } from '../constants/gate';

export function toggleFavoriteAction(payload) {
    return { type: FAVORITES_TOGGLE, payload };
}

export function favoritesLoadNextPageAction() {
    return { type: FAVORITES_LOAD_NEXT_PAGE, payload: {} };
}

export function loadFavoritesAction() {
    return {
        type: GATE_SEND_MESSAGE,
        payload: {
            method: 'getFavorites',
            types: [FAVORITES_REQUEST, FAVORITES_REQUEST_SUCCESS, FAVORITES_REQUEST_ERROR],
            data: {},
        },
    };
}

export function toggleFavoriteRequestAction(link, isAdd) {
    const method = isAdd ? 'addFavorite' : 'removeFavorite';

    return {
        type: GATE_SEND_MESSAGE,
        payload: {
            method,
            types: [
                FAVORITES_TOGGLE_REQUEST,
                FAVORITES_TOGGLE_REQUEST_SUCCESS,
                FAVORITES_TOGGLE_REQUEST_ERROR,
            ],
            data: {
                permlink: link,
            },
        },
        meta: {
            link,
            isAdd,
        },
    };
}
