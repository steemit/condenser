import React from 'react';
import { storiesOf } from '@storybook/react';
import OpenMobileAppButton from './index';

storiesOf('OpenMobileAppButton', module).add('button', () => (
    <div>
        <OpenMobileAppButton
            onClick={noop}
            onHide={noop}
            onHideForever={noop}
        />
    </div>
));

function noop() {}
