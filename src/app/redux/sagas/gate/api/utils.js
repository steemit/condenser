export const makeFakeAuthTransaction = (userName, secret) => ({
    ref_block_num: 3367,
    ref_block_prefix: 879276768,
    expiration: '2018-07-06T14:52:24',
    operations: [
        [
            'vote',
            {
                voter: userName,
                author: 'test',
                permlink: secret,
                weight: 1,
            },
        ],
    ],
    extensions: [],
});