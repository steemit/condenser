import koa_router from 'koa-router';
import _ from 'lodash';
import { api } from '@steemit/steem-js';
import { routeRegex } from 'app/ResolveRoute';
import GDPRUserList from 'app/utils/GDPRUserList';
import PostList2Rss from 'shared/PostList2Rss';
import { callBridge } from 'app/utils/steemApi';

function* accountPostsToRss(sort, username) {
    let feed = '';
    let status = '';

    const onchain = yield callBridge('get_account_posts', {
        sort,
        account: username,
        observer: username,
    });

    if (GDPRUserList.includes(username)) {
        feed = 'Content unavailable';
        status = 451;
    } else if (onchain) {
        feed = {
            version: 'https://jsonfeed.org/version/1',
            title: `Replies to @${username}'s posts`,
            home_page_url: `https://${$STM_Config.site_domain}/@${username}`,
            feed_url: `https://${$STM_Config.site_domain}/@${
                username
            }/replies.rss`,
            description: `Replies to @${
                username
            }'s posts on the Steem blockchain`,
            icon: `https://${
                $STM_Config.site_domain
            }/images/favicons/apple-touch-icon-57x57.png`,
            author: {
                name: username,
                url: `https://${$STM_Config.site_domain}/@${username}`,
            },
            items: [],
        };

        feed = PostList2Rss(feed, onchain);
        status = 200;
    } else {
        feed = 'No replies found';
        status = 404;
    }

    return {
        feed,
        status,
    };
}

export default function useUserRss(app) {
    const router = koa_router();
    app.use(router.routes());

    router.get(routeRegex.UserRss, function*() {
        // validate and build user details in JSON
        const username = this.url.match(routeRegex.UserRss)[1].replace('@', '');
        let feed = '';
        let status = '';

        const onchain = yield api.getStateAsync(`/@${username}`);

        if (GDPRUserList.includes(username)) {
            feed = 'Content unavailable';
            status = 451;
        } else if (onchain) {
            try {
                onchain.accounts[username].json_metadata = JSON.parse(
                    onchain.accounts[username].json_metadata
                );
            } catch (e) {
                onchain.accounts[username].json_metadata = {};
            }

            const userAbout = _.get(
                onchain.accounts[username].json_metadata,
                'profile.about',
                null
            );
            const userFullName = _.get(
                onchain.accounts[username].json_metadata,
                'profile.name',
                null
            );
            const userProfileImage = _.get(
                onchain.accounts[username].json_metadata,
                'profile.profile_image',
                null
            );

            feed = {
                version: 'https://jsonfeed.org/version/1',
                title: `${userFullName}'s blog posts`,
                home_page_url: `https://${$STM_Config.site_domain}/@${
                    username
                }`,
                feed_url: `https://${$STM_Config.site_domain}/@${username}.rss`,
                description: userAbout,
                icon: userProfileImage,
                author: {
                    name: userFullName,
                    url: `https://${$STM_Config.site_domain}/@${username}`,
                    avatar: userProfileImage,
                },
                items: [],
            };

            feed = PostList2Rss(feed, onchain.content);
            status = 200;
        } else {
            feed = 'No account found';
            status = 404;
        }

        // return response and status code
        this.body = feed;
        this.status = status;
        this.set('Content-Type', 'application/xml');
    });

    router.get(routeRegex.UserRepliesRss, function*() {
        // validate and build user details in JSON
        const username = this.url
            .match(routeRegex.UserRepliesRss)[1]
            .replace('@', '');
        const { feed, status } = yield accountPostsToRss('replies', username);

        // return response and status code
        this.body = feed;
        this.status = status;
        this.set('Content-Type', 'application/xml');
    });

    router.get(routeRegex.UserCommentsRss, function*() {
        // validate and build user details in JSON
        const username = this.url
            .match(routeRegex.UserCommentsRss)[1]
            .replace('@', '');
        const { feed, status } = yield accountPostsToRss('comments', username);

        // return response and status code
        this.body = feed;
        this.status = status;
        this.set('Content-Type', 'application/xml');
    });
}
