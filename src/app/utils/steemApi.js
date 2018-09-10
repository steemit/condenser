import { api } from '@steemit/steem-js';

import stateCleaner from 'app/redux/stateCleaner';

export async function getStateAsync(path) {
    const raw = await api.getStateAsync(path);

    const cleansed = stateCleaner(raw);

    return cleansed;
}
