import React from 'react';
import { storiesOf } from '@storybook/react';

import ActivityCardSettings from './ActivityCardSettings';

storiesOf('User Profile/activity/ActivityCardSettings', module).add('default', () => (
    <ActivityCardSettings style={{ width: '273px' }} />
));
