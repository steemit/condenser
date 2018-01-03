import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import DropDownList from './index';
import { Center } from '../Tooltip.story';

const menuItems = [
    <li>
        <button onClick={() => alert('click 1')}>List item one</button>
    </li>,
    <li>
        <button onClick={() => alert('click 2')}>List item two</button>
    </li>,
    <li>
        <button onClick={() => alert('click 3')}>List item three</button>
    </li>,
];

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .add('DropDownList', () => (
        <Center>
            <DropDownList>{menuItems}</DropDownList>
        </Center>
    ));
