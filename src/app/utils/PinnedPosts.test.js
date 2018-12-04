import { cachedPinnedPostUrls, pinnedPosts } from './PinnedPosts';

describe('pinnedPosts', () => {
    it('retrieves a list of URLs', async () => {
        let fetch = function(url) {
            return Promise.resolve({
                json: () =>
                    Promise.resolve({
                        pinned_posts: ['/steem/@steemitblog/foo'],
                    }),
            });
        };

        expect(cachedPinnedPostUrls === undefined);

        let urls = await pinnedPosts({ fetch: fetch });
        expect(Array.isArray(urls));
        expect(urls.length === 1);
        expect(urls[0] === '/steem/@steemitblog/foo');
        expect(Array.isArray(cachedPinnedPostUrls));
        expect(cachedPinnedPostUrls.length === 1);
        expect(cachedPinnedPostUrls[0] === '/steem/@steemitblog/foo');

        fetch = function(url) {
            throw 'this should not get called';
        };

        urls = await pinnedPosts({ fetch: fetch });
        expect(Array.isArray(urls));
        expect(urls.length === 1);
        expect(urls[0] === '/steem/@steemitblog/foo');
    });

    it('returns an empty list on error', async () => {
        let fetch = function(url) {
            return new Promise(function(resolve, reject) {
                reject();
            });
        };

        let urls = await pinnedPosts({ fetch: fetch });
        expect(Array.isArray(urls));
        expect(urls.length === 0);
    });
});
