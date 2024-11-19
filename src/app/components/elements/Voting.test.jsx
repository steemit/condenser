import React from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { configure, mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import { fromJS, Map } from 'immutable';
import renderer from 'react-test-renderer';
import rootReducer from 'app/redux/RootReducer';
import Voting from './Voting';
import configureMockStore from 'redux-mock-store';

global.window = {};
import localStorage from 'mock-local-storage';
window.localStorage = global.localStorage;

configure({ adapter: new Adapter() });

const mockGlobal = Map({
    props: Map({ sbd_print_rate: 99 }),
    feed_price: Map({
        base: '5 SBD',
        quote: '10 STEEM',
    }),
    content: Map({
        test: Map({
            author: 'Jane Doe',
            permlink: 'zip',
            active_votes: Map({}),
            stats: {
                total_votes: 1,
            },
            max_accepted_payout: '999999 SBD',
            percent_steem_dollars: 0,
            pending_payout_value: '10 SBD',
            payout_at: '2018-03-30T10:00:00Z',
            pending_payout_sbd: 99,
        }),
    }),
});

const mockUser = Map({ current: Map({ username: 'Janice' }) });

const voteTestObj = fromJS({
    stats: {
        total_votes: 1,
    },
    max_accepted_payout: '999999 SBD',
    percent_steem_dollars: 0,
    pending_payout_value: '10 SBD',
    payout_at: '2018-03-30T10:00:00Z',
});

const marketPrice = fromJS([
    {
        timepoint: '2020-09-25T10:00:00Z',
        price_usd: '0.01',
    },
]);

const vests_per_steem = 2000;

describe('Voting', () => {
    it('should render flag if user is logged in and flag prop is true.', () => {
        const mockStore = configureMockStore()({
            global: mockGlobal,
            offchain: {},
            user: mockUser,
            transaction: {},
            discussion: {},
            routing: {},
            app: {},
        });
        let wrapped = shallow(
            <Voting
                flag={true}
                vote={(w, p) => {}}
                post={voteTestObj}
                price_per_steem={1}
                sbd_print_rate={10000}
                vests_per_steem={vests_per_steem}
                store={mockStore}
            />
        ).dive();
        expect(wrapped.find('.Voting').length).toEqual(1);
        expect(wrapped.find('.Voting__button-down').html()).toContain(
            '<a href="#" title="Downvote" id="downvote_button" class="flag">'
        );
    });

    it('should dispatch an action when flag is clicked and myVote is negative', () => {
        const mockStore = configureMockStore()({
            global: mockGlobal,
            offchain: {},
            user: mockUser,
            transaction: {},
            discussion: {},
            routing: {},
            app: {},
        });
        let wrapped = shallow(
            <Voting
                flag={true}
                myVote={-666}
                vote={(w, p) => {}}
                post={voteTestObj}
                price_per_steem={1}
                sbd_print_rate={10000}
                vests_per_steem={vests_per_steem}
                store={mockStore}
            />
        ).dive();
        wrapped.find('#revoke_downvote_button').simulate('click');
        expect(mockStore.getActions()[0].type).toEqual(
            'transaction/BROADCAST_OPERATION'
        );
        expect(mockStore.getActions()[0].payload.operation.weight).toEqual(0);
        expect(mockStore.getActions()[0].payload.operation.voter).toEqual(
            'Janice'
        );
    });

    it('should render upvote and should not render flag if user is logged in and flag prop is false.', () => {
        const mockStore = configureMockStore()({
            global: mockGlobal,
            offchain: {},
            user: mockUser,
            transaction: {},
            discussion: {},
            routing: {},
            app: {},
        });
        let wrapped = shallow(
            <Voting
                flag={false}
                vote={(w, p) => {}}
                post={voteTestObj}
                price_per_steem={1}
                sbd_print_rate={10000}
                vests_per_steem={vests_per_steem}
                store={mockStore}
            />
        ).dive();
        expect(wrapped.find('#downvote_button').length).toEqual(1);
        expect(wrapped.find('.upvote').length).toEqual(1);
    });

    it('should dispatch an action with payload when upvote button is clicked.', () => {
        const mockStore = configureMockStore()({
            global: mockGlobal,
            offchain: {},
            user: mockUser,
            transaction: {},
            discussion: {},
            routing: {},
            app: {},
        });
        let wrapped = shallow(
            <Voting
                flag={false}
                vote={(w, p) => {}}
                post={voteTestObj}
                price_per_steem={1}
                sbd_print_rate={10000}
                vests_per_steem={vests_per_steem}
                store={mockStore}
            />
        ).dive();
        wrapped.find('#upvote_button').simulate('click');
        expect(mockStore.getActions()[0].type).toEqual(
            'transaction/BROADCAST_OPERATION'
        );
        expect(mockStore.getActions()[0].payload.operation.weight).toEqual(
            10000
        );
        expect(mockStore.getActions()[0].payload.operation.voter).toEqual(
            'Janice'
        );
    });

    it('should show all SP if percent_steem_dollars is 0', () => {
        const post_obj = fromJS({
            stats: {
                total_votes: 1,
            },
            max_accepted_payout: '999999 SBD',
            percent_steem_dollars: 0,
            pending_payout_value: '10 SBD',
            payout_at: '2018-03-30T10:00:00Z',
        });
        const store = createStore(rootReducer);
        const component = renderer.create(
            <Provider store={store}>
                <IntlProvider locale="en">
                    <Voting
                        vote={(w, p) => {}}
                        post={post_obj}
                        price_per_steem={1}
                        vests_per_steem={vests_per_steem}
                        sbd_print_rate={10000}
                    />
                </IntlProvider>
            </Provider>
        );
        expect(JSON.stringify(component.toJSON())).toContain(
            '0.00 SBD, <br>&nbsp;&nbsp;&nbsp;&nbsp;10.00 SP'
        );
    });

    it('should omit liquid steem if print rate is 10000', () => {
        const store = createStore(rootReducer);
        const post_obj = fromJS({
            stats: {
                total_votes: 1,
            },
            max_accepted_payout: '999999 SBD',
            percent_steem_dollars: 10000,
            pending_payout_value: '10 SBD',
            payout_at: '2018-03-30T10:00:00Z',
        });
        const component = renderer.create(
            <Provider store={store}>
                <IntlProvider locale="en">
                    <Voting
                        vote={(w, p) => {}}
                        post={post_obj}
                        price_per_steem={1}
                        vests_per_steem={vests_per_steem}
                        sbd_print_rate={10000}
                    />
                </IntlProvider>
            </Provider>
        );
        expect(JSON.stringify(component.toJSON())).toContain(
            '5.00 SBD, <br>&nbsp;&nbsp;&nbsp;&nbsp;5.00 SP'
        );
    });

    it('should show liquid steem if print rate is < 10000', () => {
        const post_obj = fromJS({
            stats: {
                total_votes: 1,
            },
            max_accepted_payout: '999999 SBD',
            percent_steem_dollars: 10000,
            pending_payout_value: '10 SBD',
            payout_at: '2018-03-30T10:00:00Z',
        });
        const store = createStore(rootReducer);
        const component = renderer.create(
            <Provider store={store}>
                <IntlProvider locale="en">
                    <Voting
                        vote={(w, p) => {}}
                        post={post_obj}
                        price_per_steem={1}
                        sbd_print_rate={5000}
                        vests_per_steem={vests_per_steem}
                    />
                </IntlProvider>
            </Provider>
        );
        expect(JSON.stringify(component.toJSON())).toContain(
            '2.50 SBD, <br>&nbsp;&nbsp;&nbsp;&nbsp;2.50 STEEM, <br>&nbsp;&nbsp;&nbsp;&nbsp;5.00 SP'
        );
    });
});
