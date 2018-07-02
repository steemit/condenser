import { configure, addDecorator } from "@storybook/react";
import StoryRouter from 'storybook-router';
import { injectGlobal } from "styled-components";

injectGlobal`
    @import url('https://fonts.googleapis.com/css?family=Roboto:300,300i,400,400i,500,500i,700,700i,900,900i&subset=cyrillic,cyrillic-ext');
`;

const reqApp = require.context("../app", true, /\.stories\.jsx?$/);
const reqSrc = require.context("../src", true, /\.stories\.jsx?$/);

function loadStories() {
    for (let fileName of reqApp.keys()) {
        reqApp(fileName);
    }

    for (let fileName of reqSrc.keys()) {
        reqSrc(fileName);
    }
}

addDecorator(StoryRouter());

configure(loadStories, module);
