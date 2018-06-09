const webpack = require('webpack');
const merge = require('webpack-merge');
const git = require('git-rev-sync');
const baseConfig = require('./base.config');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const Webpack_isomorphic_tools_plugin = require('webpack-isomorphic-tools/plugin');
const webpack_isomorphic_tools_plugin =
    new Webpack_isomorphic_tools_plugin(require('./webpack-isotools-config'));

module.exports = merge(baseConfig, {
    mode: 'production',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                BROWSER: JSON.stringify(true),
                NODE_ENV: JSON.stringify('production'),
                // FIXME this requires we put .git into the docker image :(
                VERSION: JSON.stringify(git.tag())
            },
            global: {
                TYPED_ARRAY_SUPPORT: JSON.stringify(false)
            }
        }),

        // optimizations
        // new webpack.optimize.DedupePlugin(),
        webpack_isomorphic_tools_plugin
    ],
    optimization: {
        concatenateModules: true, //ModuleConcatenationPlugin
        minimizer: [ // in production mode webpack 4 use own uglify
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: false
            }),
            new OptimizeCSSAssetsPlugin({})
        ],
    }
});
