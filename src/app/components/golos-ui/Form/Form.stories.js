import React from 'react';
import { storiesOf } from '@storybook/react';

import { FormGroup, Label, Input, Select, Textarea } from './Form';

storiesOf('Form', module).add('default', () => (
    <div>
        <FormGroup>
            <Label>Input</Label>
            <Input placeholder="test" />
        </FormGroup>
        <FormGroup>
            <Label>Select</Label>
            <Select placeholder="test">
                <option value="test">Test</option>
            </Select>
        </FormGroup>
        <FormGroup>
            <Label>Textarea</Label>
            <Textarea placeholder="test" row={6} />
        </FormGroup>
    </div>
));
