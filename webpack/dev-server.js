const fs = require('fs');
if(!fs.existsSync('tmp'))
    fs.mkdirSync('tmp');

process.env.BABEL_ENV = 'browser';
process.env.NODE_ENV = 'development';

const Koa = require('koa');
const webpack = require('webpack');

const webpackDevConfig = require('./dev.config');

const app = new Koa();
const compiler = webpack(webpackDevConfig.webpack);

app.use(require('koa-webpack-dev-middleware')(compiler, webpackDevConfig.server.options));
app.use(require('koa-webpack-hot-middleware')(compiler));

app.listen(webpackDevConfig.server.port, (process.platform === 'win32') ? '127.0.0.1' : '0.0.0.0', () => {
    console.log('`webpack-dev-server` listening on port %s', webpackDevConfig.server.port);
});
