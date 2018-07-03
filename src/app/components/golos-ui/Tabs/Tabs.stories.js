import React from 'react';
import { storiesOf } from '@storybook/react';

import Tabs from './Tabs';

const items = [
  {value: 'Посты'},
  {value: 'Ответы'},
  {value: 'Избранное'},
  {value: 'Уведомления'},
  {value: 'Сообщения'},
  {value: 'Мои ключи'},
  {value: 'Кошелек', active: true},
]

storiesOf('Tabs', module)
    .add('default', () => <Tabs items={items} />);
