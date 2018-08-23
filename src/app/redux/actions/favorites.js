import { FAVORITES_TOGGLE, FAVORITES_LOAD_NEXT_PAGE } from '../constants/favorites';

export function toggleFavoriteAction(payload) {
    return { type: FAVORITES_TOGGLE, payload };
}

export function favoritesLoadNextPageAction() {
    return { type: FAVORITES_LOAD_NEXT_PAGE, payload: {} };
}
