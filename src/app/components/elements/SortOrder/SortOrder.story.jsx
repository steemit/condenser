import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import SortOrder from './index';
import { Center } from '../Tooltip.story';

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .add('SortOrder', () => (
        <Center>
            <SortOrder
                sortOrder={'promoted'}
                topic={'life'}
                horizontal={boolean('dropdown mode?', false)}
            />
        </Center>
    ));
