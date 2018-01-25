import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import rootReducer from 'app/redux/RootReducer';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import ChangePassword from './ChangePassword';
import { Center } from './Tooltip.story';

const store = createStore(rootReducer);

console.log(
    'XXXXXXXXXXXXXXXXXXXXXX',
    process.env.BROWSER
)

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
    .add('ChangePassword', () => (
        <Center>
            <ChangePassword
                username={'maitland'}
                defaultPassword={'password1'}
                authType={null}
                priorAuthKey={'posting'} // Required pubkey if authType is given
            />
        </Center>
    ));
