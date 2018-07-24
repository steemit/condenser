import React from 'react';
import { storiesOf } from '@storybook/react';

import Tab from './Tab';

storiesOf('Golos UI/Tab', module)
    .add('default', () => <Tab>Кошелек</Tab>)
    .add('active', () => <Tab active>Кошелек</Tab>);
