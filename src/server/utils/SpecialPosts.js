import * as config from 'config';
import * as https from 'https';
import { callBridge } from 'app/utils/steemApi';
import { safeConsoleTime, safeConsoleTimeEnd } from './TimingUtils';

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

    safeConsoleTime('DEBUG: loadSpecialPosts');
    const postData = await loadSpecialPosts();
    safeConsoleTimeEnd('DEBUG: loadSpecialPosts');
    //console.info('Loaded special posts', postData);
    let loadedPostData = {
        featured_posts: [],
        promoted_posts: [],
        notices: [],
    };

    safeConsoleTime('DEBUG: loadFeaturedPosts');
    for (const url of postData.featured_posts) {
        let post = await getPost(url);
        post.special = true;
        loadedPostData.featured_posts.push(post);
    }
    safeConsoleTimeEnd('DEBUG: loadFeaturedPosts');

    safeConsoleTime('DEBUG: loadPromotedPosts');
    for (const url of postData.promoted_posts) {
        let post = await getPost(url);
        post.special = true;
        loadedPostData.promoted_posts.push(post);
    }
    safeConsoleTimeEnd('DEBUG: loadPromotedPosts');

    safeConsoleTime('DEBUG: loadNotices');
    for (const notice of postData.notices) {
        if (notice.permalink) {
            let post = await getPost(notice.permalink);
            loadedPostData.notices.push(Object.assign({}, notice, post));
        } else {
            loadedPostData.notices.push(notice);
        }
    }
    safeConsoleTimeEnd('DEBUG: loadNotices');

    console.info(
        `Loaded special posts: featured: ${
            loadedPostData.featured_posts.length
        }, promoted: ${loadedPostData.promoted_posts.length}, notices: ${
            loadedPostData.notices.length
        }`
    );

    return loadedPostData;
}
