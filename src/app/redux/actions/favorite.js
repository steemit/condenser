import { FAVORITE_TOGGLE, FAVORITE_LOAD_NEXT_PAGE } from '../constants/favorites';

export function toggleFavoriteAction(payload) {
    return { type: FAVORITE_TOGGLE, payload };
}

export function favoriteLoadNextPageAction() {
    return { type: FAVORITE_LOAD_NEXT_PAGE, payload: {} };
}
