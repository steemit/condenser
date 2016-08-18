import path from 'path';
import webpack from 'webpack';

import writeStats from './utils/write-stats';

const scssLoaders = 'style!css!autoprefixer!sass?outputStyle=expanded';
const cssLoaders = 'style!css!autoprefixer';

const Webpack_isomorphic_tools_plugin = require('webpack-isomorphic-tools/plugin');
const webpack_isomorphic_tools_plugin =
    new Webpack_isomorphic_tools_plugin(require('./webpack-isotools-config'))
        .development();

export default {
    entry: {
        app: ['babel-polyfill', './app/Main.js'],
        vendor: ['react', 'react-dom', 'react-router']
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name].[hash].js',
        chunkFilename: '[id].[hash].js',
        publicPath: '/assets/'
    },
    module: {
        loaders: [
            {test: /\.(jpe?g|png)/, loader: 'url-loader?limit=4096'},
            {test: /\.json$/, loader: 'json'},
            {test: /\.js$|\.jsx$/, exclude: /node_modules/, loader: 'babel'},
            {test: /\.svg$/, loader: 'svg-inline-loader'},
            {
                test: require.resolve("blueimp-file-upload"),
                loader: "imports?define=>false"
            },
            {
                test: require.resolve("medium-editor-insert-plugin"),
                loader: "imports?define=>false"
            }
        ]
    },
    plugins: [
        // write webpack stats
        function () { this.plugin('done', writeStats); },
        webpack_isomorphic_tools_plugin,
        new webpack.ProvidePlugin({
            $: 'jquery'
        })
    ],
    resolve: {
        root: [
            path.resolve(__dirname, '..')
        ],
        extensions: ['', '.js', '.json', '.jsx'],
        modulesDirectories: ['node_modules']
    },
    scssLoaders,
    cssLoaders
};
