import * as config from 'config';
import * as https from 'https';
import { callBridge } from 'app/utils/steemApi';

/**
 * Load special posts - including notices, featured, and promoted.
 *
 * @returns {promise} resolves to object of {featured_posts:[], promoted_posts:[], notices:[]}
 */
function loadSpecialPosts() {
    return new Promise((resolve, reject) => {
        const emptySpecialPosts = {
            featured_posts: [],
            promoted_posts: [],
            notices: [],
        };

        if (!config.special_posts_url) {
            resolve(emptySpecialPosts);
            return;
        }

        const request = https.get(config.special_posts_url, resp => {
            let data = '';
            resp.on('data', chunk => {
                data += chunk;
            });
            resp.on('end', () => {
                const json = JSON.parse(data);
                console.info('Received special posts payload');
                //console.info('Received special posts payload', json);
                if (json === Object(json)) {
                    resolve(json);
                }
            });
        });

        request.on('error', e => {
            console.error('Could not load special posts', e);
            resolve(emptySpecialPosts);
        });
    });
}

async function getPost(url) {
    const [author, permlink] = url.split('@')[1].split('/');
    return await callBridge('get_post', { author, permlink });
}

/**
 * [async] Get special posts - including notices, featured, and promoted.
 *
 * @returns {object} object of {featured_posts:[], promoted_posts:[], notices:[]}
 */
export async function specialPosts() {
    console.info('Loading special posts');

    const postData = await loadSpecialPosts();
    //console.info('Loaded special posts', postData);
    let loadedPostData = {
        featured_posts: [],
        promoted_posts: [],
        notices: [],
    };

    for (const url of postData.featured_posts) {
        let post = await getPost(url);
        post.special = true;
        loadedPostData.featured_posts.push(post);
    }

    for (const url of postData.promoted_posts) {
        let post = await getPost(url);
        post.special = true;
        loadedPostData.promoted_posts.push(post);
    }

    for (const notice of postData.notices) {
        if (notice.permalink) {
            let post = await getPost(notice.permalink);
            loadedPostData.notices.push(Object.assign({}, notice, post));
        } else {
            loadedPostData.notices.push(notice);
        }
    }

    console.info(
        `Loaded special posts: featured: ${
            loadedPostData.featured_posts.length
        }, promoted: ${loadedPostData.promoted_posts.length}, notices: ${
            loadedPostData.notices.length
        }`
    );

    return loadedPostData;
}
