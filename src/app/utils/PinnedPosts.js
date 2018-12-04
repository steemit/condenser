import * as config from 'config';
import { fetch } from 'whatwg-fetch';

export let cachedPinnedPostUrls = undefined;
export async function pinnedPosts({ force = false, fetch = fetch }) {
    if (!force && Array.isArray(cachedPinnedPostUrls)) {
        return cachedPinnedPostUrls;
    }

    const url = config.condenser_pinned_posts_url;
    try {
        const response = await fetch(url);
        const json = await response.json();
        if (Array.isArray(json.pinned_posts)) {
            cachedPinnedPostUrls = json.pinned_posts;
            return cachedPinnedPostUrls;
        }
    } catch (e) {
        console.error(e);
    }

    return [];
}
