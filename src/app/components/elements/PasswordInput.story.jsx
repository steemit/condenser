import React from 'react';
import { storiesOf } from '@storybook/react';
import PasswordInput from './PasswordInput';
import { Center } from 'decorators';

storiesOf('Elements', module)
    .addDecorator(Center)
    .add('PasswordInput', () => (
        <div>
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
        </div>
    ));
