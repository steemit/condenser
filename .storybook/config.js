import { configure } from '@storybook/react';

const req = require.context('../stories', true, /\.stories\.jsx?$/);
const appReq = require.context('../app', true, /\.stories\.jsx?$/);

configure(() => {
    for (let fileName of req.keys()) {
        req(fileName);
    }

    for (let fileName of appReq.keys()) {
        appReq(fileName);
    }
}, module);
