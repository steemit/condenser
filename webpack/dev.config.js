import webpack from 'webpack';
import git from 'git-rev-sync';
import baseConfig from './base.config';
import startKoa from './utils/start-koa';

const WEBPACK_PORT = process.env.PORT ? parseInt(process.env.PORT)+1 : 8081;
const PUBLIC_PATH = '/assets/';

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
        devtool: 'cheap-module-eval-source-map',
        entry: {
            app: [
                './app/Main.js',
            ]
        },
        output: {
            ...baseConfig.output,
            publicPath: PUBLIC_PATH
        },
        module: {
            ...baseConfig.module,
            rules: [
                ...baseConfig.module.rules,
            ]
        },
        plugins: [
            // new webpack.optimize.OccurenceOrderPlugin(),
            // new webpack.HotModuleReplacementPlugin(),
            // new webpack.NoErrorsPlugin(),
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
            // new webpack.optimize.DedupePlugin(),
            // new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
            ...baseConfig.plugins,
            function () {
                console.log("Please wait for app server startup (~60s)" +
                    " after webpack server startup...");
                this.plugin('done', startKoa);
            }
        ]
    }
};
