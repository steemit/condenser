import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text } from '@storybook/addon-knobs';
import TransactionError from './TransactionError';
import { Center } from 'decorators';
import rootReducer from 'app/redux/RootReducer';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
const store = createStore(rootReducer);

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .addDecorator(Center)
    .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
    .add('TransactionError', () => (
        <TransactionError
            opType="This is a test"
            error="There was an error ey"
        />
    ));
