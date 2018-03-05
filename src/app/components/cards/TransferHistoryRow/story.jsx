import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, date, select, number, text } from '@storybook/addon-knobs';

import { IntlProvider } from 'react-intl';

import { Provider } from 'react-redux';
import { createStore } from 'redux';

import rootReducer from 'app/redux/RootReducer';
import { receiveState } from 'app/redux/GlobalReducer';
import mockState from '../../../../../api_mockdata/get_state';

import TransferHistoryRow from './';

const store = createStore(rootReducer);

// Load some fake blockchain state.
// This component relies on many parts of the state tree - messy & hard to test!
store.dispatch(receiveState(mockState));

storiesOf('Cards', module)
    .addDecorator(withKnobs)
    .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
    .add('TransferHistoryRow', () => (
        <IntlProvider locale="en">
            <table>
                <tbody>
                    <TransferHistoryRow
                        key={1}
                        op={[
                            {
                                op: [
                                    'array one element one',
                                    'array one element two',
                                ],
                            },
                            {
                                op: [
                                    select(
                                        'transaction type',
                                        [
                                            'transfer_to_vesting',
                                            'transfer_to_savings',
                                            'transfer_from_savings',
                                            'cancel_transfer_from_savings',
                                            'withdraw_vesting',
                                            'curation_reward',
                                            'author_reward',
                                            'claim_reward_balance',
                                            'interest',
                                            'fill_convert_request',
                                            'fill_order',
                                            'comment_benefactor_reward',
                                            'something_completely_different',
                                        ],
                                        'transfer_to_vesting'
                                    ),
                                    {
                                        amount: `${number(
                                            'amount',
                                            138.69
                                        )} STEEM`,
                                        to: select(
                                            'to user (affects transfer_to_vesting)',
                                            ['userA', 'userB', 'userC'],
                                            'userA'
                                        ),
                                        from: select(
                                            'from user (affects transfer_to_vesting)',
                                            ['userA', 'userB', 'userC'],
                                            'userA'
                                        ),
                                        vesting_shares: `${text(
                                            'vesting_shares (affects withdraw_vesting)',
                                            '0.000000'
                                        )} VESTS`,
                                        reward_vests: `${text(
                                            'reward_vests',
                                            '1.1'
                                        )} VESTS`,
                                        reward: `${text(
                                            'reward',
                                            '1.1'
                                        )} VESTS`,
                                        vesting_payout: `${text(
                                            'vesting_payout',
                                            '123.12'
                                        )} VESTS`,
                                        request_id: '142857',
                                        comment_author: 'comment author',
                                        comment_permlink: 'comment permlink',
                                        sbd_payout: `${text(
                                            'sbd_payout',
                                            '0.000'
                                        )} SBD`,
                                        steem_payout: `${text(
                                            'steem_payout',
                                            '0.000'
                                        )} STEEM`,
                                        author: 'author',
                                        permlink: 'permlink',
                                        reward_steem: `${text(
                                            'reward_steem',
                                            '1.234'
                                        )} STEEM`,
                                        reward_sbd: `${text(
                                            'reward_sbd',
                                            '3.456'
                                        )} SBD`,
                                        interest: 1.234,
                                        amount_in: 1.234,
                                        amount_out: 1.234,
                                        open_owner: select('open_owner user', [
                                            'userA',
                                            'userB',
                                            'userC',
                                        ]),
                                        open_pays: 'open_pays amount',
                                        current_pays: 'current_pays amount',
                                        memo: 'memo here',
                                    },
                                ],
                                timestamp: date('date', new Date('1 Jul 2016')),
                            },
                        ]}
                        context={select(
                            'context user',
                            ['userA', 'userB', 'userC'],
                            'userA'
                        )}
                    />
                </tbody>
            </table>
        </IntlProvider>
    ));
