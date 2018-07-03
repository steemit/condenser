import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import CommonDialog from './index';

function DialogWrapper({ children }) {
    return <div style={{ maxWidth: 600, padding: 50 }}>{children}</div>;
}

const actions = { onClose: action('onClose') };

storiesOf('Dialogs', module)
    .add('without type', () => (
        <DialogWrapper>
            <CommonDialog title="Some title" text="Some body" {...actions} />
        </DialogWrapper>
    ))
    .add('type=confirm', () => (
        <DialogWrapper>
            <CommonDialog
                type="confirm"
                title="Some title"
                text="Some body"
                {...actions}
            />
        </DialogWrapper>
    ))
    .add('type=info', () => (
        <DialogWrapper>
            <CommonDialog
                type="info"
                title="Some title"
                text="Some body"
                {...actions}
            />
        </DialogWrapper>
    ))
    .add('type=alert', () => (
        <DialogWrapper>
            <CommonDialog
                type="alert"
                title="Some title"
                text="Some body"
                {...actions}
            />
        </DialogWrapper>
    ))
    .add('type=prompt', () => (
        <DialogWrapper>
            <CommonDialog
                type="prompt"
                title="Some title"
                text="Some body"
                {...actions}
            />
        </DialogWrapper>
    ));
