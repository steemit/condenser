import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, select } from '@storybook/addon-knobs';
import FoundationDropdownMenu from './FoundationDropdownMenu';
import { Center } from './Tooltip.story';

const positionOptions = ['bottom', 'top'];

const alignmentOptions = ['left', 'right'];

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
    .add('FoundationDropdownMenu', () => (
        <Center>
            <h3> Foundation Dropdown Menu</h3>
            <FoundationDropdownMenu
                className="Wallet_dropdown"
                dropdownPosition={select('position', positionOptions, 'bottom')}
                dropdownAlignment={select(
                    'alignment',
                    alignmentOptions,
                    'right'
                )}
                label={8 + ' Jahweh'}
                menu={mockMenu}
            />
        </Center>
    ));
