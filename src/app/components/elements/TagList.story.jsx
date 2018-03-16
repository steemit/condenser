import React from 'react';
import { storiesOf } from '@storybook/react';
import TagList from './TagList';
import { Center } from 'decorators';

const mockPost = {
    json_metadata: {
        tags: ['water', 'snow', 'ice', 'steam'],
    },
};

storiesOf('Elements', module)
    .addDecorator(Center)
    .add('TagList', () => <TagList post={mockPost} />);
