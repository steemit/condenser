export const globalProps = {
    id: 0,
    head_block_number: 100,
    head_block_id: '00000002296e334a2e12b20ee94b346e072a5e74',
    time: '2016-10-18T11:01:54',
    current_witness: 'darth-vader',
    total_pow: 555447,
    num_pow_witnesses: 1,
    virtual_supply: '10.000 GOLOS',
    current_supply: '12.00 GOLOS',
    confidential_supply: '0.000 GOLOS',
    current_sbd_supply: '1.000 GBG',
    confidential_sbd_supply: '0.000 GBG',
    total_vesting_fund_steem: '1.00 GOLOS',
    total_vesting_shares: '3000000.096486 GESTS',
    total_reward_fund_steem: '10.00 GOLOS',
    total_reward_shares2: '1890190741377081958226752191697',
    sbd_interest_rate: 1000,
    sbd_print_rate: 8866,
    average_block_size: 1757,
    maximum_block_size: 65536,
    current_aslot: 11397527,
    recent_slots_filled: '340282366920938463463374607431768211455',
    participation_count: 128,
    last_irreversible_block_num: 99,
    max_virtual_bandwidth: '5986734968066277376',
    current_reserve_ratio: 20000,
    vote_regeneration_per_day: 40
}

export const trendingTagsRaw = [
    {
        name: 'golos',
        total_children_rshares2: '773813018641064086190106608362',
        total_payouts: '2767195.667 GBG',
        net_votes: 615443,
        top_posts: 6949,
        comments: 8750
    },
    {
        name: 'test',
        total_children_rshares2: '640278745691364262866676189637',
        total_payouts: '6763603.204 GBG',
        net_votes: 1593868,
        top_posts: 24752,
        comments: 75527
    },
    {
        name: 'star_wars',
        total_children_rshares2: '596895524056327420167652240364',
        total_payouts: '4696817.839 GBG',
        net_votes: 1656950,
        top_posts: 33416,
        comments: 52595
    },
    {
        name: 'space',
        total_children_rshares2: '491335867878567155655300571634',
        total_payouts: '2811871.883 GBG',
        net_votes: 507969,
        top_posts: 4259,
        comments: 14954
    },
    {
        name: 'way',
        total_children_rshares2: '401240632309206263871195428252',
        total_payouts: '2610.424 GBG',
        net_votes: 16264,
        top_posts: 361,
        comments: 1
    },
]

export const trendingTags = {
    trending: [
        trendingTagsRaw[0].name, // golos
        trendingTagsRaw[1].name, // test
        trendingTagsRaw[2].name, // star_wars
        trendingTagsRaw[3].name, // space
        trendingTagsRaw[4].name, // way
    ]
}

export const feedPrice = { base: '1.000 GBG', quote: '1.000 GOLOS' }

export const discussionsBy = [
    {
        id: 1,
        author: 'lyke',
        permlink: 'new-hope',
        category: 'rebel',
    },
    {
        id: 2,
        author: 'rey',
        permlink: 'the-force-awakens',
        category: 'rebel',
    },
    {
        id: 3,
        author: 'kylo-ren',
        permlink: 'one-way-or-another',
        category: 'first-order',
    }
]

export const discussionsByComments = [
    {
        id: 4,
        author: 'rey',
        permlink: 're-lyke-new-hope',
        category: 'rebel',
        parent_author: 'lyke',
        parent_permlink: 'new-hope'
    },
    {
        id: 5,
        author: 'rey',
        permlink: 're-rey-the-force-awakens',
        category: 'rebel',
        parent_author: 'rey',
        parent_permlink: 'the-force-awakens'
    },
    {
        id: 6,
        author: 'rey',
        permlink: 're-kylo-ren-one-way-or-another',
        category: 'first-order',
        parent_author: 'kylo-ren',
        parent_permlink: 'one-way-or-another'
    }
]

export const repliesByLastUpdate = [
    {
        id: 7,
        author: 'chewbacca',
        permlink: 're-rey-re-lyke-new-hope',
        category: 'rebel',
        parent_author: 'rey',
        parent_permlink: 're-lyke-new-hope'
    },
    {
        id: 8,
        author: 'yoda',
        permlink: 're-rey-re-rey-the-force-awakens',
        category: 'rebel',
        parent_author: 'rey',
        parent_permlink: 're-rey-the-force-awakens'
    },
    {
        id: 9,
        author: 'han-solo',
        permlink: 're-rey-re-kylo-ren-one-way-or-another',
        category: 'first-order',
        parent_author: 'rey',
        parent_permlink: 're-kylo-ren-one-way-or-another'
    }
]

