import webpack from 'webpack';
import git from 'git-rev-sync';
// import { isArray } from 'lodash';
import baseConfig from './base.config';
import startKoa from './utils/start-koa';

// const LOCAL_IP = require('dev-ip')();
// const HOST = (isArray(LOCAL_IP) && LOCAL_IP[0]) || LOCAL_IP || 'localhost';

// var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// baseConfig.plugins.push(new BundleAnalyzerPlugin());

export default {
    ...baseConfig,
    devtool: 'cheap-module-eval-source-map',
    // entry: {
    //     app: [
    //         './src/app/Main.js',
    //         //`webpack-hot-middleware/client?path=//${HOST}:${PORT}/__webpack_hmr`,
    //     ]
    // },
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
        // new webpack.HotModuleReplacementPlugin(),
        // new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                BROWSER: JSON.stringify(true),
                NODE_ENV: JSON.stringify('development'),
                VERSION: JSON.stringify(git.tag())
            },
            global: {
                TYPED_ARRAY_SUPPORT: JSON.stringify(false)
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
