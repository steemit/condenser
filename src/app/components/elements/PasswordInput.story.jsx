import React from 'react';
import { storiesOf } from '@storybook/react';
import PasswordInput from './PasswordInput';
import { Center } from './Tooltip.story';

storiesOf('Elements', module).add('PasswordInput', () => (
    <Center>
        <PasswordInput
            passwordLabel={'Enter New Password'}
            onChange={() => {}}
        />
        <PasswordInput
            passwordLabel={'Confirm Password'}
            inputConfirmPassword={true}
            onChange={() => {}}
        />
        <PasswordInput
            passwordLabel={'Disabled Password'}
            inputConfirmPassword={false}
            disabled={true}
            onChange={() => {}}
        />
    </Center>
));
