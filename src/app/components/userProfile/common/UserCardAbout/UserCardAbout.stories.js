import React from 'react';
import { storiesOf } from '@storybook/react';

import UserCardAbout from './UserCardAbout';

storiesOf('User Profile/common/UserCardAbout', module)
    .add('default', () => <UserCardAbout style={{ width: '273px' }} />);
