import React from 'react';
import { storiesOf } from '@storybook/react';
import TagList from './TagList';
import { Center } from './Tooltip.story';

const mockPost = {
    json_metadata: {
        tags: ['water', 'snow', 'ice', 'steam'],
    },
};

storiesOf('Elements', module).add('TagList', () => (
    <Center>
        <TagList post={mockPost} />
    </Center>
));
