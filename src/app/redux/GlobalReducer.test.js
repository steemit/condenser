import chai, { expect } from 'chai';
import chaiImmutable from 'chai-immutable';

import { Map, OrderedMap, getIn, List, fromJS, Set, merge } from 'immutable';
import { emptyContent } from 'app/redux/EmptyState';

import * as globalActions from './GlobalReducer';
import reducer, { defaultState } from './GlobalReducer';

chai.use(chaiImmutable);

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

const mockPayloads = {
    setCollapsed: {
        post: 'the city',
        collapsed: 'is now collapsed',
    },
    receiveState: {
        content: Map({ barman: Map({ foo: 'choo', stats: '' }) }),
    },
    receiveAccount: {
        account: {
            name: 'foo',
            witness_votes: 99,
            beList: ['alice', 'bob', 'claire'],
            beOrderedMap: { foo: 'barman' },
        },
    },
    receiveComment: {
        op: {
            author: 'critic',
            permlink: 'critical-comment',
            parent_author: 'Yerofeyev',
            parent_permlink: 'moscow-stations',
            title: 'moscow to the end of the line',
            body: 'corpus of the text',
        },
    },
    receiveContent: {
        content: {
            author: 'sebald',
            permlink: 'rings-of-saturn',
            active_votes: { one: { percent: 30 }, two: { percent: 70 } },
        },
    },
    linkReply: {
        author: 'critic',
        permlink: 'critical-comment',
        parent_author: 'Yerofeyev',
        parent_permlink: 'moscow-stations',
        title: 'moscow to the end of the line',
        body: 'corpus of the text',
    },
    updateAccountWitnessVote: {
        account: 'Smee',
        witness: 'Greech',
        approve: true,
    },
    updateAccountWitnessProxy: {
        account: 'Alice',
        proxy: 'Jane',
    },
    deleteContent: {
        author: 'sebald',
        permlink: 'rings-of-saturn',
    },
    fetchingData: {
        order: 'cheeseburger',
        category: 'life',
    },
    receiveData: {
        data: [
            {
                author: 'smudge',
                permlink: 'klop',
                active_votes: { one: { percent: 30 }, two: { percent: 70 } },
            },
        ],
        order: 'by_author',
        category: 'blog',
        accountname: 'alice',
    },
    receiveRecentPosts: {
        data: [
            {
                author: 'pidge',
                permlink: 'wolf',
                active_votes: { one: { percent: 60 }, two: { percent: 30 } },
                stats: {},
            },
            {
                author: 'ding',
                permlink: 'bat',
                active_votes: { one: { percent: 60 }, two: { percent: 30 } },
                stats: {},
            },
        ],
    },
    requestMeta: {
        id: 'Hello',
        link: 'World',
    },
    receiveMeta: {
        id: 'Hello',
        meta: { link: 'spalunking' },
    },
    set: {
        key: ['europe', 'east', 'soup'],
        value: 'borscht',
    },
    remove: {
        key: ['europe', 'east', 'soup'],
    },
    update: {
        key: ['oak'],
        updater: () => 'acorn',
    },
    setMetaData: {
        id: 'pear',
        meta: { flip: 'flop' },
    },
    clearMetaElement: {
        formId: 'quince',
        element: 'flip',
    },
    fetchJsonResult: {
        id: 'seagull',
        result: 'fulmar',
        error: 'stuka',
    },
    showDialog: {
        name: 'Iris',
        params: { cheap: 'seats' },
    },
};

