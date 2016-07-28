import webpack from 'webpack';
import git from 'git-rev-sync';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
// import PurifyCSSPlugin from 'bird3-purifycss-webpack-plugin';

import baseConfig from './base.config';

const scssLoaders = ExtractTextPlugin.extract('style', baseConfig.scssLoaders.substr(baseConfig.scssLoaders.indexOf('!')));

export default {
    ...baseConfig,
    module: {
        loaders: [
            ...baseConfig.module.loaders,
            //{
            //    test: /\.(woff|woff2|eot|ttf|svg)(\?v=[0-9].[0-9].[0-9])?$/,
            //    loader: 'file?name=[sha512:hash:base64:7].[ext]'
            //},
            //{
            //    test: /\.(jpe?g|png|gif|svg)$/,
            //    loader: 'file?name=[sha512:hash:base64:7].[ext]!image?optimizationLevel=7&progressive&interlaced'
            //},
            {
                test: /\.s?css$/,
                loader: scssLoaders
            }
        ]
    },
    plugins: [
        // extract css
        new ExtractTextPlugin('[name]-[chunkhash].css'),

        // set env
        new webpack.DefinePlugin({
            'process.env': {
                BROWSER: JSON.stringify(true),
                NODE_ENV: JSON.stringify('production'),
                VERSION: JSON.stringify(git.tag())
            },
            global: {
                TYPED_ARRAY_SUPPORT: JSON.stringify(false)
            }
        }),

        // optimizations
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
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
                //drop_console: true
            },
            output: {
                comments: false
            }
        }),
        ...baseConfig.plugins
    ]
};
