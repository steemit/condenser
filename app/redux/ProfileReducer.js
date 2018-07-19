import { fromJS } from 'immutable';

export const CHANGE_LAYOUT = 'CHANGE_LAYOUT';

export default function(state, { type, payload }) {
    if (!state) {
        state = fromJS({
            layout: getSavedLayout() || 'list',
        });
    }

    switch (type) {
        case CHANGE_LAYOUT:
            return state.set('layout', payload.layout);
    }

    return state;
}

function getSavedLayout() {
    if (process.env.BROWSER) {
        try {
            return localStorage.getItem('profile.layout');
        } catch (err) {}
    }
}
