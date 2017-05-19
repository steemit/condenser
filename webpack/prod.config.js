import webpack from 'webpack';
import git from 'git-rev-sync';
import baseConfig from './base.config';
// Analyse bundle library
// import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer';

export default {
    ...baseConfig,
    module: {
        loaders: [
            ...baseConfig.module.loaders
        ]
    },
    plugins: [
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

        // Analyse your bundle dependencies
        // new BundleAnalyzerPlugin(),

        ...baseConfig.plugins
    ]
};
