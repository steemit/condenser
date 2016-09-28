var fs = require('fs');

if(!fs.existsSync('tmp'))
    fs.mkdirSync('tmp');

process.env.BABEL_ENV = 'browser';
process.env.NODE_ENV = 'development';

import Koa from 'koa';
import webpack from 'webpack';

import config from './dev.config';

const app = new Koa();
const compiler = webpack(config.webpack);

app.use(require('koa-webpack-dev-middleware')(compiler, config.server.options));
app.use(require('koa-webpack-hot-middleware')(compiler));

app.listen(config.server.port, '0.0.0.0', () => {
    console.log('`webpack-dev-server` listening on port %s', config.server.port);
});
