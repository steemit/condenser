import * as config from 'config';
import * as https from 'https';
import * as steem from '@steemit/steem-js';

function loadPinnedPosts() {
    return new Promise((resolve, reject) => {
        const emptyPinnedPosts = {
            pinned_posts: [],
            notices: [],
        };

        if (!config.pinned_posts_url) {
            resolve(emptyPinnedPosts);
            return;
        }

        const request = https.get(config.pinned_posts_url, resp => {
            let data = '';
            resp.on('data', chunk => {
                data += chunk;
            });
            resp.on('end', () => {
                const json = JSON.parse(data);
                console.info('Received pinned posts payload', json);
                if (json === Object(json)) {
                    resolve(json);
                }
            });
        });

        request.on('error', e => {
            console.error('Could not load pinned posts', e);
            resolve(emptyPinnedPosts);
        });
    });
}

export async function pinnedPosts() {
    console.info('Loading pinned posts');

    const postData = await loadPinnedPosts();
    let loadedPostData = {
        pinned_posts: [],
        notices: [],
    };

    for (const url of postData.pinned_posts) {
        const [username, postId] = url.split('@')[1].split('/');
        let post = await steem.api.getContentAsync(username, postId);
        post.pinned = true;
        loadedPostData.pinned_posts.push(post);
    }

    for (const notice of postData.notices) {
        if (notice.permalink) {
            const [username, postId] = notice.permalink
                .split('@')[1]
                .split('/');
            let post = await steem.api.getContentAsync(username, postId);
            loadedPostData.notices.push(Object.assign({}, notice, post));
        } else {
            loadedPostData.notices.push(notice);
        }
    }

    console.info('Loaded pinned posts');

    return loadedPostData;
}
