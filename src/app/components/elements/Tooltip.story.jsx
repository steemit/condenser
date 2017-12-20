import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text } from '@storybook/addon-knobs';
import Tooltip from './Tooltip';

const widthOptions = {
    range: true,
    min: 300,
    max: 1200,
    step: 1,
};

const container = {
    display: 'table',
    position: 'absolute',
    height: '100%',
    width: '100%',
};

const middle = {
    display: 'table-cell',
    verticalAlign: 'middle',
};

const center = {
    marginLeft: 'auto',
    marginRight: 'auto',
    //border: 'solid black',
    width: '300px',
};

export const Center = ({ children }) => (
    <div style={container}>
        <div style={middle}>
            <div style={center}>{children}</div>
        </div>
    </div>
);

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .add('Tooltip', () => (
        <Center>
            <Tooltip t={text('tooltip text', 'a helpful lil tip')}>
                <span>Hover Over Me To See The Tooltip.</span>
            </Tooltip>
        </Center>
    ));
