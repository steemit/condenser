import React from 'react';
import { storiesOf } from '@storybook/react';
import SearchInput from './index';
import { Center } from 'decorators';

storiesOf('Elements', module)
    .addDecorator(Center)
    .add('SearchInput', () => <SearchInput />);
