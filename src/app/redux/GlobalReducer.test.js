import chai, { expect } from 'chai';
import chaiImmutable from 'chai-immutable';

import { Map, OrderedMap, getIn, List, fromJS } from 'immutable';
import { emptyContent } from 'app/redux/EmptyState';

import reducer, {
    defaultState,
    globalActionConstants,
    emptyContentMap,
} from './GlobalReducer';

chai.use(chaiImmutable);

const mockActions = {
    [globalActionConstants.SET_COLLAPSED]: {
        type: globalActionConstants.SET_COLLAPSED,
        payload: {
            post: 'the city',
            collapsed: 'is now collapsed',
        },
    },
    [globalActionConstants.RECEIVE_STATE]: {
        type: globalActionConstants.RECEIVE_STATE,
        payload: {
            content: Map({ barman: Map({ foo: 'choo', stats: '' }) }),
        },
    },
    [globalActionConstants.RECEIVE_ACCOUNT]: {
        type: globalActionConstants.RECEIVE_ACCOUNT,
        payload: {
            account: {
                name: 'adorno',
                witness_votes: 99,
                beList: ['alice', 'bob', 'claire'],
                beOrderedMap: { foo: 'barman' },
            },
        },
    },
    [globalActionConstants.RECEIVE_COMMENT]: {
        type: globalActionConstants.RECEIVE_COMMENT,
        payload: {
            op: {
                author: 'critic',
                permlink: 'crtical-comment',
                parent_author: 'Yerofeyev',
                parent_permlink: 'moscow-stations',
                title: 'moscow to the end of the line',
                body: 'corpus of the text',
            },
        },
    },
    [globalActionConstants.RECEIVE_CONTENT]: {
        type: globalActionConstants.RECEIVE_CONTENT,
        payload: {
            content: {
                author: 'sebald',
                permlink: 'rings-of-saturn',
                active_votes: { one: { percent: 30}, two: { percent: 70}},
            },
        },
    },
};

describe('Global reducer', () => {
    it('should provide a nice initial state', () => {
        const initial = reducer();
        expect(initial).to.equal(defaultState);
    });
    it('should return correct state for a SET_COLLAPSED action', () => {
        const initial = reducer().set(
            'content',
            Map({
                [mockActions[globalActionConstants.SET_COLLAPSED].payload
                    .post]: Map({}),
            })
        );
        const actual = reducer(
            initial,
            mockActions[globalActionConstants.SET_COLLAPSED]
        );
        expect(
            actual.getIn([
                'content',
                mockActions[globalActionConstants.SET_COLLAPSED].payload.post,
                'collapsed',
            ])
        ).to.eql(
            mockActions[globalActionConstants.SET_COLLAPSED].payload.collapsed
        );
    });
    it('should return correct state for a RECEIVE_STATE action', () => {
        const initial = reducer();
        const actual = reducer(
            initial,
            mockActions[globalActionConstants.RECEIVE_STATE]
        );
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
        expect(actual.getIn(['content', 'barman', 'foo'])).to.eql('choo');
        expect(actual.getIn(['content', 'barman', 'stats'])).to.eql(
            expectedStats
        );
    });

    it('should return correct state for a RECEIVE_ACCOUNT action', () => {
        const payload =
            mockActions[globalActionConstants.RECEIVE_ACCOUNT].payload;
        const initial = reducer();
        const actual = reducer(
            initial,
            mockActions[globalActionConstants.RECEIVE_ACCOUNT]
        );
        const expected = Map({
            status: {},
            accounts: Map({
                adorno: Map({
                    name: 'adorno',
                    witness_votes: 99,
                    be_List: List(['alice', 'bob', 'claire']),
                    be_orderedMap: OrderedMap({ foo: 'barman' }),
                }),
            }),
        });
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
        const {
            author,
            permlink,
            parent_author,
            parent_permlink,
            title,
            body,
        } = mockActions[globalActionConstants.RECEIVE_COMMENT].payload.op;
        const initial = reducer();
        const actual = reducer(
            initial,
            mockActions[globalActionConstants.RECEIVE_COMMENT]
        );
        expect(actual.getIn(['content', `${author}/${permlink}`])).to.include.all.keys(...Object.keys(emptyContent), ...Object.keys( mockActions[globalActionConstants.RECEIVE_COMMENT].payload.op));
        // With Parent.
        expect(actual.getIn(['content', `${parent_author}/${parent_permlink}`])).to.include.all.keys('replies', 'children');
        // Without Parent.
        mockActions[globalActionConstants.RECEIVE_COMMENT].payload.op.parent_author = '';
        const actual2 = reducer(
            initial,
            mockActions[globalActionConstants.RECEIVE_COMMENT]
        );
        expect(actual2.getIn(['content', `${parent_author}/${parent_permlink}`])).to.eql(undefined)
    });
    it('should return correct state for a RECEIVE_CONTENT action', () => {
        const {
            author,
            permlink,
            active_votes,
        } = mockActions[globalActionConstants.RECEIVE_CONTENT].payload.content;
        const initial = reducer();
        const actual = reducer(
            initial,
            mockActions[globalActionConstants.RECEIVE_CONTENT]
        );
        expect(actual.getIn(['content', `${author}/${permlink}`])).to.include.all.keys(...Object.keys(emptyContent));
        expect(actual.getIn(['content', `${author}/${permlink}`, 'active_votes'])).to.eql(fromJS(active_votes));
    });
    
});
