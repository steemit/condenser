import path from 'path';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import genDefaultConfig from '@storybook/react/dist/server/config/defaults/webpack.config.js';
import webpack from 'webpack';

const css_loaders = [
    {
        loader: 'style-loader',
    },
    {
        loader: 'css-loader',
    },
    {
        loader: 'autoprefixer-loader'
    }
];

const scss_loaders = [
    {
        loader: 'css-loader',
    },
    {
        loader: 'autoprefixer-loader'
    },
    {
        loader: 'sass-loader',
        options: {
            sourceMap: true,
            data: '@import "app";',
            includePaths: [
                path.join(__dirname, '../src/app/assets/stylesheets'),
            ]
        }
    },
];

module.exports = (baseConfig, env) => {
    const config = genDefaultConfig(baseConfig, env);
    config.resolve = {
        alias: {
            react: path.join(__dirname, '../node_modules', 'react'),
            assets: path.join(__dirname, '../src/app/assets'),
            decorators: path.join(__dirname, '../.storybook/decorators')
        },
        extensions: ['.js', '.json', '.jsx'],
        modules: [
            path.resolve(__dirname, '../src'),
            'node_modules'
        ]
    };
    config.plugins.push( new ExtractTextPlugin('[name]-[chunkhash].css'));
    config.plugins.push(new webpack.DefinePlugin({
        'process.env': {
            BROWSER: JSON.stringify(true),
        }
    }));
    config.module = {
        rules: [
            {test: /\.(jpe?g|png)/, use: 'url-loader?limit=4096'},
            {test: /\.json$/, use: 'json-loader'},
            {test: /\.js$|\.jsx$/, exclude: /node_modules/, use: 'babel-loader'},
            {test: /\.svg$/, use: 'svg-inline-loader'},
            {
                test: require.resolve("blueimp-file-upload"),
                use: "imports?define=>false"
            },
            {
                test: /\.css$/,
                use: css_loaders
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: scss_loaders
                })
            },
            {
                test: /\.md/,
                use: 'raw-loader'
            }
        ]
    };
    return config;
};
