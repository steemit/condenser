import React from 'react';
import { storiesOf } from '@storybook/react';
import SearchInput from './index';
import { Center } from '../Tooltip.story';

storiesOf('Elements', module).add('SearchInput', () => (
    <Center>
        <SearchInput />
    </Center>
));
