const webpack = require('webpack');
const git = require('git-rev-sync');
const baseConfig = require('./base.config');

module.exports = {
    ...baseConfig,
    devtool: 'cheap-module-eval-source-map',
    output: {
        ...baseConfig.output,
        publicPath: '/assets/',
    },
    module: {
        ...baseConfig.module,
        rules: [
            ...baseConfig.module.rules,
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                BROWSER: JSON.stringify(true),
                NODE_ENV: JSON.stringify('development'),
                VERSION: JSON.stringify(git.long()),
            }
        }),
        ...baseConfig.plugins,
    ],
};
