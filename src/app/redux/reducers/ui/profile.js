import { fromJS } from 'immutable';
import {
    UI_PROFILE_CHANGE_LAYOUT
} from 'src/app/redux/constants/ui'

const LAYOUT_STORAGE_KEY = 'profile.layout';

const initialState = fromJS({
    layout: getSavedLayout() || 'list',
    activity: {
        currentTabId: 'all'
    }
});

export default function(state = initialState, { type, payload }) {
    if (!process.env.BROWSER) {
        return null;
    }

    switch (type) {
        case UI_PROFILE_CHANGE_LAYOUT:
            localStorage.setItem(LAYOUT_STORAGE_KEY, payload.layout);
            return state.set('layout', payload.layout);
    }

    return state;
}

function getSavedLayout() {
    try {
        return localStorage.getItem(LAYOUT_STORAGE_KEY);
    } catch (err) {}
}
