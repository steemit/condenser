import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, select } from '@storybook/addon-knobs';
import DropdownMenu from './DropdownMenu';
import { Center } from 'decorators';

const selectOptions = ['transfer', 'transfer to savings', 'power up'];

const mockMenu = [
    {
        value: 'transfer',
        link: '#',
        onClick: () => {},
    },
    {
        value: 'transfer to savings',
        link: '#',
        onClick: () => {},
    },
    {
        value: 'power up',
        link: '#',
        onClick: () => {},
    },
];

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .addDecorator(Center)
    .add('DropdownMenu', () => (
        <div>
            <h3>Dropdown Menu</h3>
            <DropdownMenu
                title={'Other actions'}
                key="_others"
                items={mockMenu}
                el={'div'}
                selected={select(
                    'Currently Selected',
                    selectOptions,
                    'power up'
                )}
            />
        </div>
    ));
