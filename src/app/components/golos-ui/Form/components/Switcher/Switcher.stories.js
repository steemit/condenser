import React from 'react';
import { storiesOf } from '@storybook/react';
import { withState } from '@dump247/storybook-state';

import Switcher from './Switcher';

storiesOf('Golos UI/Switcher', module).add(
    'default',
    withState({ checked: false })(({ store }) => (
        <Switcher
            value={store.state.checked}
            onChange={() => store.set({ checked: !store.state.checked })}
        />
    ))
);
