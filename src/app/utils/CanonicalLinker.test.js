import { makeCanonicalLink } from './CanonicalLinker';

describe('makeCanonicalLink', () => {
    const post_data = {
        author: 'test',
        permlink: 'test-post',
        category: 'testing',
        link: '/testing/@test/test-post',
    };
    const test_cases = [
        [
            'handles posts without app',
            { ...post_data, json_metadata: {} },
            'https://steemit.com/testing/@test/test-post',
        ],
        [
            'handles empty strings as app',
            { ...post_data, json_metadata: { app: '' } },
            'https://steemit.com/testing/@test/test-post',
        ],
        [
            "handles apps that don't exist",
            { ...post_data, json_metadata: { app: 'fakeapp/1.2.3' } },
            'https://steemit.com/testing/@test/test-post',
        ],
        [
            "handles app that don't exist without version",
            { ...post_data, json_metadata: { app: 'fakeapp' } },
            'https://steemit.com/testing/@test/test-post',
        ],
        [
            'handles apps that do exist',
            { ...post_data, json_metadata: { app: 'busy/1.1.1' } },
            'https://busy.org/@test/test-post',
        ],
        [
            'handles posts from steemit',
            { ...post_data, json_metadata: { app: 'steemit/0.1' } },
            'https://steemit.com/testing/@test/test-post',
        ],
        [
            'handles badly formatted app strings',
            { ...post_data, json_metadata: { app: 'fakeapp/0.0.1/a////' } },
            'https://steemit.com/testing/@test/test-post',
        ],
        [
            'handles objects as apps',
            { ...post_data, json_metadata: { app: { this_is: 'an objct' } } },
            'https://steemit.com/testing/@test/test-post',
        ],
    ];
    test_cases.forEach(v => {
        it(v[0], () => {
            expect(makeCanonicalLink(v[1])).toBe(v[2]);
        });
    });
});
