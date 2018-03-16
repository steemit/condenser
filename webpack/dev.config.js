const webpack = require('webpack');
const git = require('git-rev-sync');
const baseConfig = require('./base.config');
const startKoa = require('./utils/start-koa');

// var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// baseConfig.plugins.push(new BundleAnalyzerPlugin());

module.exports = {
    ...baseConfig,
    devtool: 'cheap-module-eval-source-map',
    output: {
        ...baseConfig.output,
        publicPath: '/assets/'
    },
    module: {
        ...baseConfig.module,
        rules: [
            ...baseConfig.module.rules,
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                BROWSER: JSON.stringify(true),
                NODE_ENV: JSON.stringify('development'),
                VERSION: JSON.stringify(git.long())
            }
        }),
        ...baseConfig.plugins,
        function () {
            console.log("Please wait for app server startup (~60s)" +
                " after webpack server startup...");
            this.plugin('done', startKoa);
        }
    ]
};
