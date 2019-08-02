import { api } from '@steemit/steem-js';

import stateCleaner from 'app/redux/stateCleaner';

export async function getStateAsync(url) {
    // strip off query string
    url = url.split('?')[0];

    if (url === '/') url = 'trending';

    if (url.indexOf('/curation-rewards') !== -1)
        url = url.replace('/curation-rewards', '/transfers');
    if (url.indexOf('/author-rewards') !== -1)
        url = url.replace('/author-rewards', '/transfers');

    const raw = await api.getStateAsync(url);
    const cleansed = stateCleaner(raw);
    return cleansed;
}
