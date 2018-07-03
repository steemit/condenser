import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import DialogManager from './index';
import './index.scss';

storiesOf('DialogManager', module).add('open dialog', () => (
    <div>
        <button onClick={openDialog}>Open Dialog</button>
        <DialogManager />
    </div>
));

function openDialog() {
    DialogManager.showDialog({
        component: ({ someProp }) => (
            <div style={{ width: 400, height: 100, background: '#fff' }}>
                {someProp}
            </div>
        ),
        props: {
            someProp: 'Hello',
        },
        onClose: action('onClose'),
    });
}
