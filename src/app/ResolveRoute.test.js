import resolveRoute, { routeRegex } from './ResolveRoute';

describe('routeRegex', () => {
    it('should produce the desired regex patterns', () => {
        const test_cases = [
            ['PostsIndex', /^\/(@[\w\.\d-]+)\/feed\/?$/],
            ['UserProfile1', /^\/(@[\w\.\d-]+)\/?$/],
            [
                'UserProfile2',
                /^\/(@[\w\.\d-]+)\/(blog|posts|comments|recommended|transfers|curation-rewards|author-rewards|permissions|created|recent-replies|feed|password|followed|followers|settings)\/?$/,
            ],
            ['UserProfile3', /^\/(@[\w\.\d-]+)\/[\w\.\d-]+/],
            [
                'CategoryFilters',
                /^\/(hot|votes|responses|trending|trending30|promoted|cashout|payout|payout_comments|created|active)\/?$/gi,
            ],
            ['PostNoCategory', /^\/(@[\w\.\d-]+)\/([\w\d-]+)/],
            ['Post', /^\/([\w\d\-\/]+)\/(\@[\w\d\.-]+)\/([\w\d-]+)\/?($|\?)/],
            [
                'PostJson',
                /^\/([\w\d\-\/]+)\/(\@[\w\d\.-]+)\/([\w\d-]+)(\.json)$/,
            ],
            ['UserJson', /^\/(@[\w\.\d-]+)(\.json)$/],
            ['UserNameJson', /^.*(?=(\.json))/],
        ];

        test_cases.forEach(r => {
            expect(routeRegex[r[0]]).toEqual(r[1]);
        });
    });
});

describe('resolveRoute', () => {
    const test_cases = [
        ['/', { page: 'PostsIndex', params: ['trending'] }],
        ['/about.html', { page: 'About' }],
        ['/faq.html', { page: 'Faq' }],
        ['/login.html', { page: 'Login' }],
        ['/privacy.html', { page: 'Privacy' }],
        ['/support.html', { page: 'Support' }],
        ['/tos.html', { page: 'Tos' }],
        ['/change_password', { page: 'ChangePassword' }],
        ['/create_account', { page: 'CreateAccount' }],
        ['/approval', { page: 'Approval' }],
        ['/pick_account', { page: 'NotFound' }],
        ['/recover_account_step_1', { page: 'RecoverAccountStep1' }],
        ['/recover_account_step_2', { page: 'RecoverAccountStep2' }],
        ['/waiting_list.html', { page: 'WaitingList' }],
        ['/market', { page: 'Market' }],
        ['/~witnesses', { page: 'Witnesses' }],
        ['/submit.html', { page: 'SubmitPost' }],
        [
            '/@maitland/feed',
            { page: 'PostsIndex', params: ['home', '@maitland'] },
        ],
        [
            '/@maitland/blog',
            { page: 'UserProfile', params: ['@maitland', 'blog'] },
        ],
        [
            '/@cool/nice345',
            { page: 'PostNoCategory', params: ['@cool', 'nice345'] },
        ],
        [
            '/ceasar/@salad/circa90',
            { page: 'Post', params: ['ceasar', '@salad', 'circa90', ''] },
        ],
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
