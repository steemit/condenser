import koa_router from 'koa-router';
import { api } from '@steemit/steem-js';
import { routeRegex } from 'app/ResolveRoute';
import PostList2Rss from 'shared/PostList2Rss';

export default function useFeedsRss(app) {
    const router = koa_router();
    app.use(router.routes());

    router.get(routeRegex.CategoryFiltersRss, function*() {
        // validate and build user details in JSON
        let feed = '';
        let status = '';

        const matches = this.url.match(routeRegex.CategoryFiltersRss);
        const filter =
            typeof matches[1] !== 'undefined'
                ? matches[1].charAt(0).toUpperCase() + matches[1].substring(1)
                : '';
        const category =
            typeof matches[3] !== 'undefined'
                ? matches[3].charAt(0).toUpperCase() + matches[3].substring(1)
                : '';

        const onchain = yield api.getStateAsync(this.url.replace('.rss', ''));

        if (onchain) {
            feed = {
                version: 'https://jsonfeed.org/version/1',
                title: `Steemit ${filter} ${category} Blog Posts`,
                description: `${filter} ${
                    category
                } blog posts powered and monetized by the Steem blockchain.`,
                home_page_url: `https://${$STM_Config.site_domain}${this.url}`,
                feed_url: `https://${$STM_Config.site_domain}${this.url}`,
                icon: `https://${
                    $STM_Config.site_domain
                }/images/favicons/apple-touch-icon-57x57.png`,
                author: {
                    name: 'Steemit',
                    url: `https://${$STM_Config.site_domain}/`,
                    avatar: `https://${
                        $STM_Config.site_domain
                    }/images/favicons/apple-touch-icon-57x57.png`,
                },
                items: [],
            };

            feed = PostList2Rss(feed, onchain.content);
            // feed = JSON.stringify(onchain);
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
