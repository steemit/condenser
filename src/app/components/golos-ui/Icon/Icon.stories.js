import React from 'react';
import { storiesOf } from '@storybook/react';

import Icon from './Icon';

const files = require.context('!svg-sprite-loader!./assets', false, /.*\.svg$/);
files.keys().forEach(files);

const names = files.keys().map(file => file.match(/\/(.*)\.svg$/)[1]);

storiesOf('Golos UI/Icon', module).add('default', () => (
    <div>{names.map(name => <Icon name={name} />)}</div>
));
