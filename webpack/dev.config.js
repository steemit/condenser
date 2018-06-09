const webpack = require('webpack');
const merge = require('webpack-merge');
const git = require('git-rev-sync');
const baseConfig = require('./base.config');
const StartServerPlugin = require('./plugins/StartServerPlugin');

const Webpack_isomorphic_tools_plugin = require('webpack-isomorphic-tools/plugin');
const webpack_isomorphic_tools_plugin =
    new Webpack_isomorphic_tools_plugin(require('./webpack-isotools-config'))
        .development();

const WEBPACK_PORT = process.env.PORT ? parseInt(process.env.PORT)+1 : 8081;
const PUBLIC_PATH = '/assets/';

module.exports = {
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
    webpack: merge(baseConfig, {
        mode: 'development',
        devtool: 'cheap-module-eval-source-map',
        output: {
            publicPath: PUBLIC_PATH
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new webpack.DefinePlugin({
                'process.env': {
                    BROWSER: JSON.stringify(true),
                    NODE_ENV: JSON.stringify('development'),
                    VERSION: JSON.stringify(git.long())
                },
                global: {
                    TYPED_ARRAY_SUPPORT: JSON.stringify(false)
                }
            }),
            webpack_isomorphic_tools_plugin,
            new StartServerPlugin()
        ],
        optimization: {
            noEmitOnErrors: true, // NoEmitOnErrorsPlugin
        }
    })
};
