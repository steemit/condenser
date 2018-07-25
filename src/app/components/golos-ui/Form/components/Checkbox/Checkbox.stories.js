import React from 'react';
import { storiesOf } from '@storybook/react';
import { withState } from '@dump247/storybook-state';

import Checkbox from './Checkbox';

storiesOf('Golos UI/Checkbox', module).add(
    'default',
    withState({ checked: false })(({ store }) => (
        <Checkbox
            value={store.state.checked}
            onChange={() => store.set({ checked: !store.state.checked })}
        />
    ))
);
