import koa_router from 'koa-router';
import _ from 'lodash';
import { api } from '@steemit/steem-js';
import { routeRegex } from 'app/ResolveRoute';
import GDPRUserList from 'app/utils/GDPRUserList';
import PostList2Rss from 'shared/PostList2Rss';

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
}
