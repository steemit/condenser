var fs = require('fs');
if(!fs.existsSync('tmp'))
    fs.mkdirSync('tmp');

process.env.BABEL_ENV = 'browser';
process.env.NODE_ENV = 'development';

import Koa from 'koa';
import webpack from 'webpack';

import webpackDevConfig from './dev.config';

const app = new Koa();
const compiler = webpack(webpackDevConfig.webpack);

app.use(require('koa-webpack-dev-middleware')(compiler, webpackDevConfig.server.options));
app.use(require('koa-webpack-hot-middleware')(compiler));

app.listen(webpackDevConfig.server.port, '0.0.0.0', () => {
    console.log('`webpack-dev-server` listening on port %s', webpackDevConfig.server.port);
});
