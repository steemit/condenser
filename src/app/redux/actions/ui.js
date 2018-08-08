import {
    UI_PROFILE_CHANGE_LAYOUT,
    UI_PROFILE_ACTIVITY_CHANGE_TAB,
} from 'src/app/redux/constants/ui';

export function changeProfileLayout(payload) {
    return { type: UI_PROFILE_CHANGE_LAYOUT, payload };
}

export function changeProfileActivityTab(payload) {
    return { type: UI_PROFILE_ACTIVITY_CHANGE_TAB, payload };
}