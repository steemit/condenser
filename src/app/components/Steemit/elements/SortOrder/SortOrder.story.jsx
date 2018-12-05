import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import SortOrder from './index';
import { Center } from 'decorators';

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .addDecorator(Center)
    .add('SortOrder', () => (
        <SortOrder
            sortOrder={'promoted'}
            topic={'life'}
            horizontal={boolean('dropdown mode?', false)}
        />
    ));
