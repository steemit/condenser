import log from '../log';
var fs = require('fs');

if(!fs.existsSync('tmp'))
    fs.mkdirSync('tmp');

process.env.BABEL_ENV = 'browser';

// this is the default entrypoint for the dev server
// however the env can be overridden in the environment.
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

import Koa from 'koa';
import webpack from 'webpack';

import config from './dev.config';

const app = new Koa();
const compiler = webpack(config.webpack);

app.use(require('koa-webpack-dev-middleware')(compiler, config.server.options));
app.use(require('koa-webpack-hot-middleware')(compiler));

// FIXME make this use the normal config system
app.listen(config.server.port, '0.0.0.0', () => {
    log.info('`webpack-dev-server` listening on port %s', config.server.port);
});
