import React from 'react';
import { storiesOf } from '@storybook/react';

import Card, { CardTitle } from './Card';

storiesOf('Card', module).add('default', () => (
    <Card style={{height: "100px"}}>
        <CardTitle>Краткая информация</CardTitle>
    </Card>
));
