import React from 'react';
import { storiesOf } from '@storybook/react';
import Reputation from './Reputation';
import { Center } from 'decorators';

storiesOf('Elements', module)
    .addDecorator(Center)
    .add('Reputation', () => <Reputation value={1200} />);
