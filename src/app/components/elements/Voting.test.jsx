import React from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import { fromJS } from 'immutable';
import renderer from 'react-test-renderer';
import rootReducer from 'app/redux/RootReducer';

import Voting from './Voting';

configure({ adapter: new Adapter() });

const store = createStore(rootReducer);

describe('Voting', () => {
    it('should show all SP if percent_steem_dollars is 0', () => {
        const post_obj = fromJS({
            stats: {
                total_votes: 1,
            },
            max_accepted_payout: '999999 SBD',
            percent_steem_dollars: 0,
            pending_payout_value: '10 SBD',
            cashout_time: '2018-03-30T10:00:00Z',
        });
        const component = renderer.create(
            <Provider store={store}>
                <IntlProvider locale="en">
                    <Voting
                        post="Test post"
                        vote={(w, p) => {}}
                        post_obj={post_obj}
                        price_per_steem={1}
                        sbd_print_rate={10000}
                    />
                </IntlProvider>
            </Provider>
        );
        expect(JSON.stringify(component.toJSON())).toContain(
            '(0.00 SBD, 10.00 SP)'
        );
    });

    it('should omit liquid steem if print rate is 10000', () => {
        const post_obj = fromJS({
            stats: {
                total_votes: 1,
            },
            max_accepted_payout: '999999 SBD',
            percent_steem_dollars: 10000,
            pending_payout_value: '10 SBD',
            cashout_time: '2018-03-30T10:00:00Z',
        });
        const component = renderer.create(
            <Provider store={store}>
                <IntlProvider locale="en">
                    <Voting
                        post="Test post"
                        vote={(w, p) => {}}
                        post_obj={post_obj}
                        price_per_steem={1}
                        sbd_print_rate={10000}
                    />
                </IntlProvider>
            </Provider>
        );
        expect(JSON.stringify(component.toJSON())).toContain(
            '(5.00 SBD, 5.00 SP)'
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
            cashout_time: '2018-03-30T10:00:00Z',
        });
        const component = renderer.create(
            <Provider store={store}>
                <IntlProvider locale="en">
                    <Voting
                        post="Test post"
                        vote={(w, p) => {}}
                        post_obj={post_obj}
                        price_per_steem={1}
                        sbd_print_rate={5000}
                    />
                </IntlProvider>
            </Provider>
        );
        expect(JSON.stringify(component.toJSON())).toContain(
            '(2.50 SBD, 2.50 STEEM, 5.00 SP)'
        );
    });
});
