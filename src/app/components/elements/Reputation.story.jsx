import React from 'react';
import { storiesOf } from '@storybook/react';
import Reputation from './Reputation';
import { Center } from './Tooltip.story';

storiesOf('Elements', module).add('Reputation', () => (
    <Center>
        <Reputation value={1200} />
    </Center>
));
