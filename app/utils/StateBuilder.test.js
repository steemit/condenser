import { assert, expect } from 'chai'

import * as api from 'app/utils/APIMocks'

import {
    globalProps,
    trendingTags,
    trendingTagsRaw,
    get_discussion_idx,
    cnt,
    feedPrice,
    _witnesses,
    accountHistory
} from 'app/utils/test_fixtures/chain_data'

import getState from 'app/utils/StateBuilder'

const feed_price = { base: "2.724 GBG", quote: "1.000 GOLOS" }

const options = {
    IGNORE_TAGS: []
}

describe('StateBuilder', function() {

    it('url => ', async function() {
        const state = {
            current_route: '/trending',
            props: globalProps,
            tag_idx: trendingTags,
            categories: {},
            tags: {},
            content: cnt,
            accounts: {},
            witnesses: {},
            discussion_idx: get_discussion_idx('', 'trending'),
            feed_price: feedPrice,
            select_tags: [],
            filter_tags: []
        }

        const result = await getState(api, '', options)
        assert.deepEqual(result, state)
    })

    it('url => / ', async function() {
        const state = {
            current_route: '/trending',
            props: globalProps,
            tag_idx: trendingTags,
            categories: {},
            tags: {},
            content: cnt,
            accounts: {},
            witnesses: {},
            discussion_idx: get_discussion_idx('', 'trending'),
            feed_price: feedPrice,
            select_tags: [],
            filter_tags: []
        }

        const result = await getState(api, '/', options)
        assert.deepEqual(result, state)
    })

    it('url => /created ', async function() {
        const state = {
            current_route: '/created',
            props: globalProps,
            tag_idx: trendingTags,
            categories: {},
            tags: {},
            content: cnt,
            accounts: {},
            witnesses: {},
            discussion_idx: get_discussion_idx('', 'created'),
            feed_price: feedPrice,
            select_tags: [],
            filter_tags: []
        }

        const result = await getState(api, '/created', options)
        assert.deepEqual(result, state)
    })

    it('url => /hot ', async function() {
        const state = {
            current_route: '/hot',
            props: globalProps,
            tag_idx: trendingTags,
            categories: {},
            tags: {},
            content: cnt,
            accounts: {},
            witnesses: {},
            discussion_idx: get_discussion_idx('', 'hot'),
            feed_price: feedPrice,
            select_tags: [],
            filter_tags: []
        }

        const result = await getState(api, '/hot', options)
        assert.deepEqual(result, state)
    })

    it('url => /trending ', async function() {
        const state = {
            current_route: '/trending',
            props: globalProps,
            tag_idx: trendingTags,
            categories: {},
            tags: {},
            content: cnt,
            accounts: {},
            witnesses: {},
            discussion_idx: get_discussion_idx('', 'trending'),
            feed_price: feedPrice,
            select_tags: [],
            filter_tags: []
        }

        const result = await getState(api, '/trending', options)
        assert.deepEqual(result, state)
    })

    it('url => /trending/space ', async function() {
        const state = {
            current_route: '/trending/space',
            props: globalProps,
            tag_idx: trendingTags,
            categories: {},
            tags: {},
            content: cnt,
            accounts: {},
            witnesses: {},
            discussion_idx: get_discussion_idx('space', 'trending'),
            feed_price: feedPrice,
            select_tags: []
        }

        const result = await getState(api, '/trending/space', options)
        assert.deepEqual(result, state)
    })

    it('url => /promoted ', async function() {
        const state = {
            current_route: '/promoted',
            props: globalProps,
            tag_idx: trendingTags,
            categories: {},
            tags: {},
            content: cnt,
            accounts: {},
            witnesses: {},
            discussion_idx: get_discussion_idx('', 'promoted'),
            feed_price: feedPrice,
            select_tags: [],
            filter_tags: []
        }

        const result = await getState(api, '/promoted', options)
        assert.deepEqual(result, state)
    })

    it('url => witnesses ', async function() {
        const state = {
            current_route: '/witnesses',
            props: globalProps,
            tag_idx: trendingTags,
            categories: {},
            tags: {},
            content: {},
            accounts: {},
            witnesses: _witnesses,
            discussion_idx: {},
            feed_price: feedPrice,
            select_tags: []
           
        }

        const result = await getState(api, 'witnesses', options)
        assert.deepEqual(result, state)
    })

    it('url => ~witnesses ', async function() {
        const state = {
            current_route: '/~witnesses',
            props: globalProps,
            tag_idx: trendingTags,
            categories: {},
            tags: {},
            content: {},
            accounts: {},
            witnesses: _witnesses,
            discussion_idx: {},
            feed_price: feedPrice,
            select_tags: []
           
        }

        const result = await getState(api, '~witnesses', options)
        assert.deepEqual(result, state)
    })

    it('url => tags ', async function() {
        const state = {
            current_route: '/tags',
            props: globalProps,
            tag_idx: trendingTags,
            categories: {},
            tags: {
                'golos': trendingTagsRaw[0],
                'test': trendingTagsRaw[1],
                'star_wars': trendingTagsRaw[2],
                'space': trendingTagsRaw[3],
                'way': trendingTagsRaw[4],
            },
            content: {},
            accounts: {},
            witnesses: {},
            discussion_idx: {},
            feed_price: feedPrice,
            select_tags: []
           
        }

        const result = await getState(api, 'tags', options)
        assert.deepEqual(result, state)
    })

    
    it('url => /@rey ', async function() {
        const state = {
            current_route: '/@rey',
            props: globalProps,
            tag_idx: trendingTags,
            categories: {},
            tags: {},
            content: {
                'lyke/new-hope': {
                    id: 1,
                    author: 'lyke',
                    permlink: 'new-hope',
                    category: 'rebel',
                    first_reblogged_on: '2017-06-14T14:32:42',
                    replies: []
                },
                'rey/the-force-awakens': {
                    id: 2,
                    author: 'rey',
                    permlink: 'the-force-awakens',
                    category: 'rebel',
                    replies: []
                }
            },
            accounts: {
                'rey': {
                    name: 'rey',
                    reputation: '801751331759',
                    tags_usage: [],
                    guest_bloggers: [ 'lyke' , 1 ],
                    blog: [ 
                        'lyke/new-hope',
                        'rey/the-force-awakens'
                    ]
                }
            },
            witnesses: {},
            discussion_idx: {},
            feed_price: feedPrice,
            select_tags: []
           
        }

        const result = await getState(api, '/@rey', options)
        assert.deepEqual(result, state)
    })

    it('url => /@rey/blog ', async function() {
        const state = {
            current_route: '/@rey/blog',
            props: globalProps,
            tag_idx: trendingTags,
            categories: {},
            tags: {},
            content: {
                'lyke/new-hope': {
                    id: 1,
                    author: 'lyke',
                    permlink: 'new-hope',
                    category: 'rebel',
                    first_reblogged_on: '2017-06-14T14:32:42',
                    replies: []
                },
                'rey/the-force-awakens': {
                    id: 2,
                    author: 'rey',
                    permlink: 'the-force-awakens',
                    category: 'rebel',
                    replies: []
                }
            },
            accounts: {
                'rey': {
                    name: 'rey',
                    reputation: '801751331759',
                    tags_usage: [],
                    guest_bloggers: [ 'lyke' , 1 ],
                    blog: [ 
                        'lyke/new-hope',
                        'rey/the-force-awakens'
                    ]
                }
            },
            witnesses: {},
            discussion_idx: {},
            feed_price: feedPrice,
            select_tags: []
           
        }

        const result = await getState(api, '/@rey/blog', options)
        assert.deepEqual(result, state)
    })

    it('url => /@rey/feed ', async function() {
        const state = {
            current_route: '/@rey/feed',
            props: globalProps,
            tag_idx: trendingTags,
            categories: {},
            tags: {},
            content: {
                'kylo-ren/one-way-or-another': {
                    id: 3,
                    author: 'kylo-ren',
                    permlink: 'one-way-or-another',
                    category: 'first-order',
                    replies: []
                },
                'lyke/new-hope': {
                    id: 1,
                    author: 'lyke',
                    permlink: 'new-hope',
                    category: 'rebel',
                    first_reblogged_by: 'rey',
                    first_reblogged_on: '2017-08-18T15:55:12',
                    reblogged_by: [ 'rey' ],
                    replies: []
                }
            },
            accounts: {
                'rey': {
                    name: 'rey',
                    reputation: '801751331759',
                    tags_usage: [],
                    guest_bloggers: [ 'lyke' , 1 ],
                    feed: [
                        'kylo-ren/one-way-or-another',
                        'lyke/new-hope'
                    ]
                }
            },
            witnesses: {},
            discussion_idx: {},
            feed_price: feedPrice,
            select_tags: []
           
        }

        const result = await getState(api, '/@rey/feed', options)
        assert.deepEqual(result, state)
    })

    it('url => /@rey/comments ', async function() {
        const state = {
            current_route: '/@rey/comments',
            props: globalProps,
            tag_idx: trendingTags,
            categories: {},
            tags: {},
            content: {
                'rey/re-lyke-new-hope': {
                    id: 4,
                    author: 'rey',
                    permlink: 're-lyke-new-hope',
                    category: 'rebel',
                    parent_author: 'lyke',
                    parent_permlink: 'new-hope'
                },
                'rey/re-rey-the-force-awakens': {
                    id: 5,
                    author: 'rey',
                    permlink: 're-rey-the-force-awakens',
                    category: 'rebel',
                    parent_author: 'rey',
                    parent_permlink: 'the-force-awakens'
                },
                'rey/re-kylo-ren-one-way-or-another': {
                    id: 6,
                    author: 'rey',
                    permlink: 're-kylo-ren-one-way-or-another',
                    category: 'first-order',
                    parent_author: 'kylo-ren',
                    parent_permlink: 'one-way-or-another'
                }
            },
            accounts: {
                'rey': {
                    name: 'rey',
                    reputation: '801751331759',
                    tags_usage: [],
                    guest_bloggers: [ 'lyke' , 1 ],
                    comments: [
                        'rey/re-lyke-new-hope',
                        'rey/re-rey-the-force-awakens',
                        'rey/re-kylo-ren-one-way-or-another',
                    ]
                }
            },
            witnesses: {},
            discussion_idx: {},
            feed_price: feedPrice,
            select_tags: []
           
        }

        const result = await getState(api, '/@rey/comments', options)
        assert.deepEqual(result, state)
    })

    it('url => /@rey/recent-replies ', async function() {
        const state = {
            current_route: '/@rey/recent-replies',
            props: globalProps,
            tag_idx: trendingTags,
            categories: {},
            tags: {},
            content: {
                'chewbacca/re-rey-re-lyke-new-hope':    {
                    id: 7,
                    author: 'chewbacca',
                    permlink: 're-rey-re-lyke-new-hope',
                    category: 'rebel',
                    parent_author: 'rey',
                    parent_permlink: 're-lyke-new-hope'
                },
                'yoda/re-rey-re-rey-the-force-awakens': {
                    id: 8,
                    author: 'yoda',
                    permlink: 're-rey-re-rey-the-force-awakens',
                    category: 'rebel',
                    parent_author: 'rey',
                    parent_permlink: 're-rey-the-force-awakens'
                },
                'han-solo/re-rey-re-kylo-ren-one-way-or-another': {
                    id: 9,
                    author: 'han-solo',
                    permlink: 're-rey-re-kylo-ren-one-way-or-another',
                    category: 'first-order',
                    parent_author: 'rey',
                    parent_permlink: 're-kylo-ren-one-way-or-another'
                }
            },
            accounts: {
                'rey': {
                    name: 'rey',
                    reputation: '801751331759',
                    tags_usage: [],
                    guest_bloggers: [ 'lyke' , 1 ],
                    recent_replies: [
                        'chewbacca/re-rey-re-lyke-new-hope',
                        'yoda/re-rey-re-rey-the-force-awakens',
                        'han-solo/re-rey-re-kylo-ren-one-way-or-another'
                    ]
                }
            },
            witnesses: {},
            discussion_idx: {},
            feed_price: feedPrice,
            select_tags: []
           
        }

        const result = await getState(api, '/@rey/recent-replies', options)
        assert.deepEqual(result, state)
    })

    it('url => /@rey/transfers ', async function() {
        const state = {
            current_route: '/@rey/transfers',
            props: globalProps,
            tag_idx: trendingTags,
            categories: {},
            tags: {},
            content: {},
            accounts: {
                'rey': {
                    name: 'rey',
                    reputation: '801751331759',
                    tags_usage: [],
                    guest_bloggers: [ 'lyke' , 1 ],
                    transfer_history: [
                        accountHistory[1],
                        accountHistory[2],
                        accountHistory[3]
                    ],
                    other_history: [
                        accountHistory[0]
                    ]
                }
            },
            witnesses: {},
            discussion_idx: {},
            feed_price: feedPrice,
            select_tags: []
           
        }

        const result = await getState(api, '/@rey/transfers', options)
        assert.deepEqual(result, state)
    })

    it('url => /rebel/@lyke/new-hope ', async function() {
        const state = {
            current_route: '/rebel/@lyke/new-hope',
            props: globalProps,
            tag_idx: trendingTags,
            categories: {},
            tags: {},
            content: {
                'lyke/new-hope': {
                    id: 1,
                    author: 'lyke',
                    permlink: 'new-hope',
                    category: 'rebel',
                    replies: [
                        'rey/re-lyke-new-hope'
                    ]
                },
                'rey/re-lyke-new-hope': {
                    id: 10,
                    author: 'rey',
                    permlink: 're-lyke-new-hope',
                    category: 'rebel',
                    parent_author: 'lyke',
                    parent_permlink: 'new-hope'
                },
                'chewbacca/re-rey-re-lyke-new-hope': {
                    id: 11,
                    author: 'chewbacca',
                    permlink: 're-rey-re-lyke-new-hope',
                    category: 'rebel',
                    parent_author: 'rey',
                    parent_permlink: 're-lyke-new-hope'
                }
            },
            accounts: {
                'rey': {
                    name: 'rey',
                    reputation: '801751331759'
                }
            },
            witnesses: {},
            discussion_idx: {},
            feed_price: feedPrice,
            select_tags: []
           
        }

        const result = await getState(api, '/rebel/@lyke/new-hope', options)
        assert.deepEqual(result, state)
    })
})
