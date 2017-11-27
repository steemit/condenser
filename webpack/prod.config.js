import webpack from 'webpack';
import git from 'git-rev-sync';
import baseConfig from './base.config';

export default {
    ...baseConfig,
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                BROWSER: JSON.stringify(true),
                NODE_ENV: JSON.stringify('production'),
                VERSION: JSON.stringify(git.long())
            },
            global: {
                TYPED_ARRAY_SUPPORT: JSON.stringify(false)
            }
        }),
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
                cascade: true
            },
            output: {
                comments: false
            }
        }),
        ...baseConfig.plugins
    ]
};
