import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, number } from '@storybook/addon-knobs';
import NotifiCounter from './NotifiCounter';
import { Center } from './Tooltip.story';

const options = {
    range: true,
    min: 0,
    max: 1001,
    step: 1,
};

const mockStore = {
    dispatch: () => {},
    value: 300,
    subscribe: () => {},
    getState: () => ({
        app: {
            get: () => {
                return {
                    get: () => number('number of notifications', 10, options),
                };
            },
        },
    }),
};

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .add('NotifCounter', () => (
        <Center>
            <NotifiCounter store={mockStore} fields={'not relevant'} />
            <span> Notifications</span>
        </Center>
    ));
