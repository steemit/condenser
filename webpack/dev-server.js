process.env.BABEL_ENV = 'browser';
process.env.NODE_ENV = 'development';

const serve = require('webpack-serve');
const config = require('./dev.config');

serve({ config }).then(server => {
    server.on('listening', ({ server, options }) => {
        console.log('webpack dev server listening on port %s', options.port);
    });
});
