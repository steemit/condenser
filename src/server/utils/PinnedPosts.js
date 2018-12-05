import * as config from 'config';
import * as https from 'https';
import * as steem from '@steemit/steem-js';

let cachedPinnedPostUrls = undefined;
function pinnedPostUrls() {
    return new Promise(function(resolve, reject) {
        if (Array.isArray(cachedPinnedPostUrls)) {
            resolve(cachedPinnedPostUrls);
        }

        const request = https.get(config.pinned_posts_url, resp => {
            let data = '';
            resp.on('data', chunk => {
                data += chunk;
            });
            resp.on('end', () => {
                const json = JSON.parse(data);
                if (Array.isArray(json.pinned_posts)) {
                    cachedPinnedPostUrls = json.pinned_posts;
                    resolve(cachedPinnedPostUrls);
                }
            });
        });

        request.on('error', e => {
            console.error(e);
            resolve([]);
        });
    });
}

let cachedPinnedPosts = undefined;
export async function pinnedPosts() {
    const urls = await pinnedPostUrls();
    let posts = [];
    urls.forEach(async url => {
        const [username, postId] = url.split('@')[1].split('/');
        posts.push(await steem.api.getContentAsync(username, postId));
    });
    return posts;
}
