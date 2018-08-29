import React from 'react';
import { storiesOf } from '@storybook/react';
import { withState } from '@dump247/storybook-state';

import RadioGroup from './RadioGroup';

storiesOf('Golos UI/Form/RadioGroup', module)
    .add(
        'simple',
        withState({ checked: 'id1' })(({ store }) => (
            <RadioGroup
                options={[{ id: 'id1', title: 'option 1' }, { id: 'id2', title: 'option 2' }]}
                value={store.state.checked}
                onChange={value => store.set({ checked: value })}
            />
        ))
    )
    .add(
        'disabled',
        withState({ checked: 'id1' })(({ store }) => (
            <RadioGroup
                disabled
                options={[{ id: 'id1', title: 'option 1' }, { id: 'id2', title: 'option 2' }]}
                value={'id1'}
                onChange={value => store.set({ checked: value })}
            />
        ))
    );
