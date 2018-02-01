import { resolveRoute, routeRegex } from './Routes';

describe('routeRegex', () => {
    it('should produce the desired regex patterns', () => {
        const test_cases = [
            ['PostsIndexUserFeed', /^\/([\w.\d-]{3,})\/feed\/?$/],
            ['UserProfile1', /^\/([\w.\d-]{3,})\/?$/],
            [
                'UserProfile2',
                /^\/([\w.\d-]{3,})\/(blog|posts|comments|recommended|wallet|curation-rewards|author-rewards|permissions|created|recent-replies|feed|password|followed|followers|settings)\/?$/,
            ],
            ['Post', /^\/([\w\d.-]{3,})\/([\w\d-]+)\/?($|\?)/],
            ['PostJson', /^\/([\w\d.-]{3,})\/([\w\d-]+)(\.json)$/],
            ['UserJson', /^\/([\w.\d-]{3,})(\.json)$/],
            ['UserNameJson', /^.*(?=(\.json))/],
        ];

        test_cases.forEach(r => {
            expect(routeRegex[r[0]]).toEqual(r[1]);
        });
    });
});

describe('resolveRoute', () => {
    const test_cases = [
        ['/', { page: 'PostsIndex', params: ['all', 'trending'] }],
        ['/s/about', { page: 'About' }],
        ['/s/welcome', { page: 'Welcome' }],
        ['/s/faq', { page: 'Faq' }],
        ['/c/login', { page: 'Login' }],
        ['/s/privacy', { page: 'Privacy' }],
        ['/s/support', { page: 'Support' }],
        ['/s/tos', { page: 'Tos' }],
        ['/c/change-password', { page: 'ChangePassword' }],
        ['/c/create-account', { page: 'CreateAccount' }],
        ['/c/approval', { page: 'Approval' }],
        ['/c/pick-account', { page: 'PickAccount' }],
        ['/c/recover-account-step-1', { page: 'RecoverAccountStep1' }],
        ['/c/recover-account-step-2', { page: 'RecoverAccountStep2' }],
        ['/c/market', { page: 'Market' }],
        ['/c/witnesses', { page: 'Witnesses' }],
        ['/c/submit', { page: 'SubmitPost' }],
        [
            '/maitland/feed',
            { page: 'PostsIndex', params: ['home', 'maitland'] },
        ],
        [
            '/maitland/blog',
            { page: 'UserProfile', params: ['maitland', 'blog'] },
        ],
        ['/salad/circa90', { page: 'Post', params: ['salad', 'circa90', ''] }],
    ];
    test_cases.forEach(r => {
        it(`should resolve the route for the ${r[1].page} page`, () => {
            expect(resolveRoute(r[0])).toEqual(r[1]);
        });
    });

    it('should resolve xss test route in development environment', () => {
        expect(resolveRoute('/c/xss/test')).toEqual({ page: 'NotFound' });
        process.env.NODE_ENV = 'development';
        expect(resolveRoute('/c/xss/test')).toEqual({ page: 'XSSTest' });
        delete process.env.NODE_ENV;
    });
    it('should resolve benchmark route in development environment', () => {
        expect(resolveRoute('/c/benchmark')).toEqual({ page: 'NotFound' });
        process.env.OFFLINE_SSR_TEST = true;
        expect(resolveRoute('/c/benchmark')).toEqual({ page: 'Benchmark' });
        delete process.env.OFFLINE_SSR_TEST;
    });
    it('should resolve an unknown route to NotFound', () => {
        expect(resolveRoute('/randomness/123/34')).toEqual({
            page: 'NotFound',
        });
    });
});
