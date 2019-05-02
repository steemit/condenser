import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, select } from '@storybook/addon-knobs';
import Callout from './Callout';
import { Center } from 'decorators';

const selectOptions = ['error', 'default'];

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .addDecorator(Center)
    .add('Callout', () => (
        <Callout type={select('Callout style', selectOptions, 'default')}>
            <span> Callout, you can add an error style with the knob</span>
        </Callout>
    ));
