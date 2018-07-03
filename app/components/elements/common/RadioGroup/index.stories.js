import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import RadioGroup from 'app/components/elements/common/RadioGroup';
import './index.scss';

const actions = {
    onChange: action('onChange'),
};

storiesOf('RadioGroup', module)
    .add('simple', () => (
        <RadioGroup
            options={[
                { id: 'id1', title: 'option 1' },
                { id: 'id2', title: 'option 2' },
            ]}
            value={'id1'}
            {...actions}
        />
    ))
    .add('disabled', () => (
        <RadioGroup
            disabled
            options={[
                { id: 'id1', title: 'option 1' },
                { id: 'id2', title: 'option 2' },
            ]}
            value={'id1'}
            {...actions}
        />
    ));
