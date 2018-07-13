import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, select } from '@storybook/addon-knobs';
import Orderbook from './Orderbook';

const selectOptions = ['error', 'default'];

const mockOrder = {
    getSBDAmount: () => 999,
    getStringSBD: () => 'nine hundred and ninety nine',
    getStringSteem: () => 'two hundred steem',
    getStringPrice: () => '55',
    equals: () => 55,
};

const mockOrder2 = {
    getSBDAmount: () => 111,
    getStringSBD: () => 'one hundred and eleven',
    getStringSteem: () => 'one steem',
    getStringPrice: () => '55',
    equals: () => 55,
};

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .add('Orderbook', () => (
        <Orderbook
            side={'bids'}
            orders={[mockOrder, mockOrder2]}
            onClick={price => {
                setFormPrice(price);
            }}
        />
    ));
