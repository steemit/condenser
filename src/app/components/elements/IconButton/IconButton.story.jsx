import React from 'react';
import { storiesOf } from '@storybook/react';
import IconButton from './index';
import { Center } from '../Tooltip.story';

storiesOf('Elements', module).add('IconButton', () => (
    <Center>
        <IconButton icon="pencil" />
        <IconButton icon="magnifyingGlass" />
    </Center>
));
