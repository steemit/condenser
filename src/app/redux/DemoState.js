module.exports = {
    user: {
        current: {
            name: 'alice',
            pending: {
                trxid: {
                    trx: {},
                    broadcast: new Date(),
                    server_response: null,
                    error: null,
                    confirmed: {
                        blocknum: 1234,
                    },
                },
            },
            wallet: {
                locked: false,
                server_salt: 'salt',
                unencrypted_keys: {
                    $pubkey: 'privkey',
                    $pubkey1: 'privkey1',
                    $pubkey2: 'privkey2',
                    $pubkey3: 'privkey3',
                },
                encrypted_keys: {
                    $pubkey: 'encryptedprivkey',
                },
            },
        },
        users: {
            alice: {
                open_orders: [],
                convert_requests: [],
                history: {
                    trade: [],
                    transfer: [],
                    vote: [],
                    post: [],
                    reward: [],
                },
                posts: {
                    recent: ['slug', 'slug1'],
                    expiring: ['slug', 'slug'],
                    best: ['slug', 'slug'],
                },
                proxy: null,
            },
        },
    },
    discussions: {
        update_status: {
            /// used to track async state of fetching
            trending: {
                last_update: new Date(),
                fetching: false,
                timeout: new Date(),
                fetch_cursor: null, /// fetching from start, else author/slug
            },
            recent: {},
            expiring: {},
            best: {},
            active: {},
            category: {
                general: {
                    /// the category name
                    trending: {
                        /// ~trending within category
                        last_update: new Date(),
                        fetching: false,
                        timeout: new Date(),
                        fetch_cursor: null, /// fetching from start, else author/slug
                    },
                    recent: {},
                    expiring: {},
                    best: {},
                },
            },
        },
        trending: ['author/slug', 'author3/slug'],
        recent: ['author3/slug', 'author/slug'],
        expiring: ['author3/slug', 'author/slug'],
        best: ['author2/slug', 'author/slug'],
        active: ['author1/slug', 'author/slug'],
        category: {
            '~trending': ['cat1', 'cat2'], /// used to track trending categories
            '~best': ['bestcat1', 'bestcat2'], /// used to track all time best categories
            '~active': [],
            general: {
                trending: ['author/slug', 'author3/slug'],
                recent: ['author2/slug', 'author3/slug'],
                expiring: ['author1/slug', 'author/slug'],
                best: ['author2/slug', 'author3/slug'],
                active: ['author2/slug', 'author3/slug'],
            },
        },
        'author/slug': {
            fetched: new Date(), /// the date at which this data was requested from the server
            id: '2.9.0',
            author: 'author',
            permlink: 'slug',
            parent_author: '',
            parent_permlink: 'general',
            title: 'title',
            body: `Lorem ipsum dolor sit amet, molestiae adversarium nec cu, mei in stet illud. Eam homero option cu, no periculis erroribus concludaturque vis.
            No sit dissentias persequeris. Sea voluptua indoctum instructior cu, usu an fierent concludaturque. Ad ferri voluptua perpetua pri, an mel
            liberavisse consectetuer, epicuri postulant mea ne. Sanctus epicurei vituperatoribus pro cu.`,
            json_metadata: '',
            last_update: '2016-02-29T21:08:48',
            created: '2016-02-29T21:08:48',
            depth: 0,
            children: 4,
            children_rshares2: '0',
            net_rshares: 0,
            abs_rshares: 0,
            cashout_time: '2016-02-29T22:08:48',
            total_payout_value: '0.000 USD',
            pending_payout_value: '0.000 CLOUT',
            total_pending_payout_value: '0.000 CLOUT',
            replies: [], /// there is data to be fetched if 'children' is not 0
            fetched_replies: new Date(),
            fetching_replies: false,
        },
    },
};
