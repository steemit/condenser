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
            matches[1].charAt(0).toUpperCase() + matches[1].substring(1);
        const category =
            matches[2].charAt(0).toUpperCase() + matches[2].substring(1);

        const onchain = yield api.getStateAsync(this.url.replace('.rss', ''));

        if (onchain) {
            feed = {
                version: 'https://jsonfeed.org/version/1',
                title: `Steemit ${filter} ${category} Posts`,
                home_page_url: `https://steemit.com${this.url}`,
                feed_url: `https://steemit.com${this.url}`,
                icon:
                    'https://steemit.com/images/favicons/apple-touch-icon-57x57.png',
                author: {
                    name: 'Steemit',
                    url: 'https://steemit.com/',
                    avatar:
                        'https://steemit.com/images/favicons/apple-touch-icon-57x57.png',
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
