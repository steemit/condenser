import React from 'react';
import { storiesOf } from '@storybook/react';
import { withState } from '@dump247/storybook-state';

import Slider from './Slider';

storiesOf('Golos UI/Slider', module)
    .add(
        'default',
        withState({ value: 0 })(({ store }) => (
            <Slider
                style={{ width: '200px' }}
                value={store.state.value}
                onChange={value => store.set({ value })}
            />
        ))
    )
    .add(
        'captions',
        withState({ value: 0 })(({ store }) => (
            <Slider
                showCaptions
                style={{ width: '200px' }}
                value={store.state.value}
                onChange={value => store.set({ value })}
            />
        ))
    );
