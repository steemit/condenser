import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text } from '@storybook/addon-knobs';
import { Center } from 'decorators';
import Tooltip from './Tooltip';

const widthOptions = {
    range: true,
    min: 300,
    max: 1200,
    step: 1,
};

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .addDecorator(Center)
    .add('Tooltip', () => (
        <Tooltip t={text('tooltip text', 'a helpful lil tip')}>
            <span>Hover Over Me To See The Tooltip.</span>
        </Tooltip>
    ));
