import React from 'react';
import { storiesOf } from '@storybook/react';

import UserCardAbout from './UserCardAbout';

storiesOf('UserCardAbout', module)
    .add('default', () => <UserCardAbout style={{ width: '273px' }} />);
