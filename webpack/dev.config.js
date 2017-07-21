import webpack from 'webpack';
import git from 'git-rev-sync';
import { isArray } from 'lodash';
import baseConfig from './base.config';
import startKoa from './utils/start-koa';

const LOCAL_IP = require('dev-ip')();
const WEBPACK_PORT = process.env.PORT ? parseInt(process.env.PORT)+1 : 8081;
const HOST = (isArray(LOCAL_IP) && LOCAL_IP[0]) || LOCAL_IP || 'localhost';
const PUBLIC_PATH = "/assets/";

export default {
    server: {
        port: WEBPACK_PORT,
        options: {
            publicPath: PUBLIC_PATH,
            hot: true,
            stats: {
                assets: true,
                colors: true,
                version: false,
                hash: false,
                timings: true,
                chunks: false,
                chunkModules: false
            }
        }
    },
    webpack: {
        ...baseConfig,
        devtool: 'source-map',
        entry: {
            app: [
                './src/app/Main.js',
                //`webpack-hot-middleware/client?path=//${HOST}:${PORT}/__webpack_hmr`,
            ]
        },
        output: {...baseConfig.output, publicPath: PUBLIC_PATH},
        module: {
            ...baseConfig.module,
            loaders: [
                ...baseConfig.module.loaders,
            ]
        },
        plugins: [
            new webpack.optimize.OccurenceOrderPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoErrorsPlugin(),
            new webpack.DefinePlugin({
                'process.env': {
                    BROWSER: JSON.stringify(true),
                    NODE_ENV: JSON.stringify('development'),
                    VERSION: JSON.stringify(git.tag())
                },
                global: {
                    'TYPED_ARRAY_SUPPORT': JSON.stringify(false)
                }
            }),
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
            ...baseConfig.plugins,
            function () {
                console.log("Please wait for app server startup (~60s)" +
                    " after webpack server startup...");
                this.plugin('done', startKoa);
            }
        ]
    }
};
