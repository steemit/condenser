const webpack = require('webpack');
const git = require('git-rev-sync');
const baseConfig = require('./base.config');

module.exports = {
    ...baseConfig,
    devtool: 'source-map', // https://webpack.js.org/configuration/devtool/#production
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                BROWSER: JSON.stringify(true),
                NODE_ENV: JSON.stringify('production'),
                VERSION: JSON.stringify(git.long()),
            },
        }),
        /*
        // TODO: sourcemap
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true, // https://github.com/mishoo/UglifyJS2#minify-options
            compress: {
                warnings: false,
                screw_ie8: true,
                sequences: true,
                dead_code: true,
                drop_debugger: true,
                comparisons: true,
                conditionals: true,
                evaluate: true,
                booleans: true,
                loops: true,
                unused: true,
                hoist_funs: true,
                if_return: true,
                join_vars: true,
                cascade: true,
            },
            output: {
                comments: false
            }
        }),*/
        ...baseConfig.plugins,
    ],
};
