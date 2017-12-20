import React from 'react';
import { storiesOf } from '@storybook/react';
import LoadingIndicator from './LoadingIndicator';
import styles from './LoadingIndicator.scss';

storiesOf('Elements', module).add('LoadingIndicator', () => (
    <LoadingIndicator />
));
