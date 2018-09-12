process.env.BABEL_ENV = 'browser';
process.env.NODE_ENV = 'development';

const serve = require('webpack-serve');
const argv = {};
const config = require('./dev.config');

serve(argv, { config }).then(result => {
    result.on('listening', ({ options }) => {
        console.log('webpack dev server listening on port %s', options.port);
    });
});
