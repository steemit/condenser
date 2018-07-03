import React from 'react';
import { storiesOf } from '@storybook/react';

import Button from 'golos-ui/Button';
import Icon from 'golos-ui/Icon';

storiesOf('Button', module)
    .add('type', () => <Button type="submit">Подписаться</Button>)
    .add('icon', () => <Button><Icon name="subscribe" height="10px" width="14px"/>Подписаться</Button>)
    .add('children', () => <Button>Подписаться</Button>)

    .add('light', () => <Button light>Подписаться</Button>)
    .add('neutral', () => <Button neutral>Подписаться</Button>)

    .add('auto', () => <Button auto>Подписаться</Button>)
    .add('small', () => <Button small>Подписаться</Button>);
