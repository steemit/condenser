import store from 'store';

export const ALLOWED_THEMES = ['Default', 'Green', 'Red']
export const DEFAULT_THEME = 'Default'

export function themeName() {
    var theme_name = DEFAULT_THEME;
    if (store.get('theme')) {
        theme_name = store.get('theme');
    }
    theme_name = theme_name.replace(/"/g,'').toLowerCase();
    return theme_name;
}
