import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import rootReducer from 'app/redux/RootReducer';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import ChangePassword from './ChangePassword';
import { Center } from 'decorators';

const store = createStore(rootReducer);

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .addDecorator(Center)
    .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
    .add('ChangePassword', () => (
        <ChangePassword
            username={'maitland'}
            defaultPassword={'password1'}
            authType={null}
            priorAuthKey={'posting'} // Required pubkey if authType is given
        />
    ));
