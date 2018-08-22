import { PINNED_TOGGLE } from '../constants/pinnedPosts';

export function togglePinAction(link, isPin) {
    return { type: PINNED_TOGGLE, payload: { link, isPin } };
}
