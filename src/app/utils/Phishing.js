const domains = [
    'steewit.com',
    'śteemit.com',
    'ŝteemit.com',
    'şteemit.com',
    'šteemit.com',
    'sţeemit.com',
    'sťeemit.com',
    'șteemit.com',
    'sleemit.com',
];

/**
 * Does this URL look like a phishing attempt?
 *
 * @param {string} questionableUrl
 * @returns {boolean}
 */
export const looksPhishy = questionableUrl => {
    for (let domain of domains) {
        if (questionableUrl.toLocaleLowerCase().indexOf(domain) > -1)
            return true;
    }

    return false;
};