export const contentReplies = [
    {
        id: 10,
        author: 'rey',
        permlink: 're-lyke-new-hope',
        category: 'rebel',
        parent_author: 'lyke',
        parent_permlink: 'new-hope'
    },
    {
        id: 11,
        author: 'chewbacca',
        permlink: 're-rey-re-lyke-new-hope',
        category: 'rebel',
        parent_author: 'rey',
        parent_permlink: 're-lyke-new-hope'
    }
]

export function get_discussion_idx(tag, type) {
    return {
        [tag]: {
            [type]: [
                'lyke/new-hope',
                'rey/the-force-awakens',
                'kylo-ren/one-way-or-another',
            ]
        }
    }
}

export const cnt = {
    'lyke/new-hope': discussionsBy[0],
    'rey/the-force-awakens': discussionsBy[1],
    'kylo-ren/one-way-or-another': discussionsBy[2]
}

export const wtns = [
    {
        id: 1665,
        owner: 'golosio',
        created: '2018-01-10T07:39:48',
        url: 'https://golos.io/@golosio',
        votes: '39271138454921394',
        virtual_last_update: '2607443603880326661783852653',
        virtual_position: '246053009916421244517088133334808071999',
        virtual_scheduled_time: '2607446003336026492878249215',
        total_missed: 0,
        last_aslot: 14124796,
        last_confirmed_block_num: 14067048,
        pow_worker: 0,
        signing_key: 'GLS5KxQ8s2oAGp7nzdgZXHsXkiHgr79xmhFgAn9yUb7mGkumXrGqa',
        props: {
          account_creation_fee: '3.000 GOLOS',
          maximum_block_size: 65536,
          sbd_interest_rate: 1000
        },
        sbd_exchange_rate: {
          base: '4.699 GBG',
          quote: '1.000 GOLOS'
        },
        last_sbd_exchange_update: '2018-02-20T21:56:33',
        last_work: '0000000000000000000000000000000000000000000000000000000000000000',
        running_version: '0.16.4',
        hardfork_version_vote: '0.0.0',
        hardfork_time_vote: '2016-10-18T11:00:00'
      }
]

export const _witnesses = {
    'golosio': wtns[0]
}

export const accountGuestBloggers = [
    [ 'lyke' , 1 ]
]

export const accountReputation = '801751331759'

export const accountBlogEntries = [
    {
        author: 'lyke',
        permlink: 'new-hope',
        blog: 'rey',
        reblog_on: '2017-06-14T14:32:42',
        entry_id: 1
    },
    {
        author: 'rey',
        permlink: 'the-force-awakens',
        blog: 'rey',
        reblog_on: '1970-01-01T00:00:00',
        entry_id: 0
    }
]

export const accountFeedEntries = [
    {
        author: 'kylo-ren',
        permlink: 'one-way-or-another',
        reblog_by: [],
        reblog_on: '1970-01-01T00:00:00',
        entry_id: 1
      },
      {
        author: 'lyke',
        permlink: 'new-hope',
        reblog_by: [ 'rey' ],
        reblog_on: '2017-08-18T15:55:12',
        entry_id: 0
      }
]

export const accountHistory = [
    [ 0,
        {
          trx_id: '8dgggff1b53bc73c26ggg5857d27ggg51712dd6',
          block: 99,
          trx_in_block: 3,
          op_in_trx: 0,
          virtual_op: 0,
          timestamp: '2017-04-12T00:00:00',
          op: [
            'account_create', {
              fee: '123.000 GOLOS',
              creator: 'universe',
              new_account_name: 'leia'
            }
          ]
        }
    ],
    [ 1, {
            trx_id: 'fdbb3bbbb36bbbb8e16430ed01ddbb46c508210d',
            block: 101,
            trx_in_block: 0,
            op_in_trx: 0,
            virtual_op: 0,
            timestamp: '2017-04-04T10:10:10',
            op: [
                'transfer', {
                    from: 'lyke',
                    to: 'rey',
                    amount: '1000.001 GOLOS',
                    memo: ''
                }
            ]
        }
    ],
    [ 2, {
            trx_id: 'fdcc3cccc36cccc8e16430ed01ddcc46c508210d',
            block: 102,
            trx_in_block: 0,
            op_in_trx: 0,
            virtual_op: 0,
            timestamp: '2017-04-04T11:11:11',
            op: [
                'transfer', {
                    from: 'lyke',
                    to: 'rey',
                    amount: '1000000.001 GOLOS',
                    memo: 'test'
                }
            ]
        }
    ],
    [ 3, {
                trx_id: 'fddd3dddd36dddd8e16430ed01dddd46c508210d',
                block: 103,
                trx_in_block: 0,
                op_in_trx: 0,
                virtual_op: 0,
                timestamp: '2017-04-04T11:11:11',
                op: [
                    'transfer', {
                        from: 'chewbacca',
                        to: 'rey',
                        amount: '1100.001 GOLOS',
                        memo: 'lightsaber'
                    }
                ]
            }
    ],
]
