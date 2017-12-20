import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import rootReducer from 'app/redux/RootReducer';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { Center } from './Tooltip.story';
import UserList from './UserList';

const store = createStore(rootReducer);

const mockUsers = Array(70).fill('test');

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
    .add('UserList', () => <UserList users={mockUsers} title="User List" />);
