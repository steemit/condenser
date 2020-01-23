import React from 'react';
import { storiesOf } from '@storybook/react';
import ElasticSearchInput from './index';
import { Center } from 'decorators';

storiesOf('Elements', module)
    .addDecorator(Center)
    .add('ElasticSearchInput', () => <ElasticSearchInput />);
