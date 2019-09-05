import { api } from '@steemit/steem-js';

import stateCleaner from 'app/redux/stateCleaner';

export async function getStateAsync(url) {
    // strip off query string
    url = url.split('?')[0];

    // strip off leading and trailing slashes
    if (url.length > 0 && url[0] == '/') url = url.substring(1, url.length);
    if (url.length > 0 && url[url.length - 1] == '/')
        url = url.substring(0, url.length - 1);

    // blank URL defaults to `trending`
    if (url === '') url = 'trending';

    // curation and author rewards pages are alias of `transfers`
    // @TODO: maybe remove these all together as Condenser should redirect them to Wallet?
    if (url.match(/^@.*?\/curation-rewards$/) !== null) {
        url = url.replace('/curation-rewards', '/transfers');
    } else if (url.match(/^@.*?\/author-rewards$/) !== null) {
        url = url.replace('/author-rewards', '/transfers');
    }

    const raw = await api.getStateAsync(url);
    const cleansed = stateCleaner(raw);
    return cleansed;
}
