import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import rootReducer from 'app/redux/RootReducer';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import Userpic from './Userpic';
import { Center } from 'decorators';

const store = createStore(rootReducer);
global.$STM_Config = { img_proxy_prefix: 'https://steemitimages.com/' };

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .addDecorator(Center)
    .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
    .add('Userpic', () => <Userpic account={'maitland'} />);
