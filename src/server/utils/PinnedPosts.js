import * as config from 'config';
import * as https from 'https';
import * as steem from '@steemit/steem-js';

function pinnedPostUrls() {
    return new Promise(function(resolve, reject) {
        if (!config.pinned_posts_url) {
            resolve([]);
        }

        const request = https.get(config.pinned_posts_url, resp => {
            let data = '';
            resp.on('data', chunk => {
                data += chunk;
            });
            resp.on('end', () => {
                const json = JSON.parse(data);
                if (Array.isArray(json.pinned_posts)) {
                    resolve(json.pinned_posts);
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
    for (const url of urls) {
        const [username, postId] = url.split('@')[1].split('/');
        let post = await steem.api.getContentAsync(username, postId);
        post.pinned = true;
        posts.push(post);
    }

    return posts;
}
