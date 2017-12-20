import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import rootReducer from 'app/redux/RootReducer';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import MarkNotificationRead from './MarkNotificationRead';
import { Center } from './Tooltip.story';

const store = createStore(rootReducer);

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
    .add('MarkNotificationRead', () => (
        <Center>
            <p>
                {' '}
                This is a curious component, that will always render null...{' '}
            </p>
            <MarkNotificationRead
                fields={'send,receive'}
                account={'maitland'}
            />
        </Center>
    ));
