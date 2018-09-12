import { Map, Set, List, fromJS, Iterable } from 'immutable';
import createModule from 'redux-modules';
import constants from './constants';
import { contentStats, fromJSGreedy } from 'app/utils/StateFunctions';
import { LIQUID_TICKER, DEBT_TICKER } from 'app/client_config'

const emptyContentMap = Map({
    fetched: new Date(), /// the date at which this data was requested from the server
    id: '2.8.0',
    author: '',
    permlink: '',
    category: '',
    i18n_category: '',
    parent_author: '',
    parent_permlink: '',
    title: '',
    body: '',
    json_metadata: '{}',
    last_update: new Date().toISOString(),
    created: new Date().toISOString(),
    depth: 0,
    children: 0,
    children_rshares2: '0',
    net_rshares: 0,
    abs_rshares: 0,
    cashout_time: new Date().toISOString(),
    total_vote_weight: '0',
    total_payout_value: ['0.000', DEBT_TICKER].join(" "),
    pending_payout_value: ['0.000', LIQUID_TICKER].join(" "),
    total_pending_payout_value: ['0.000', LIQUID_TICKER].join(" "),
    active_votes: [],
    replies: [],
    stats: {
        authorRepLog10: 86,
        gray: false,
        hasPendingPayout: false,
        hasReplies: false,
        hide: false,
        netVoteSign: 0,
        pictures: true,
    },
});

