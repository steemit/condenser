export function findParent(el, class_name) {
    if (
        el.className &&
        el.className.indexOf &&
        el.className.indexOf(class_name) !== -1
    )
        return el;
    if (el.parentNode) return findParent(el.parentNode, class_name);
    return null;
}

// From https://stackoverflow.com/a/18284182
export function getViewportDimensions(w) {
    // Bail if server-side
    if (!process.env.BROWSER) return { w: 0, h: 0 };

    // Use the specified window or the current window if no argument
    w = w || window;

    // This works for all browsers except IE8 and before
    if (w.innerWidth != null) return { w: w.innerWidth, h: w.innerHeight };

    // For IE (or any browser) in Standards mode
    var d = w.document;
    if (document.compatMode == 'CSS1Compat')
        return {
            w: d.documentElement.clientWidth,
            h: d.documentElement.clientHeight,
        };

    // For browsers in Quirks mode
    return { w: d.body.clientWidth, h: d.body.clientHeight };
}

function locale() {
    if (navigator.languages != undefined) return navigator.languages[0];
    else return navigator.language;
}

/**
 * A naive location guess so that we don't inundate non-gdpr users with notices.
 *
 * @returns {boolean}
 */
export function showGdprNotice() {
    const gdprCountries = [
        'AT',
        'BE',
        'BG',
        'HR',
        'CY',
        'CZ',
        'DK',
        'EE',
        'FI',
        'FR',
        'DE',
        'EL',
        'HU',
        'IE',
        'IT',
        'LV',
        'LT',
        'LU',
        'MT',
        'NL',
        'PL',
        'PT',
        'RO',
        'SK',
        'SI',
        'ES',
        'SE',
        'UK',
    ];

    const loc = locale();
    let country = null;

    // Many locales lack the country, so, let's check for that.
    if (loc.indexOf('-') > -1) {
        // we have a locale in the form of lang-CO
        country = loc.split('-')[1];
    }

    let showGdprNotice = false;
    if (gdprCountries.indexOf(country.toUpperCase()) > -1) {
        showGdprNotice = true;
    }
    return showGdprNotice;
}
