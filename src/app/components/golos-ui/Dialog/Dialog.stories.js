import React from 'react';
import { storiesOf } from '@storybook/react';

import {
    Dialog,
    DialogHeader,
    DialogContent,
    DialogFooter,
    DialogButton,
} from './Dialog';

storiesOf('Golos UI/Dialog', module).add('default', () => (
    <Dialog>
        <DialogHeader>Header</DialogHeader>
        <DialogContent>Content</DialogContent>
        <DialogFooter>
            <DialogButton>Cancel</DialogButton>
            <DialogButton primary>OK</DialogButton>
        </DialogFooter>
    </Dialog>
));
