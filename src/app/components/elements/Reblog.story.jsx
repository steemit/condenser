import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import rootReducer from 'app/redux/RootReducer';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import Reblog from './Reblog';
import { Center } from './Tooltip.story';

const store = createStore(rootReducer);

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
    .add('Reblog', () => (
        <Center>
            <Reblog
                permlink={'foo/bar'}
                author={'maitland'}
                reblog={() => alert('STEEM WAZ HERE')}
            />
        </Center>
    ));
