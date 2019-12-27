jest.mock('./utils/GDPRUserList');
import resolveRoute, { routeRegex } from './ResolveRoute';

describe('routeRegex', () => {
    it('should produce the desired regex patterns', () => {
        const test_cases = [
            ['UserFeed', /^\/(@[\w\.\d-]+)\/feed\/?$/],
            [
                'UserProfile',
                /^\/(@[\w\.\d-]+)(?:\/(blog|posts|comments|replies|payout|feed|followed|followers|settings|notifications))?\/?$/,
            ],
            [
                'CategoryFilters',
                /^\/(hot|trending|promoted|payout|payout_comments|muted|created)(?:\/([\w\W\d-]{2,32}))?\/?$/,
            ],
            ['PostNoCategory', /^\/(@[\w\.\d-]+)\/([\w\d-]+)$/],
            ['Post', /^\/([\w\W\d-]{2,32})\/(@[\w\.\d-]+)\/([\w\d-]+)\/?$/],
            [
                'PostJson',
                /^\/([\w\W\d-]{2,32})\/(@[\w\.\d-]+)\/([\w\d-]+)(\.json)$/,
            ],
            ['UserJson', /^\/(@[\w\.\d-]+)(\.json)$/],
            ['UserRss', /^\/(@[\w\.\d-]+)(\.rss)$/],
            [
                'CategoryFiltersRss',
                /^\/(hot|trending|promoted|payout|payout_comments|muted|created)(\/([\w\W\d-]{2,32}))?(\.rss)$/,
            ],
            ['UserRepliesRss', /^\/(@[\w\.\d-]+)(replies\.rss)$/],
            ['UserCommentsRss', /^\/(@[\w\.\d-]+)(comment\.rss)$/],
        ];

        test_cases.forEach(r => {
            expect(String(routeRegex[r[0]])).toEqual(String(r[1]));
        });
    });
});

describe('resolveRoute', () => {
    const test_cases = [
        ['/', { page: 'PostsIndex', params: ['trending'] }],
        ['/trending', { page: 'PostsIndex', params: ['trending', undefined] }],
        ['/trending/cat', { page: 'PostsIndex', params: ['trending', 'cat'] }],
        ['/trending/Dog', { page: 'PostsIndex', params: ['trending', 'Dog'] }],
        ['/about.html', { page: 'About' }],
        ['/faq.html', { page: 'Faq' }],
        ['/login.html', { page: 'Login' }],
        ['/privacy.html', { page: 'Privacy' }],
        ['/support.html', { page: 'Support' }],
        ['/tos.html', { page: 'Tos' }],
        ['/submit.html', { page: 'SubmitPost' }],
        ['/@steem/feed', { page: 'PostsIndex', params: ['home', '@steem'] }],
        ['/@gdpr/feed', { page: 'NotFound' }],
        ['/@steem', { page: 'UserProfile', params: ['@steem', undefined] }],
        ['/@steem/blog', { page: 'UserProfile', params: ['@steem', 'blog'] }],
        ['/@gdpr/blog', { page: 'NotFound' }],
        ['/@foo/bar34', { page: 'PostNoCategory', params: ['@foo', 'bar34'] }],
        ['/@gdpr/nice345', { page: 'NotFound' }],
        ['/taggy/@gdpr/nice345', { page: 'NotFound' }],
        [
            '/ceasar/@salad/circa90',
            { page: 'Post', params: ['ceasar', '@salad', 'circa90'] },
        ],
        [
            '/roles/hive-105677',
            { page: 'CommunityRoles', params: ['hive-105677'] },
        ],
        ['/search', { page: 'SearchIndex' }],
        ['/rewards', { page: 'Rewards' }],
    ];
    test_cases.forEach(r => {
        it(`should resolve the route for the ${r[1].page} page`, () => {
            expect(resolveRoute(r[0])).toEqual(r[1]);
        });
    });

    it('should resolve xss test route in development environment', () => {
        expect(resolveRoute('/xss/test')).toEqual({ page: 'NotFound' });
        process.env.NODE_ENV = 'development';
        expect(resolveRoute('/xss/test')).toEqual({ page: 'XSSTest' });
        delete process.env.NODE_ENV;
    });
    it('should resolve benchmark route in development environment', () => {
        expect(resolveRoute('/benchmark')).toEqual({ page: 'NotFound' });
        process.env.OFFLINE_SSR_TEST = true;
        expect(resolveRoute('/benchmark')).toEqual({ page: 'Benchmark' });
        delete process.env.OFFLINE_SSR_TEST;
    });
    it('should resolve an unknown route to NotFound', () => {
        expect(resolveRoute('/randomness')).toEqual({ page: 'NotFound' });
    });
});
