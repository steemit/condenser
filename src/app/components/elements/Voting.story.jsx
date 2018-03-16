import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import rootReducer from 'app/redux/RootReducer';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import Voting from './Voting';
import { Center } from 'decorators';
import { IntlProvider } from 'react-intl';

const store = createStore(rootReducer);

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .addDecorator(Center)
    .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
    .add('Voting', () => (
        <IntlProvider locale="en">
            <Voting
                post={'cool Post'}
                post_obj={{
                    get: arg => {
                        switch (arg) {
                            case 'cashout_time':
                                return '2016';
                                break;
                            case 'pending_payout_value':
                                return 5;
                                break;
                            case 'total_payout_value':
                                return 15;
                                break;
                            case 'curator_payout_value':
                                return 13;
                                break;
                            default:
                                return 'cool';
                        }
                    },
                    getIn: () => {},
                }}
            />
        </IntlProvider>
    ));

/*
                store={mockStore}

*/