export default createModule({
    name: 'global',
    initialState: Map({ status: {} }),
    transformations: [
        {
            action: 'SET_COLLAPSED',
            reducer: (state, action) =>
                state.updateIn(['content', action.payload.post], value =>
                    value.merge(Map({ collapsed: action.payload.collapsed }))
                ),
        },
        {
            action: 'FETCHING_STATE',
            reducer: (state, { payload: fetching }) =>
                state.mergeDeep({ fetching }),
        },
        {
            action: 'FETCHING_JSON',
            reducer: (state, { payload: fetchingJson }) =>
                state.mergeDeep({ fetchingJson }),
        },
        {
            action: 'FETCHING_XCHANGE',
            reducer: (state, { payload: fetchingXchange }) =>
                state.mergeDeep({ fetchingXchange }),
        },
        {
            action: 'RECEIVE_STATE',
            reducer: (state, action) => {
                let payload = fromJS(action.payload);
                if (payload.has('content')) {
                    const content = payload.get('content').withMutations(c => {
                        c.forEach((cc, key) => {
                            cc = emptyContentMap.mergeDeep(cc);
                            const stats = fromJS(contentStats(cc));
                            c.setIn([key, 'stats'], stats);
                        });
                    });
                    payload = payload.set('content', content);

                    // TODO reserved words used in account names, find correct solution
                    if (!Map.isMap(payload.get('accounts'))) {
                        const accounts = payload.get('accounts');
                        payload = payload.set(
                            'accounts',
                            fromJSGreedy(accounts)
                        );
                    }
                }
                return state.mergeDeep(payload);
            },
        },
        {
            action: 'RECEIVE_ACCOUNT',
            reducer: (state, { payload: { account } }) => {
                extractPinnedPosts(account);

                account = fromJS(account, (key, value) => {
                    if (key === 'witness_votes') {
                        return value.toSet();
                    } else {
                        return Iterable.isIndexed(value)
                            ? value.toList()
                            : value.toOrderedMap();
                    }
                });

                // Merging accounts: A get_state will provide a very full account but a get_accounts will provide a smaller version
                return state.updateIn(
                    ['accounts', account.get('name')],
                    Map(),
                    a => a.mergeDeep(account)
                );
            },
        },
        {
            action: 'RECEIVE_ACCOUNTS',
            reducer: (state, { payload: { accounts } }) => {
                return state.withMutations(state => {
                    accounts.forEach(account => {
                        account = fromJS(account, (key, value) => {
                            if (key === 'witness_votes') {
                                return value.toSet();
                            } else {
                                return Iterable.isIndexed(value)
                                    ? value.toList()
                                    : value.toOrderedMap();
                            }
                        });
                        // Merging accounts: A get_state will provide a very full account but a get_accounts will provide a smaller version
                        state.updateIn(
                            ['accounts', account.get('name')],
                            Map(),
                            a => a.mergeDeep(account)
                        );
                    });
                })
            },
        },
        {
            action: 'RECEIVE_COMMENT',
            reducer: (state, { payload: op }) => {
                const {
                    author,
                    permlink,
                    parent_author = '',
                    parent_permlink = '',
                    title = '',
                    body,
                } = op;
                const key = author + '/' + permlink;

                let updatedState = state.updateIn(
                    ['content', key],
                    Map(emptyContent),
                    r =>
                        r.merge({
                            author,
                            permlink,
                            parent_author,
                            parent_permlink,
                            title: title.toString('utf-8'),
                            body: body.toString('utf-8'),
                        })
                );

                if (parent_author !== '' && parent_permlink !== '') {
                    const parent_key = parent_author + '/' + parent_permlink;

                    updatedState = updatedState.updateIn(
                        ['content', parent_key, 'replies'],
                        List(),
                        r => r.insert(0, key)
                    );

                    const children = updatedState.getIn(
                        ['content', parent_key, 'replies'],
                        List()
                    ).size;

                    updatedState = updatedState.updateIn(
                        ['content', parent_key, 'children'],
                        () => children
                    );
                }
                return updatedState;
            },
        },
        {
            action: 'RECEIVE_CONTENT',
            reducer: (state, { payload: { content } }) => {
                content = fromJS(content);
                const key =
                    content.get('author') + '/' + content.get('permlink');

                return state.updateIn(['content', key], Map(), c => {
                    c = emptyContentMap.mergeDeep(c);
                    c = c.delete('votesSummary');
                    c = c.delete('active_votes');
                    c = c.mergeDeep(content);
                    c = c.set('stats', fromJS(contentStats(c)));
                    return c;
                });
            },
        },
        {
            action: 'RECEIVE_CONTENTS',
            reducer: (state, { payload: { contents } }) => {
                contents = fromJS(contents);
                return state.withMutations(state => {
                    contents.forEach(content => {
                        const key =
                            content.get('author') + '/' + content.get('permlink');

                        state.updateIn(['content', key], Map(), c => {
                            c = emptyContentMap.mergeDeep(c);
                            c = c.delete('votesSummary');
                            c = c.delete('active_votes');
                            c = c.mergeDeep(content);
                            c = c.set('stats', fromJS(contentStats(c)));
                            return c;
                        });
                    });
                });
            },
        },
        {
            action: 'LINK_REPLY',
            reducer: (state, { payload: op }) => {
                const {
                    author,
                    permlink,
                    parent_author = '',
                    parent_permlink = '',
                } = op;

                if (parent_author === '' || parent_permlink === '') {
                    return state;
                }

                const key = author + '/' + permlink;
                const parent_key = parent_author + '/' + parent_permlink;
                // Add key if not exist
                let updatedState = state.updateIn(
                    ['content', parent_key, 'replies'],
                    List(),
                    l => (l.findIndex(i => i === key) === -1 ? l.push(key) : l)
                );

                const children = updatedState.getIn(
                    ['content', parent_key, 'replies'],
                    List()
                ).size;

                updatedState = updatedState.updateIn(
                    ['content', parent_key, 'children'],
                    () => children
                );

                return updatedState;
            },
        },
        {
            action: 'UPDATE_ACCOUNT_WITNESS_VOTE',
            reducer: (state, { payload: { account, witness, approve } }) =>
                state.updateIn(
                    ['accounts', account, 'witness_votes'],
                    Set(),
                    votes =>
                        approve
                            ? Set(votes).add(witness)
                            : Set(votes).remove(witness)
                ),
        },
        {
            action: 'UPDATE_ACCOUNT_WITNESS_PROXY',
            reducer: (state, { payload: { account, proxy } }) =>
                state.setIn(['accounts', account, 'proxy'], proxy),
        },
        {
            action: 'DELETE_CONTENT',
            reducer: (state, { payload: { author, permlink } }) => {
                const key = author + '/' + permlink;
                const content = state.getIn(['content', key]);
                const parentAuthor = content.get('parent_author') || '';
                const parentPermlink = content.get('parent_permlink') || '';
                let updatedState = state.deleteIn(['content', key]);

                if (parentAuthor !== '' && parentPermlink !== '') {
                    const parent_key = parentAuthor + '/' + parentPermlink;

                    updatedState = updatedState.updateIn(
                        ['content', parent_key, 'replies'],
                        List(),
                        r => r.filter(i => i !== key)
                    );
                }

                return updatedState;
            },
        },
        {
            action: 'VOTED',
            reducer: (
                state,
                { payload: { username, author, permlink, weight } }
            ) =>
                state.updateIn(
                    ['content', author + '/' + permlink, 'active_votes'],
                    List(),
                    activeVotes =>
                        activeVotes.withMutations(activeVotes => {
                            const vote = Map({
                                voter: username,
                                percent: weight,
                            });
                            const idx = activeVotes.findIndex(
                                v => v.get('voter') === username
                            );

                            if (idx === -1) {
                                activeVotes.push(vote);
                            } else {
                                activeVotes.set(idx, vote);
                            }
                        })
                ),
        },
        {
            action: 'FETCHING_DATA',
            reducer: (state, { payload: { order, category } }) =>
                state.updateIn(['status', category || '', order], () => ({
                    fetching: true,
                })),
        },
        {
            action: 'RECEIVE_DATA',
            reducer: (state, { payload }) => {
                const {
                    data,
                    order,
                    category,
                    permlink: startPermLink,
                    accountname,
                } = payload;
                let newState = state;

                let dataPath;

                if (
                    order === 'by_author' ||
                    order === 'by_feed' ||
                    order === 'by_comments' ||
                    order === 'by_replies'
                ) {
                    dataPath = ['accounts', accountname, category];
                } else {
                    dataPath = ['discussion_idx', category || '', order];
                }

                newState = newState.updateIn(dataPath, List(), posts => {
                    const links = data.map(v => `${v.author}/${v.permlink}`);

                    if (startPermLink) {
                        return posts.withMutations(posts => {
                            for (let id of links.filter(id => !posts.includes(id))) {
                                posts.push(id);
                            }
                        });
                    } else {
                        return fromJS(links);
                    }
                });

                newState = newState.updateIn(['content'], content =>
                    content.withMutations(content => {
                        for (let value of data) {
                            content.set(
                                `${value.author}/${value.permlink}`,
                                fromJS({
                                    ...value,
                                    stats: contentStats(value),
                                })
                            );
                        }
                    })
                );

                newState = newState.updateIn(
                    ['status', category || '', order],
                    () => {
                        if (data.length < constants.FETCH_DATA_BATCH_SIZE) {
                            return { fetching: false, lastFetch: Date.now() };
                        } else {
                            return { fetching: false };
                        }
                    }
                );

                return newState;
            },
        },
        {
            action: 'RECEIVE_RECENT_POSTS',
            reducer: (state, { payload: { data } }) => {
                let newState = state.updateIn(
                    ['discussion_idx', '', 'created'],
                    List(),
                    posts =>
                        posts.withMutations(posts => {
                            for (let { author, permlink } of data) {
                                const entry = `${author}/${permlink}`;

                                if (!posts.includes(entry)) {
                                    posts.unshift(entry);
                                }
                            }
                        })
                );

                newState = newState.updateIn(['content'], content =>
                    content.withMutations(map => {
                        for (let value of data) {
                            const key = `${value.author}/${value.permlink}`;

                            if (!map.has(key)) {
                                map.set(
                                    key,
                                    fromJS({
                                        ...value,
                                        stats: contentStats(value),
                                    })
                                );
                            }
                        }
                    })
                );

                return newState;
            },
        },
        {
            action: 'REQUEST_META',
            reducer: (state, { payload: { id, link } }) =>
                state.setIn(['metaLinkData', id], Map({ link })),
        },
        {
            action: 'RECEIVE_META',
            reducer: (state, { payload: { id, meta } }) =>
                state.updateIn(['metaLinkData', id], data => data.merge(meta)),
        },
        {
            action: 'SET',
            reducer: (state, { payload: { key, value } }) => {
                return state.setIn(Array.isArray(key) ? key : [key], fromJS(value));
            },
        },
        {
            action: 'REMOVE',
            reducer: (state, { payload: { key } }) => {
                return state.removeIn(Array.isArray(key) ? key : [key]);
            },
        },
        {
            action: 'UPDATE',
            reducer: (state, { payload: { key, notSet = Map(), updater } }) =>
                // key = Array.isArray(key) ? key : [key] // TODO enable and test
                state.updateIn(key, notSet, updater),
        },
        {
            action: 'SET_META_DATA',
            reducer: (state, { payload: { id, meta } }) =>
                state.setIn(['metaLinkData', id], fromJS(meta)),
        },
        {
            action: 'CLEAR_META',
            reducer: (state, { payload: { id } }) =>
                state.deleteIn(['metaLinkData', id]),
        },
        {
            action: 'CLEAR_META_ELEMENT',
            reducer: (state, { payload: { formId, element } }) =>
                state.updateIn(['metaLinkData', formId], data =>
                    data.remove(element)
                ),
        },
        {
            action: 'FETCH_JSON',
            reducer: state => state,
        },
        {
            action: 'FETCH_EXCHANGE_RATES',
            reducer: state => state,
        },
        {
            action: 'FETCH_JSON_RESULT',
            reducer: (state, { payload: { id, result, error } }) =>
                state.set(id, fromJS({ result, error })),
        },
        {
            action: 'SHOW_DIALOG',
            reducer: (state, { payload: { name, params = {} } }) =>
                state.update('active_dialogs', Map(), d =>
                    d.set(name, fromJS({ params }))
                ),
        },
        {
            action: 'HIDE_DIALOG',
            reducer: (state, { payload: { name } }) =>
                state.update('active_dialogs', d => d.delete(name)),
        },
        {
            action: 'RECEIVE_ACCOUNT_VESTING_DELEGATIONS',
            reducer: (
                state,
                { payload: { account, type, vesting_delegations } }
            ) =>
                state.setIn(
                    ['accounts', account, `${type}_vesting`],
                    fromJS(vesting_delegations)
                ),
        },
        {
            action: 'PINNED_UPDATE',
            reducer: (state, { payload }) => {
                const { accountName, pinnedPosts } = payload;

                return state.setIn(
                    ['accounts', accountName, 'pinnedPosts'],
                    List(pinnedPosts)
                );
            },
        },
        {
            action: 'RECEIVE_REWARDS',
            reducer: (state, { payload: {account, rewards} }) => {
                return state.updateIn(
                    ['accounts', account, 'transfer_history' /*'rewards_history'*/ ],
                    Map(),
                    r => r.mergeDeep(fromJS(rewards))
                );
            }
        },
    ],
});

function extractPinnedPosts(account) {
    if (account.json_metadata) {
        try {
            account.pinnedPosts = JSON.parse(account.json_metadata).pinnedPosts || [];
        } catch (err) {
            console.error(err);
        }
    }
}
