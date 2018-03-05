import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import rootReducer from 'app/redux/RootReducer';
import { Map, List } from 'immutable';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import Keys from './Keys';
import { Center } from 'decorators';

const store = createStore(rootReducer);

const mockAccount = Map({
    name: 'maitland',
    posting: Map({
        key_auths: [
            List(['SOMETHING', 'HERE']),
            List(['ANOTHER THING', 'OVER THERE']),
        ],
    }),
});

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .addDecorator(Center)
    .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
    .add('Keys', () => (
        <Keys account={mockAccount} authType="posting" onKey={() => {}} />
    ));