describe('Global reducer', () => {
    it('should provide a nice initial state', () => {
        const initial = reducer();
        expect(initial).to.equal(defaultState);
    });
    it('should return correct state for a SET_COLLAPSED action', () => {
        // Arrange
        const initial = reducer().set(
            'content',
            Map({
                [mockPayloads.setCollapsed.post]: Map({}),
            })
        );
        // Act
        const actual = reducer(
            initial,
            globalActions.setCollapsed(mockPayloads.setCollapsed)
        );
        // Assert
        expect(
            actual.getIn([
                'content',
                mockPayloads.setCollapsed.post,
                'collapsed',
            ])
        ).to.eql(mockPayloads.setCollapsed.collapsed);
    });
    it('should return correct state for a RECEIVE_STATE action', () => {
        // Arrange
        const initial = reducer();
        // Act
        const actual = reducer(
            initial,
            globalActions.receiveState(mockPayloads.receiveState)
        );
        // Assert
        expect(actual.getIn(['content', 'barman', 'foo'])).to.eql('choo');
        expect(actual.getIn(['content', 'barman', 'stats'])).to.eql(
            expectedStats
        );
    });

    it('should return correct state for a RECEIVE_ACCOUNT action', () => {
        // Arrange
        const payload = mockPayloads.receiveAccount;
        const initial = reducer();
        const expected = Map({
            status: {},
            accounts: Map({
                foo: Map({
                    name: 'foo',
                    witness_votes: 99,
                    be_List: List(['alice', 'bob', 'claire']),
                    be_orderedMap: OrderedMap({ foo: 'barman' }),
                }),
            }),
        });
        // Act
        const actual = reducer(initial, globalActions.receiveAccount(payload));
        // Assert
        expect(actual.getIn(['accounts', payload.account.name, 'name'])).to.eql(
            payload.account.name
        );
        expect(
            actual.getIn(['accounts', payload.account.name, 'beList'])
        ).to.eql(List(payload.account.beList));
        expect(
            actual.getIn(['accounts', payload.account.name, 'beOrderedMap'])
        ).to.eql(OrderedMap(payload.account.beOrderedMap));
    });

    it('should return correct state for a RECEIVE_COMMENT action', () => {
        // Arrange
        const payload = mockPayloads.receiveComment;
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
            actual.getIn(['content', `${author}/${permlink}`])
        ).to.include.all.keys(
            ...Object.keys(emptyContent),
            ...Object.keys(payload.op)
        );
        expect(
            actual.getIn(['content', `${parent_author}/${parent_permlink}`])
        ).to.include.all.keys('replies', 'children');
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
        ).to.eql(undefined);
    });
    it('should return correct state for a RECEIVE_CONTENT action', () => {
        // Arrange
        const payload = mockPayloads.receiveContent;
        const { author, permlink, active_votes } = payload.content;
        // Act
        const actual = reducer(
            reducer(),
            globalActions.receiveContent(payload)
        );
        // Assert
        expect(
            actual.getIn(['content', `${author}/${permlink}`])
        ).to.include.all.keys(
            ...Object.keys(emptyContent),
            ...Object.keys(payload.content)
        );
        expect(
            actual.getIn(['content', `${author}/${permlink}`, 'active_votes'])
        ).to.eql(fromJS(active_votes));
    });

    it('should return correct state for a LINK_REPLY action', () => {
        // Arrange
        let payload = mockPayloads.linkReply;
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
        expect(actual.get('content')).to.eql(expected);
        // Arrange
        // Remove parent
        payload.parent_author = '';
        // Act
        actual = reducer(initial, globalActions.linkReply(payload));
        // Assert
        expect(actual).to.eql(initial);
    });
    it('should return correct state for a UPDATE_ACCOUNT_WITNESS_VOTE action', () => {
        // Arrange
        let payload = mockPayloads.updateAccountWitnessVote;
        const initial = reducer();
        // Act
        let actual = reducer(
            initial,
            globalActions.updateAccountWitnessVote(payload)
        );
        // Assert
        expect(
            actual.getIn(['accounts', payload.account, 'witness_votes'])
        ).to.eql(Set([payload.witness]));
        // Arrange
        payload.approve = false;
        // Act
        actual = reducer(
            initial,
            globalActions.updateAccountWitnessVote(payload)
        );
        // Assert
        expect(actual).to.eql(initial);
    });
    it('should return correct state for a UPDATE_ACCOUNT_WITNESS_VOTE action', () => {
        // Arrange
        let payload = mockPayloads.updateAccountWitnessProxy;
        const initial = reducer();
        const expected = Map({ proxy: payload.proxy });
        // Act
        const actual = reducer(
            initial,
            globalActions.updateAccountWitnessProxy(payload)
        );
        // Assert
        expect(actual.getIn(['accounts', payload.account])).to.eql(expected);
    });
    it('should return correct state for a DELETE_CONTENT action', () => {
        // Arrange
        let payload = mockPayloads.deleteContent;
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
        expect(actual.get('content')).to.eql(expected);
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
        expect(actual.getIn(['content', 'alice/bob', 'replies']))
            .to.have.length(2)
            .and.to.not.include(`${payload.author}/${payload.permlink}`);
    });
    it('should return correct state for a FETCHING_DATA action', () => {
        // Arrange
        const payload = mockPayloads.fetchingData;
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
        ).to.eql({ fetching: true });
    });
    it('should return correct state for a RECEIVE_DATA action', () => {
        //Arrange
        let payload = mockPayloads.receiveData;
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

        //Assert
        expect(actual1.getIn(['content', 'author'])).to.eql(payload.author);
        expect(actual1.getIn(['content', 'permlink'])).to.eql(payload.permlink);
        expect(actual1.getIn(['content', 'active_vites'])).to.eql(
            payload.active_votes
        );
        expect(
            actual1.getIn([
                'content',
                `${payload.data[0].author}/${payload.data[0].permlink}`,
                'stats',
                'allowDelete',
            ])
        ).to.eql(false);

        // Push new key to posts list, If order meets the condition.
        expect(
            actual1.getIn(['accounts', payload.accountname, payload.category])
        ).to.deep.include(
            `${payload.data[0].author}/${payload.data[0].permlink}`
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
        ).to.deep.include(
            `${payload.data[0].author}/${payload.data[0].permlink}`
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
        expect(
            actual3.getIn(['discussion_idx', '', payload.order])
        ).to.deep.include(
            `${payload.data[0].author}/${payload.data[0].permlink}`
        );
    });
    it('should return correct state for a RECEIVE_RECENT_POSTS action', () => {
        // Arrange
        const initial = reducer();
        const initWithData = reducer()
            .setIn(['discussion_idx', '', 'created'], List([]))
            .set('content', Map({}));

        // Act
        const actual = reducer(
            initWithData,
            globalActions.receiveRecentPosts(mockPayloads.receiveRecentPosts)
        );
        // Assert
        // It adds recent posts to discussion_idx
        expect(actual.getIn(['discussion_idx', '', 'created'])).to.eql(
            List([
                `${mockPayloads.receiveRecentPosts.data[1].author}/${
                    mockPayloads.receiveRecentPosts.data[1].permlink
                }`,
                `${mockPayloads.receiveRecentPosts.data[0].author}/${
                    mockPayloads.receiveRecentPosts.data[0].permlink
                }`,
            ])
        );
        // It adds recent posts to content
        expect(actual.get('content'))
            .to.have.property(
                `${mockPayloads.receiveRecentPosts.data[0].author}/${
                    mockPayloads.receiveRecentPosts.data[0].permlink
                }`
            )
            .to.have.property('stats');

        // Act
        // If the recent post is already in the list do not add it again.
        const actual2 = reducer(
            actual,
            globalActions.receiveRecentPosts(mockPayloads.receiveRecentPosts)
        );
        // Assert
        expect(actual.getIn(['discussion_idx', '', 'created'])).to.have.sizeOf(
            2
        );
        expect(actual.get('content'))
            .to.have.sizeOf(2)
            .and.to.have.property(
                `${mockPayloads.receiveRecentPosts.data[0].author}/${
                    mockPayloads.receiveRecentPosts.data[0].permlink
                }`
            );
    });
    it('should return correct state for a REQUEST_META action', () => {
        // Act
        const actual = reducer(
            reducer(),
            globalActions.requestMeta(mockPayloads.requestMeta)
        );
        // Assert
        expect(actual.getIn(['metaLinkData', `${mockPayloads.requestMeta.id}`]))
            .to.have.property('link')
            .to.equal(mockPayloads.requestMeta.link);
    });
    it('should return correct state for a RECEIVE_META action', () => {
        // Arrange
        const initial = reducer();
        const initialWithData = initial.setIn(
            ['metaLinkData', mockPayloads.receiveMeta.id],
            Map({})
        );
        // Act
        const actual = reducer(
            initialWithData,
            globalActions.receiveMeta(mockPayloads.receiveMeta)
        );
        // Assert
        expect(actual.getIn(['metaLinkData', mockPayloads.receiveMeta.id]))
            .to.have.property('link')
            .to.equal(mockPayloads.receiveMeta.meta.link);
    });

    it('should return correct state for a SET action', () => {
        // Arrange
        const initial = reducer();
        // Act
        const actual = reducer(initial, globalActions.set(mockPayloads.set));
        // Assert
        expect(actual.getIn(mockPayloads.set.key)).to.eql(
            mockPayloads.set.value
        );
        // Arrange
        // Make the key a non-array.
        mockPayloads.set = {
            key: 'hello',
            value: 'world',
        };
        // Assert
        const actual2 = reducer(initial, globalActions.set(mockPayloads.set));
        expect(actual2.getIn([mockPayloads.set.key])).to.eql(
            mockPayloads.set.value
        );
    });
    it('should return correct state for a REMOVE action', () => {
        // Arrange
        const initial = reducer();
        initial.setIn(mockPayloads.remove.key, 'potato');
        // Act
        const actual = reducer(
            initial,
            globalActions.remove(mockPayloads.remove)
        );
        // Assert
        expect(actual.getIn(mockPayloads.set.key)).to.not.eql('potato');
    });

    it('should return correct state for a UPDATE action', () => {
        // Arrange
        const initial = reducer();
        initial.setIn(mockPayloads.update.key, 'acorn');
        // Act
        const actual = reducer(
            initial,
            globalActions.update(mockPayloads.update)
        );
        // Assert
        expect(actual.getIn(mockPayloads.update.key)).to.eql(
            mockPayloads.update.updater()
        );
    });

    it('should return correct state for a SET_META_DATA action', () => {
        // Arrange
        const initial = reducer();
        // Act
        const actual = reducer(
            initial,
            globalActions.setMetaData(mockPayloads.setMetaData)
        );
        // Assert
        expect(
            actual.getIn(['metaLinkData', mockPayloads.setMetaData.id])
        ).to.eql(fromJS(mockPayloads.setMetaData.meta));
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
        expect(actual.get('metaLinkData')).to.not.have.property('deleteMe');
    });

    it('should return correct state for a CLEAR_META_ELEMENT action', () => {
        // Arrange
        const initial = reducer().setIn(
            ['metaLinkData', mockPayloads.clearMetaElement.formId],
            { data: { [mockPayloads.clearMetaElement.element]: 'flop' } }
        );
        // Act
        // no such action creator for the CLEAR_META_ELEMENT
        // const actual = reducer(initial, globalActions.clearMetaElement(mockPayloads.clearMetaElement))
        // expect(actual.get('metaLinkData')).to.not.have.property(mockPayloads.clearMetaElement.element)
    });

    it('should return correct state for a FETCH_JSON action', () => {
        const initial = reducer();
        const actual = reducer(initial, globalActions.fetchJson(defaultState));
        expect(initial).to.eql(actual);
    });

    it('should return correct state for a FETCH_JSON_RESULT action', () => {
        const payload = mockPayloads.fetchJsonResult;
        const initial = reducer();
        const actual = reducer(initial, globalActions.fetchJsonResult(payload));
        expect(actual)
            .to.have.property(payload.id)
            .to.eql(
                Map({
                    result: payload.result,
                    error: payload.error,
                })
            );
    });

    it('should return correct state for a SHOW_DIALOG action', () => {
        const payload = mockPayloads.showDialog;
        const initial = reducer().set(
            'active_dialogs',
            Map({ chimney: 'smoke' })
        );
        const actual = reducer(initial, globalActions.showDialog(payload));
        expect(actual.get('active_dialogs'))
            .to.have.property(payload.name)
            .to.eql(Map({ params: Map({ ...payload.params }) }));
    });

    it('should return correct state for a HIDE_DIALOG action', () => {
        const payload = { name: 'dolphin' };
        const initial = reducer().set(
            'active_dialogs',
            Map({ [payload.name]: 'flipper' })
        );
        const actual = reducer(initial, globalActions.hideDialog(payload));
        expect(actual.get('active_dialogs')).to.not.have.property(payload.name);
    });
});
