import { Map, OrderedMap, getIn, List, fromJS, Set, merge } from 'immutable';
import { emptyContent } from 'app/redux/EmptyState';
import * as globalActions from './GlobalReducer';
import reducer, { defaultState } from './GlobalReducer';

const expectedStats = Map({
    isNsfw: false,
    hide: false,
    hasPendingPayout: false,
    gray: false,
    flagWeight: 0,
    up_votes: 0,
    total_votes: 0,
    authorRepLog10: undefined,
    allowDelete: true,
});

describe('Global reducer', () => {
    it('should provide a nice initial state', () => {
        const initial = reducer();
        expect(initial).toEqual(defaultState);
    });
    it('should return correct state for a SET_COLLAPSED action', () => {
        // Arrange
        const payload = {
            post: 'the city',
            collapsed: 'is now collapsed',
        };
        const initial = reducer().set(
            'content',
            Map({
                [payload.post]: Map({}),
            })
        );
        // Act
        const actual = reducer(initial, globalActions.setCollapsed(payload));
        // Assert
        expect(actual.getIn(['content', payload.post, 'collapsed'])).toEqual(
            payload.collapsed
        );
    });
    it('should return correct state for a RECEIVE_STATE action', () => {
        // Arrange
        const payload = {
            content: Map({ barman: Map({ foo: 'choo', stats: '' }) }),
        };
        const initial = reducer();
        // Act
        const actual = reducer(initial, globalActions.receiveState(payload));
        // Assert
        expect(actual.getIn(['content', 'barman', 'foo'])).toEqual('choo');
        expect(actual.getIn(['content', 'barman', 'stats'])).toEqual(
            expectedStats
        );
    });

    it('should return correct state for a RECEIVE_ACCOUNT action', () => {
        // Arrange
        const payload = {
            account: {
                name: 'foo',
                beList: ['alice', 'bob', 'claire'],
                beOrderedMap: { foo: 'barman' },
            },
        };
        const initial = reducer();
        const expected = Map({
            status: {},
            accounts: Map({
                foo: Map({
                    name: 'foo',
                    be_List: List(['alice', 'bob', 'claire']),
                    be_orderedMap: OrderedMap({ foo: 'barman' }),
                }),
            }),
        });
        // Act
        const actual = reducer(initial, globalActions.receiveAccount(payload));
        // Assert
        expect(
            actual.getIn(['accounts', payload.account.name, 'name'])
        ).toEqual(payload.account.name);
        expect(
            actual.getIn(['accounts', payload.account.name, 'beList'])
        ).toEqual(List(payload.account.beList));
        expect(
            actual.getIn(['accounts', payload.account.name, 'beOrderedMap'])
        ).toEqual(OrderedMap(payload.account.beOrderedMap));
    });

    it('should return correct state for a RECEIVE_ACCOUNTS action', () => {
        // Arrange
        const payload = {
            accounts: [
                {
                    name: 'foo',
                    beList: ['alice', 'bob', 'claire'],
                    beorderedMap: { foo: 'barman' },
                },
                {
                    name: 'bar',
                    beList: ['james', 'billy', 'samantha'],
                    beOrderedMap: { kewl: 'snoop' },
                },
            ],
        };

        const initState = Map({
            status: {},
            seagull: Map({ result: 'fulmar', error: 'stuka' }),
            accounts: Map({
                sergei: Map({
                    name: 'sergei',
                    beList: List(['foo', 'carl', 'hanna']),
                    beorderedMap: OrderedMap({ foo: 'cramps' }),
                }),
            }),
        });

        const initial = reducer(initState);

        const expected = Map({
            status: {},
            accounts: Map({
                sergei: Map({
                    name: 'sergei',
                    beList: List(['foo', 'carl', 'hanna']),
                    beorderedMap: OrderedMap({
                        foo: 'cramps',
                    }),
                }),
                foo: Map({
                    name: 'foo',
                    beList: List(['alice', 'bob', 'claire']),
                    beorderedMap: OrderedMap({ foo: 'barman' }),
                }),
                bar: Map({
                    name: 'bar',
                    beList: List(['james', 'billy', 'samantha']),
                    beOrderedMap: OrderedMap({ kewl: 'snoop' }),
                }),
            }),
        });
        // Act
        const actual = reducer(initial, globalActions.receiveAccounts(payload));
        // Assert
        expect(actual.get('accounts')).toEqual(expected.get('accounts'));
    });

    it('should return correct state for a RECEIVE_COMMENT action', () => {
        // Arrange
        const payload = {
            op: {
                author: 'critic',
                permlink: 'critical-comment',
                parent_author: 'Yerofeyev',
                parent_permlink: 'moscow-stations',
                title: 'moscow to the end of the line',
                body: 'corpus of the text',
            },
        };
        const {
            author,
            permlink,
            parent_author,
            parent_permlink,
            title,
            body,
        } = payload.op;
        //Act
        const actual = reducer(
            reducer(),
            globalActions.receiveComment(payload)
        );
        //  Assert
        expect(
            actual.getIn(['content', `${author}/${permlink}`, 'author'])
        ).toEqual(author);
        expect(
            actual.getIn(['content', `${author}/${permlink}`, 'title'])
        ).toEqual(title);
        expect(
            actual.getIn(['content', `${parent_author}/${parent_permlink}`])
        ).toEqual(
            Map({ replies: List(['critic/critical-comment']), children: 1 })
        );
        // Arrange
        payload.op.parent_author = '';
        // Act
        const actual2 = reducer(
            reducer(),
            globalActions.receiveComment(payload)
        );
        // Assert
        expect(
            actual2.getIn(['content', `${parent_author}/${parent_permlink}`])
        ).toEqual(undefined);
    });
    it('should return correct state for a RECEIVE_CONTENT action', () => {
        // Arrange
        const payload = {
            content: {
                author: 'sebald',
                permlink: 'rings-of-saturn',
                active_votes: { one: { percent: 30 }, two: { percent: 70 } },
            },
        };
        const { author, permlink, active_votes } = payload.content;
        // Act
        const actual = reducer(
            reducer(),
            globalActions.receiveContent(payload)
        );
        // Assert
        expect(
            actual.getIn(['content', `${author}/${permlink}`, 'author'])
        ).toEqual(payload.content.author);
        expect(
            actual.getIn(['content', `${author}/${permlink}`, 'permlink'])
        ).toEqual(payload.content.permlink);
        expect(
            actual.getIn(['content', `${author}/${permlink}`, 'active_votes'])
        ).toEqual(fromJS(active_votes));
    });

    it('should return correct state for a LINK_REPLY action', () => {
        // Arrange
        let payload = {
            author: 'critic',
            permlink: 'critical-comment',
            parent_author: 'Yerofeyev',
            parent_permlink: 'moscow-stations',
            title: 'moscow to the end of the line',
            body: 'corpus of the text',
        };
        const initial = reducer();
        const expected = Map({
            [payload.parent_author + '/' + payload.parent_permlink]: Map({
                replies: List([`${payload.author}/${payload.permlink}`]),
                children: 1,
            }),
        });
        // Act
        let actual = reducer(initial, globalActions.linkReply(payload));
        // Assert
        expect(actual.get('content')).toEqual(expected);
        // Arrange
        // Remove parent
        payload.parent_author = '';
        // Act
        actual = reducer(initial, globalActions.linkReply(payload));
        // Assert
        expect(actual).toEqual(initial);
    });
    it('should return correct state for a DELETE_CONTENT action', () => {
        // Arrange
        let payload = {
            author: 'sebald',
            permlink: 'rings-of-saturn',
        };
        let initial = reducer();
        // Act
        // add content
        const initWithContent = initial.setIn(
            ['content', `${payload.author}/${payload.permlink}`],
            Map({
                author: 'sebald',
                permlink: 'rings-of-saturn',
                parent_author: '',
                active_votes: { one: { percent: 30 }, two: { percent: 70 } },
                replies: List(['cool', 'mule']),
            })
        );
        let expected = Map({});
        // Act
        let actual = reducer(
            initWithContent,
            globalActions.deleteContent(payload)
        );
        // Assert
        expect(actual.get('content')).toEqual(expected);
        // Arrange
        const initWithContentAndParent = initial.setIn(
            ['content', `${payload.author}/${payload.permlink}`],
            Map({
                author: 'sebald',
                permlink: 'rings-of-saturn',
                parent_author: 'alice',
                parent_permlink: 'bob',
                active_votes: { one: { percent: 30 }, two: { percent: 70 } },
            })
        );
        const initWithParentKeyContent = initWithContentAndParent.setIn(
            ['content', 'alice/bob'],
            Map({
                replies: [
                    `${payload.author}/${payload.permlink}`,
                    'dorothy-hughes/in-a-lonely-place',
                    'artichoke/hearts',
                ],
            })
        );
        expected = Map({
            replies: ['dorothy-hughes/in-a-lonely-place', 'artichoke/hearts'],
        });
        // Act
        actual = reducer(
            initWithParentKeyContent,
            globalActions.deleteContent(payload)
        );
        // Assert
        expect(actual.getIn(['content', 'alice/bob', 'replies'])).toHaveLength(
            2
        );
        expect(actual.getIn(['content', 'alice/bob', 'replies'])).toEqual([
            'dorothy-hughes/in-a-lonely-place',
            'artichoke/hearts',
        ]);
    });
    it('should return correct state for a FETCHING_DATA action', () => {
        // Arrange
        const payload = {
            order: 'cheeseburger',
            category: 'life',
        };
        const initWithCategory = reducer().set(
            'status',
            Map({
                [payload.category]: Map({
                    [payload.order]: { fetching: false },
                }),
            })
        );
        // Act
        const actual = reducer(
            initWithCategory,
            globalActions.fetchingData(payload)
        );
        // Assert
        expect(
            actual.getIn(['status', payload.category, payload.order])
        ).toEqual({ fetching: true });
    });
    it('should return correct state for a RECEIVE_DATA action', () => {
        //Arrange
        const postData = {
            author: 'smudge',
            permlink: 'klop',
            active_votes: {
                one: { percent: 30 },
                two: { percent: 70 },
            },
        };
        let payload = {
            data: [postData],
            order: 'by_author',
            category: 'blog',
            accountname: 'alice',
        };
        const initWithData = reducer().merge({
            accounts: Map({
                [payload.accountname]: Map({
                    [payload.category]: List([
                        { data: { author: 'farm', permlink: 'barn' } },
                    ]),
                }),
            }),
            content: Map({}),
            status: Map({
                [payload.category]: Map({
                    [payload.order]: {},
                }),
            }),
            discussion_idx: Map({
                [payload.category]: Map({
                    UnusualOrder: List([
                        { data: { author: 'ship', permlink: 'bridge' } },
                    ]),
                }),
                '': Map({
                    FebrileFriday: List([]),
                }),
            }),
        });

        //Act
        const actual1 = reducer(
            initWithData,
            globalActions.receiveData(payload)
        );

        const postKey = `${postData.author}/${postData.permlink}`;

        //Assert
        expect(actual1.getIn(['content', postKey, 'author'])).toEqual(
            postData.author
        );
        expect(actual1.getIn(['content', postKey, 'permlink'])).toEqual(
            postData.permlink
        );
        expect(actual1.getIn(['content', postKey, 'active_votes'])).toEqual(
            fromJS(postData.active_votes)
        );
        expect(
            actual1.getIn(['content', postKey, 'stats', 'allowDelete'])
        ).toEqual(false);

        // Push new key to posts list, If order meets the condition.
        expect(
            actual1.getIn(['accounts', payload.accountname, payload.category])
        ).toEqual(
            List([
                { data: { author: 'farm', permlink: 'barn' } },
                'smudge/klop',
            ])
        );

        // Arrange
        payload.order = 'UnusualOrder';
        //Act.
        // Push new key to discussion_idx list, If order does not meet the condition.
        const actual2 = reducer(
            initWithData,
            globalActions.receiveData(payload)
        );

        // Assert
        expect(
            actual2.getIn(['discussion_idx', payload.category, payload.order])
        ).toEqual(
            List([
                { data: { author: 'ship', permlink: 'bridge' } },
                'smudge/klop',
            ])
        );
        // Arrange
        // handle falsey payload category by setting empty string at keypath location typically occupied by category.
        payload.order = 'FebrileFriday';
        payload.category = '';
        // Act
        const actual3 = reducer(
            initWithData,
            globalActions.receiveData(payload)
        );
        // Assert.
        expect(actual3.getIn(['discussion_idx', '', payload.order])).toEqual(
            List(['smudge/klop'])
        );
    });
    it('should handle fetch status for a RECEIVE_DATA action', () => {
        //Arrange
        let payload = {
            data: [],
            order: 'by_author',
            category: 'blog',
            accountname: 'alice',
        };
        const initWithData = reducer().merge({
            accounts: Map({
                [payload.accountname]: Map({
                    [payload.category]: List([]),
                }),
            }),
            content: Map({}),
            status: Map({
                [payload.category]: Map({
                    [payload.order]: {},
                }),
            }),
            discussion_idx: Map({
                [payload.category]: Map({
                    UnusualOrder: List([
                        { data: { author: 'ship', permlink: 'bridge' } },
                    ]),
                }),
                '': Map({
                    FebrileFriday: List([]),
                }),
            }),
        });

        //Act
        const actual1 = reducer(
            initWithData,
            globalActions.receiveData(payload)
        );

        //Assert
        expect(
            actual1.getIn(['status', payload.category, payload.order]).fetching
        ).toBeFalsy();
        expect(
            actual1.getIn(['status', payload.category, payload.order])
                .last_fetch
        ).toBeFalsy();

        // Arrange
        payload.fetching = true;
        //Act.
        const actual2 = reducer(
            initWithData,
            globalActions.receiveData(payload)
        );

        // Assert
        expect(
            actual2.getIn(['status', payload.category, payload.order]).fetching
        ).toBeTruthy();
        expect(
            actual2.getIn(['status', payload.category, payload.order])
                .last_fetch
        ).toBeFalsy();

        // Arrange
        payload.endOfData = true;
        // Act
        const actual3 = reducer(
            initWithData,
            globalActions.receiveData(payload)
        );
        // Assert.
        expect(
            actual3.getIn(['status', payload.category, payload.order]).fetching
        ).toBeTruthy();
        expect(
            actual3.getIn(['status', payload.category, payload.order])
                .last_fetch
        ).toBeTruthy();

        // Arrange
        payload.fetching = false;
        // Act
        const actual4 = reducer(
            initWithData,
            globalActions.receiveData(payload)
        );
        // Assert.
        expect(
            actual4.getIn(['status', payload.category, payload.order]).fetching
        ).toBeFalsy();
        expect(
            actual4.getIn(['status', payload.category, payload.order])
                .last_fetch
        ).toBeTruthy();
    });
    it('should return correct state for a RECEIVE_RECENT_POSTS action', () => {
        // Arrange
        const payload = {
            data: [
                {
                    author: 'pidge',
                    permlink: 'wolf',
                    active_votes: {
                        one: { percent: 60 },
                        two: { percent: 30 },
                    },
                    stats: {},
                },
                {
                    author: 'ding',
                    permlink: 'bat',
                    active_votes: {
                        one: { percent: 60 },
                        two: { percent: 30 },
                    },
                    stats: {},
                },
            ],
        };
        const initial = reducer();
        const initWithData = reducer()
            .setIn(['discussion_idx', '', 'created'], List([]))
            .set('content', Map({}));
        // Act
        const actual = reducer(
            initWithData,
            globalActions.receiveRecentPosts(payload)
        );
        // Assert
        // It adds recent posts to discussion_idx
        expect(actual.getIn(['discussion_idx', '', 'created'])).toEqual(
            List([
                `${payload.data[1].author}/${payload.data[1].permlink}`,
                `${payload.data[0].author}/${payload.data[0].permlink}`,
            ])
        );
        // It adds recent posts to content
        expect(
            actual.getIn([
                'content',
                `${payload.data[0].author}/${payload.data[0].permlink}`,
                'author',
            ])
        ).toEqual(payload.data[0].author);
        expect(
            actual.getIn([
                'content',
                `${payload.data[0].author}/${payload.data[0].permlink}`,
                'stats',
            ])
        ).toEqual(
            Map({
                isNsfw: false,
                hide: false,
                hasPendingPayout: false,
                gray: false,
                flagWeight: 0,
                up_votes: 2,
                total_votes: 2,
                authorRepLog10: undefined,
                allowDelete: false,
            })
        );

        // Act
        // If the recent post is already in the list do not add it again.
        const actual2 = reducer(
            actual,
            globalActions.receiveRecentPosts(payload)
        );
        // Assert
        expect(actual.getIn(['discussion_idx', '', 'created'])).toEqual(
            List(['ding/bat', 'pidge/wolf'])
        );
    });
    it('should return correct state for a REQUEST_META action', () => {
        // Arrange
        const payload = {
            id: 'Hello',
            link: 'World',
        };
        // Act
        const actual = reducer(reducer(), globalActions.requestMeta(payload));
        // Assert
        expect(actual.getIn(['metaLinkData', `${payload.id}`])).toEqual(
            Map({ link: 'World' })
        );
    });
    it('should return correct state for a RECEIVE_META action', () => {
        // Arrange
        const payload = {
            id: 'Hello',
            meta: { link: 'spalunking' },
        };
        const initial = reducer();
        const initialWithData = initial.setIn(
            ['metaLinkData', payload.id],
            Map({})
        );
        // Act
        const actual = reducer(
            initialWithData,
            globalActions.receiveMeta(payload)
        );
        // Assert
        expect(actual.getIn(['metaLinkData', payload.id])).toEqual(
            Map({ link: 'spalunking' })
        );
    });

    it('should return correct state for a SET action', () => {
        // Arrange
        let payload = {
            key: ['europe', 'east', 'soup'],
            value: 'borscht',
        };
        const initial = reducer();
        // Act
        const actual = reducer(initial, globalActions.set(payload));
        // Assert
        expect(actual.getIn(payload.key)).toEqual(payload.value);
        // Arrange
        // Make the key a non-array.
        payload = {
            key: 'hello',
            value: 'world',
        };
        // Assert
        const actual2 = reducer(initial, globalActions.set(payload));
        expect(actual2.getIn([payload.key])).toEqual(payload.value);
    });
    it('should return correct state for a REMOVE action', () => {
        // Arrange
        const payload = {
            key: ['europe', 'east', 'soup'],
        };
        const initial = reducer();
        initial.setIn(payload.key, 'potato');
        // Act
        const actual = reducer(initial, globalActions.remove(payload));
        // Assert
        expect(actual.getIn(payload.key)).toEqual(undefined);
    });

    it('should return correct state for a UPDATE action', () => {
        // Arrange
        const payload = {
            key: ['oak'],
            updater: () => 'acorn',
        };
        const initial = reducer();
        initial.setIn(payload.key, 'acorn');
        // Act
        const actual = reducer(initial, globalActions.update(payload));
        // Assert
        expect(actual.getIn(payload.key)).toEqual(payload.updater());
    });

    it('should return correct state for a SET_META_DATA action', () => {
        // Arrange
        const payload = {
            id: 'pear',
            meta: { flip: 'flop' },
        };
        const initial = reducer();
        // Act
        const actual = reducer(initial, globalActions.setMetaData(payload));
        // Assert
        expect(actual.getIn(['metaLinkData', payload.id])).toEqual(
            fromJS(payload.meta)
        );
    });

    it('should return correct state for a CLEAR_META action', () => {
        // Arrange
        const initial = reducer().set(
            'metaLinkData',
            Map({ deleteMe: { erase: 'me' } })
        );
        // Act
        const actual = reducer(
            initial,
            globalActions.clearMeta({ id: 'deleteMe' })
        );
        // Assert
        expect(actual.get('metaLinkData')).toEqual(Map({}));
    });

    it('should return correct state for a CLEAR_META_ELEMENT action', () => {
        // Arrange
        const payload = {
            id: 'pear',
            meta: { flip: 'flop' },
        };

        const clearPayload = {
            formId: 'pear',
            element: 'flip',
        };
        const initial = reducer(initial, globalActions.setMetaData(payload));
        // Act
        const actual = reducer(
            initial,
            globalActions.clearMetaElement(clearPayload)
        );
        // Assert
        expect(actual.get('metaLinkData')).toEqual(Map({ pear: Map({}) }));
    });

    it('should return correct state for a FETCH_JSON action', () => {
        const initial = reducer();
        const actual = reducer(initial, globalActions.fetchJson(defaultState));
        expect(initial).toEqual(actual);
    });

    it('should return correct state for a FETCH_JSON_RESULT action', () => {
        const payload = {
            id: 'seagull',
            result: 'fulmar',
            error: 'stuka',
        };
        const initial = reducer();
        const actual = reducer(initial, globalActions.fetchJsonResult(payload));
        expect(actual).toEqual(
            Map({
                status: {},
                seagull: Map({ result: 'fulmar', error: 'stuka' }),
            })
        );
    });

    it('should return correct state for a SHOW_DIALOG action', () => {
        const payload = {
            name: 'Iris',
            params: { cheap: 'seats' },
        };
        const initial = reducer().set(
            'active_dialogs',
            Map({ chimney: 'smoke' })
        );
        const actual = reducer(initial, globalActions.showDialog(payload));
        expect(actual.get('active_dialogs')).toEqual(
            Map({
                chimney: 'smoke',
                Iris: Map({ params: Map({ cheap: 'seats' }) }),
            })
        );
    });

    it('should return correct state for a HIDE_DIALOG action', () => {
        const payload = { name: 'dolphin' };
        const initial = reducer().set(
            'active_dialogs',
            Map({ [payload.name]: 'flipper' })
        );
        const actual = reducer(initial, globalActions.hideDialog(payload));
        expect(actual.get('active_dialogs')).toEqual(Map({}));
    });
});
