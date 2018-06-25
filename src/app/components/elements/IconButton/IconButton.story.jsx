import React from 'react';
import { storiesOf } from '@storybook/react';
import IconButton from './index';
import { Center } from 'decorators';

storiesOf('Elements', module)
    .addDecorator(Center)
    .add('IconButton', () => (
        <span>
            <IconButton icon="pencil" />
            <IconButton icon="magnifyingGlass" />
            <IconButton icon="questionMark" />
        </span>
    ));
