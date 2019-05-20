import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, date } from '@storybook/addon-knobs';
import { Center } from 'decorators';

import { IntlProvider } from 'react-intl';

import ContentEditedWrapper from './';

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .addDecorator(Center)
    .add('ContentEditedWrapper', () => (
        <IntlProvider locale="en">
            <TimeAgoWrapper date={date('date', new Date('1 Jul 2016'))} />
        </IntlProvider>
    ));
