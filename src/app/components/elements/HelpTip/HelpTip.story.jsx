import React from 'react';
import { storiesOf } from '@storybook/react';
import HelpTip from './index';
import IconButton from '../IconButton';
import { Center } from 'decorators';

storiesOf('Elements', module)
    .addDecorator(Center)
    .add('HelpTip', () => (
        <HelpTip content="Hello World">
            <IconButton />
        </HelpTip>
    ));
